import { describe, expect, it } from 'vitest'
import { buatPapan, adalahProperti, adalahBandara, anggotaKelompok } from './papan'
import {
  GalatAksi, PENGATURAN_BAWAAN, alasanTakBolehBangun, buatPermainan, kekayaanTim, langkah, papanDari, pemainAktif, sewaPetak,
} from './mesin'
import type { Permainan, PengaturanPermainan, PetakProperti } from './tipe'

function pengaturan(jumlahTim = 2, benih = 7): PengaturanPermainan {
  return {
    ...PENGATURAN_BAWAAN,
    jumlahTim,
    namaTim: Array.from({ length: jumlahTim }, (_, i) => `Tim ${i + 1}`),
    warnaTim: (['merah', 'biru', 'hijau', 'kuning', 'ungu', 'oranye', 'pink', 'sian'] as const).slice(0, jumlahTim),
    namaPemain: Array.from({ length: jumlahTim }, (_, i) => [`T${i + 1}A`, `T${i + 1}B`]),
    benih,
  }
}

/** Paksa pemain aktif ke posisi tertentu lalu selesaikan pendaratan lewat fase bergerak. */
function daratkan(p: Permainan, ke: number, langkahMaju = 1): Permainan {
  const q = structuredClone(p)
  q.fase = { jenis: 'bergerak', dari: pemainAktif(q).posisi, ke, langkah: langkahMaju }
  return langkah(q, { jenis: 'tiba' })
}

describe('buatPapan', () => {
  it('ukuran papan mengikuti jumlah tim: 8 + 8 × tim', () => {
    for (let t = 2; t <= 8; t++) {
      const papan = buatPapan(t)
      expect(papan.petak.length).toBe(8 + 8 * t)
      expect(papan.petak.map((x) => x.id)).toEqual(papan.petak.map((_, i) => i))
      expect(papan.indeks.bandara).toHaveLength(4)
      expect(papan.wilayah).toHaveLength(t)
      expect(papan.petak.filter(adalahProperti)).toHaveLength(6 * t)
    }
  })

  it('setiap kelompok warna berisi tepat 3 kota dari wilayah yang sama', () => {
    const papan = buatPapan(5)
    const kelompok = new Set(papan.petak.filter(adalahProperti).map((x) => x.kelompok))
    expect(kelompok.size).toBe(10)
    for (const k of kelompok) {
      const anggota = anggotaKelompok(papan, k)
      expect(anggota).toHaveLength(3)
      expect(new Set(anggota.map((a) => a.wilayah)).size).toBe(1)
    }
  })

  it('sudut ditempatkan benar dan geometri tidak tumpang tindih', () => {
    const papan = buatPapan(3)
    expect(papan.petak[papan.indeks.mulai]!.jenis).toBe('mulai')
    expect(papan.petak[papan.indeks.penjara]!.jenis).toBe('penjara')
    expect(papan.petak[papan.indeks.parkir]!.jenis).toBe('parkir')
    expect(papan.petak[papan.indeks.masukPenjara]!.jenis).toBe('masuk-penjara')
    const kunci = new Set(papan.petak.map((x) => `${x.x},${x.y}`))
    expect(kunci.size).toBe(papan.petak.length)
    for (const x of papan.petak) {
      expect(x.x + x.lebar).toBeLessThanOrEqual(papan.lebar)
      expect(x.y + x.tinggi).toBeLessThanOrEqual(papan.tinggi)
    }
  })

  it('menolak jumlah tim di luar 2–8', () => {
    expect(() => buatPapan(1)).toThrow()
    expect(() => buatPapan(9)).toThrow()
  })
})

