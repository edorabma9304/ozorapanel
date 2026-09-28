/**
 * Durable Object satu ruang permainan.
 *
 * Tugasnya sama dengan `server/ruang.ts` versi Node dan Edge Function Deno:
 * menjadi satu-satunya pihak yang menjalankan mesin, lalu mengabarkan nomor
 * urut terbaru ke semua klien. Bedanya hanya tempat keadaan disimpan.
 *
 * Kenapa nomor urut saja yang dikabarkan: isi ruang berbeda per penerima
 * (obrolan tim disaring, benih dadu disensor), jadi pandangan tidak boleh
 * disiarkan bersama-sama. Setiap klien meminta pandangannya sendiri.
 *
 * Keadaan ditulis ke penyimpanan objek, jadi ruang tetap hidup walau objeknya
 * sempat ditidurkan Cloudflare di tengah permainan.
 */
import { buatRuang, langkahRuang, pandangan } from '../src/features/monopoli/mesin-ruang'
import type { PerintahRuang, Ruang } from '../src/features/monopoli/ruang'
import type { PengaturanPermainan } from '../src/features/monopoli/tipe'

const KUNCI = 'ruang'
/** Komentar berkala supaya perantara jaringan tidak menutup aliran yang diam. */
const JEDA_DENYUT_MS = 25_000
const MAKS_PESERTA_SIARAN = 40

type Permintaan =
  | { aksi: 'buat'; kode: string; dari: string; nama: string; pengaturan: PengaturanPermainan }
  | { aksi: 'lihat'; kode: string; dari: string }
  | { aksi: 'perintah'; kode: string; dari: string; perintah: PerintahRuang }

function jawab(isi: unknown, status = 200) {
  return new Response(JSON.stringify(isi), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export class RuangPermainan implements DurableObject {
  #ctx: DurableObjectState
  #ruang: Ruang | null = null
  #dimuat = false
  #penulis = new Set<WritableStreamDefaultWriter<Uint8Array>>()
  #penyandi = new TextEncoder()

  constructor(ctx: DurableObjectState) {
    this.#ctx = ctx
  }

  async #muat() {
    if (this.#dimuat) return
    this.#ruang = (await this.#ctx.storage.get<Ruang>(KUNCI)) ?? null
    this.#dimuat = true
  }

  async #simpan(ruang: Ruang) {
    this.#ruang = ruang
    await this.#ctx.storage.put(KUNCI, ruang)
  }

  /** Kabarkan nomor urut terbaru; penulis yang sudah putus dibuang. */
  async #kabarkan(urut: number) {
    const pesan = this.#penyandi.encode(`event: urut\ndata: ${JSON.stringify({ urut })}\n\n`)
    await Promise.all(
      [...this.#penulis].map(async (w) => {
        try {
          await w.write(pesan)
        } catch {
          this.#penulis.delete(w)
        }
      }),
    )
  }

  #aliran(): Response {
    if (this.#penulis.size >= MAKS_PESERTA_SIARAN) {
      return jawab({ ok: false, pesan: 'Terlalu banyak pendengar di ruang ini.' }, 503)
    }
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const penulis = writable.getWriter()
    this.#penulis.add(penulis)
    void penulis.write(this.#penyandi.encode(': tersambung\n\n'))

    const denyut = setInterval(() => {
      penulis.write(this.#penyandi.encode(': denyut\n\n')).catch(() => {
        clearInterval(denyut)
        this.#penulis.delete(penulis)
      })
    }, JEDA_DENYUT_MS)

    return new Response(readable, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        // Cegah perantara menahan aliran di bufernya.
        'x-accel-buffering': 'no',
      },
    })
  }

  async fetch(req: Request): Promise<Response> {
    await this.#muat()
    const url = new URL(req.url)

    if (url.pathname === '/api/ruang/aliran') return this.#aliran()
    if (url.pathname !== '/api/ruang') return jawab({ ok: false, pesan: 'Alamat tidak dikenal.' }, 404)
    if (req.method !== 'POST') return jawab({ ok: false, pesan: 'Metode tidak didukung.' }, 405)

    let permintaan: Permintaan
    try {
      permintaan = (await req.json()) as Permintaan
    } catch {
      return jawab({ ok: false, pesan: 'Isi permintaan bukan JSON yang sah.' }, 400)
    }

    const kode = String(permintaan.kode ?? '').toUpperCase().slice(0, 8)
    const dari = String(permintaan.dari ?? '').slice(0, 64)
    if (!kode || !dari) return jawab({ ok: false, pesan: 'Kode ruang dan identitas wajib diisi.' }, 400)

    if (permintaan.aksi === 'buat') {
      if (this.#ruang) return jawab({ ok: false, pesan: 'Kode ruang itu sudah dipakai, coba lagi.' }, 409)
      const ruang = buatRuang({
        kode,
        tuanRumah: dari,
        nama: permintaan.nama,
        pengaturan: permintaan.pengaturan,
        waktu: Date.now(),
      })
      await this.#simpan(ruang)
      return jawab({ ok: true, ruang: pandangan(ruang, dari) })
    }

    const sekarang = this.#ruang
    if (!sekarang) return jawab({ ok: false, pesan: 'Ruang tidak ditemukan.' }, 404)

    if (permintaan.aksi === 'lihat') return jawab({ ok: true, ruang: pandangan(sekarang, dari) })

    if (permintaan.aksi === 'perintah') {
      // Durable Object menjalankan permintaan satu per satu, jadi tidak ada dua
      // perintah yang saling menimpa — kunci optimistik tidak diperlukan.
      let berikut: Ruang
      try {
        berikut = langkahRuang(sekarang, permintaan.perintah, {
          dari,
          waktu: Date.now(),
          id: crypto.randomUUID(),
        })
      } catch (e) {
        return jawab({ ok: false, pesan: e instanceof Error ? e.message : 'Perintah ditolak.' }, 400)
      }
      if (berikut !== sekarang) {
        await this.#simpan(berikut)
        await this.#kabarkan(berikut.urut)
      }
      return jawab({ ok: true, ruang: pandangan(berikut, dari) })
    }

    return jawab({ ok: false, pesan: 'Aksi tidak dikenal.' }, 400)
  }
}
