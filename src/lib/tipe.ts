import type { Peran } from '@/config/peran'

/** Kolom wajib setiap entitas — lihat .claude/rules/database.md */
export type Entitas = {
  id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export type Pengguna = Entitas & {
  nama: string
  email: string
  peran: Peran
  avatar_url?: string | null
  telepon?: string | null
  jabatan?: string | null
  aktif: boolean
  terakhir_masuk?: string | null
}

/** Satu baris jejak audit. Halaman /audit tetap ada setelah `pnpm demo:strip`,
 *  jadi tipenya tinggal di sini, bukan di berkas data peraga. */
export type Audit = Entitas & {
  aktor_nama: string
  aktor_email: string
  aksi: 'buat' | 'ubah' | 'hapus' | 'masuk' | 'keluar' | 'ekspor'
  modul: string
  ringkasan: string
  ip: string
  waktu: string
}

export type ArahUrut = 'naik' | 'turun'

export type KueriDaftar = {
  halaman?: number
  perHalaman?: number
  cari?: string
  urut?: { kolom: string; arah: ArahUrut }
  /** Filter kesetaraan sederhana: { status: 'lunas' }. Nilai undefined diabaikan. */
  filter?: Record<string, string | number | boolean | null | undefined>
  /** Sertakan baris yang sudah di-soft-delete. */
  termasukTerhapus?: boolean
}

export type Halaman<T> = {
  data: T[]
  total: number
  halaman: number
  perHalaman: number
  totalHalaman: number
}

/** Bentuk balasan API sesuai .claude/rules/api.md */
export type BalasanApi<T> = {
  success: boolean
  data: T
  message?: string
}

/** Galat yang aman ditampilkan ke pengguna — pesan sudah dalam Bahasa Indonesia. */
export class GalatApi extends Error {
  readonly kode: number
  readonly detail?: unknown

  constructor(pesan: string, kode = 500, detail?: unknown) {
    super(pesan)
    this.name = 'GalatApi'
    this.kode = kode
    this.detail = detail
  }
}

const PESAN_STATUS: Record<number, string> = {
  400: 'Data yang dikirim tidak valid. Periksa kembali isian Anda.',
  401: 'Sesi Anda sudah berakhir. Silakan masuk kembali.',
  403: 'Anda tidak punya akses ke tindakan ini.',
  404: 'Data yang dicari tidak ditemukan.',
  409: 'Data sudah ada atau sedang dipakai.',
  422: 'Ada isian yang belum sesuai.',
  429: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.',
  500: 'Terjadi gangguan di server. Coba beberapa saat lagi.',
  503: 'Layanan sedang tidak tersedia. Coba lagi nanti.',
}

/** Ubah galat apa pun jadi pesan yang aman dibaca pengguna (tanpa bocor detail internal). */
export function pesanRamah(galat: unknown): string {
  if (galat instanceof GalatApi) return galat.message
  if (galat instanceof Error) {
    if (galat.message.includes('Failed to fetch') || galat.message.includes('NetworkError')) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    }
  }
  return PESAN_STATUS[500]!
}

export function galatDariStatus(status: number, detail?: unknown): GalatApi {
  return new GalatApi(PESAN_STATUS[status] ?? PESAN_STATUS[500]!, status, detail)
}