describe('mesin: alur giliran', () => {
  it('urutan giliran: Tim1 P1 → Tim1 P2 → Tim2 P1 → …', () => {
    let p = buatPermainan(pengaturan(2))
    expect(pemainAktif(p).nama).toBe('T1A')
    for (const nama of ['T1B', 'T2A', 'T2B', 'T1A']) {
      // Lewati lemparan dengan meletakkan pemain di petak Mulai supaya tidak ada tawaran.
      p = daratkan(p, 0, 0)
      expect(p.fase.jenis).toBe('aksi')
      p.dadu = [1, 2]
      p.kembarBeruntun = 0
      p = langkah(p, { jenis: 'akhiri-giliran' })
      expect(pemainAktif(p).nama).toBe(nama)
    }
    expect(p.giliran).toBe(2)
  })

  it('benih sama menghasilkan lemparan yang sama', () => {
    const a = langkah(buatPermainan(pengaturan(2, 42)), { jenis: 'lempar' })
    const b = langkah(buatPermainan(pengaturan(2, 42)), { jenis: 'lempar' })
    expect(a.dadu).toEqual(b.dadu)
    expect(a.fase.jenis).toBe('bergerak')
  })

  it('melewati Mulai memberi gaji ke dompet pribadi', () => {
    let p = buatPermainan(pengaturan(2))
    p.pemain[0]!.posisi = 22
    p = daratkan(p, 0, 2)
    expect(p.pemain[0]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal + PENGATURAN_BAWAAN.gaji)
  })

  it('aksi di fase yang salah ditolak', () => {
    const p = buatPermainan(pengaturan(2))
    expect(() => langkah(p, { jenis: 'beli' })).toThrow(GalatAksi)
    expect(() => langkah(p, { jenis: 'akhiri-giliran' })).toThrow(GalatAksi)
  })
})

describe('mesin: properti & sewa', () => {
  it('membeli kota menjadikannya milik TIM, dibayar dari kas tim', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    const kota = papan.petak.find(adalahProperti)!
    p = daratkan(p, kota.id)
    expect(p.fase).toEqual({ jenis: 'tawaran', petak: kota.id })
    p = langkah(p, { jenis: 'beli' })
    expect(p.milik[kota.id]).toEqual({ tim: 0, tingkat: 0 })
    expect(p.tim[0]!.kas).toBe(PENGATURAN_BAWAAN.kasAwal - kota.harga)
    expect(p.pemain[0]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal)
  })

  it('kekurangan kas tim ditutup dari dompet pemain yang membeli', () => {
    let p = buatPermainan(pengaturan(2))
    const kota = papanDari(p).petak.find(adalahProperti)!
    p.tim[0]!.kas = 10
    p = daratkan(p, kota.id)
    p = langkah(p, { jenis: 'beli' })
    expect(p.tim[0]!.kas).toBe(0)
    expect(p.pemain[0]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal - (kota.harga - 10))
  })

  it('rekan setim tidak membayar sewa; lawan membayar dari dompet pribadi ke kas pemilik', () => {
    let p = buatPermainan(pengaturan(2))
    const kota = papanDari(p).petak.find(adalahProperti)!
    p.milik[kota.id] = { tim: 0, tingkat: 0 }
    p.pemainAktif = 1 // T1B, rekan setim
    p = daratkan(p, kota.id)
    expect(p.fase.jenis).toBe('aksi')
    expect(p.pemain[1]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal)

    p.pemainAktif = 2 // T2A, lawan
    const sewa = sewaPetak(p, kota.id)
    p = daratkan(p, kota.id)
    expect(p.pemain[2]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal - sewa)
    expect(p.tim[0]!.kas).toBe(PENGATURAN_BAWAAN.kasAwal + sewa)
    expect(p.tim[1]!.kerugian).toBe(sewa)
  })

  it('sewa: kelompok lengkap ×2 dan pengali bangunan, tanpa pengali tersembunyi', () => {
    const p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    const [a, b, c] = anggotaKelompok(papan, '1-a') // wilayah 1 = kampung halaman tim 1
    p.milik[a!.id] = { tim: 0, tingkat: 0 }
    expect(sewaPetak(p, a!.id)).toBe(a!.sewaDasar)
    p.milik[b!.id] = { tim: 0, tingkat: 0 }
    p.milik[c!.id] = { tim: 0, tingkat: 0 }
    expect(sewaPetak(p, a!.id)).toBe(a!.sewaDasar * 2)
    p.milik[a!.id]!.tingkat = 4
    expect(sewaPetak(p, a!.id)).toBe(a!.sewaDasar * 45)
    // Wilayah asal tim tidak lagi menambah sewa — sewa harus bisa dihitung
    // pemain tanpa membuka aturan.
    p.milik[a!.id]!.tingkat = 0
    const sebelum = sewaPetak(p, a!.id)
    for (const x of [a, b, c]) p.milik[x!.id] = { tim: 1, tingkat: 0 }
    expect(sewaPetak(p, a!.id)).toBe(sebelum)
  })

  it('sewa bandara naik menurut jumlah bandara yang dikuasai', () => {
    const p = buatPermainan(pengaturan(2))
    const [b1, b2] = papanDari(p).indeks.bandara
    p.milik[b1!] = { tim: 0, tingkat: 0 }
    expect(sewaPetak(p, b1!)).toBe(25)
    p.milik[b2!] = { tim: 0, tingkat: 0 }
    expect(sewaPetak(p, b1!)).toBe(50)
  })

  it('mendarat di properti tim sendiri tidak menagih apa pun', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    const bandara = papan.indeks.bandara[0]!
    p.milik[bandara] = { tim: 0, tingkat: 0 }
    p = daratkan(p, bandara)
    expect(p.fase.jenis).toBe('aksi')
    expect(p.pemain[0]!.uang).toBe(PENGATURAN_BAWAAN.uangPribadiAwal)
    expect(p.tim[0]!.kerugian).toBe(0)
  })
})

