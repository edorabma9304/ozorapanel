/**
 * Perhitungan kontras WCAG 2.1.
 *
 * Dipakai untuk menurunkan warna teks dari warna merek yang dipilih
 * administrator. Tanpa ini, memilih warna cerah sebagai warna utama akan
 * menghasilkan tombol yang tidak terbaca — dan itu baru ketahuan saat diaudit,
 * bukan saat dilihat.
 */

export const TEKS_TERANG = '#ffffff'
export const TEKS_GELAP = '#101828'

function keRgb(heks: string): [number, number, number] {
  const n = Number.parseInt(heks.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function keHeks([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`
}

/** Luminansi relatif menurut WCAG 2.1. */
export function luminansi(heks: string): number {
  const c = keRgb(heks).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** Rasio kontras antara dua warna, 1–21. */
export function kontras(a: string, b: string): number {
  const [terang, gelap] = [luminansi(a), luminansi(b)].sort((x, y) => y - x) as [number, number]
  return (terang + 0.05) / (gelap + 0.05)
}

/** Pilih teks putih atau gelap — mana pun yang kontrasnya lebih tinggi. */
export function teksTerbaca(latar: string): string {
  return kontras(latar, TEKS_TERANG) >= kontras(latar, TEKS_GELAP) ? TEKS_TERANG : TEKS_GELAP
}

/** Kontras terbaik yang bisa dicapai warna ini dengan teks putih atau gelap. */
export function kontrasTerbaik(latar: string): number {
  return Math.max(kontras(latar, TEKS_TERANG), kontras(latar, TEKS_GELAP))
}

export function lolosAA(latar: string): boolean {
  return kontrasTerbaik(latar) >= 4.5
}

/** Terangkan/gelapkan warna sejumlah poin luminansi HSL, rona dipertahankan. */
export function geserTerang(heks: string, poin: number): string {
  let [r, g, b] = keRgb(heks).map((v) => v / 255) as [number, number, number]
  const maks = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (maks + min) / 2
  if (maks !== min) {
    const d = maks - min
    s = l > 0.5 ? d / (2 - maks - min) : d / (maks + min)
    h = maks === r ? (g - b) / d + (g < b ? 6 : 0) : maks === g ? (b - r) / d + 2 : (r - g) / d + 4
    h /= 6
  }
  const lBaru = Math.min(1, Math.max(0, l + poin / 100))
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(lBaru, 1 - lBaru)
    return (lBaru - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255
  }
  return keHeks([f(0), f(8), f(4)])
}

/**
 * Turunkan varian warna merek untuk kedua tema.
 *
 * Mode gelap memakai versi yang lebih terang — warna pekat di atas permukaan
 * gelap sulit dibedakan dari latarnya.
 */
export function varianMerek(warna: string) {
  const gelap = geserTerang(warna, 12)
  return {
    terang: { isi: warna, teks: teksTerbaca(warna) },
    gelap: { isi: gelap, teks: teksTerbaca(gelap) },
  }
}
