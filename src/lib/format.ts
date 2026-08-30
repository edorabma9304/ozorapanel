/**
 * Pemformatan angka, mata uang, dan tanggal — semua dalam locale Indonesia.
 * Semua fungsi di sini WAJIB punya test (lihat format.test.ts).
 */

const NBSP = / /g

const fmtRupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const fmtAngka = new Intl.NumberFormat('id-ID')

/** 1500000 -> "Rp 1.500.000". Nilai tak valid jadi "Rp 0". */
export function formatRp(nilai: number | null | undefined): string {
  const n = Number(nilai)
  if (!Number.isFinite(n)) return 'Rp 0'
  return fmtRupiah.format(n).replace(NBSP, ' ')
}

/** Versi ringkas untuk kartu statistik: 1250000 -> "Rp 1,25 jt". */
export function formatRpRingkas(nilai: number | null | undefined): string {
  const n = Number(nilai)
  if (!Number.isFinite(n)) return 'Rp 0'
  const abs = Math.abs(n)
  const tanda = n < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${tanda}Rp ${formatAngka(abs / 1_000_000_000, 2)} M`
  if (abs >= 1_000_000) return `${tanda}Rp ${formatAngka(abs / 1_000_000, 2)} jt`
  if (abs >= 1_000) return `${tanda}Rp ${formatAngka(abs / 1_000, 1)} rb`
  return formatRp(n)
}

/** 1234.5 -> "1.234,5". `desimal` membatasi angka di belakang koma. */
export function formatAngka(nilai: number | null | undefined, desimal?: number): string {
  const n = Number(nilai)
  if (!Number.isFinite(n)) return '0'
  if (desimal === undefined) return fmtAngka.format(n)
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: desimal,
  }).format(n)
}

/** 0.1234 -> "12,3%". Masukkan rasio (0–1), bukan angka persen. */
export function formatPersen(rasio: number | null | undefined, desimal = 1): string {
  const n = Number(rasio)
  if (!Number.isFinite(n)) return '0%'
  return `${formatAngka(n * 100, desimal)}%`
}

function keTanggal(nilai: Date | string | number | null | undefined): Date | null {
  if (nilai === null || nilai === undefined || nilai === '') return null
  const d = nilai instanceof Date ? nilai : new Date(nilai)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "2026-08-30" -> "30 Agu 2026". Format "panjang" -> "30 Agustus 2026". */
export function formatTanggal(
  nilai: Date | string | number | null | undefined,
  gaya: 'pendek' | 'panjang' | 'numerik' = 'pendek',
): string {
  const d = keTanggal(nilai)
  if (!d) return '-'
  const opsi: Intl.DateTimeFormatOptions =
    gaya === 'panjang'
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : gaya === 'numerik'
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' }
  return new Intl.DateTimeFormat('id-ID', opsi).format(d).replace(NBSP, ' ')
}

/** "30 Agu 2026, 14.05" */
export function formatTanggalWaktu(nilai: Date | string | number | null | undefined): string {
  const d = keTanggal(nilai)
  if (!d) return '-'
  const tgl = formatTanggal(d)
  const jam = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(d)
  return `${tgl}, ${jam}`
}

const SATUAN_RELATIF: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31_536_000_000],
  ['month', 2_592_000_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** "3 hari yang lalu" / "dalam 2 jam". */
export function formatWaktuRelatif(
  nilai: Date | string | number | null | undefined,
  sekarang: Date = new Date(),
): string {
  const d = keTanggal(nilai)
  if (!d) return '-'
  const selisih = d.getTime() - sekarang.getTime()
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  for (const [satuan, ms] of SATUAN_RELATIF) {
    if (Math.abs(selisih) >= ms) return rtf.format(Math.round(selisih / ms), satuan)
  }
  return 'baru saja'
}

/** Potong teks panjang dengan elipsis, tanpa memotong di tengah kata. */
export function potong(teks: string, maks = 60): string {
  if (teks.length <= maks) return teks
  const potongan = teks.slice(0, maks)
  const spasi = potongan.lastIndexOf(' ')
  return `${(spasi > maks * 0.6 ? potongan.slice(0, spasi) : potongan).trimEnd()}…`
}

/** 2048 -> "2 KB". */
export function formatUkuranBerkas(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const satuan = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), satuan.length - 1)
  return `${formatAngka(bytes / 1024 ** i, i === 0 ? 0 : 1)} ${satuan[i]}`
}
