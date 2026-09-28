import { describe, expect, it } from 'vitest'
import { GalatRuang, MAKS_PESERTA, type PerintahRuang, type Ruang } from './ruang'
import { buatKode, buatRuang, langkahRuang, pandangan } from './mesin-ruang'
import { PENGATURAN_BAWAAN } from './mesin'
import type { PengaturanPermainan } from './tipe'

const PENGATURAN: PengaturanPermainan = {
  ...PENGATURAN_BAWAAN,
  jumlahTim: 2,
  namaTim: ['Elang', 'Hiu'],
  warnaTim: ['merah', 'biru'],
  namaPemain: [['', ''], ['', '']],
  benih: 11,
}

let jam = 1000
function kirim(r: Ruang, dari: string, perintah: PerintahRuang) {
  jam += 1
  return langkahRuang(r, perintah, { dari, waktu: jam, id: `m${jam}` })
}

function ruangSiap() {
  let r = buatRuang({ kode: 'ABCDE', tuanRumah: 'tuan', nama: 'Edo', pengaturan: PENGATURAN, waktu: 1 })
  for (const [id, nama] of [['b', 'Budi'], ['c', 'Cita'], ['d', 'Dewi']] as const) {
    r = kirim(r, id, { jenis: 'gabung', nama })
  }
  const orang = ['tuan', 'b', 'c', 'd']
  orang.forEach((id, i) => {
    r = kirim(r, id, { jenis: 'duduk', kursi: i })
  })
  return r
}

describe('kode ruang', () => {
  it('lima huruf tanpa karakter yang mudah tertukar', () => {
    const kode = buatKode(() => 0.999)
    expect(kode).toHaveLength(5)
    expect(kode).not.toMatch(/[IO01]/)
  })
})

describe('lobi', () => {
  it('kursi dibuat dua per tim dan bisa diduduki', () => {
    const r = ruangSiap()
    expect(r.kursi).toHaveLength(4)
    expect(r.kursi.map((k) => k.peserta)).toEqual(['tuan', 'b', 'c', 'd'])
    expect(r.kursi.map((k) => k.tim)).toEqual([0, 0, 1, 1])
  })

  it('kursi yang sudah diduduki tidak bisa direbut', () => {
    const r = ruangSiap()
    expect(() => kirim(r, 'b', { jenis: 'duduk', kursi: 0 })).toThrow(GalatRuang)
  })

  it('hanya tuan rumah yang boleh mengatur dan memulai', () => {
    const r = ruangSiap()
    expect(() => kirim(r, 'b', { jenis: 'mulai' })).toThrow(GalatRuang)
    expect(() => kirim(r, 'b', { jenis: 'atur', pengaturan: PENGATURAN })).toThrow(GalatRuang)
  })

  it('tidak bisa mulai sebelum semua kursi terisi', () => {
    let r = ruangSiap()
    r = kirim(r, 'd', { jenis: 'berdiri', kursi: 3 })
    expect(() => kirim(r, 'tuan', { jenis: 'mulai' })).toThrow(/kursi harus terisi/i)
  })

  it('mengubah jumlah tim menyusun ulang kursi', () => {
    let r = ruangSiap()
    r = kirim(r, 'tuan', { jenis: 'atur', pengaturan: { ...PENGATURAN, jumlahTim: 3 } })
    expect(r.kursi).toHaveLength(6)
    expect(r.kursi[0]!.peserta).toBe('tuan')
    expect(r.kursi[5]!.peserta).toBeNull()
  })

  it('nama pemain diambil dari nama peserta yang duduk', () => {
    let r = ruangSiap()
    r = kirim(r, 'tuan', { jenis: 'mulai' })
    expect(r.permainan!.pemain.map((x) => x.nama)).toEqual(['Edo', 'Budi', 'Cita', 'Dewi'])
  })

  it('peserta yang pergi mengosongkan kursinya dan tuan rumah berpindah', () => {
    let r = ruangSiap()
    r = kirim(r, 'tuan', { jenis: 'pergi' })
    expect(r.kursi[0]!.peserta).toBeNull()
    expect(r.tuanRumah).toBe('b')
  })
})

