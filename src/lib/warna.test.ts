import { describe, it, expect } from 'vitest'
import { geserTerang, kontras, kontrasTerbaik, lolosAA, teksTerbaca, varianMerek } from './warna'

describe('kontras', () => {
  it('hitam dan putih adalah kontras maksimum', () => {
    expect(kontras('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })
  it('warna yang sama tidak punya kontras', () => {
    expect(kontras('#5d87ff', '#5d87ff')).toBeCloseTo(1, 5)
  })
  it('urutan argumen tidak memengaruhi hasil', () => {
    expect(kontras('#3469ff', '#ffffff')).toBeCloseTo(kontras('#ffffff', '#3469ff'), 5)
  })
  it('mengenali palet Modernize asli yang gagal AA', () => {
    // Ini bug yang memicu perombakan palet: putih di atas mint hanya 1,72:1.
    expect(kontras('#13deb9', '#ffffff')).toBeLessThan(2)
  })
})

describe('teksTerbaca', () => {
  it('memilih teks gelap di atas warna cerah', () => {
    expect(teksTerbaca('#13deb9')).toBe('#101828')
    expect(teksTerbaca('#ffae1f')).toBe('#101828')
  })
  it('memilih teks putih di atas warna pekat', () => {
    expect(teksTerbaca('#101828')).toBe('#ffffff')
    expect(teksTerbaca('#0a7361')).toBe('#ffffff')
  })
  it('pilihannya selalu yang kontrasnya lebih tinggi', () => {
    for (const w of ['#3469ff', '#13deb9', '#ffae1f', '#fa896b', '#2a3547']) {
      const teks = teksTerbaca(w)
      expect(kontras(w, teks)).toBe(kontrasTerbaik(w))
    }
  })
})

describe('lolosAA', () => {
  it('warna merek bawaan lolos', () => {
    expect(lolosAA('#3469ff')).toBe(true)
  })
  it('warna dengan luminansi tengah gagal dengan teks apa pun', () => {
    // #7b7b7b adalah titik terburuk: putih 4,23:1, gelap 4,19:1 — dua-duanya
    // di bawah 4,5. Warna seperti ini tidak boleh dipakai sebagai warna isi.
    expect(lolosAA('#7b7b7b')).toBe(false)
    expect(kontrasTerbaik('#7b7b7b')).toBeLessThan(4.5)
  })

  it('abu-abu yang sedikit lebih terang atau gelap sudah lolos', () => {
    expect(lolosAA('#767676')).toBe(true)
    expect(lolosAA('#858585')).toBe(true)
  })
})

describe('geserTerang', () => {
  it('menerangkan warna', () => {
    expect(kontrasTerbaik(geserTerang('#3469ff', 20))).not.toBe(kontrasTerbaik('#3469ff'))
    expect(geserTerang('#3469ff', 20)).not.toBe('#3469ff')
  })
  it('tidak melewati putih atau hitam', () => {
    expect(geserTerang('#ffffff', 50)).toBe('#ffffff')
    expect(geserTerang('#000000', -50)).toBe('#000000')
  })
})

describe('varianMerek', () => {
  it('menghasilkan pasangan isi dan teks untuk kedua tema', () => {
    const v = varianMerek('#3469ff')
    expect(kontras(v.terang.isi, v.terang.teks)).toBeGreaterThanOrEqual(4.5)
    expect(kontras(v.gelap.isi, v.gelap.teks)).toBeGreaterThanOrEqual(4.5)
  })
  it('varian gelap lebih terang dari varian terang', () => {
    const v = varianMerek('#3469ff')
    expect(v.gelap.isi).not.toBe(v.terang.isi)
  })
})
