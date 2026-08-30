import { describe, it, expect } from 'vitest'
import {
  ATURAN_GAJI, emberPiutang, hitungHpp, hitungMargin, hitungMarkup, hitungSlipGaji,
  hitungTotalPesanan,
} from './hitung'

describe('hitungTotalPesanan', () => {
  const item = [
    { harga: 100_000, qty: 2 },
    { harga: 50_000, qty: 1 },
  ]

  it('menjumlahkan harga dikali jumlah', () => {
    expect(hitungTotalPesanan(item).subtotal).toBe(250_000)
  })

  it('menghitung pajak SETELAH diskon, bukan sebelum', () => {
    const r = hitungTotalPesanan(item, { diskonPersen: 10, pajakPersen: 11 })
    expect(r.potongan).toBe(25_000)
    expect(r.dasarPajak).toBe(225_000)
    expect(r.pajak).toBe(24_750) // 11% dari 225.000, bukan dari 250.000
    expect(r.total).toBe(249_750)
  })

  it('tidak mengenakan pajak pada ongkir', () => {
    const r = hitungTotalPesanan(item, { pajakPersen: 11, ongkir: 20_000 })
    expect(r.pajak).toBe(27_500)
    expect(r.total).toBe(250_000 + 27_500 + 20_000)
  })

  it('menggabungkan diskon persen dan nominal', () => {
    const r = hitungTotalPesanan(item, { diskonPersen: 10, diskonNominal: 15_000 })
    expect(r.potongan).toBe(40_000)
  })

  it('membatasi potongan agar tidak melebihi subtotal', () => {
    const r = hitungTotalPesanan(item, { diskonNominal: 999_999_999 })
    expect(r.potongan).toBe(250_000)
    expect(r.total).toBe(0)
  })

  it('mengabaikan diskon persen di luar 0–100', () => {
    expect(hitungTotalPesanan(item, { diskonPersen: -5 }).potongan).toBe(0)
    expect(hitungTotalPesanan(item, { diskonPersen: 500 }).potongan).toBe(250_000)
  })

  it('mengabaikan jumlah dan harga negatif', () => {
    expect(hitungTotalPesanan([{ harga: -100, qty: 5 }]).subtotal).toBe(0)
    expect(hitungTotalPesanan([{ harga: 100, qty: -5 }]).subtotal).toBe(0)
  })

  it('return nol untuk keranjang kosong', () => {
    expect(hitungTotalPesanan([]).total).toBe(0)
  })
})

describe('hitungMargin', () => {
  it('menghitung margin kotor sebagai rasio', () => {
    expect(hitungMargin(100_000, 60_000)).toBeCloseTo(0.4, 5)
  })
  it('return 0 bila harga jual nol atau negatif', () => {
    expect(hitungMargin(0, 60_000)).toBe(0)
    expect(hitungMargin(-100, 60)).toBe(0)
  })
  it('bisa bernilai negatif saat menjual rugi', () => {
    expect(hitungMargin(50_000, 80_000)).toBeCloseTo(-0.6, 5)
  })
})

describe('hitungMarkup', () => {
  it('menghitung markup dari harga modal', () => {
    expect(hitungMarkup(150_000, 100_000)).toBeCloseTo(0.5, 5)
  })
  it('return 0 bila harga modal nol', () => {
    expect(hitungMarkup(150_000, 0)).toBe(0)
  })
})

