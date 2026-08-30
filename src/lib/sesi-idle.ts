import { APP } from '@/config/app'

/**
 * Pemantau sesi menganggur.
 *
 * .claude/rules/auth.md: "Session expired → redirect ke halaman login".
 * .claude/rules/security.md: "Session timeout — auto logout setelah idle".
 *
 * Batas waktu dihitung dari aktivitas terakhir yang disimpan di localStorage,
 * bukan dari timer di memori — dengan begitu membuka banyak tab tidak membuat
 * sesi hidup selamanya, dan menutup laptop tetap terhitung sebagai menganggur.
 */

export const MENIT_IDLE = 30
export const MENIT_PERINGATAN = 2

const KUNCI = `${APP.prefiksSimpanan}aktivitas_terakhir`
const PERISTIWA = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'visibilitychange'] as const

function catatAktivitas() {
  try {
    localStorage.setItem(KUNCI, String(Date.now()))
  } catch {
    // storage diblokir — pemantauan idle dilewati, bukan alasan menolak masuk
  }
}

export function bacaAktivitasTerakhir(): number {
  try {
    return Number(localStorage.getItem(KUNCI)) || Date.now()
  } catch {
    return Date.now()
  }
}

export function bersihkanAktivitas() {
  try {
    localStorage.removeItem(KUNCI)
  } catch {
    // abaikan
  }
}

/**
 * Mulai memantau. `onPeringatan` dipanggil sekali saat sisa waktu menipis,
 * `onHabis` saat batas terlampaui.
 *
 * Kembalikan fungsi untuk berhenti memantau.
 */
export function pantauIdle({
  menitIdle = MENIT_IDLE,
  menitPeringatan = MENIT_PERINGATAN,
  onPeringatan,
  onHabis,
}: {
  menitIdle?: number
  menitPeringatan?: number
  onPeringatan: (sisaDetik: number) => void
  onHabis: () => void
}) {
  const batas = menitIdle * 60_000
  const ambangPeringatan = menitPeringatan * 60_000
  let sudahMemperingatkan = false

  catatAktivitas()

  const perbarui = () => {
    catatAktivitas()
    sudahMemperingatkan = false
  }

  for (const p of PERISTIWA) {
    window.addEventListener(p, perbarui, { passive: true })
  }

  const jam = setInterval(() => {
    const diam = Date.now() - bacaAktivitasTerakhir()
    if (diam >= batas) {
      onHabis()
      return
    }
    if (diam >= batas - ambangPeringatan && !sudahMemperingatkan) {
      sudahMemperingatkan = true
      onPeringatan(Math.round((batas - diam) / 1000))
    }
  }, 15_000)

  return () => {
    clearInterval(jam)
    for (const p of PERISTIWA) window.removeEventListener(p, perbarui)
  }
}
