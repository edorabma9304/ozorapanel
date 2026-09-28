/**
 * Transport daring lintas perangkat lewat server ruang sendiri.
 *
 * Bedanya dengan `transport-supabase.ts` hanya tempat mesinnya berjalan:
 * di sini sebuah proses Node (`server/ruang.ts`) yang memegang keadaan dan
 * menyajikan build permainan sekaligus. Dipakai saat permainan dibagikan lewat
 * tunnel atau dipasang di satu VPS, tanpa layanan pihak ketiga.
 *
 * Alur satu perubahan:
 * 1. Klien POST perintah ke `<basis>/ruang`.
 * 2. Server menjalankan mesin, menaikkan nomor urut, lalu mengabarkan nomor
 *    urut terbaru ke semua pendengar lewat SSE `<basis>/ruang/aliran`.
 * 3. Setiap klien mengambil pandangannya sendiri dengan aksi `lihat`.
 *
 * Yang dikabarkan hanya nomor urut, bukan isi ruangnya — obrolan tim dan benih
 * dadu berbeda per penerima, jadi pandangan tidak boleh disiarkan bersama.
 *
 * Aktifkan dengan menyetel VITE_SERVER_RUANG saat build, mis. '/api'.
 */
import { APP } from '@/config/app'
import type { PerintahRuang, Ruang } from './ruang'
import { idPeserta, type StatusTransport, type Transport } from './transport'
import type { PengaturanPermainan } from './tipe'

/** Jaring pengaman bila satu kabar SSE terlewat atau alirannya terputus. */
const JEDA_JAJAK_MS = 8000

/** Apakah build ini punya server ruang. */
export function serverRuangSiap() {
  return Boolean(APP.serverRuang)
}

/** Buang garis miring di ujung supaya `${basis}/ruang` tidak jadi '//ruang'. */
function basis() {
  return APP.serverRuang.replace(/\/+$/, '')
}

type Jawaban = { ok: true; ruang: Ruang } | { ok: false; pesan: string }

export function transportHttp(opsi: {
  kode: string
  nama: string
  pengaturan?: PengaturanPermainan
}): Transport {
  if (!APP.serverRuang) {
    throw new Error('Server ruang belum dikonfigurasi. Setel VITE_SERVER_RUANG saat build.')
  }

  const id = idPeserta()
  const pendengar = new Set<Parameters<Transport['langgan']>[0]>()
  let ruang: Ruang | null = null
  let status: StatusTransport = 'menyambung'
  let galat: string | null = null
  let hidup = true
  let aliran: EventSource | null = null
  let jajak: ReturnType<typeof setInterval> | null = null

  function siarkan() {
    const keadaan = { ruang, status, galat }
    for (const cb of pendengar) cb(keadaan)
  }

  async function panggil(badan: Record<string, unknown>): Promise<Jawaban> {
    try {
      const jawab = await fetch(`${basis()}/ruang`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kode: opsi.kode, dari: id, ...badan }),
      })
      return (await jawab.json()) as Jawaban
    } catch {
      return { ok: false, pesan: 'Tidak bisa menghubungi server permainan. Periksa koneksi, lalu coba lagi.' }
    }
  }

  function terima(jawaban: Jawaban, { diamkanGagal = false } = {}) {
    if (!hidup) return
    if (jawaban.ok) {
      ruang = jawaban.ruang
      status = 'tersambung'
      galat = null
    } else if (!diamkanGagal) {
      // "Ruang tidak ditemukan" hanya berarti kodenya salah, bukan sambungan putus.
      if (/tidak ditemukan/i.test(jawaban.pesan) && !ruang) status = 'tidak-ada'
      else galat = jawaban.pesan
    }
    siarkan()
  }

  async function segarkan(diamkanGagal = false) {
    terima(await panggil({ aksi: 'lihat' }), { diamkanGagal })
  }

  async function mulai() {
    if (opsi.pengaturan) {
      terima(await panggil({ aksi: 'buat', nama: opsi.nama, pengaturan: opsi.pengaturan }))
    } else {
      await segarkan()
    }
    if (!hidup) return

    // EventSource menyambung ulang sendiri bila alirannya putus; jajak berkala
    // tetap ada untuk kasus alirannya tersangkut di perantara jaringan.
    aliran = new EventSource(`${basis()}/ruang/aliran?kode=${encodeURIComponent(opsi.kode)}`)
    aliran.addEventListener('urut', () => void segarkan(true))

    jajak = setInterval(() => void segarkan(true), JEDA_JAJAK_MS)
  }

  void mulai()

  return {
    id,
    kode: opsi.kode,
    langgan(cb) {
      pendengar.add(cb)
      cb({ ruang, status, galat })
      return () => pendengar.delete(cb)
    },
    kirim(perintah: PerintahRuang) {
      void panggil({ aksi: 'perintah', perintah }).then((j) => terima(j))
    },
    tutup() {
      hidup = false
      void panggil({ aksi: 'perintah', perintah: { jenis: 'pergi' } })
      if (jajak) clearInterval(jajak)
      if (aliran) aliran.close()
      pendengar.clear()
    },
  }
}
