import { describe, it, expect } from 'vitest'
import { punyaIzin, bisaAksesModul, adalahSuperadminBawaan } from './peran'

describe('punyaIzin', () => {
  it('memberi superadmin akses penuh lewat wildcard', () => {
    expect(punyaIzin('superadmin', 'pengguna.hapus')).toBe(true)
    expect(punyaIzin('superadmin', 'modul.apa.pun')).toBe(true)
  })

  it('penolakan eksplisit mengalahkan wildcard', () => {
    expect(punyaIzin('admin', 'pengguna.ubah')).toBe(true)
    expect(punyaIzin('admin', 'pengguna.hapus')).toBe(false)
  })

  it('mencocokkan wildcard pada level modul', () => {
    expect(punyaIzin('finance', 'pesanan.hapus')).toBe(true)
  })

  it('menolak modul yang tidak ada di daftar peran', () => {
    expect(punyaIzin('finance', 'stok.lihat')).toBe(false)
    expect(punyaIzin('sales', 'laporan.lihat')).toBe(false)
  })

  it('membedakan izin baca dan tulis saat ditulis eksplisit', () => {
    expect(punyaIzin('sales', 'katalog.lihat')).toBe(true)
    expect(punyaIzin('sales', 'katalog.hapus')).toBe(false)
  })

  it('menolak saat peran kosong', () => {
    expect(punyaIzin(null, 'dasbor.lihat')).toBe(false)
    expect(punyaIzin(undefined, 'dasbor.lihat')).toBe(false)
  })
})

describe('bisaAksesModul', () => {
  it('true bila peran punya wildcard modul', () => {
    expect(bisaAksesModul('produksi', 'stok')).toBe(true)
  })
  it('false bila modul di luar jangkauan peran', () => {
    expect(bisaAksesModul('produksi', 'laporan')).toBe(false)
  })
})

describe('adalahSuperadminBawaan', () => {
  it('mengenali surel bawaan tanpa peduli huruf besar/kecil dan spasi', () => {
    expect(adalahSuperadminBawaan(' Edo.Rabmadhani@Gmail.com ')).toBe(true)
    expect(adalahSuperadminBawaan('ozolab.official@gmail.com')).toBe(true)
  })
  it('menolak surel lain dan nilai kosong', () => {
    expect(adalahSuperadminBawaan('orang@lain.com')).toBe(false)
    expect(adalahSuperadminBawaan(null)).toBe(false)
    expect(adalahSuperadminBawaan('')).toBe(false)
  })
})