describe('mesin: bangunan', () => {
  function siapkanKelompok(p: Permainan, kelompok: string, tim: number) {
    const anggota = anggotaKelompok(papanDari(p), kelompok)
    for (const x of anggota) p.milik[x.id] = { tim, tingkat: 0 }
    return anggota
  }

  it('butuh kelompok lengkap, bangun merata, maksimal pencakar langit', () => {
    const p = buatPermainan(pengaturan(2))
    p.fase = { jenis: 'aksi' }
    const [a, b, c] = anggotaKelompok(papanDari(p), '0-a')
    p.milik[a!.id] = { tim: 0, tingkat: 0 }
    expect(alasanTakBolehBangun(p, a!.id, 0)).toMatch(/ketiga kota/)
    siapkanKelompok(p, '0-a', 0)
    expect(alasanTakBolehBangun(p, a!.id, 0)).toBeNull()
    let q = langkah(p, { jenis: 'bangun', petak: a!.id })
    expect(q.milik[a!.id]!.tingkat).toBe(1)
    expect(q.tim[0]!.kas).toBe(PENGATURAN_BAWAAN.kasAwal - a!.biayaBangun)
    expect(() => langkah(q, { jenis: 'bangun', petak: a!.id })).toThrow(/merata/)
    q = langkah(q, { jenis: 'bangun', petak: b!.id })
    q = langkah(q, { jenis: 'bangun', petak: c!.id })
    q.milik[a!.id]!.tingkat = 4
    q.milik[b!.id]!.tingkat = 4
    q.milik[c!.id]!.tingkat = 4
    expect(alasanTakBolehBangun(q, a!.id, 0)).toMatch(/tertinggi/)
  })

  it('menjual bangunan mengembalikan setengah biaya ke kas tim', () => {
    const p = buatPermainan(pengaturan(2))
    p.fase = { jenis: 'aksi' }
    const [a] = siapkanKelompok(p, '0-a', 0)
    p.milik[a!.id]!.tingkat = 1
    const q = langkah(p, { jenis: 'jual-bangunan', petak: a!.id })
    expect(q.milik[a!.id]!.tingkat).toBe(0)
    expect(q.tim[0]!.kas).toBe(PENGATURAN_BAWAAN.kasAwal + Math.floor(a!.biayaBangun / 2))
  })

  it('kekayaan tim = kas + dompet + harga properti + bangunan', () => {
    const p = buatPermainan(pengaturan(2))
    const [a] = siapkanKelompok(p, '0-a', 0)
    p.milik[a!.id]!.tingkat = 2
    const anggota = anggotaKelompok(papanDari(p), '0-a')
    const nilaiProperti = anggota.reduce((s, x) => s + x.harga, 0) + 2 * a!.biayaBangun
    expect(kekayaanTim(p, 0)).toBe(PENGATURAN_BAWAAN.kasAwal + 2 * PENGATURAN_BAWAAN.uangPribadiAwal + nilaiProperti)
  })
})

