/**
 * Tipe inti permainan "Jelajah Dunia" — papan berputar gaya Monopoly yang
 * dimainkan per TIM (2 pemain per tim, maksimal 8 tim).
 *
 * Semua tipe di sini murni data: bisa disimpan ke localStorage atau dikirim
 * ke backend apa adanya. Logika ada di `mesin.ts`, tata letak di `papan.ts`.
 */

export const WARNA_TIM = ['merah', 'biru', 'hijau', 'kuning', 'ungu', 'oranye', 'pink', 'sian'] as const
export type WarnaTim = (typeof WARNA_TIM)[number]

/** Dua pemain dalam satu tim memakai bentuk pion berbeda dengan warna sama. */
export type BentukPion = 'bulat' | 'permata'

export type JenisPetak =
  | 'mulai'
  | 'penjara'
  | 'parkir'
  | 'masuk-penjara'
  | 'bandara'
  | 'properti'
  | 'kesempatan'
  | 'harta'
  | 'pajak'
  | 'bonus'

export type Sisi = 'bawah' | 'kiri' | 'atas' | 'kanan'

export type PetakDasar = {
  /** Indeks urut searah jarum jam mulai dari petak Mulai. */
  id: number
  jenis: JenisPetak
  nama: string
  /** Wilayah (distrik) tempat petak berada; kosong untuk petak sudut & bandara. */
  wilayah?: number
  /** Posisi tata letak di kanvas SVG (sudut kiri-atas), dihitung sekali di `papan.ts`. */
  x: number
  y: number
  lebar: number
  tinggi: number
  sisi: Sisi
}

export type PetakProperti = PetakDasar & {
  jenis: 'properti'
  wilayah: number
  /** Kelompok warna: `${wilayah}-a` atau `${wilayah}-b`; satu kelompok = 3 kota. */
  kelompok: string
  harga: number
  /** Sewa dasar tanpa bangunan. Sewa per tingkat = dasar × PENGALI_SEWA[tingkat]. */
  sewaDasar: number
  /** Biaya satu tingkat bangunan (rumah → vila → menara → pencakar langit). */
  biayaBangun: number
}

export type PetakBandara = PetakDasar & { jenis: 'bandara'; harga: number }

export type Petak = PetakDasar | PetakProperti | PetakBandara

export type Wilayah = {
  id: number
  nama: string
  /** Deskripsi singkat, tampil saat wilayah disorot. */
  julukan: string
  kota: string[]
  /** Tim yang "berasal" dari wilayah ini — mendapat bonus tuan rumah. */
  timAsal: number
}

export type Papan = {
  jumlahTim: number
  petak: Petak[]
  wilayah: Wilayah[]
  /** Ukuran kanvas SVG keseluruhan. */
  lebar: number
  tinggi: number
  /** Indeks petak-petak penting agar tidak perlu mencari ulang. */
  indeks: { mulai: number; penjara: number; parkir: number; masukPenjara: number; bandara: number[] }
}

export type Pemain = {
  id: number
  tim: number
  nama: string
  bentuk: BentukPion
  posisi: number
  /** Dompet pribadi — gaji & hadiah kartu masuk ke sini. */
  uang: number
  diPenjara: boolean
  /** Berapa giliran sudah dihabiskan di penjara (maks 3). */
  giliranPenjara: number
  kartuBebas: number
}

export type Tim = {
  id: number
  nama: string
  warna: WarnaTim
  /** Kas bersama — pembelian properti & bangunan ditarik dari sini. */
  kas: number
  /** Akumulasi uang yang keluar untuk sewa, pajak, dan denda. */
  kerugian: number
  gugur: boolean
  alasanGugur?: string
}

export type Kepemilikan = {
  tim: number
  /** 0 = tanah kosong, 1 rumah, 2 vila, 3 menara, 4 pencakar langit. */
  tingkat: number
}

export type JenisKartu = 'kesempatan' | 'harta'

export type EfekKartu =
  | { jenis: 'uang'; jumlah: number; ke: 'pribadi' | 'kas' }
  | { jenis: 'pindah'; ke: 'mulai' | 'bandara-terdekat' | 'penjara' | 'mundur-3' }
  | { jenis: 'bayar-tiap-tim'; jumlah: number }
  | { jenis: 'terima-tiap-tim'; jumlah: number }
  | { jenis: 'kartu-bebas' }
  | { jenis: 'perbaikan'; perTingkat: number }

export type Kartu = { id: string; jenis: JenisKartu; teks: string; efek: EfekKartu }

/**
 * Fase giliran. UI membaca fase untuk tahu tombol apa yang boleh tampil;
 * mesin menolak aksi yang tidak sesuai fase.
 */
export type Fase =
  | { jenis: 'lempar' }
  | { jenis: 'bergerak'; dari: number; ke: number; langkah: number }
  | { jenis: 'tawaran'; petak: number }
  | { jenis: 'kartu'; kartu: Kartu }
  | { jenis: 'aksi' }
  | { jenis: 'selesai'; pemenang: number | null; alasan: string }

export type Peristiwa = {
  urut: number
  teks: string
  tim?: number
  nada: 'biasa' | 'baik' | 'buruk' | 'penting'
}

export type PengaturanPermainan = {
  jumlahTim: number
  namaTim: string[]
  warnaTim: WarnaTim[]
  namaPemain: string[][]
  kasAwal: number
  uangPribadiAwal: number
  gaji: number
  targetKekayaan: number
  targetKerugian: number
  benih: number
}

export type Permainan = {
  versi: 2
  pengaturan: PengaturanPermainan
  tim: Tim[]
  pemain: Pemain[]
  /** Kepemilikan per id petak. */
  milik: Record<number, Kepemilikan>
  giliran: number
  /** Indeks pemain yang sedang bermain. */
  pemainAktif: number
  fase: Fase
  dadu: [number, number] | null
  /** Naik tiap lemparan. Dua lemparan bernilai sama tetap terbedakan, jadi
   *  klien tahu kapan harus menggulirkan dadu lagi. */
  lemparanKe: number
  kembarBeruntun: number
  /** Uang pajak & denda terkumpul — diambil siapa pun yang mendarat di Parkir Bebas. */
  pot: number
  tumpukan: { kesempatan: string[]; harta: string[] }
  log: Peristiwa[]
  /** Keadaan PRNG — supaya reducer tetap murni & dapat diulang. */
  acak: number
}

export type Aksi =
  | { jenis: 'lempar' }
  | { jenis: 'bayar-keluar-penjara' }
  | { jenis: 'pakai-kartu-bebas' }
  | { jenis: 'tiba' }
  | { jenis: 'beli' }
  | { jenis: 'lewati' }
  | { jenis: 'terapkan-kartu' }
  | { jenis: 'bangun'; petak: number }
  | { jenis: 'jual-bangunan'; petak: number }
  | { jenis: 'setor'; pemain: number; jumlah: number }
  | { jenis: 'tarik'; pemain: number; jumlah: number }
  | { jenis: 'akhiri-giliran' }
  | { jenis: 'menyerah'; tim: number }

export const TINGKAT_BANGUNAN = ['Tanah', 'Rumah', 'Vila', 'Menara', 'Pencakar langit'] as const
export const PENGALI_SEWA = [1, 4, 10, 25, 45] as const
export const TINGKAT_MAKS = 4
