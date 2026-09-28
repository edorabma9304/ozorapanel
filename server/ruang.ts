/**
 * Server ruang permainan — Node, tanpa dependensi, keadaan di memori.
 *
 * Satu proses mengerjakan dua hal: menyajikan build statis permainan
 * (`dist-game/`) dan menjadi satu-satunya pihak yang boleh mengubah keadaan
 * ruang. Klien tidak pernah menghitung sendiri; mereka mengirim perintah ke
 * `POST /api/ruang`, server menjalankan `langkahRuang` (mesin yang sama persis
 * dengan yang dipakai klien, disalin oleh `pnpm mesin:salin`), lalu mengabarkan
 * nomor urut terbaru lewat SSE `GET /api/ruang/aliran`.
 *
 * Kenapa otoritatif: benih dadu dan urutan kartu ada di dalam keadaan. Kalau
 * klien yang menghitung, siapa pun bisa meramalkan dadu dan mengintip kartu.
 *
 * Kenapa hanya nomor urut yang dikabarkan: isi ruang berbeda per penerima
 * (obrolan tim, rahasia yang disensor), jadi tiap klien harus meminta
 * pandangannya sendiri.
 *
 * Pakai:
 *   pnpm game:build        # hasilkan dist-game/
 *   pnpm mesin:salin       # salin mesin ke server/mesin/
 *   pnpm game:server       # jalankan di :5190
 *
 * Keadaan hanya di memori: server mati berarti semua ruang hilang. Itu memang
 * pilihannya — permainan berlangsung satu duduk, bukan berhari-hari. Untuk
 * pemasangan permanen yang tahan restart, pakai jalur Supabase di
 * docs/MONOPOLI.md.
 */
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'
import { buatRuang, langkahRuang, pandangan } from './mesin/mesin-ruang.ts'
import type { PerintahRuang, Ruang } from './mesin/ruang.ts'
import type { PengaturanPermainan } from './mesin/tipe.ts'

const PORT = Number(process.env['PORT'] ?? 5190)
const AKAR = resolve(process.env['AKAR_STATIS'] ?? fileURLToPath(new NodeURL('../dist-game/', import.meta.url)))

/** Batas kasar supaya satu orang tidak bisa menghabiskan memori server. */
const MAKS_RUANG = 200
const MAKS_BADAN_BYTE = 64 * 1024
/** Ruang yang tidak disentuh selama ini dibuang. */
const UMUR_RUANG_MS = 6 * 60 * 60 * 1000
const JEDA_BERSIH_MS = 10 * 60 * 1000
/** Komentar SSE berkala supaya perantara jaringan tidak menutup aliran diam. */
const JEDA_DENYUT_MS = 25_000

type Baris = { ruang: Ruang; disentuh: number }

const ruangan = new Map<string, Baris>()
const pendengar = new Map<string, Set<ServerResponse>>()

// ------------------------------------------------------------------ Bantu HTTP
const JENIS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
}

/** Build permainan boleh dipasang di domain lain sambil memakai server ini. */
const LINTAS_ASAL = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
}

function jawab(res: ServerResponse, isi: unknown, status = 200) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...LINTAS_ASAL })
  res.end(JSON.stringify(isi))
}

async function bacaBadan(req: IncomingMessage): Promise<unknown> {
  const bagian: Buffer[] = []
  let ukuran = 0
  for await (const potong of req) {
    ukuran += (potong as Buffer).length
    if (ukuran > MAKS_BADAN_BYTE) throw new Error('Isi permintaan terlalu besar.')
    bagian.push(potong as Buffer)
  }
  return JSON.parse(Buffer.concat(bagian).toString('utf8'))
}

// ------------------------------------------------------------------ Kabar perubahan
function kabarkan(kode: string, urut: number) {
  const set = pendengar.get(kode)
  if (!set) return
  for (const res of set) res.write(`event: urut\ndata: ${JSON.stringify({ urut })}\n\n`)
}

function aliran(req: IncomingMessage, res: ServerResponse, kode: string) {
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    // Cegah perantara (nginx, cloudflared) menahan aliran di bufernya.
    'x-accel-buffering': 'no',
    ...LINTAS_ASAL,
  })
  res.write(': tersambung\n\n')

  const set = pendengar.get(kode) ?? new Set<ServerResponse>()
  set.add(res)
  pendengar.set(kode, set)

  const denyut = setInterval(() => res.write(': denyut\n\n'), JEDA_DENYUT_MS)
  const tutup = () => {
    clearInterval(denyut)
    set.delete(res)
    if (set.size === 0) pendengar.delete(kode)
  }
  req.on('close', tutup)
  res.on('error', tutup)
}

// ------------------------------------------------------------------ API ruang
type Permintaan =
  | { aksi: 'buat'; kode: string; dari: string; nama: string; pengaturan: PengaturanPermainan }
  | { aksi: 'lihat'; kode: string; dari: string }
  | { aksi: 'perintah'; kode: string; dari: string; perintah: PerintahRuang }