describe('mesin: uang tim & kondisi akhir', () => {
  it('setor dan tarik hanya untuk anggota tim aktif', () => {
    let p = buatPermainan(pengaturan(2))
    p = langkah(p, { jenis: 'setor', pemain: 1, jumlah: 100 })
    expect(p.pemain[1]!.uang).toBe(150)
    expect(p.tim[0]!.kas).toBe(1100)
    p = langkah(p, { jenis: 'tarik', pemain: 0, jumlah: 50 })
    expect(p.pemain[0]!.uang).toBe(300)
    expect(() => langkah(p, { jenis: 'setor', pemain: 2, jumlah: 10 })).toThrow(GalatAksi)
    expect(() => langkah(p, { jenis: 'tarik', pemain: 0, jumlah: 99999 })).toThrow(GalatAksi)
  })

  it('kekurangan uang pribadi ditutup kas tim, lalu dompet rekan, lalu jual bangunan', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    const [a, b, c] = anggotaKelompok(papan, '1-b')
    for (const x of [a, b, c]) p.milik[x!.id] = { tim: 1, tingkat: 4 }
    const sewa = sewaPetak(p, a!.id)
    expect(sewa).toBeGreaterThan(500)
    // Tim 0 punya sedikit uang + satu bangunan yang bisa dijual.
    const [k] = anggotaKelompok(papan, '0-a')
    p.milik[k!.id] = { tim: 0, tingkat: 3 }
    p.pemain[0]!.uang = 100
    p.pemain[1]!.uang = 100
    p.tim[0]!.kas = 100
    p.pengaturan.targetKerugian = 99999
    p = daratkan(p, a!.id)
    expect(p.pemain[0]!.uang).toBe(0)
    expect(p.pemain[1]!.uang).toBe(0)
    const dariJual = 3 * Math.floor(k!.biayaBangun / 2)
    if (300 + dariJual >= sewa) {
      expect(p.tim[0]!.gugur).toBe(false)
      expect(p.milik[k!.id]!.tingkat).toBeLessThan(3)
    } else {
      expect(p.tim[0]!.gugur).toBe(true)
      expect(p.milik[k!.id]).toBeUndefined()
    }
    expect(p.tim[1]!.kas).toBeGreaterThan(PENGATURAN_BAWAAN.kasAwal)
  })

  it('tim yang kerugiannya melewati target gugur dan propertinya hilang', () => {
    let p = buatPermainan(pengaturan(3))
    const papan = papanDari(p)
    const kota = papan.petak.find(adalahProperti)!
    const bandara = papan.indeks.bandara[0]!
    p.milik[kota.id] = { tim: 1, tingkat: 0 }
    p.milik[bandara] = { tim: 0, tingkat: 0 }
    p.pengaturan.targetKerugian = 5
    p = daratkan(p, kota.id)
    expect(p.tim[0]!.gugur).toBe(true)
    expect(p.milik[bandara]).toBeUndefined()
    // Giliran otomatis pindah ke tim yang masih hidup.
    expect(p.tim[pemainAktif(p).tim]!.gugur).toBe(false)
    expect(p.fase.jenis).toBe('lempar')
  })

  it('tim terakhir yang bertahan menang', () => {
    let p = buatPermainan(pengaturan(2))
    p = langkah(p, { jenis: 'menyerah', tim: 1 })
    expect(p.fase).toMatchObject({ jenis: 'selesai', pemenang: 0 })
  })

  it('mencapai target kekayaan memenangkan permainan saat giliran berakhir', () => {
    let p = buatPermainan(pengaturan(2))
    p.fase = { jenis: 'aksi' }
    p.tim[0]!.kas = 10000
    p = langkah(p, { jenis: 'akhiri-giliran' })
    expect(p.fase).toMatchObject({ jenis: 'selesai', pemenang: 0 })
    expect(() => langkah(p, { jenis: 'lempar' })).toThrow(GalatAksi)
  })
})