describe('hitungHpp', () => {
  const bahan = [
    { nama: 'Tepung', jumlah: 0.5, hargaPerSatuan: 12_000 },
    { nama: 'Gula', jumlah: 0.2, hargaPerSatuan: 15_000 },
    { nama: 'Telur', jumlah: 3, hargaPerSatuan: 2_500 },
  ]

  it('menjumlahkan biaya seluruh bahan', () => {
    expect(hitungHpp(bahan).hpp).toBe(6_000 + 3_000 + 7_500)
  })

  it('menambahkan biaya operasional', () => {
    expect(hitungHpp(bahan, { biayaOperasional: 5_000 }).hpp).toBe(21_500)
  })

  it('membagi ke harga per porsi', () => {
    expect(hitungHpp(bahan, { hasilPorsi: 10 }).perPorsi).toBe(1_650)
  })

  it('melewati bahan tanpa harga dan mencatatnya', () => {
    const r = hitungHpp([...bahan, { nama: 'Vanili', jumlah: 1, hargaPerSatuan: 0 }])
    expect(r.dilewati).toEqual(['Vanili'])
    expect(r.hpp).toBe(16_500)
  })

  it('return 0 dan mencatat semua bila tak ada bahan berharga', () => {
    const r = hitungHpp([{ nama: 'X', jumlah: 1, hargaPerSatuan: 0 }])
    expect(r.hpp).toBe(0)
    expect(r.dilewati).toEqual(['X'])
  })

  it('menghitung porsi biaya tiap bahan', () => {
    const r = hitungHpp(bahan)
    expect(r.bahan.find((b) => b.nama === 'Telur')?.porsi).toBeCloseTo(7_500 / 16_500, 5)
  })

  it('memperlakukan hasil porsi minimal 1', () => {
    expect(hitungHpp(bahan, { hasilPorsi: 0 }).perPorsi).toBe(16_500)
  })
})

describe('hitungSlipGaji', () => {
  const dasar = { gajiPokok: 5_000_000, tunjangan: 500_000, hariHadir: 22, hariAlfa: 0, jamLembur: 0 }

  it('menghitung bruto dari gaji pokok, tunjangan, dan lembur', () => {
    const s = hitungSlipGaji({ ...dasar, jamLembur: 4 })
    expect(s.lembur).toBe(4 * ATURAN_GAJI.upahLemburPerJam)
    expect(s.bruto).toBe(5_000_000 + 500_000 + 100_000)
  })

  it('memotong BPJS 3% dan PPh 2% dari bruto', () => {
    const s = hitungSlipGaji(dasar)
    expect(s.bpjs).toBe(165_000)
    expect(s.pph).toBe(110_000)
  })

  it('memotong alfa sebesar gaji pokok dibagi 25 hari', () => {
    const s = hitungSlipGaji({ ...dasar, hariAlfa: 2 })
    expect(s.potonganAlfa).toBe(400_000)
  })

  it('menghitung gaji bersih setelah semua potongan', () => {
    const s = hitungSlipGaji({ ...dasar, hariAlfa: 1 })
    expect(s.netto).toBe(5_500_000 - 165_000 - 110_000 - 200_000)
  })

  it('tidak pernah menghasilkan gaji bersih negatif', () => {
    const s = hitungSlipGaji({ ...dasar, hariAlfa: 60 })
    expect(s.netto).toBe(0)
  })

  it('mengabaikan nilai negatif pada masukan', () => {
    const s = hitungSlipGaji({ ...dasar, gajiPokok: -1_000, tunjangan: -50, jamLembur: -3 })
    expect(s.bruto).toBe(0)
    expect(s.netto).toBe(0)
  })
})

describe('emberPiutang', () => {
  const sekarang = new Date('2026-08-30T00:00:00Z')

  it('faktur yang belum jatuh tempo', () => {
    expect(emberPiutang('2026-09-10', sekarang)).toBe('belum_jatuh_tempo')
  })
  it('tunggakan 1–30 hari', () => {
    expect(emberPiutang('2026-08-20', sekarang)).toBe('1_30')
  })
  it('tunggakan 31–60 hari', () => {
    expect(emberPiutang('2026-07-20', sekarang)).toBe('31_60')
  })
  it('tunggakan di atas 60 hari', () => {
    expect(emberPiutang('2026-05-01', sekarang)).toBe('lebih_60')
  })
  it('tanggal tak valid dianggap belum jatuh tempo', () => {
    expect(emberPiutang('bukan tanggal', sekarang)).toBe('belum_jatuh_tempo')
  })
})
