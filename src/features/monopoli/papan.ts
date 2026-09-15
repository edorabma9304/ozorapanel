import type { Papan, Petak, PetakBandara, PetakProperti, Sisi, Wilayah } from './tipe'

/**
 * Pembangkit papan. Ukuran papan mengikuti jumlah tim:
 *
 *   jumlah petak = 8 + 8 × jumlahTim
 *
 * 4 sudut (Mulai, Penjara, Parkir Bebas, Masuk Penjara), 4 bandara di tengah
 * tiap sisi, dan satu WILAYAH (distrik) per tim berisi 8 petak dengan pola
 * `K K S K K S K K` — 6 kota dalam 2 kelompok warna + 2 petak spesial.
 * Wilayah ke-i adalah "kampung halaman" tim ke-i.
 */

export const UKURAN_SUDUT = 150
export const LEBAR_PETAK = 100
export const HARGA_BANDARA = 200
export const SEWA_BANDARA = [25, 50, 100, 200] as const
export const PAJAK = 100
export const BONUS_PETAK = 50
export const DENDA_PENJARA = 50
export const TIM_MIN = 2
export const TIM_MAKS = 8

export const WILAYAH_DUNIA: Array<Omit<Wilayah, 'id' | 'timAsal'>> = [
  { nama: 'Asia Tenggara', julukan: 'Negeri tropis seribu pulau', kota: ['Jakarta', 'Bali', 'Singapura', 'Bangkok', 'Kuala Lumpur', 'Manila'] },
  { nama: 'Asia Timur', julukan: 'Pusat teknologi dan tradisi', kota: ['Tokyo', 'Seoul', 'Beijing', 'Shanghai', 'Taipei', 'Hong Kong'] },
  { nama: 'Eropa', julukan: 'Kota tua dan seni klasik', kota: ['Paris', 'London', 'Roma', 'Berlin', 'Amsterdam', 'Madrid'] },
  { nama: 'Afrika', julukan: 'Sabana luas dan pasar ramai', kota: ['Kairo', 'Cape Town', 'Nairobi', 'Marrakesh', 'Lagos', 'Zanzibar'] },
  { nama: 'Amerika Utara', julukan: 'Gedung tinggi dan jalan raya', kota: ['New York', 'Los Angeles', 'Toronto', 'Meksiko', 'Chicago', 'Vancouver'] },
  { nama: 'Amerika Selatan', julukan: 'Karnaval dan pegunungan Andes', kota: ['Rio de Janeiro', 'Buenos Aires', 'Lima', 'Santiago', 'Bogota', 'Cusco'] },
  { nama: 'Oseania', julukan: 'Pantai karang dan hutan hujan', kota: ['Sydney', 'Melbourne', 'Auckland', 'Fiji', 'Perth', 'Brisbane'] },
  { nama: 'Timur Tengah', julukan: 'Gurun emas dan menara kaca', kota: ['Dubai', 'Doha', 'Istanbul', 'Abu Dhabi', 'Riyadh', 'Muscat'] },
]

const NAMA_BANDARA = ['Bandara Selatan', 'Bandara Barat', 'Bandara Utara', 'Bandara Timur']

function bulatkanPuluhan(n: number) {
  return Math.round(n / 10) * 10
}

/** Harga dasar kota per wilayah: naik bertahap dari $60 sampai $360. */
export function hargaDasarWilayah(wilayah: number, jumlahTim: number) {
  const pembagi = Math.max(jumlahTim - 1, 1)
  return bulatkanPuluhan(60 + (wilayah / pembagi) * 300)
}

