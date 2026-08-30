/**
 * Validasi dan kompresi gambar di sisi peramban.
 *
 * Kenapa dikompres sebelum diunggah:
 *  - foto dari kamera ponsel rutin 3–6 MB; setelah diciutkan jadi 1600px
 *    biasanya tinggal 150–400 KB tanpa perbedaan yang terlihat,
 *  - hemat kuota pengguna, hemat penyimpanan server, dan halaman jadi cepat,
 *  - lihat .claude/rules/performance.md — target < 100 KB thumbnail, < 500 KB hero.
 *
 * Validasi di sini untuk pengalaman pengguna. Server WAJIB memeriksa ulang
 * tipe dan ukuran berkas (.claude/rules/security.md).
 */

export type TipeGambar = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | 'image/svg+xml'

export type AturanGambar = {
  /** Ukuran berkas maksimal SEBELUM kompresi, dalam byte. */
  maksByte?: number
  tipeDiizinkan?: TipeGambar[]
  /** Lebar/tinggi minimal agar tidak pecah saat ditampilkan. */
  minLebar?: number
  minTinggi?: number
  /** Rasio yang diharapkan (lebar/tinggi), mis. 1 untuk persegi. */
  rasio?: number
  /** Toleransi rasio, bawaan 0,08 (8%). */
  toleransiRasio?: number
}

export type OpsiKompresi = {
  /** Sisi terpanjang hasil akhir. Gambar lebih kecil tidak diperbesar. */
  maksSisi?: number
  /** 0–1. Bawaan 0,82 — titik seimbang antara ukuran dan kualitas. */
  kualitas?: number
  /** Paksa format keluaran. Bawaan: WebP bila didukung, jika tidak JPEG/PNG. */
  format?: 'image/webp' | 'image/jpeg' | 'image/png'
  /** Potong ke tengah mengikuti rasio ini (mis. 1 untuk favicon persegi). */
  potongRasio?: number
}

export type HasilGambar = {
  dataUri: string
  tipe: string
  lebar: number
  tinggi: number
  ukuranAsli: number
  ukuranAkhir: number
  /** Rasio penghematan 0–1. Negatif berarti hasilnya justru lebih besar. */
  hemat: number
  dikompres: boolean
}

