// oxlint-disable unicorn/require-post-message-target-origin -- aturan itu untuk
// window.postMessage; BroadcastChannel.postMessage memang tanpa targetOrigin.
/**
 * Jalur pengiriman perintah ruang. Papan hanya bicara ke antarmuka ini, jadi
 * mengganti backend berarti menulis satu berkas transport, bukan menyunting
 * layar permainan — pola yang sama dengan driver data di `src/lib/adapter`.
 *
 * Dua transport tersedia:
 * - `transportSiaran` — BroadcastChannel, hanya antar tab di browser yang
 *   sama. Dipakai untuk mencoba dan menguji tanpa server.
 * - `transportSupabase` — sungguhan, lintas perangkat (lihat berkas terpisah).
 */
import { APP } from '@/config/app'
import { buatKode, buatRuang, langkahRuang, pandangan } from './mesin-ruang'
import { GalatRuang, type PerintahRuang, type Ruang } from './ruang'
import type { PengaturanPermainan } from './tipe'

export type StatusTransport = 'menyambung' | 'tersambung' | 'tidak-ada' | 'putus'

export type Transport = {
  /** Id peserta kita di ruang ini. */
  id: string
  kode: string
  langgan(cb: (keadaan: { ruang: Ruang | null; status: StatusTransport; galat: string | null }) => void): () => void
  kirim(perintah: PerintahRuang): void
  tutup(): void
}

const KUNCI_ID = `${APP.prefiksSimpanan}monopoli_peserta`

/** Id peserta bertahan lintas muat ulang supaya bisa kembali ke kursinya. */
export function idPeserta(): string {
  try {
    const ada = localStorage.getItem(KUNCI_ID)
    if (ada) return ada
    const baru = `p_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(KUNCI_ID, baru)
    return baru
  } catch {
    return `p_${Math.random().toString(36).slice(2, 10)}`
  }
}

export { buatKode }

// ------------------------------------------------------------------ Siaran antar tab
type PesanSiaran =
  | { t: 'halo'; dari: string }
  | { t: 'perintah'; dari: string; id: string; waktu: number; perintah: PerintahRuang }
  | { t: 'keadaan'; untuk: string; ruang: Ruang }
  | { t: 'galat'; untuk: string; pesan: string }
  | { t: 'tiada'; untuk: string }

/**
 * Transport tanpa server: tab yang membuat ruang memegang keadaan sebenarnya
 * dan melayani tab lain. Cukup untuk mencoba berdua di satu komputer; untuk
 * lintas perangkat pakai transport Supabase.
 */
export function transportSiaran(opsi: {
  kode: string
  nama: string
  /** Isi bila kita yang membuat ruang. */
  pengaturan?: PengaturanPermainan
}): Transport {
  const id = idPeserta()
  const kanal = new BroadcastChannel(`${APP.prefiksSimpanan}monopoli_${opsi.kode}`)
  const pendengar = new Set<Parameters<Transport['langgan']>[0]>()

  let tuanRumah = Boolean(opsi.pengaturan)
  let ruang: Ruang | null = opsi.pengaturan
    ? buatRuang({ kode: opsi.kode, tuanRumah: id, nama: opsi.nama, pengaturan: opsi.pengaturan, waktu: Date.now() })
    : null
  let status: StatusTransport = tuanRumah ? 'tersambung' : 'menyambung'
  let galat: string | null = null

  function siarkan() {
    const keadaan = { ruang, status, galat }
    for (const cb of pendengar) cb(keadaan)
  }

  /** Tuan rumah mengirim pandangan yang sudah disaring ke tiap peserta. */
  function layani() {
    if (!ruang) return
    for (const p of ruang.peserta) {
      kanal.postMessage({ t: 'keadaan', untuk: p.id, ruang: pandangan(ruang, p.id) } satisfies PesanSiaran)
    }
    siarkan()
  }

  function terapkan(dari: string, perintah: PerintahRuang, idPesan: string, waktu: number) {
    if (!ruang) return
    try {
      ruang = langkahRuang(ruang, perintah, { dari, waktu, id: idPesan })
      galat = null
    } catch (e) {
      const pesan = e instanceof GalatRuang || e instanceof Error ? e.message : 'Perintah ditolak.'
      if (dari === id) galat = pesan
      else kanal.postMessage({ t: 'galat', untuk: dari, pesan } satisfies PesanSiaran)
    }
    layani()
  }

  kanal.addEventListener('message', (ev: MessageEvent<PesanSiaran>) => {
    const pesan = ev.data
    if (tuanRumah) {
      if (pesan.t === 'halo') {
        if (ruang) kanal.postMessage({ t: 'keadaan', untuk: pesan.dari, ruang: pandangan(ruang, pesan.dari) } satisfies PesanSiaran)
        else kanal.postMessage({ t: 'tiada', untuk: pesan.dari } satisfies PesanSiaran)
        return
      }
      if (pesan.t === 'perintah') terapkan(pesan.dari, pesan.perintah, pesan.id, pesan.waktu)
      return
    }
    if (pesan.t === 'keadaan' && pesan.untuk === id) {
      ruang = pesan.ruang
      status = 'tersambung'
      galat = null
      siarkan()
    }
    if (pesan.t === 'tiada' && pesan.untuk === id) {
      status = 'tidak-ada'
      siarkan()
    }
    if (pesan.t === 'galat' && pesan.untuk === id) {
      galat = pesan.pesan
      siarkan()
    }
  })

  if (!tuanRumah) {
    kanal.postMessage({ t: 'halo', dari: id } satisfies PesanSiaran)
    // Tidak ada yang menjawab berarti tidak ada tab yang memegang ruang itu.
    setTimeout(() => {
      if (status === 'menyambung') {
        status = 'tidak-ada'
        siarkan()
      }
    }, 900)
  }

  return {
    id,
    kode: opsi.kode,
    langgan(cb) {
      pendengar.add(cb)
      cb({ ruang, status, galat })
      return () => pendengar.delete(cb)
    },
    kirim(perintah) {
      const idPesan = `m_${Math.random().toString(36).slice(2, 10)}`
      if (tuanRumah) terapkan(id, perintah, idPesan, Date.now())
      else kanal.postMessage({ t: 'perintah', dari: id, id: idPesan, waktu: Date.now(), perintah } satisfies PesanSiaran)
    },
    tutup() {
      try {
        this.kirim({ jenis: 'pergi' })
      } catch {
        // kanal mungkin sudah tertutup
      }
      pendengar.clear()
      kanal.close()
      tuanRumah = false
    },
  }
}
