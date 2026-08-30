import { APP, KUNCI_SIMPANAN } from './app'
import { varianMerek } from '@/lib/warna'

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

const ID_GAYA = 'warna-merek'

/**
 * Timpa token warna merek.
 *
 * Ditulis sebagai elemen <style> berisi blok `:root` dan `.dark` terpisah,
 * BUKAN inline style di documentElement. Inline style berlaku ke kedua tema
 * sekaligus — itu pernah membuat mode gelap memakai warna isi versi terang
 * dengan warna teks versi gelap, dan kontrasnya jatuh ke 4,06:1.
 *
 * Warna teks tidak ditebak: diturunkan dari warna yang dipilih lewat
 * perhitungan kontras WCAG, sehingga warna merek apa pun tetap terbaca.
 */
export function terapkanWarna(merek: Merek) {
  const utama = varianMerek(merek.warnaUtama || MEREK_BAWAAN.warnaUtama)
  const aksen = varianMerek(merek.warnaAksen || MEREK_BAWAAN.warnaAksen)

  const css = `
:root {
  --primary: ${utama.terang.isi};
  --primary-fg: ${utama.terang.teks};
  --secondary: ${aksen.terang.isi};
  --secondary-fg: ${aksen.terang.teks};
  --ring: ${utama.terang.isi};
  --sidebar-active: ${utama.terang.isi};
}
.dark {
  --primary: ${utama.gelap.isi};
  --primary-fg: ${utama.gelap.teks};
  --secondary: ${aksen.gelap.isi};
  --secondary-fg: ${aksen.gelap.teks};
  --ring: ${utama.gelap.isi};
  --sidebar-active: ${utama.gelap.isi};
}`

  let gaya = document.getElementById(ID_GAYA)
  if (!gaya) {
    gaya = document.createElement('style')
    gaya.id = ID_GAYA
    document.head.appendChild(gaya)
  }
  gaya.textContent = css
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