const TANDA_TANGAN: Array<{ tipe: TipeGambar; bytes: number[]; offset?: number }> = [
  { tipe: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { tipe: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { tipe: 'image/gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { tipe: 'image/webp', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
]

/**
 * Tebak tipe sebenarnya dari byte awal berkas.
 *
 * `File.type` datang dari peramban berdasarkan ekstensi dan mudah dipalsukan
 * dengan mengganti nama berkas. Memeriksa tanda tangan byte menutup celah itu.
 */
export async function tipeSebenarnya(berkas: File): Promise<TipeGambar | null> {
  const kepala = new Uint8Array(await berkas.slice(0, 16).arrayBuffer())

  for (const { tipe, bytes, offset = 0 } of TANDA_TANGAN) {
    if (bytes.every((b, i) => kepala[offset + i] === b)) return tipe
  }

  // SVG adalah teks, jadi tidak punya tanda tangan biner.
  const awal = new TextDecoder().decode(kepala).trimStart().toLowerCase()
  if (awal.startsWith('<?xml') || awal.startsWith('<svg')) return 'image/svg+xml'

  return null
}

export function bacaDimensi(sumber: Blob | string): Promise<{ lebar: number; tinggi: number }> {
  return new Promise((selesai, gagal) => {
    const url = typeof sumber === 'string' ? sumber : URL.createObjectURL(sumber)
    const img = new Image()
    img.onload = () => {
      const ukuran = { lebar: img.naturalWidth, tinggi: img.naturalHeight }
      if (typeof sumber !== 'string') URL.revokeObjectURL(url)
      selesai(ukuran)
    }
    img.onerror = () => {
      if (typeof sumber !== 'string') URL.revokeObjectURL(url)
      gagal(new Error('Berkas tidak dapat dibaca sebagai gambar.'))
    }
    img.src = url
  })
}

/** Pesan galat dalam Bahasa Indonesia, atau null bila lolos. */
export async function periksaGambar(berkas: File, aturan: AturanGambar = {}): Promise<string | null> {
  const {
    maksByte = 5 * 1024 * 1024,
    tipeDiizinkan = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    minLebar,
    minTinggi,
    rasio,
    toleransiRasio = 0.08,
  } = aturan

  if (berkas.size === 0) return 'Berkas kosong atau gagal dibaca.'
  if (berkas.size > maksByte) {
    return `Ukuran berkas ${formatByte(berkas.size)} melebihi batas ${formatByte(maksByte)}.`
  }

  const tipe = await tipeSebenarnya(berkas)
  if (!tipe) return 'Berkas ini bukan gambar yang dikenali (PNG, JPG, WebP, GIF, atau SVG).'
  if (!tipeDiizinkan.includes(tipe)) {
    const daftar = tipeDiizinkan.map((t) => t.replace('image/', '').replace('+xml', '').toUpperCase()).join(', ')
    return `Format ${tipe.replace('image/', '').toUpperCase()} tidak diizinkan. Gunakan ${daftar}.`
  }
  if (berkas.type && berkas.type !== tipe) {
    return `Isi berkas (${tipe.replace('image/', '')}) tidak cocok dengan ekstensinya. Berkas mungkin sudah diganti nama.`
  }

  // SVG tidak punya dimensi piksel tetap — lewati pemeriksaan ukuran.
  if (tipe === 'image/svg+xml') return null

  let dimensi: { lebar: number; tinggi: number }
  try {
    dimensi = await bacaDimensi(berkas)
  } catch {
    return 'Gambar rusak atau tidak dapat dibuka.'
  }

  if (minLebar && dimensi.lebar < minLebar) {
    return `Lebar gambar ${dimensi.lebar}px, minimal ${minLebar}px agar tidak pecah.`
  }
  if (minTinggi && dimensi.tinggi < minTinggi) {
    return `Tinggi gambar ${dimensi.tinggi}px, minimal ${minTinggi}px agar tidak pecah.`
  }
  if (rasio) {
    const nyata = dimensi.lebar / dimensi.tinggi
    if (Math.abs(nyata - rasio) / rasio > toleransiRasio) {
      return `Rasio gambar ${nyata.toFixed(2)}:1, seharusnya sekitar ${rasio.toFixed(2)}:1.`
    }
  }

  return null
}

let dukungWebp: boolean | null = null
function webpDidukung(): boolean {
  if (dukungWebp === null) {
    const kanvas = document.createElement('canvas')
    kanvas.width = 1
    kanvas.height = 1
    dukungWebp = kanvas.toDataURL('image/webp').startsWith('data:image/webp')
  }
  return dukungWebp
}

/**
 * Ciutkan gambar ke sisi terpanjang tertentu lalu sandikan ulang.
 *
 * SVG dilewatkan apa adanya — formatnya vektor, mengubahnya jadi raster justru
 * memperbesar berkas dan menghilangkan ketajamannya.
 */
export async function kompresGambar(berkas: File, opsi: OpsiKompresi = {}): Promise<HasilGambar> {
  const { maksSisi = 1600, kualitas = 0.82, potongRasio } = opsi
  const tipe = await tipeSebenarnya(berkas)

  if (tipe === 'image/svg+xml') {
    const teks = await berkas.text()
    const dataUri = `data:image/svg+xml,${encodeURIComponent(teks)}`
    return {
      dataUri,
      tipe: 'image/svg+xml',
      lebar: 0,
      tinggi: 0,
      ukuranAsli: berkas.size,
      ukuranAkhir: berkas.size,
      hemat: 0,
      dikompres: false,
    }
  }

  const bitmap = await createImageBitmap(berkas)

  // Tentukan area sumber — dipotong ke tengah bila rasio diminta.
  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height
  if (potongRasio) {
    const rasioAsli = sw / sh
    if (rasioAsli > potongRasio) {
      sw = Math.round(sh * potongRasio)
      sx = Math.round((bitmap.width - sw) / 2)
    } else if (rasioAsli < potongRasio) {
      sh = Math.round(sw / potongRasio)
      sy = Math.round((bitmap.height - sh) / 2)
    }
  }

  // Jangan pernah memperbesar — hanya memperkecil.
  const skala = Math.min(1, maksSisi / Math.max(sw, sh))
  const lebar = Math.max(1, Math.round(sw * skala))
  const tinggi = Math.max(1, Math.round(sh * skala))

  const kanvas = document.createElement('canvas')
  kanvas.width = lebar
  kanvas.height = tinggi
  const ktx = kanvas.getContext('2d')
  if (!ktx) throw new Error('Peramban tidak mendukung kanvas 2D.')
  ktx.imageSmoothingQuality = 'high'
  ktx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, lebar, tinggi)
  bitmap.close()

  // PNG dipertahankan bila transparansinya terpakai; selain itu WebP lebih kecil.
  const punyaAlfa = tipe === 'image/png' || tipe === 'image/webp' || tipe === 'image/gif'
  const format =
    opsi.format ?? (webpDidukung() ? 'image/webp' : punyaAlfa ? 'image/png' : 'image/jpeg')

  const dataUri = kanvas.toDataURL(format, kualitas)
  // data URI base64 ≈ 4/3 ukuran biner, ditambah prefiks.
  const ukuranAkhir = Math.round(((dataUri.length - dataUri.indexOf(',') - 1) * 3) / 4)

  return {
    dataUri,
    tipe: format,
    lebar,
    tinggi,
    ukuranAsli: berkas.size,
    ukuranAkhir,
    hemat: berkas.size > 0 ? (berkas.size - ukuranAkhir) / berkas.size : 0,
    dikompres: true,
  }
}

/** Format byte ringkas — dipakai pesan galat agar tidak bergantung modul lain. */
function formatByte(byte: number): string {
  if (byte < 1024) return `${byte} B`
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`
}

/** Preset siap pakai untuk tiap jenis unggahan di panel ini. */
export const PRESET = {
  logo: {
    aturan: { maksByte: 2 * 1024 * 1024, minTinggi: 48 } satisfies AturanGambar,
    kompresi: { maksSisi: 512, kualitas: 0.9, format: 'image/png' } satisfies OpsiKompresi,
  },
  favicon: {
    aturan: {
      maksByte: 1024 * 1024,
      tipeDiizinkan: ['image/png', 'image/svg+xml', 'image/webp'] as TipeGambar[],
      minLebar: 48,
      minTinggi: 48,
    } satisfies AturanGambar,
    kompresi: { maksSisi: 128, kualitas: 0.92, format: 'image/png', potongRasio: 1 } satisfies OpsiKompresi,
  },
  sampul: {
    aturan: { maksByte: 8 * 1024 * 1024, minLebar: 800 } satisfies AturanGambar,
    kompresi: { maksSisi: 1600, kualitas: 0.82, potongRasio: 16 / 9 } satisfies OpsiKompresi,
  },
  produk: {
    aturan: { maksByte: 8 * 1024 * 1024, minLebar: 400 } satisfies AturanGambar,
    kompresi: { maksSisi: 1200, kualitas: 0.85, potongRasio: 1 } satisfies OpsiKompresi,
  },
  avatar: {
    aturan: { maksByte: 4 * 1024 * 1024, minLebar: 128 } satisfies AturanGambar,
    kompresi: { maksSisi: 320, kualitas: 0.85, potongRasio: 1 } satisfies OpsiKompresi,
  },
} as const
