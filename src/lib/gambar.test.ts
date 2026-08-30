import { describe, it, expect } from 'vitest'
import { periksaGambar, tipeSebenarnya, PRESET } from './gambar'

/** Bangun File dengan byte awal tertentu supaya tanda tangannya terbaca. */
function berkas(nama: string, tipe: string, bytes: number[], isiTambahan = 64): File {
  const data = new Uint8Array([...bytes, ...Array.from({ length: isiTambahan }, () => 0)])
  return new File([data], nama, { type: tipe })
}

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG = [0xff, 0xd8, 0xff, 0xe0]
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]

describe('tipeSebenarnya', () => {
  it('mengenali PNG dari tanda tangan byte', async () => {
    expect(await tipeSebenarnya(berkas('a.png', 'image/png', PNG))).toBe('image/png')
  })

  it('mengenali JPEG dari tanda tangan byte', async () => {
    expect(await tipeSebenarnya(berkas('a.jpg', 'image/jpeg', JPEG))).toBe('image/jpeg')
  })

  it('mengenali SVG dari teks pembukanya', async () => {
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'a.svg', {
      type: 'image/svg+xml',
    })
    expect(await tipeSebenarnya(svg)).toBe('image/svg+xml')
  })

  it('mengabaikan ekstensi dan membaca isi sebenarnya', async () => {
    // Berkas JPEG yang diganti nama jadi .png
    const menyamar = berkas('sebenarnya-jpeg.png', 'image/png', JPEG)
    expect(await tipeSebenarnya(menyamar)).toBe('image/jpeg')
  })

  it('return null untuk berkas yang bukan gambar', async () => {
    const teks = new File(['halo dunia'], 'a.txt', { type: 'text/plain' })
    expect(await tipeSebenarnya(teks)).toBeNull()
  })
})

describe('periksaGambar', () => {
  it('menolak berkas kosong', async () => {
    const kosong = new File([], 'a.png', { type: 'image/png' })
    expect(await periksaGambar(kosong)).toMatch(/kosong/i)
  })

  it('menolak berkas yang melebihi batas ukuran', async () => {
    const besar = berkas('a.png', 'image/png', PNG, 2000)
    const pesan = await periksaGambar(besar, { maksByte: 500 })
    expect(pesan).toMatch(/melebihi batas/i)
  })

  it('menolak berkas yang bukan gambar', async () => {
    const teks = new File(['bukan gambar sama sekali'], 'a.txt', { type: 'text/plain' })
    expect(await periksaGambar(teks)).toMatch(/bukan gambar/i)
  })

  it('menolak tipe di luar daftar yang diizinkan', async () => {
    const gif = berkas('a.gif', 'image/gif', GIF)
    const pesan = await periksaGambar(gif, { tipeDiizinkan: ['image/png', 'image/jpeg'] })
    expect(pesan).toMatch(/tidak diizinkan/i)
  })

  it('menolak berkas yang ekstensinya tidak cocok dengan isinya', async () => {
    const menyamar = berkas('palsu.png', 'image/png', JPEG)
    const pesan = await periksaGambar(menyamar)
    expect(pesan).toMatch(/tidak cocok/i)
  })

  it('meloloskan SVG tanpa memeriksa dimensi piksel', async () => {
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'a.svg', {
      type: 'image/svg+xml',
    })
    expect(await periksaGambar(svg, { minLebar: 9999 })).toBeNull()
  })
})

describe('PRESET', () => {
  it('favicon hanya menerima PNG, SVG, dan WebP', () => {
    expect(PRESET.favicon.aturan.tipeDiizinkan).toEqual(['image/png', 'image/svg+xml', 'image/webp'])
  })

  it('favicon dipotong persegi dan diciutkan ke 128px', () => {
    expect(PRESET.favicon.kompresi.potongRasio).toBe(1)
    expect(PRESET.favicon.kompresi.maksSisi).toBe(128)
  })

  it('sampul memakai rasio 16:9', () => {
    expect(PRESET.sampul.kompresi.potongRasio).toBeCloseTo(16 / 9, 5)
  })

  it('setiap preset punya batas ukuran berkas', () => {
    for (const [nama, p] of Object.entries(PRESET)) {
      expect(p.aturan.maksByte, `preset ${nama}`).toBeGreaterThan(0)
    }
  })
})
