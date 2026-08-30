import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gabung class Tailwind dengan aman — kelas terakhir menang saat bentrok. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Tunda eksekusi sampai pemanggilan berhenti selama `jeda` ms. */
export function debounce<T extends (...args: never[]) => void>(fn: T, jeda = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const terbungkus = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), jeda)
  }
  terbungkus.batal = () => timer && clearTimeout(timer)
  return terbungkus
}

/** ID acak yang aman secara kriptografis — untuk id sementara di sisi klien. */
export function idAcak(panjang = 12) {
  const bytes = new Uint8Array(panjang)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, panjang)
}

/** Inisial dari nama, maksimal 2 huruf. */
export function inisial(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k.charAt(0).toUpperCase())
    .join('')
}

/** Ubah teks jadi slug aman URL. */
export function slug(teks: string) {
  return teks
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function tunggu(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
