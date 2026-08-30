import { APP, KUNCI_SIMPANAN } from './app'

/**
 * Identitas visual aplikasi.
 *
 * Nilai bawaan ada di sini; administrator bisa menimpanya lewat halaman
 * Pengaturan → Merek. Timpaan disimpan di localStorage untuk driver `mock`
 * — pada backend sungguhan, simpan di tabel pengaturan dan muat saat aplikasi start.
 */
export type Merek = {
  nama: string
  singkatan: string
  /** URL logo terang. Kosong = pakai lambang SVG bawaan. */
  logoTerang: string
  /** URL logo untuk mode gelap. Kosong = pakai logoTerang. */
  logoGelap: string
  /** Emoji atau URL gambar untuk favicon. Kosong = lambang bawaan. */
  favicon: string
  warnaUtama: string
  warnaAksen: string
}

export const MEREK_BAWAAN: Merek = {
  nama: APP.nama,
  singkatan: 'OP',
  logoTerang: '',
  logoGelap: '',
  favicon: '',
  warnaUtama: '#3469ff',
  warnaAksen: '#49beff',
}

const KUNCI = `${APP.prefiksSimpanan}merek`

export function bacaMerek(): Merek {
  try {
    const mentah = localStorage.getItem(KUNCI)
    return mentah ? { ...MEREK_BAWAAN, ...(JSON.parse(mentah) as Partial<Merek>) } : MEREK_BAWAAN
  } catch {
    return MEREK_BAWAAN
  }
}

export function simpanMerek(merek: Merek) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(merek))
  } catch {
    // Mode privat — perubahan tetap berlaku sampai halaman ditutup.
  }
  terapkanWarna(merek)
  terapkanFavicon(merek)
  for (const cb of pendengar) cb(merek)
}

/** Timpa token warna Tailwind di tingkat dokumen. */
export function terapkanWarna(merek: Merek) {
  const akar = document.documentElement
  if (merek.warnaUtama) akar.style.setProperty('--primary', merek.warnaUtama)
  if (merek.warnaAksen) akar.style.setProperty('--secondary', merek.warnaAksen)
  akar.style.setProperty('--ring', merek.warnaUtama || '#5d87ff')
}

/** Tulis ulang <link rel="icon"> tanpa memuat ulang halaman. */
export function terapkanFavicon(merek: Merek) {
  const href = merek.favicon
    ? merek.favicon.startsWith('http') || merek.favicon.startsWith('data:')
      ? merek.favicon
      : `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="26" font-size="26">${merek.favicon}</text></svg>`,
        )}`
    : '/favicon.svg'

  let tautan = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!tautan) {
    tautan = document.createElement('link')
    tautan.rel = 'icon'
    document.head.appendChild(tautan)
  }
  tautan.href = href
}

const pendengar = new Set<(m: Merek) => void>()
export function pantauMerek(cb: (m: Merek) => void) {
  pendengar.add(cb)
  return () => {
    pendengar.delete(cb)
  }
}

export { KUNCI_SIMPANAN }
