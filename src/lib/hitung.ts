/**
 * Fungsi kalkulasi bisnis.
 *
 * .claude/rules/testing.md menetapkan fungsi kalkulasi WAJIB punya test.
 * Karena itu semuanya dikumpulkan di sini sebagai fungsi murni — tanpa React,
 * tanpa akses jaringan — supaya mudah diuji dan dipakai ulang di halaman mana pun.
 */

// ------------------------------------------------------------------ Pesanan
export type BarisPesanan = { harga: number; qty: number }

export type RincianPesanan = {
  subtotal: number
  potongan: number
  dasarPajak: number
  pajak: number
  ongkir: number
  total: number
}

/**
 * Hitung total pesanan.
 *
 * Urutannya penting dan mengikuti praktik perpajakan Indonesia:
 * diskon mengurangi subtotal DULU, pajak dihitung dari nilai setelah diskon,
 * baru ongkir ditambahkan (ongkir tidak dikenai PPN di sini).
 */
export function hitungTotalPesanan(
  item: BarisPesanan[],
  { diskonPersen = 0, diskonNominal = 0, pajakPersen = 0, ongkir = 0 } = {},
): RincianPesanan {
  const subtotal = item.reduce((a, b) => a + Math.max(0, b.harga) * Math.max(0, b.qty), 0)

  const dariPersen = Math.round((subtotal * batasi(diskonPersen, 0, 100)) / 100)
  // Potongan tidak boleh melebihi subtotal — mencegah total negatif.
  const potongan = Math.min(subtotal, dariPersen + Math.max(0, diskonNominal))

  const dasarPajak = subtotal - potongan
  const pajak = Math.round((dasarPajak * Math.max(0, pajakPersen)) / 100)

  return {
    subtotal,
    potongan,
    dasarPajak,
    pajak,
    ongkir: Math.max(0, ongkir),
    total: dasarPajak + pajak + Math.max(0, ongkir),
  }
}

// ------------------------------------------------------------------ Margin & HPP
/** Margin kotor sebagai rasio 0–1. Return 0 bila harga jual nol atau tak valid. */
export function hitungMargin(hargaJual: number, hargaModal: number): number {
  if (!Number.isFinite(hargaJual) || hargaJual <= 0) return 0
  if (!Number.isFinite(hargaModal) || hargaModal < 0) return 0
  return (hargaJual - hargaModal) / hargaJual
}

/** Markup dari harga modal, sebagai rasio 0–n. */
export function hitungMarkup(hargaJual: number, hargaModal: number): number {
  if (!Number.isFinite(hargaModal) || hargaModal <= 0) return 0
  return (hargaJual - hargaModal) / hargaModal
}

export type BahanResep = {
  nama: string
  /** Jumlah yang dipakai, dalam satuan yang sama dengan `hargaPerSatuan`. */
  jumlah: number
  hargaPerSatuan: number
}

export type RincianHpp = {
  hpp: number
  perPorsi: number
  bahan: Array<{ nama: string; biaya: number; porsi: number }>
  dilewati: string[]
}

/**
 * Harga pokok produksi dari daftar bahan.
 *
 * Bahan tanpa harga (belum pernah dibeli) DILEWATI dan dicatat di `dilewati`,
 * bukan dihitung nol diam-diam — supaya HPP yang kelihatan murah karena data
 * bahan belum lengkap bisa langsung ketahuan.
 */
export function hitungHpp(
  bahan: BahanResep[],
  { hasilPorsi = 1, biayaOperasional = 0 } = {},
): RincianHpp {
  const dilewati: string[] = []
  const terpakai: Array<{ nama: string; biaya: number }> = []

  for (const b of bahan) {
    if (!Number.isFinite(b.hargaPerSatuan) || b.hargaPerSatuan <= 0) {
      dilewati.push(b.nama)
      continue
    }
    terpakai.push({ nama: b.nama, biaya: Math.max(0, b.jumlah) * b.hargaPerSatuan })
  }

  const biayaBahan = terpakai.reduce((a, b) => a + b.biaya, 0)
  const hpp = biayaBahan + Math.max(0, biayaOperasional)
  const porsi = Math.max(1, Math.floor(hasilPorsi))

  return {
    hpp,
    perPorsi: Math.round(hpp / porsi),
    bahan: terpakai.map((b) => ({ ...b, porsi: hpp > 0 ? b.biaya / hpp : 0 })),
    dilewati,
  }
}

// ------------------------------------------------------------------ Penggajian
export type MasukanGaji = {
  gajiPokok: number
  tunjangan: number
  hariHadir: number
  hariAlfa: number
  jamLembur: number
}

export type SlipGaji = {
  lembur: number
  bruto: number
  bpjs: number
  pph: number
  potonganAlfa: number
  totalPotongan: number
  netto: number
}

export const ATURAN_GAJI = {
  hariKerjaSebulan: 25,
  tarifBpjs: 0.03,
  tarifPph: 0.02,
  upahLemburPerJam: 25_000,
} as const

/**
 * Slip gaji satu karyawan.
 *
 * Potongan alfa memakai gaji pokok dibagi hari kerja sebulan. Sesuaikan
 * konstanta di `ATURAN_GAJI` mengikuti kebijakan perusahaan Anda.
 */
export function hitungSlipGaji(m: MasukanGaji, aturan = ATURAN_GAJI): SlipGaji {
  const gajiPokok = Math.max(0, m.gajiPokok)
  const tunjangan = Math.max(0, m.tunjangan)

  const lembur = Math.max(0, m.jamLembur) * aturan.upahLemburPerJam
  const bruto = gajiPokok + tunjangan + lembur

  const bpjs = Math.round(bruto * aturan.tarifBpjs)
  const pph = Math.round(bruto * aturan.tarifPph)
  const potonganAlfa = Math.round(
    Math.max(0, m.hariAlfa) * (gajiPokok / aturan.hariKerjaSebulan),
  )

  const totalPotongan = bpjs + pph + potonganAlfa

  return {
    lembur,
    bruto,
    bpjs,
    pph,
    potonganAlfa,
    totalPotongan,
    // Gaji bersih tidak pernah negatif walau potongannya melebihi bruto.
    netto: Math.max(0, bruto - totalPotongan),
  }
}

// ------------------------------------------------------------------ Piutang
export type EmberPiutang = 'belum_jatuh_tempo' | '1_30' | '31_60' | 'lebih_60'

/** Kelompokkan faktur menurut umur tunggakannya. */
export function emberPiutang(jatuhTempo: Date | string, sekarang: Date = new Date()): EmberPiutang {
  const tempo = jatuhTempo instanceof Date ? jatuhTempo : new Date(jatuhTempo)
  if (Number.isNaN(tempo.getTime())) return 'belum_jatuh_tempo'

  const hari = Math.floor((sekarang.getTime() - tempo.getTime()) / 86_400_000)
  if (hari <= 0) return 'belum_jatuh_tempo'
  if (hari <= 30) return '1_30'
  if (hari <= 60) return '31_60'
  return 'lebih_60'
}

function batasi(n: number, min: number, maks: number): number {
  if (!Number.isFinite(n)) return min
  return Math.min(maks, Math.max(min, n))
}
