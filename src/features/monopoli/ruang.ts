/**
 * Bentuk data ruang permainan daring.
 *
 * Satu "ruang" berisi peserta, kursi, permainan yang sedang berjalan, dan
 * obrolan. Semuanya JSON murni supaya bisa disimpan di baris basis data dan
 * disiarkan apa adanya. Logikanya ada di `mesin-ruang.ts`, yang juga murni.
 */
import type { Aksi, PengaturanPermainan, Permainan } from './tipe'

export const PANJANG_KODE = 5
export const MAKS_OBROLAN = 120
export const MAKS_HURUF_PESAN = 300
/** 8 tim = 16 kursi, sisanya penonton. Batas ini menjaga server yang terbuka
 *  ke publik dari ruang yang digelembungkan tanpa batas. */
export const MAKS_PESERTA = 24

export type Peserta = {
  id: string
  nama: string
  /** Stempel waktu terakhir peserta terlihat; dipakai menandai yang terputus. */
  terlihat: number
}

/**
 * Satu kursi = satu pion. Nomor kursi tetap walau pesertanya berganti, jadi
 * pemain yang sambung ulang bisa kembali ke pion yang sama.
 */
export type Kursi = {
  /** Indeks pemain di dalam `Permainan.pemain`. */
  pemain: number
  tim: number
  /** 0 = pion bulat, 1 = pion permata. */
  nomor: 0 | 1
  peserta: string | null
}

export type SaluranObrolan = 'semua' | 'tim'

export type PesanObrolan = {
  id: string
  peserta: string
  nama: string
  saluran: SaluranObrolan
  /** Diisi hanya untuk saluran tim. */
  tim: number | null
  teks: string
  waktu: number
}

export type Ruang = {
  versi: 1
  kode: string
  /** Peserta yang membuat ruang; satu-satunya yang boleh mengatur & memulai. */
  tuanRumah: string
  pengaturan: PengaturanPermainan
  peserta: Peserta[]
  kursi: Kursi[]
  permainan: Permainan | null
  obrolan: PesanObrolan[]
  /** Naik pada tiap perubahan. Dipakai sebagai kunci optimistik. */
  urut: number
}

export type PerintahRuang =
  | { jenis: 'gabung'; nama: string }
  | { jenis: 'pergi' }
  | { jenis: 'atur'; pengaturan: PengaturanPermainan }
  | { jenis: 'duduk'; kursi: number }
  | { jenis: 'berdiri'; kursi: number }
  | { jenis: 'mulai' }
  | { jenis: 'aksi'; aksi: Aksi }
  | { jenis: 'obrol'; saluran: SaluranObrolan; teks: string }
  | { jenis: 'bubar' }

export type KonteksPerintah = {
  /** Peserta pengirim. */
  dari: string
  waktu: number
  /** Id acak untuk pesan obrolan; disuntik supaya reducer tetap murni. */
  id: string
}

/** Ditolak karena aturan ruang, bukan karena aturan permainan. */
export class GalatRuang extends Error {}

export function kursiPeserta(ruang: Ruang, peserta: string): Kursi[] {
  return ruang.kursi.filter((k) => k.peserta === peserta)
}

export function timPeserta(ruang: Ruang, peserta: string): number | null {
  return kursiPeserta(ruang, peserta)[0]?.tim ?? null
}

export function semuaKursiTerisi(ruang: Ruang) {
  return ruang.kursi.length > 0 && ruang.kursi.every((k) => k.peserta !== null)
}
