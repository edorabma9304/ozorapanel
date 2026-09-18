import { describe, expect, it } from 'vitest'
import { PENGATURAN_BAWAAN, buatPermainan, langkah, papanDari } from './mesin'
import { adalahProperti } from './papan'
import { efekDariPerubahan } from './suara'
import type { PengaturanPermainan, Permainan } from './tipe'

function pengaturan(jumlahTim = 2): PengaturanPermainan {
  return {
    ...PENGATURAN_BAWAAN,
    jumlahTim,
    namaTim: Array.from({ length: jumlahTim }, (_, i) => `Tim ${i + 1}`),
    warnaTim: (['merah', 'biru'] as const).slice(0, jumlahTim),
    namaPemain: Array.from({ length: jumlahTim }, (_, i) => [`T${i + 1}A`, `T${i + 1}B`]),
    benih: 5,
  }
}

function daratkan(p: Permainan, ke: number) {
  const q = structuredClone(p)
  q.fase = { jenis: 'bergerak', dari: q.pemain[q.pemainAktif]!.posisi, ke, langkah: 1 }
  return langkah(q, { jenis: 'tiba' })
}

describe('efekDariPerubahan', () => {
  it('membeli properti membunyikan koin', () => {
    const awal = buatPermainan(pengaturan())
    const kota = papanDari(awal).petak.find(adalahProperti)!
    const menawarkan = daratkan(awal, kota.id)
    const membeli = langkah(menawarkan, { jenis: 'beli' })
    expect(efekDariPerubahan(menawarkan, membeli)).toContain('beli')
  })

  it('kartu harta karun dan kesempatan punya bunyi berbeda', () => {
    const awal = buatPermainan(pengaturan())
    const papan = papanDari(awal)
    const kesempatan = papan.petak.find((x) => x.jenis === 'kesempatan')!
    const harta = papan.petak.find((x) => x.jenis === 'harta')!
    expect(efekDariPerubahan(awal, daratkan(awal, kesempatan.id))).toContain('kartu')
    expect(efekDariPerubahan(awal, daratkan(awal, harta.id))).toContain('harta')
  })

  it('masuk penjara dan membayar sewa terdengar', () => {
    const awal = buatPermainan(pengaturan())
    const papan = papanDari(awal)
    expect(efekDariPerubahan(awal, daratkan(awal, papan.indeks.masukPenjara))).toContain('penjara')

    const kota = papan.petak.find(adalahProperti)!
    const denganPemilik = structuredClone(awal)
    denganPemilik.milik[kota.id] = { tim: 1, tingkat: 0 }
    expect(efekDariPerubahan(denganPemilik, daratkan(denganPemilik, kota.id))).toContain('bayar')
  })

  it('keadaan yang tidak berubah tidak membunyikan apa pun', () => {
    const awal = buatPermainan(pengaturan())
    expect(efekDariPerubahan(awal, awal)).toEqual([])
  })

  it('permainan usai memicu bunyi kemenangan', () => {
    const awal = buatPermainan(pengaturan())
    const selesai = langkah(awal, { jenis: 'menyerah', tim: 1 })
    expect(efekDariPerubahan(awal, selesai)).toContain('menang')
  })
})