function tanganiApi(res: ServerResponse, permintaan: Permintaan) {
  const kode = String(permintaan.kode ?? '').toUpperCase().slice(0, 8)
  const dari = String(permintaan.dari ?? '').slice(0, 64)
  if (!kode || !dari) return jawab(res, { ok: false, pesan: 'Kode ruang dan identitas wajib diisi.' }, 400)

  if (permintaan.aksi === 'buat') {
    if (ruangan.has(kode)) return jawab(res, { ok: false, pesan: 'Kode ruang itu sudah dipakai, coba lagi.' }, 409)
    if (ruangan.size >= MAKS_RUANG) {
      return jawab(res, { ok: false, pesan: 'Server sedang penuh. Tunggu beberapa menit lalu coba lagi.' }, 503)
    }
    const ruang = buatRuang({
      kode,
      tuanRumah: dari,
      nama: permintaan.nama,
      pengaturan: permintaan.pengaturan,
      waktu: Date.now(),
    })
    ruangan.set(kode, { ruang, disentuh: Date.now() })
    return jawab(res, { ok: true, ruang: pandangan(ruang, dari) })
  }

  const baris = ruangan.get(kode)
  if (!baris) return jawab(res, { ok: false, pesan: 'Ruang tidak ditemukan.' }, 404)

  if (permintaan.aksi === 'lihat') {
    return jawab(res, { ok: true, ruang: pandangan(baris.ruang, dari) })
  }

  if (permintaan.aksi === 'perintah') {
    // Node menjalankan ini satu per satu, jadi tidak ada dua perintah yang
    // saling menimpa — kunci optimistik seperti di Edge Function tidak perlu.
    let berikut: Ruang
    try {
      berikut = langkahRuang(baris.ruang, permintaan.perintah, {
        dari,
        waktu: Date.now(),
        id: crypto.randomUUID(),
      })
    } catch (e) {
      const pesan = e instanceof Error ? e.message : 'Perintah ditolak.'
      return jawab(res, { ok: false, pesan }, 400)
    }
    baris.disentuh = Date.now()
    if (berikut !== baris.ruang) {
      baris.ruang = berikut
      kabarkan(kode, berikut.urut)
    }
    return jawab(res, { ok: true, ruang: pandangan(berikut, dari) })
  }

  return jawab(res, { ok: false, pesan: 'Aksi tidak dikenal.' }, 400)
}

// ------------------------------------------------------------------ Berkas statis
async function sajikan(res: ServerResponse, jalurUrl: string) {
  // normalize + cek prefiks: cegah '../' keluar dari folder build.
  const bersih = normalize(decodeURIComponent(jalurUrl)).replace(/^(\.\.[/\\])+/, '')
  let berkas = resolve(join(AKAR, bersih))
  if (!berkas.startsWith(AKAR)) berkas = join(AKAR, 'index.html')

  let info = await stat(berkas).catch(() => null)
  if (info?.isDirectory()) {
    berkas = join(berkas, 'index.html')
    info = await stat(berkas).catch(() => null)
  }
  // Rute apa pun yang tidak ada berkasnya dilayani index.html (aplikasi satu halaman).
  if (!info?.isFile()) {
    berkas = join(AKAR, 'index.html')
    info = await stat(berkas).catch(() => null)
  }
  if (!info?.isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Build permainan belum ada. Jalankan: pnpm game:build')
    return
  }

  const jenis = JENIS[extname(berkas).toLowerCase()] ?? 'application/octet-stream'
  // Berkas ber-hash boleh disimpan lama; index.html tidak, supaya build baru terlihat.
  const simpan = /-[\dA-Za-z_-]{8,}\.\w+$/.test(berkas) ? 'public, max-age=31536000, immutable' : 'no-cache'
  res.writeHead(200, { 'content-type': jenis, 'content-length': info.size, 'cache-control': simpan })
  createReadStream(berkas).pipe(res)
}

// ------------------------------------------------------------------ Server
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, LINTAS_ASAL)
    res.end()
    return
  }

  if (url.pathname === '/api/ruang/aliran') {
    const kode = (url.searchParams.get('kode') ?? '').toUpperCase().slice(0, 8)
    if (!kode) return jawab(res, { ok: false, pesan: 'Kode ruang wajib diisi.' }, 400)
    aliran(req, res, kode)
    return
  }

  if (url.pathname === '/api/ruang') {
    if (req.method !== 'POST') return jawab(res, { ok: false, pesan: 'Metode tidak didukung.' }, 405)
    void bacaBadan(req)
      .then((badan) => tanganiApi(res, badan as Permintaan))
      .catch(() => jawab(res, { ok: false, pesan: 'Isi permintaan bukan JSON yang sah.' }, 400))
    return
  }

  if (url.pathname === '/api/sehat') return jawab(res, { ok: true, ruang: ruangan.size })

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return jawab(res, { ok: false, pesan: 'Metode tidak didukung.' }, 405)
  }
  void sajikan(res, url.pathname)
})

setInterval(() => {
  const batas = Date.now() - UMUR_RUANG_MS
  for (const [kode, baris] of ruangan) {
    if (baris.disentuh < batas) ruangan.delete(kode)
  }
}, JEDA_BERSIH_MS).unref()

server.listen(PORT, () => {
  console.log(`Server ruang siap di http://localhost:${PORT}`)
  console.log(`Menyajikan ${AKAR}`)
})