describe('mesin: petak spesial & kartu', () => {
  it('pajak masuk pot, parkir bebas mengambil pot ke kas tim', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    const pajak = papan.petak.find((x) => x.jenis === 'pajak')!
    p = daratkan(p, pajak.id)
    expect(p.pot).toBe(100)
    expect(p.pemain[0]!.uang).toBe(150)
    p.fase = { jenis: 'lempar' }
    p = daratkan(p, papan.indeks.parkir)
    expect(p.pot).toBe(0)
    expect(p.tim[0]!.kas).toBe(1100)
  })

  it('Masuk Penjara memindahkan pion dan menahan lemparan ekstra', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    p.dadu = [3, 3]
    p.kembarBeruntun = 1
    p = daratkan(p, papan.indeks.masukPenjara)
    expect(p.pemain[0]!.diPenjara).toBe(true)
    expect(p.pemain[0]!.posisi).toBe(papan.indeks.penjara)
    p = langkah(p, { jenis: 'akhiri-giliran' })
    expect(p.pemainAktif).toBe(1)
  })

  it('bayar keluar penjara lalu boleh melempar', () => {
    let p = buatPermainan(pengaturan(2))
    p.pemain[0]!.diPenjara = true
    p = langkah(p, { jenis: 'bayar-keluar-penjara' })
    expect(p.pemain[0]!.diPenjara).toBe(false)
    expect(p.pemain[0]!.uang).toBe(200)
    expect(p.pot).toBe(50)
    expect(p.fase.jenis).toBe('lempar')
  })

  it('kartu pindah ke Mulai memberi gaji; kartu uang masuk ke tujuan yang benar', () => {
    let p = buatPermainan(pengaturan(2))
    p.pemain[0]!.posisi = 5
    p.fase = { jenis: 'kartu', kartu: { id: 'x', jenis: 'kesempatan', teks: '', efek: { jenis: 'pindah', ke: 'mulai' } } }
    p = langkah(p, { jenis: 'terapkan-kartu' })
    expect(p.fase).toMatchObject({ jenis: 'bergerak', ke: 0 })
    p = langkah(p, { jenis: 'tiba' })
    expect(p.pemain[0]!.uang).toBe(450)

    p.fase = { jenis: 'kartu', kartu: { id: 'y', jenis: 'harta', teks: '', efek: { jenis: 'uang', jumlah: 100, ke: 'kas' } } }
    p = langkah(p, { jenis: 'terapkan-kartu' })
    expect(p.tim[0]!.kas).toBe(1100)
    expect(p.fase.jenis).toBe('aksi')
  })

  it('kartu bayar tiap tim & terima tiap tim', () => {
    let p = buatPermainan(pengaturan(3))
    p.fase = { jenis: 'kartu', kartu: { id: 'x', jenis: 'kesempatan', teks: '', efek: { jenis: 'bayar-tiap-tim', jumlah: 20 } } }
    p = langkah(p, { jenis: 'terapkan-kartu' })
    expect(p.pemain[0]!.uang).toBe(210)
    expect(p.tim[1]!.kas).toBe(1020)
    expect(p.tim[2]!.kas).toBe(1020)
    p.fase = { jenis: 'kartu', kartu: { id: 'y', jenis: 'harta', teks: '', efek: { jenis: 'terima-tiap-tim', jumlah: 10 } } }
    p = langkah(p, { jenis: 'terapkan-kartu' })
    expect(p.pemain[0]!.uang).toBe(230)
    expect(p.tim[1]!.kas).toBe(1010)
  })

  it('kartu bandara terdekat memindahkan ke bandara berikutnya', () => {
    let p = buatPermainan(pengaturan(2))
    const papan = papanDari(p)
    p.pemain[0]!.posisi = papan.indeks.bandara[0]! + 1
    p.fase = { jenis: 'kartu', kartu: { id: 'x', jenis: 'kesempatan', teks: '', efek: { jenis: 'pindah', ke: 'bandara-terdekat' } } }
    p = langkah(p, { jenis: 'terapkan-kartu' })
    expect(p.fase).toMatchObject({ jenis: 'bergerak', ke: papan.indeks.bandara[1] })
    expect(papan.petak[papan.indeks.bandara[1]!]!.jenis).toBe('bandara')
    expect(adalahBandara(papan.petak[papan.indeks.bandara[1]!]!)).toBe(true)
  })

  it('simulasi acak 300 aksi tidak pernah melempar galat dan uang tidak negatif', () => {
    let p = buatPermainan(pengaturan(4, 99))
    for (let i = 0; i < 300 && p.fase.jenis !== 'selesai'; i++) {
      switch (p.fase.jenis) {
        case 'lempar':
          p = langkah(p, { jenis: 'lempar' })
          break
        case 'bergerak':
          p = langkah(p, { jenis: 'tiba' })
          break
        case 'tawaran': {
          const petak = papanDari(p).petak[p.fase.petak] as PetakProperti
          const t = p.tim[pemainAktif(p).tim]!
          p = langkah(p, t.kas + pemainAktif(p).uang >= petak.harga ? { jenis: 'beli' } : { jenis: 'lewati' })
          break
        }
        case 'kartu':
          p = langkah(p, { jenis: 'terapkan-kartu' })
          break
        case 'aksi':
          p = langkah(p, { jenis: 'akhiri-giliran' })
          break
      }
      for (const t of p.tim) expect(t.kas).toBeGreaterThanOrEqual(0)
      for (const x of p.pemain) expect(x.uang).toBeGreaterThanOrEqual(0)
    }
    expect(p.log.length).toBeGreaterThan(50)
  })
})