describe('otorisasi aksi permainan', () => {
  function mulai() {
    return kirim(ruangSiap(), 'tuan', { jenis: 'mulai' })
  }

  it('hanya pemegang kursi yang sedang giliran boleh melempar', () => {
    const r = mulai()
    expect(() => kirim(r, 'b', { jenis: 'aksi', aksi: { jenis: 'lempar' } })).toThrow(/giliran/i)
    const maju = kirim(r, 'tuan', { jenis: 'aksi', aksi: { jenis: 'lempar' } })
    expect(maju.permainan!.dadu).not.toBeNull()
    expect(maju.permainan!.lemparanKe).toBe(1)
  })

  it('aksi mekanis boleh dikirim siapa pun, dan yang telat diabaikan', () => {
    let r = mulai()
    r = kirim(r, 'tuan', { jenis: 'aksi', aksi: { jenis: 'lempar' } })
    expect(r.permainan!.fase.jenis).toBe('bergerak')
    // Pemain lain yang menutup animasinya lebih dulu boleh memajukan papan.
    const majuOlehLain = kirim(r, 'c', { jenis: 'aksi', aksi: { jenis: 'tiba' } })
    expect(majuOlehLain.permainan!.fase.jenis).not.toBe('bergerak')
    // Kiriman kedua datang terlambat: ruang tidak berubah, tidak melempar galat.
    const lagi = kirim(majuOlehLain, 'tuan', { jenis: 'aksi', aksi: { jenis: 'tiba' } })
    expect(lagi).toBe(majuOlehLain)
  })

  it('menyerah hanya boleh oleh anggota tim itu', () => {
    const r = mulai()
    expect(() => kirim(r, 'c', { jenis: 'aksi', aksi: { jenis: 'menyerah', tim: 0 } })).toThrow(/tim itu/i)
    const gugur = kirim(r, 'b', { jenis: 'aksi', aksi: { jenis: 'menyerah', tim: 0 } })
    expect(gugur.permainan!.tim[0]!.gugur).toBe(true)
  })

  it('orang luar ruang tidak bisa berbuat apa-apa', () => {
    const r = mulai()
    expect(() => kirim(r, 'penyusup', { jenis: 'aksi', aksi: { jenis: 'tiba' } })).toThrow(/belum bergabung/i)
  })
})

describe('obrolan', () => {
  it('pesan tim hanya terlihat oleh tim itu', () => {
    let r = ruangSiap()
    r = kirim(r, 'tuan', { jenis: 'obrol', saluran: 'tim', teks: 'beli Bali ya' })
    r = kirim(r, 'c', { jenis: 'obrol', saluran: 'semua', teks: 'halo semua' })

    const untukRekan = pandangan(r, 'b').obrolan.map((m) => m.teks)
    const untukLawan = pandangan(r, 'c').obrolan.map((m) => m.teks)
    expect(untukRekan).toEqual(['beli Bali ya', 'halo semua'])
    expect(untukLawan).toEqual(['halo semua'])
  })

  it('pesan kosong diabaikan dan yang panjang dipotong', () => {
    let r = ruangSiap()
    const sebelum = r
    r = kirim(r, 'tuan', { jenis: 'obrol', saluran: 'semua', teks: '   ' })
    expect(r).toBe(sebelum)
    r = kirim(r, 'tuan', { jenis: 'obrol', saluran: 'semua', teks: 'a'.repeat(500) })
    expect(r.obrolan[0]!.teks).toHaveLength(300)
  })

  it('penonton tanpa kursi tidak bisa memakai saluran tim', () => {
    let r = ruangSiap()
    r = kirim(r, 'x', { jenis: 'gabung', nama: 'Penonton' })
    expect(() => kirim(r, 'x', { jenis: 'obrol', saluran: 'tim', teks: 'hai' })).toThrow(/belum duduk/i)
  })
})

describe('pandangan', () => {
  it('benih acak dan urutan kartu tidak ikut dikirim', () => {
    const r = kirim(ruangSiap(), 'tuan', { jenis: 'mulai' })
    expect(r.permainan!.acak).not.toBe(0)
    expect(r.permainan!.tumpukan.kesempatan.length).toBeGreaterThan(0)

    const tampak = pandangan(r, 'b').permainan!
    expect(tampak.acak).toBe(0)
    expect(tampak.tumpukan).toEqual({ kesempatan: [], harta: [] })
  })

  it('urut naik tiap perubahan supaya bisa dipakai kunci optimistik', () => {
    const r = ruangSiap()
    const sesudah = kirim(r, 'tuan', { jenis: 'obrol', saluran: 'semua', teks: 'hai' })
    expect(sesudah.urut).toBe(r.urut + 1)
  })
})

describe('penjagaan server terbuka', () => {
  it('perintah yang tidak dikenal ditolak, bukan didiamkan', () => {
    const r = ruangSiap()
    // Klien usang mengirim perintah yang sudah tidak ada lagi. Kalau ini lolos,
    // nomor urutnya tetap naik dan semua klien ikut menyegarkan tanpa alasan.
    const usang = { jenis: 'terbang', petak: 3 } as unknown as PerintahRuang
    expect(() => kirim(r, 'tuan', usang)).toThrow(GalatRuang)
    expect(() => kirim(r, 'tuan', usang)).toThrow(/muat ulang/i)
  })

  it('jumlah peserta dibatasi supaya ruang tidak digelembungkan', () => {
    let r = ruangSiap()
    while (r.peserta.length < MAKS_PESERTA) {
      r = kirim(r, `pen${r.peserta.length}`, { jenis: 'gabung', nama: 'Penonton' })
    }
    expect(() => kirim(r, 'satu-lagi', { jenis: 'gabung', nama: 'Telat' })).toThrow(/penuh/i)
  })

  it('peserta yang sudah ada tetap bisa memperbarui namanya saat ruang penuh', () => {
    let r = ruangSiap()
    while (r.peserta.length < MAKS_PESERTA) {
      r = kirim(r, `pen${r.peserta.length}`, { jenis: 'gabung', nama: 'Penonton' })
    }
    r = kirim(r, 'tuan', { jenis: 'gabung', nama: 'Edo Baru' })
    expect(r.peserta.find((x) => x.id === 'tuan')!.nama).toBe('Edo Baru')
  })
})