export function buatPapan(jumlahTim: number): Papan {
  if (jumlahTim < TIM_MIN || jumlahTim > TIM_MAKS) {
    throw new Error(`Jumlah tim harus ${TIM_MIN}–${TIM_MAKS}, diberikan ${jumlahTim}.`)
  }
  const perSisi = 1 + 2 * jumlahTim // petak di antara dua sudut — selalu ganjil
  const total = 4 * perSisi + 4
  const ukuran = 2 * UKURAN_SUDUT + perSisi * LEBAR_PETAK
  const C = UKURAN_SUDUT
  const W = LEBAR_PETAK

  const wilayah: Wilayah[] = Array.from({ length: jumlahTim }, (_, i) => ({
    id: i,
    ...WILAYAH_DUNIA[i]!,
    timAsal: i,
  }))

  // Penomoran searah jarum jam dari sudut kanan-bawah (Mulai) ke kiri.
  const petak: Petak[] = []
  let urutDistrik = 0 // hitung petak distrik yang sudah ditempatkan (0..8*tim-1)
  const tengah = (perSisi + 1) / 2

  function geometri(id: number): { x: number; y: number; lebar: number; tinggi: number; sisi: Sisi } {
    const s = perSisi
    if (id === 0) return { x: ukuran - C, y: ukuran - C, lebar: C, tinggi: C, sisi: 'bawah' }
    if (id <= s) return { x: ukuran - C - id * W, y: ukuran - C, lebar: W, tinggi: C, sisi: 'bawah' }
    if (id === s + 1) return { x: 0, y: ukuran - C, lebar: C, tinggi: C, sisi: 'kiri' }
    if (id <= 2 * s + 1) {
      const j = id - (s + 1)
      return { x: 0, y: ukuran - C - j * W, lebar: C, tinggi: W, sisi: 'kiri' }
    }
    if (id === 2 * s + 2) return { x: 0, y: 0, lebar: C, tinggi: C, sisi: 'atas' }
    if (id <= 3 * s + 2) {
      const k = id - (2 * s + 2)
      return { x: C + (k - 1) * W, y: 0, lebar: W, tinggi: C, sisi: 'atas' }
    }
    if (id === 3 * s + 3) return { x: ukuran - C, y: 0, lebar: C, tinggi: C, sisi: 'kanan' }
    const m = id - (3 * s + 3)
    return { x: ukuran - C, y: C + (m - 1) * W, lebar: C, tinggi: W, sisi: 'kanan' }
  }

  const bandara: number[] = []

  for (let id = 0; id < total; id++) {
    const g = geometri(id)
    const sisiKe = Math.floor(id / (perSisi + 1)) // 0..3
    const posDiSisi = id % (perSisi + 1) // 0 = sudut

    if (posDiSisi === 0) {
      const sudut = (['mulai', 'penjara', 'parkir', 'masuk-penjara'] as const)[sisiKe]!
      const nama = { mulai: 'Mulai', penjara: 'Penjara', parkir: 'Parkir Bebas', 'masuk-penjara': 'Masuk Penjara' }[sudut]
      petak.push({ id, jenis: sudut, nama, ...g })
      continue
    }
    if (posDiSisi === tengah) {
      bandara.push(id)
      const p: PetakBandara = { id, jenis: 'bandara', nama: NAMA_BANDARA[sisiKe]!, harga: HARGA_BANDARA, ...g }
      petak.push(p)
      continue
    }

    const distrik = Math.floor(urutDistrik / 8)
    const slot = urutDistrik % 8
    urutDistrik++
    const w = wilayah[distrik]!

    if (slot === 2) {
      // Petak kartu: wilayah genap dapat Kesempatan, ganjil dapat Harta Karun.
      const jenis = distrik % 2 === 0 ? 'kesempatan' : 'harta'
      petak.push({ id, jenis, nama: jenis === 'kesempatan' ? 'Kesempatan' : 'Harta Karun', wilayah: distrik, ...g })
      continue
    }
    if (slot === 5) {
      const jenis = distrik % 2 === 0 ? 'pajak' : 'bonus'
      petak.push({ id, jenis, nama: jenis === 'pajak' ? 'Pajak' : 'Bonus', wilayah: distrik, ...g })
      continue
    }

    const urutKota = [0, 1, -1, 2, 3, -1, 4, 5][slot]!
    const dasar = hargaDasarWilayah(distrik, jumlahTim)
    const harga = dasar + urutKota * 20
    const p: PetakProperti = {
      id,
      jenis: 'properti',
      nama: w.kota[urutKota]!,
      wilayah: distrik,
      kelompok: `${distrik}-${urutKota < 3 ? 'a' : 'b'}`,
      harga,
      sewaDasar: Math.max(4, Math.ceil(harga / 10 / 2) * 2),
      biayaBangun: bulatkanPuluhan(harga / 2),
      ...g,
    }
    petak.push(p)
  }

  return {
    jumlahTim,
    petak,
    wilayah,
    lebar: ukuran,
    tinggi: ukuran,
    indeks: {
      mulai: 0,
      penjara: perSisi + 1,
      parkir: 2 * perSisi + 2,
      masukPenjara: 3 * perSisi + 3,
      bandara,
    },
  }
}

export function adalahProperti(p: Petak): p is PetakProperti {
  return p.jenis === 'properti'
}

export function adalahBandara(p: Petak): p is PetakBandara {
  return p.jenis === 'bandara'
}

/** Semua petak dalam satu kelompok warna. */
export function anggotaKelompok(papan: Papan, kelompok: string): PetakProperti[] {
  return papan.petak.filter((p): p is PetakProperti => adalahProperti(p) && p.kelompok === kelompok)
}
