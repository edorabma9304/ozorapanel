import { describe, it, expect } from 'vitest'
import {
  formatRp,
  formatRpRingkas,
  formatAngka,
  formatPersen,
  formatTanggal,
  formatWaktuRelatif,
  potong,
  formatUkuranBerkas,
} from './format'

describe('formatRp', () => {
  it('memformat angka jadi rupiah dengan pemisah ribuan', () => {
    expect(formatRp(1500000)).toBe('Rp 1.500.000')
  })
  it('membulatkan pecahan rupiah', () => {
    expect(formatRp(1500.6)).toBe('Rp 1.501')
  })
  it('menangani nilai negatif', () => {
    expect(formatRp(-2000)).toBe('-Rp 2.000')
  })
  it('return "Rp 0" untuk null, undefined, dan NaN', () => {
    expect(formatRp(null)).toBe('Rp 0')
    expect(formatRp(undefined)).toBe('Rp 0')
    expect(formatRp(Number.NaN)).toBe('Rp 0')
  })
})

describe('formatRpRingkas', () => {
  it('meringkas jutaan', () => {
    expect(formatRpRingkas(1250000)).toBe('Rp 1,25 jt')
  })
  it('meringkas miliaran', () => {
    expect(formatRpRingkas(2500000000)).toBe('Rp 2,5 M')
  })
  it('meringkas ribuan', () => {
    expect(formatRpRingkas(45000)).toBe('Rp 45 rb')
  })
  it('memakai format penuh di bawah seribu', () => {
    expect(formatRpRingkas(750)).toBe('Rp 750')
  })
  it('mempertahankan tanda minus', () => {
    expect(formatRpRingkas(-1250000)).toBe('-Rp 1,25 jt')
  })
})

describe('formatAngka', () => {
  it('memakai koma sebagai pemisah desimal', () => {
    expect(formatAngka(1234.5)).toBe('1.234,5')
  })
  it('membatasi desimal saat diminta', () => {
    expect(formatAngka(1.23456, 2)).toBe('1,23')
  })
  it('return "0" untuk nilai tak valid', () => {
    expect(formatAngka(undefined)).toBe('0')
  })
})

describe('formatPersen', () => {
  it('mengubah rasio jadi persen', () => {
    expect(formatPersen(0.1234)).toBe('12,3%')
  })
  it('menghormati jumlah desimal', () => {
    expect(formatPersen(0.5, 0)).toBe('50%')
  })
})

describe('formatTanggal', () => {
  const tgl = new Date('2026-08-30T03:00:00Z')
  it('memakai nama bulan singkat secara default', () => {
    expect(formatTanggal(tgl)).toBe('30 Agu 2026')
  })
  it('memakai nama bulan penuh pada gaya panjang', () => {
    expect(formatTanggal(tgl, 'panjang')).toBe('30 Agustus 2026')
  })
  it('menerima string ISO', () => {
    expect(formatTanggal('2026-08-30')).toBe('30 Agu 2026')
  })
  it('return "-" untuk tanggal kosong atau tak valid', () => {
    expect(formatTanggal(null)).toBe('-')
    expect(formatTanggal('bukan tanggal')).toBe('-')
  })
})

describe('formatWaktuRelatif', () => {
  const acuan = new Date('2026-08-30T12:00:00Z')
  it('menyebut masa lalu', () => {
    expect(formatWaktuRelatif(new Date('2026-08-27T12:00:00Z'), acuan)).toBe('3 hari yang lalu')
  })
  it('menyebut "baru saja" untuk selisih di bawah semenit', () => {
    expect(formatWaktuRelatif(new Date('2026-08-30T11:59:30Z'), acuan)).toBe('baru saja')
  })
})

describe('potong', () => {
  it('membiarkan teks pendek apa adanya', () => {
    expect(potong('halo', 10)).toBe('halo')
  })
  it('memotong di batas kata dan menambah elipsis', () => {
    expect(potong('satu dua tiga empat lima', 14)).toBe('satu dua tiga…')
  })
})

describe('formatUkuranBerkas', () => {
  it('mengubah byte jadi satuan terbaca', () => {
    expect(formatUkuranBerkas(2048)).toBe('2 KB')
    expect(formatUkuranBerkas(1048576)).toBe('1 MB')
  })
  it('return "0 B" untuk nol atau negatif', () => {
    expect(formatUkuranBerkas(0)).toBe('0 B')
  })
})
