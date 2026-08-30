/**
 * Data peraga deterministik untuk driver `mock`.
 * Memakai PRNG ber-seed supaya isinya sama setiap kali dimuat —
 * penting agar tangkapan layar & test tidak berubah-ubah.
 *
 * Berkas ini bagian dari demo: dibuang oleh `pnpm demo:strip`.
 */
import type { Audit, Pengguna } from '@/lib/tipe'
import type { Peran } from '@/config/peran'

/** Mulberry32 — kecil, cepat, dan cukup untuk data peraga. */
function prng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const acak = prng(20260830)
const pilih = <T,>(arr: readonly T[]): T => arr[Math.floor(acak() * arr.length)]!
const angka = (min: number, maks: number) => Math.floor(acak() * (maks - min + 1)) + min

const HARI = 86_400_000
const SEKARANG = new Date('2026-08-30T09:00:00+07:00').getTime()
const tanggalLalu = (hari: number) => new Date(SEKARANG - hari * HARI).toISOString()

const DEPAN = ['Adi','Budi','Citra','Dewi','Eka','Fajar','Gita','Hendra','Indah','Joko','Kartika','Lestari','Maya','Nanda','Oki','Putri','Rizky','Sari','Tono','Umar','Vina','Wahyu','Yusuf','Zahra']
const BELAKANG = ['Pratama','Wijaya','Santoso','Nugroho','Hartono','Kusuma','Permana','Saputra','Maulana','Rahayu','Setiawan','Anggraini','Firmansyah','Halim','Purnomo']
const KOTA = ['Jakarta','Bandung','Surabaya','Yogyakarta','Semarang','Medan','Makassar','Denpasar','Malang','Palembang']
const PERUSAHAAN = ['PT Sinar Abadi','CV Mitra Jaya','PT Nusantara Digital','Toko Berkah','PT Cahaya Timur','CV Karya Mandiri','PT Bumi Lestari','UD Sumber Rejeki']

export const namaAcak = () => `${pilih(DEPAN)} ${pilih(BELAKANG)}`
const emailDari = (nama: string, i: number) =>
  `${nama.toLowerCase().replace(/\s+/g, '.')}${i}@contoh.id`

/** Avatar SVG data-URI — tanpa permintaan jaringan, aman untuk CSP ketat. */
export function avatarDari(nama: string): string {
  const huruf = nama.trim().split(/\s+/).slice(0, 2).map((k) => k[0]).join('').toUpperCase()
  let h = 0
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="hsl(${h} 70% 88%)"/><text x="50%" y="54%" font-family="system-ui,sans-serif" font-size="30" font-weight="700" fill="hsl(${h} 55% 32%)" text-anchor="middle" dominant-baseline="middle">${huruf}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function entitas(i: number, umurHari = angka(1, 400)) {
  return {
    id: `id-${i.toString().padStart(5, '0')}`,
    created_at: tanggalLalu(umurHari),
    updated_at: tanggalLalu(Math.max(0, umurHari - angka(0, 20))),
    deleted_at: null,
  }
}

// ------------------------------------------------------------------ Pengguna
const PERAN_CONTOH: Peran[] = ['admin', 'finance', 'produksi', 'sales', 'sales', 'produksi']
const JABATAN = ['Manajer Operasional','Staf Keuangan','Kepala Produksi','Account Executive','Supervisor Gudang','Admin Kantor']

export const PENGGUNA_CONTOH: Pengguna[] = [
  {
    ...entitas(1, 500),
    nama: 'Edo Rabmadhani',
    email: 'edo.rabmadhani@gmail.com',
    peran: 'superadmin' as Peran,
    avatar_url: avatarDari('Edo Rabmadhani'),
    telepon: '0812-1000-0001',
    jabatan: 'Pemilik',
    aktif: true,
    terakhir_masuk: tanggalLalu(0),
  },
  ...Array.from({ length: 17 }, (_, k) => {
    const nama = namaAcak()
    return {
      ...entitas(k + 2),
      nama,
      email: emailDari(nama, k + 2),
      peran: pilih(PERAN_CONTOH),
      avatar_url: avatarDari(nama),
      telepon: `08${angka(11, 89)}-${angka(1000, 9999)}-${angka(1000, 9999)}`,
      jabatan: pilih(JABATAN),
      aktif: acak() > 0.15,
      terakhir_masuk: tanggalLalu(angka(0, 45)),
    }
  }),
]

// ------------------------------------------------------------------ Pelanggan
export type Pelanggan = ReturnType<typeof buatPelanggan>
function buatPelanggan(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i),
    nama,
    email: emailDari(nama, i),
    telepon: `08${angka(11, 89)}-${angka(1000, 9999)}-${angka(1000, 9999)}`,
    perusahaan: pilih(PERUSAHAAN),
    kota: pilih(KOTA),
    avatar_url: avatarDari(nama),
    status: pilih(['aktif', 'aktif', 'aktif', 'nonaktif'] as const),
    total_belanja: angka(2, 480) * 250_000,
    jumlah_pesanan: angka(1, 42),
  }
}
export const PELANGGAN_CONTOH = Array.from({ length: 48 }, (_, k) => buatPelanggan(k + 1))

// ------------------------------------------------------------------ Produk
const KATEGORI = ['Elektronik', 'Fashion', 'Rumah Tangga', 'Olahraga', 'Kecantikan', 'Makanan']
const NAMA_PRODUK = ['Kursi Ergonomis','Meja Lipat','Lampu Meja LED','Headset Nirkabel','Tas Kanvas','Sepatu Lari','Botol Minum','Jam Tangan','Kaos Katun','Blender Portabel','Kamera Aksi','Keyboard Mekanik','Matras Yoga','Parfum Lokal','Kopi Bubuk','Powerbank','Rak Dinding','Sarung Bantal','Tumbler Baja','Payung Lipat']

export type Produk = ReturnType<typeof buatProduk>
function buatProduk(i: number) {
  const nama = `${pilih(NAMA_PRODUK)} ${pilih(['Pro', 'Lite', 'Max', 'Classic', 'V2', 'Premium'])}`
  const harga = angka(4, 320) * 25_000
  return {
    ...entitas(i),
    nama,
    sku: `SKU-${(i + 1000).toString()}`,
    kategori: pilih(KATEGORI),
    harga,
    harga_modal: Math.round(harga * (0.55 + acak() * 0.2)),
    stok: angka(0, 240),
    terjual: angka(0, 900),
    rating: Number((3.4 + acak() * 1.6).toFixed(1)),
    status: pilih(['terbit', 'terbit', 'terbit', 'draf', 'arsip'] as const),
    gambar: avatarDari(nama),
  }
}
export const PRODUK_CONTOH = Array.from({ length: 60 }, (_, k) => buatProduk(k + 1))

// ------------------------------------------------------------------ Pesanan
export type Pesanan = ReturnType<typeof buatPesanan>
function buatPesanan(i: number) {
  const pel = pilih(PELANGGAN_CONTOH)
  const jumlahItem = angka(1, 5)
  const item = Array.from({ length: jumlahItem }, () => {
    const p = pilih(PRODUK_CONTOH)
    const qty = angka(1, 4)
    return { produk_id: p.id, nama: p.nama, qty, harga: p.harga, subtotal: p.harga * qty }
  })
  const total = item.reduce((a, b) => a + b.subtotal, 0)
  return {
    ...entitas(i, angka(0, 120)),
    nomor: `INV-2026-${(i + 1000).toString()}`,
    pelanggan_id: pel.id,
    pelanggan_nama: pel.nama,
    pelanggan_avatar: pel.avatar_url,
    item,
    total,
    ongkir: angka(0, 6) * 5_000,
    status: pilih(['baru', 'diproses', 'dikirim', 'selesai', 'selesai', 'batal'] as const),
    status_bayar: pilih(['lunas', 'lunas', 'belum', 'sebagian'] as const),
    metode_bayar: pilih(['Transfer Bank', 'QRIS', 'Kartu Kredit', 'COD'] as const),
    tanggal: tanggalLalu(angka(0, 120)),
  }
}
export const PESANAN_CONTOH = Array.from({ length: 86 }, (_, k) => buatPesanan(k + 1))

// ------------------------------------------------------------------ Faktur
export type Faktur = ReturnType<typeof buatFaktur>
function buatFaktur(i: number) {
  const pel = pilih(PELANGGAN_CONTOH)
  const jumlahItem = angka(1, 4)
  const item = Array.from({ length: jumlahItem }, (_, k) => {
    const p = pilih(PRODUK_CONTOH)
    const qty = angka(1, 6)
    return { no: k + 1, nama: p.nama, qty, harga: p.harga, subtotal: p.harga * qty }
  })
  const subtotal = item.reduce((a, b) => a + b.subtotal, 0)
  const pajak = Math.round(subtotal * 0.11)
  const dibuat = angka(0, 90)
  return {
    ...entitas(i, dibuat),
    nomor: `FKT-${2026}${(i + 100).toString().padStart(4, '0')}`,
    dari_nama: 'PT Ozora Digital Nusantara',
    dari_alamat: 'Jl. Merdeka No. 12, Yogyakarta 55223',
    ke_nama: pel.perusahaan,
    ke_alamat: `Jl. ${pilih(['Sudirman','Gatot Subroto','Diponegoro','Ahmad Yani'])} No. ${angka(1, 200)}, ${pel.kota}`,
    ke_email: pel.email,
    item,
    subtotal,
    pajak,
    total: subtotal + pajak,
    status: pilih(['lunas', 'tertunda', 'jatuh_tempo', 'draf'] as const),
    tanggal: tanggalLalu(dibuat),
    jatuh_tempo: tanggalLalu(dibuat - 14),
  }
}
export const FAKTUR_CONTOH = Array.from({ length: 42 }, (_, k) => buatFaktur(k + 1))

// ------------------------------------------------------------------ Tiket
const JUDUL_TIKET = ['Tidak bisa masuk ke akun','Pesanan belum diterima','Salah kirim barang','Minta ubah alamat pengiriman','Refund belum masuk','Aplikasi keluar sendiri','Kode promo tidak berlaku','Faktur tidak terunduh','Stok tidak sesuai','Notifikasi tidak muncul']
export type Tiket = ReturnType<typeof buatTiket>
function buatTiket(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i, angka(0, 60)),
    nomor: `TKT-${(i + 500).toString()}`,
    judul: pilih(JUDUL_TIKET),
    pelapor: nama,
    avatar: avatarDari(nama),
    prioritas: pilih(['rendah', 'sedang', 'tinggi', 'mendesak'] as const),
    status: pilih(['terbuka', 'diproses', 'menunggu', 'selesai'] as const),
    kategori: pilih(['Akun', 'Pengiriman', 'Pembayaran', 'Produk', 'Teknis'] as const),
    balasan: angka(0, 14),
  }
}
export const TIKET_CONTOH = Array.from({ length: 34 }, (_, k) => buatTiket(k + 1))

// ------------------------------------------------------------------ Blog
const JUDUL_BLOG = ['Cara Menyusun Laporan Keuangan Bulanan','Lima Kebiasaan Tim Produksi yang Efisien','Mengelola Stok Tanpa Kelebihan Beli','Panduan Singkat Menghitung HPP','Membangun Loyalitas Pelanggan Lokal','Otomasi Pesanan lewat WhatsApp','Menyiapkan Audit Internal Pertama','Memilih Metode Pembayaran yang Tepat','Membaca Laporan Laba Rugi','Strategi Diskon yang Tidak Merugikan']
export type Pos = ReturnType<typeof buatPos>
function buatPos(i: number) {
  const judul = JUDUL_BLOG[i % JUDUL_BLOG.length]!
  const penulis = namaAcak()
  return {
    ...entitas(i, angka(1, 300)),
    judul,
    slug: judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    ringkasan: 'Catatan praktis dari lapangan, ditulis untuk tim kecil yang mengerjakan banyak hal sekaligus.',
    penulis,
    avatar: avatarDari(penulis),
    kategori: pilih(['Keuangan', 'Operasional', 'Pemasaran', 'Teknologi'] as const),
    sampul: avatarDari(judul),
    dibaca: angka(120, 9800),
    komentar: angka(0, 48),
    terbit: tanggalLalu(angka(1, 300)),
  }
}
export const POS_CONTOH = Array.from({ length: 20 }, (_, k) => buatPos(k))

// ------------------------------------------------------------------ Kontak
export type Kontak = ReturnType<typeof buatKontak>
function buatKontak(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i),
    nama,
    email: emailDari(nama, i),
    telepon: `08${angka(11, 89)}-${angka(1000, 9999)}-${angka(1000, 9999)}`,
    departemen: pilih(['Penjualan', 'Dukungan', 'Keuangan', 'Operasional'] as const),
    jabatan: pilih(JABATAN),
    perusahaan: pilih(PERUSAHAAN),
    avatar: avatarDari(nama),
    favorit: acak() > 0.75,
  }
}
export const KONTAK_CONTOH = Array.from({ length: 30 }, (_, k) => buatKontak(k + 1))

// ------------------------------------------------------------------ Catatan
const WARNA_CATATAN = ['primary', 'success', 'warning', 'danger', 'info'] as const
export type Catatan = ReturnType<typeof buatCatatan>
function buatCatatan(i: number) {
  const isi = [
    'Hubungi supplier kemasan sebelum Jumat, stok kardus tinggal 40.',
    'Rapat tim produksi Senin 09.00 — bahas antrean pesanan besar.',
    'Cek ulang HPP setelah harga tepung naik 8%.',
    'Draf penawaran untuk PT Sinar Abadi menunggu tanda tangan.',
    'Backup database mingguan belum jalan otomatis, cek cron.',
    'Ide konten: seri "di balik dapur" untuk media sosial.',
  ]
  return {
    ...entitas(i, angka(0, 30)),
    judul: pilih(['Pengingat', 'Ide', 'Tugas', 'Rapat', 'Catatan Cepat']) as string,
    isi: isi[i % isi.length]!,
    warna: pilih(WARNA_CATATAN),
    disematkan: acak() > 0.7,
  }
}
export const CATATAN_CONTOH = Array.from({ length: 12 }, (_, k) => buatCatatan(k + 1))

// ------------------------------------------------------------------ Surel
export type Surel = ReturnType<typeof buatSurel>
function buatSurel(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i, angka(0, 21)),
    dari: nama,
    dari_email: emailDari(nama, i),
    avatar: avatarDari(nama),
    subjek: pilih(['Konfirmasi pesanan bulan ini','Permintaan penawaran harga','Undangan rapat koordinasi','Laporan stok mingguan','Tindak lanjut pembayaran','Perubahan jadwal pengiriman']),
    cuplikan: 'Selamat pagi, menindaklanjuti percakapan kemarin, berikut rincian yang Bapak/Ibu minta…',
    label: pilih(['kotak_masuk', 'kotak_masuk', 'kotak_masuk', 'penting', 'draf', 'terkirim'] as const),
    dibaca: acak() > 0.45,
    berbintang: acak() > 0.8,
    lampiran: angka(0, 3),
  }
}
export const SUREL_CONTOH = Array.from({ length: 26 }, (_, k) => buatSurel(k + 1))

// ------------------------------------------------------------------ Obrolan
export type Obrolan = ReturnType<typeof buatObrolan>
function buatObrolan(i: number) {
  const nama = namaAcak()
  const jumlahPesan = angka(3, 9)
  return {
    ...entitas(i, angka(0, 10)),
    nama,
    avatar: avatarDari(nama),
    status: pilih(['daring', 'sibuk', 'luring'] as const),
    belum_dibaca: acak() > 0.6 ? angka(1, 6) : 0,
    pesan: Array.from({ length: jumlahPesan }, (_, k) => ({
      id: `p-${i}-${k}`,
      dari: k % 2 === 0 ? ('lawan' as const) : ('saya' as const),
      isi: pilih([
        'Baik, saya cek dulu ya.',
        'Stoknya masih ada 24 pcs.',
        'Boleh minta nomor fakturnya?',
        'Sudah saya kirim tadi pagi.',
        'Terima kasih banyak!',
        'Untuk pengiriman ke Surabaya perkiraan 2 hari.',
      ]),
      waktu: tanggalLalu(angka(0, 3)),
    })),
  }
}
export const OBROLAN_CONTOH = Array.from({ length: 10 }, (_, k) => buatObrolan(k + 1))

// ------------------------------------------------------------------ Kanban
export const KANBAN_CONTOH = [
  { id: 'kol-1', judul: 'Antrean', warna: 'info' as const },
  { id: 'kol-2', judul: 'Dikerjakan', warna: 'warning' as const },
  { id: 'kol-3', judul: 'Ditinjau', warna: 'secondary' as const },
  { id: 'kol-4', judul: 'Selesai', warna: 'success' as const },
].map((kolom, ik) => ({
  ...kolom,
  kartu: Array.from({ length: angka(2, 5) }, (_, k) => {
    const nama = namaAcak()
    return {
      id: `krt-${ik}-${k}`,
      judul: pilih([
        'Perbaiki perhitungan ongkir',
        'Desain ulang halaman pesanan',
        'Integrasi pembayaran QRIS',
        'Migrasi data pelanggan lama',
        'Tulis dokumentasi API',
        'Uji coba cetak faktur',
        'Audit hak akses pengguna',
        'Optimasi ukuran gambar produk',
      ]),
      label: pilih(['Fitur', 'Bug', 'Riset', 'Perawatan'] as const),
      prioritas: pilih(['rendah', 'sedang', 'tinggi'] as const),
      penanggung: nama,
      avatar: avatarDari(nama),
      tenggat: tanggalLalu(-angka(1, 25)),
    }
  }),
}))

// ------------------------------------------------------------------ Kalender
export const ACARA_CONTOH = Array.from({ length: 18 }, (_, k) => ({
  id: `acr-${k}`,
  judul: pilih(['Rapat mingguan tim','Kunjungan supplier','Tutup buku bulanan','Pelatihan kasir','Stock opname','Peluncuran produk baru','Audit internal','Libur nasional']),
  tanggal: new Date(SEKARANG + (angka(-12, 20) * HARI)).toISOString(),
  jenis: pilih(['rapat', 'tenggat', 'libur', 'acara'] as const),
}))

// ------------------------------------------------------------------ Audit
function buatAudit(i: number): Audit {
  const p = pilih(PENGGUNA_CONTOH)
  return {
    ...entitas(i, angka(0, 40)),
    aktor_nama: p.nama,
    aktor_email: p.email,
    aksi: pilih(['buat', 'ubah', 'hapus', 'masuk', 'keluar', 'ekspor'] as const),
    modul: pilih(['pesanan', 'produk', 'pengguna', 'pengaturan', 'faktur'] as const),
    ringkasan: pilih([
      'Mengubah status pesanan menjadi "dikirim"',
      'Menambah pengguna baru dengan peran Sales',
      'Menghapus produk dari katalog',
      'Mengekspor laporan penjualan bulanan',
      'Memperbarui pengaturan pajak',
    ]),
    ip: `10.0.${angka(0, 254)}.${angka(1, 254)}`,
    waktu: tanggalLalu(angka(0, 40)),
  }
}
export const AUDIT_CONTOH = Array.from({ length: 60 }, (_, k) => buatAudit(k + 1))

// ------------------------------------------------------------------ Deret bagan
export const BULAN_SINGKAT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export const DERET_PENDAPATAN = BULAN_SINGKAT.map(() => angka(180, 620) * 100_000)
export const DERET_PENGELUARAN = BULAN_SINGKAT.map(() => angka(90, 380) * 100_000)
export const DERET_PENGUNJUNG = Array.from({ length: 30 }, () => angka(320, 1800))
export const DERET_KONVERSI = Array.from({ length: 30 }, () => Number((1 + acak() * 4).toFixed(2)))

export const KOLEKSI_CONTOH: Record<string, unknown[]> = {
  pengguna: PENGGUNA_CONTOH,
  pelanggan: PELANGGAN_CONTOH,
  produk: PRODUK_CONTOH,
  pesanan: PESANAN_CONTOH,
  faktur: FAKTUR_CONTOH,
  tiket: TIKET_CONTOH,
  pos: POS_CONTOH,
  kontak: KONTAK_CONTOH,
  catatan: CATATAN_CONTOH,
  surel: SUREL_CONTOH,
  audit: AUDIT_CONTOH,
}

// ------------------------------------------------------------------ Profil sosial
export type Pengikut = ReturnType<typeof buatPengikut>
function buatPengikut(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i),
    nama,
    avatar: avatarDari(nama),
    jabatan: pilih(JABATAN),
    kota: pilih(KOTA),
    saling_ikut: acak() > 0.45,
    teman: acak() > 0.5,
  }
}
export const PENGIKUT_CONTOH = Array.from({ length: 24 }, (_, k) => buatPengikut(k + 1))

/** Gambar galeri dibuat sebagai SVG gradien — tanpa berkas dan tanpa jaringan. */
export function gambarPeraga(benih: string, lebar = 400, tinggi = 300): string {
  let h = 0
  for (const c of benih) h = (h * 31 + c.charCodeAt(0)) % 360
  const h2 = (h + 42) % 360
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lebar}" height="${tinggi}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${h} 72% 72%)"/><stop offset="100%" stop-color="hsl(${h2} 68% 56%)"/></linearGradient></defs><rect width="${lebar}" height="${tinggi}" fill="url(#g)"/><circle cx="${lebar * 0.78}" cy="${tinggi * 0.26}" r="${tinggi * 0.22}" fill="rgba(255,255,255,.22)"/><circle cx="${lebar * 0.2}" cy="${tinggi * 0.82}" r="${tinggi * 0.3}" fill="rgba(255,255,255,.14)"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const FOTO_CONTOH = Array.from({ length: 12 }, (_, k) => ({
  id: `foto-${k}`,
  judul: pilih(['Rapat tim','Produk baru','Gudang','Kunjungan pabrik','Pameran','Kantor','Pelatihan','Peluncuran']),
  gambar: gambarPeraga(`foto-${k}`),
  suka: angka(4, 320),
  komentar: angka(0, 48),
}))

export type Kiriman = {
  id: string
  penulis: string
  avatar: string | null
  waktu: string
  isi: string
  gambar: string | null
  suka: number
  komentar: number
}

export const KIRIMAN_CONTOH: Kiriman[] = Array.from({ length: 6 }, (_, k) => {
  const nama = namaAcak()
  return {
    id: `krm-${k}`,
    penulis: nama,
    avatar: avatarDari(nama),
    waktu: tanggalLalu(angka(0, 14)),
    isi: pilih([
      'Baru selesai stock opname bulanan. Selisihnya nol untuk pertama kalinya tahun ini.',
      'Pengiriman ke Surabaya sudah berangkat pagi tadi, estimasi tiba dua hari.',
      'Katalog produk sudah diperbarui — 12 item baru masuk kategori Elektronik.',
      'Rapat koordinasi produksi dimajukan ke Senin pukul 09.00.',
      'Terima kasih tim gudang, target pengemasan minggu ini tercapai lebih cepat.',
      'Laporan keuangan kuartal ini sudah bisa diunduh dari menu Laporan.',
    ]),
    gambar: k % 2 === 0 ? gambarPeraga(`krm-${k}`, 640, 360) : null,
    suka: angka(3, 180),
    komentar: angka(0, 24),
  }
})

// ------------------------------------------------------------------ Integrasi
export const INTEGRASI_CONTOH = [
  { id: 'gmail', nama: 'Gmail', kategori: 'Komunikasi', deskripsi: 'Kirim, terima, dan kelola surel langsung dari panel.', warna: '#ea4335', huruf: 'G', tersambung: true },
  { id: 'whatsapp', nama: 'WhatsApp Business', kategori: 'Komunikasi', deskripsi: 'Kirim notifikasi pesanan dan nota ke pelanggan lewat WhatsApp.', warna: '#25d366', huruf: 'W', tersambung: true },
  { id: 'gmeet', nama: 'Google Meet', kategori: 'Komunikasi', deskripsi: 'Buat tautan rapat langsung dari kalender panel.', warna: '#00832d', huruf: 'M', tersambung: false },
  { id: 'zoom', nama: 'Zoom', kategori: 'Komunikasi', deskripsi: 'Jadwalkan dan mulai rapat tanpa pindah aplikasi.', warna: '#2d8cff', huruf: 'Z', tersambung: false },
  { id: 'midtrans', nama: 'Midtrans', kategori: 'Pembayaran', deskripsi: 'Terima pembayaran QRIS, transfer bank, dan kartu kredit.', warna: '#0f4c81', huruf: 'M', tersambung: true },
  { id: 'xendit', nama: 'Xendit', kategori: 'Pembayaran', deskripsi: 'Gerbang pembayaran alternatif dengan biaya transaksi lebih rendah.', warna: '#4573ff', huruf: 'X', tersambung: false },
  { id: 'jne', nama: 'JNE', kategori: 'Logistik', deskripsi: 'Cek ongkir otomatis dan lacak status pengiriman.', warna: '#d0021b', huruf: 'J', tersambung: true },
  { id: 'sicepat', nama: 'SiCepat', kategori: 'Logistik', deskripsi: 'Buat label pengiriman langsung dari halaman pesanan.', warna: '#e8112d', huruf: 'S', tersambung: false },
  { id: 'accurate', nama: 'Accurate', kategori: 'Akuntansi', deskripsi: 'Sinkronkan faktur dan jurnal ke perangkat lunak akuntansi.', warna: '#f5a623', huruf: 'A', tersambung: false },
  { id: 'gsheet', nama: 'Google Sheets', kategori: 'Produktivitas', deskripsi: 'Ekspor laporan otomatis ke spreadsheet setiap minggu.', warna: '#0f9d58', huruf: 'S', tersambung: true },
  { id: 'notion', nama: 'Notion', kategori: 'Produktivitas', deskripsi: 'Catat hasil rapat dan dokumentasi proses di ruang kerja tim.', warna: '#111111', huruf: 'N', tersambung: false },
  { id: 'slack', nama: 'Slack', kategori: 'Produktivitas', deskripsi: 'Kirim peringatan stok menipis ke kanal tim.', warna: '#611f69', huruf: 'S', tersambung: false },
]

// ------------------------------------------------------------------ Transaksi & gerbang bayar
export const TRANSAKSI_CONTOH = Array.from({ length: 6 }, (_, k) => ({
  id: `trx-${k}`,
  jam: ['08.45', '10.12', '11.30', '13.05', '15.20', '16.45'][k]!,
  judul: pilih(['Pembayaran diterima','Pesanan baru masuk','Pengembalian dana','Penarikan saldo','Faktur diterbitkan','Stok masuk dicatat']),
  detail: pilih(['INV-2026-1042','FKT-20260118','INV-2026-1077','Rekening BCA','FKT-20260122','SJ-2026-0341']),
  nilai: angka(-8, 42) * 125_000,
  warna: (['primary', 'success', 'warning', 'danger', 'info', 'secondary'] as const)[k]!,
}))

export const GERBANG_BAYAR = [
  { nama: 'Transfer Bank', nilai: 18_450_000, ubah: 0.124, huruf: 'TB', warna: 'primary' as const },
  { nama: 'QRIS', nilai: 12_310_000, ubah: 0.086, huruf: 'QR', warna: 'success' as const },
  { nama: 'Kartu Kredit', nilai: 7_920_000, ubah: -0.021, huruf: 'KK', warna: 'info' as const },
  { nama: 'Pengembalian', nilai: -1_240_000, ubah: 0.008, huruf: 'PD', warna: 'danger' as const },
]

// ------------------------------------------------------------------ Transaksi keuangan
export type TransaksiKeuangan = ReturnType<typeof buatTransaksi>
function buatTransaksi(i: number) {
  const masuk = acak() > 0.38
  const pel = pilih(PELANGGAN_CONTOH)
  return {
    ...entitas(i, angka(0, 180)),
    kode: `TRX-${(i + 70000).toString()}`,
    jenis: masuk ? ('masuk' as const) : ('keluar' as const),
    kategori: masuk
      ? pilih(['Penjualan', 'Pengembalian dana masuk', 'Pendapatan lain'] as const)
      : pilih(['Pembelian bahan', 'Gaji', 'Sewa', 'Listrik & air', 'Ongkir', 'Pemasaran'] as const),
    pihak: masuk ? pel.nama : pilih(['PT Sumber Kemasan', 'CV Logistik Cepat', 'PLN', 'Tim internal', 'Meta Ads']),
    metode: pilih(['Transfer Bank', 'QRIS', 'Kartu Kredit', 'Tunai'] as const),
    nominal: angka(1, 240) * 125_000,
    status: pilih(['berhasil', 'berhasil', 'berhasil', 'tertunda', 'gagal'] as const),
    tanggal: tanggalLalu(angka(0, 180)),
    catatan: pilih([
      'Pembayaran diterima penuh.',
      'Menunggu konfirmasi bank.',
      'Sudah direkonsiliasi dengan mutasi rekening.',
      'Termasuk biaya administrasi.',
    ]),
  }
}
export const TRANSAKSI_KEUANGAN = Array.from({ length: 64 }, (_, k) => buatTransaksi(k + 1))

// ------------------------------------------------------------------ Berkas
export type Berkas = ReturnType<typeof buatBerkas>
const JENIS_BERKAS = [
  { ext: 'pdf', jenis: 'dokumen' as const, warna: 'danger' as const },
  { ext: 'xlsx', jenis: 'lembar' as const, warna: 'success' as const },
  { ext: 'docx', jenis: 'dokumen' as const, warna: 'info' as const },
  { ext: 'png', jenis: 'gambar' as const, warna: 'primary' as const },
  { ext: 'jpg', jenis: 'gambar' as const, warna: 'primary' as const },
  { ext: 'mp4', jenis: 'video' as const, warna: 'warning' as const },
  { ext: 'zip', jenis: 'arsip' as const, warna: 'netral' as const },
]
const NAMA_BERKAS = ['Laporan penjualan','Kontrak supplier','Faktur bulanan','Foto produk','Panduan operasional','Rekap stok','Presentasi rapat','Daftar harga','Sertifikat halal','Video pelatihan','Notulen rapat','Anggaran tahunan']

function buatBerkas(i: number) {
  const t = pilih(JENIS_BERKAS)
  const nama = pilih(NAMA_BERKAS)
  const p = pilih(PENGGUNA_CONTOH)
  return {
    ...entitas(i, angka(0, 200)),
    nama: `${nama} ${angka(2024, 2026)}.${t.ext}`,
    ext: t.ext,
    jenis: t.jenis,
    warna: t.warna,
    ukuran: angka(24, 48_000) * 1024,
    pemilik: p.nama,
    avatar: p.avatar_url ?? '',
    dibagikan: acak() > 0.6,
    bintang: acak() > 0.78,
    pratinjau: t.jenis === 'gambar' ? gambarPeraga(`berkas-${i}`, 320, 240) : null,
  }
}
export const BERKAS_CONTOH = Array.from({ length: 28 }, (_, k) => buatBerkas(k + 1))

export const FOLDER_CONTOH = [
  { id: 'f1', nama: 'Dokumen legal', jumlah: 24, ukuran: 128 * 1024 * 1024, warna: 'primary' as const },
  { id: 'f2', nama: 'Foto produk', jumlah: 312, ukuran: 1_842 * 1024 * 1024, warna: 'success' as const },
  { id: 'f3', nama: 'Laporan keuangan', jumlah: 48, ukuran: 76 * 1024 * 1024, warna: 'warning' as const },
  { id: 'f4', nama: 'Arsip 2025', jumlah: 156, ukuran: 940 * 1024 * 1024, warna: 'info' as const },
]

// ------------------------------------------------------------------ Tugas
export type Tugas = ReturnType<typeof buatTugas>
const JUDUL_TUGAS = ['Rekonsiliasi mutasi bank','Perbarui harga jual kategori Elektronik','Tinjau pengajuan cuti tim produksi','Susun laporan stok mingguan','Hubungi supplier kemasan','Uji coba cetak faktur baru','Audit hak akses pengguna','Migrasi data pelanggan lama','Siapkan materi pelatihan kasir','Cek ulang perhitungan HPP','Jadwalkan stock opname','Perbarui katalog produk musiman']

function buatTugas(i: number) {
  const p = pilih(PENGGUNA_CONTOH)
  return {
    ...entitas(i, angka(0, 40)),
    judul: JUDUL_TUGAS[i % JUDUL_TUGAS.length]!,
    keterangan: pilih([
      'Koordinasikan dengan tim terkait sebelum tenggat.',
      'Butuh persetujuan atasan sebelum dieksekusi.',
      'Sudah dibahas pada rapat mingguan lalu.',
      'Prioritaskan setelah tutup buku bulanan.',
    ]),
    daftar: pilih(['Hari ini', 'Minggu ini', 'Menunggu', 'Selesai'] as const),
    prioritas: pilih(['rendah', 'sedang', 'tinggi'] as const),
    selesai: acak() > 0.62,
    penanggung: p.nama,
    avatar: p.avatar_url ?? '',
    tenggat: tanggalLalu(-angka(0, 21)),
    subtugas: { selesai: angka(0, 4), total: angka(4, 8) },
    lampiran: angka(0, 3),
    komentar: angka(0, 12),
  }
}
export const TUGAS_CONTOH = Array.from({ length: 18 }, (_, k) => buatTugas(k + 1))

// ------------------------------------------------------------------ Balasan tiket
export const BALASAN_TIKET = (nomor: string) =>
  Array.from({ length: 5 }, (_, i) => {
    const dariAgen = i % 2 === 1
    const p = PENGGUNA_CONTOH[i % PENGGUNA_CONTOH.length]!
    return {
      id: `${nomor}-b${i}`,
      dari: dariAgen ? p.nama : 'Pelapor',
      avatar: dariAgen ? (p.avatar_url ?? '') : avatarDari('Pelapor'),
      agen: dariAgen,
      waktu: tanggalLalu(6 - i),
      isi: dariAgen
        ? pilih([
            'Terima kasih atas laporannya. Kami sedang memeriksa data pesanan Anda.',
            'Sudah kami perbaiki dari sisi sistem. Mohon coba muat ulang halamannya.',
            'Kami perlu nomor pesanan untuk menelusuri lebih jauh. Boleh dibagikan?',
          ])
        : pilih([
            'Sampai sekarang masih belum bisa. Sudah saya coba di dua peramban berbeda.',
            'Baik, nomor pesanannya INV-2026-1042. Terima kasih bantuannya.',
            'Sudah bisa sekarang. Terima kasih banyak atas responsnya yang cepat.',
          ]),
    }
  })

// ------------------------------------------------------------------ Provinsi (untuk peta)
export const PROVINSI_CONTOH = [
  { kode: 'ac', nama: 'Aceh', nilai: 1240, x: 62, y: 122 },
  { kode: 'su', nama: 'Sumatera Utara', nilai: 3820, x: 108, y: 168 },
  { kode: 'sb', nama: 'Sumatera Barat', nilai: 2160, x: 132, y: 214 },
  { kode: 'ri', nama: 'Riau', nilai: 2740, x: 168, y: 182 },
  { kode: 'ss', nama: 'Sumatera Selatan', nilai: 3110, x: 214, y: 258 },
  { kode: 'lp', nama: 'Lampung', nilai: 2480, x: 244, y: 296 },
  { kode: 'jk', nama: 'DKI Jakarta', nilai: 12840, x: 296, y: 322 },
  { kode: 'jb', nama: 'Jawa Barat', nilai: 9620, x: 320, y: 332 },
  { kode: 'jt', nama: 'Jawa Tengah', nilai: 7410, x: 366, y: 338 },
  { kode: 'yo', nama: 'DI Yogyakarta', nilai: 4280, x: 372, y: 352 },
  { kode: 'ji', nama: 'Jawa Timur', nilai: 8150, x: 416, y: 338 },
  { kode: 'ba', nama: 'Bali', nilai: 5340, x: 460, y: 350 },
  { kode: 'kb', nama: 'Kalimantan Barat', nilai: 1680, x: 300, y: 200 },
  { kode: 'ks', nama: 'Kalimantan Selatan', nilai: 1920, x: 386, y: 250 },
  { kode: 'kt', nama: 'Kalimantan Timur', nilai: 2240, x: 412, y: 196 },
  { kode: 'sn', nama: 'Sulawesi Selatan', nilai: 3460, x: 468, y: 262 },
  { kode: 'sa', nama: 'Sulawesi Utara', nilai: 1450, x: 528, y: 176 },
  { kode: 'nb', nama: 'Nusa Tenggara Barat', nilai: 1310, x: 500, y: 352 },
  { kode: 'nt', nama: 'Nusa Tenggara Timur', nilai: 980, x: 556, y: 366 },
  { kode: 'ma', nama: 'Maluku', nilai: 720, x: 604, y: 258 },
  { kode: 'pa', nama: 'Papua', nilai: 860, x: 706, y: 264 },
]

// ------------------------------------------------------------------ Supplier & pembelian
export type Supplier = ReturnType<typeof buatSupplier>
const NAMA_SUPPLIER = ['PT Sumber Kemasan','CV Bahan Prima','UD Sinar Grosir','PT Aneka Plastik','CV Mitra Pangan','PT Logistik Nusantara','UD Berkah Tepung','PT Kimia Bersih']

function buatSupplier(i: number) {
  const nama = NAMA_SUPPLIER[i % NAMA_SUPPLIER.length]!
  const pic = namaAcak()
  return {
    ...entitas(i, angka(30, 500)),
    nama,
    kode: `SUP-${(i + 100).toString()}`,
    pic,
    avatar: avatarDari(nama),
    telepon: `08${angka(11, 89)}-${angka(1000, 9999)}-${angka(1000, 9999)}`,
    email: `pembelian@${nama.toLowerCase().replace(/[^a-z]/g, '')}.co.id`,
    kota: pilih(KOTA),
    termin: pilih([0, 14, 30, 45] as const),
    total_pembelian: angka(8, 320) * 1_250_000,
    hutang: acak() > 0.55 ? angka(0, 48) * 500_000 : 0,
    aktif: acak() > 0.12,
  }
}
export const SUPPLIER_CONTOH = Array.from({ length: 16 }, (_, k) => buatSupplier(k + 1))

export type Pembelian = ReturnType<typeof buatPembelian>
function buatPembelian(i: number) {
  const s = pilih(SUPPLIER_CONTOH)
  const jumlahItem = angka(1, 5)
  const item = Array.from({ length: jumlahItem }, () => {
    const p = pilih(PRODUK_CONTOH)
    const qty = angka(5, 80)
    return { nama: p.nama, sku: p.sku, qty, harga: p.harga_modal, subtotal: p.harga_modal * qty }
  })
  const total = item.reduce((a, b) => a + b.subtotal, 0)
  const umur = angka(0, 120)
  return {
    ...entitas(i, umur),
    nomor: `PO-2026-${(i + 400).toString()}`,
    supplier_id: s.id,
    supplier_nama: s.nama,
    supplier_avatar: s.avatar,
    item,
    total,
    dibayar: pilih([0, 0.5, 1] as const),
    status: pilih(['draf', 'dipesan', 'sebagian', 'diterima', 'batal'] as const),
    tanggal: tanggalLalu(umur),
    jatuh_tempo: tanggalLalu(umur - s.termin),
  }
}
export const PEMBELIAN_CONTOH = Array.from({ length: 38 }, (_, k) => buatPembelian(k + 1))

// ------------------------------------------------------------------ Stok & mutasi
export type Mutasi = ReturnType<typeof buatMutasi>
function buatMutasi(i: number) {
  const p = pilih(PRODUK_CONTOH)
  const jenis = pilih(['masuk', 'keluar', 'penyesuaian', 'transfer'] as const)
  const qty = jenis === 'keluar' ? -angka(1, 24) : angka(1, 60)
  return {
    ...entitas(i, angka(0, 90)),
    produk_id: p.id,
    produk_nama: p.nama,
    sku: p.sku,
    gambar: p.gambar,
    jenis,
    qty,
    alasan: jenis === 'masuk' ? 'Penerimaan pembelian'
      : jenis === 'keluar' ? 'Penjualan'
      : jenis === 'transfer' ? 'Transfer antar gudang'
      : pilih(['Stok opname', 'Barang rusak', 'Koreksi pencatatan', 'Kedaluwarsa']),
    gudang: pilih(['Gudang Utama', 'Gudang Cabang', 'Etalase Toko'] as const),
    petugas: pilih(PENGGUNA_CONTOH).nama,
    waktu: tanggalLalu(angka(0, 90)),
  }
}
export const MUTASI_CONTOH = Array.from({ length: 56 }, (_, k) => buatMutasi(k + 1))

export const GUDANG_CONTOH = [
  { id: 'g1', nama: 'Gudang Utama', kota: 'Yogyakarta', kapasitas: 0.72, item: 1_842 },
  { id: 'g2', nama: 'Gudang Cabang', kota: 'Semarang', kapasitas: 0.48, item: 964 },
  { id: 'g3', nama: 'Etalase Toko', kota: 'Yogyakarta', kapasitas: 0.86, item: 312 },
]

// ------------------------------------------------------------------ Promo
export type Promo = ReturnType<typeof buatPromo>
const NAMA_PROMO = ['Diskon Akhir Bulan','Gratis Ongkir','Beli 2 Gratis 1','Cashback Pelanggan Baru','Promo Gajian','Flash Sale Weekend','Diskon Kategori Elektronik','Voucher Ulang Tahun']

function buatPromo(i: number) {
  const jenis = pilih(['persen', 'nominal', 'ongkir'] as const)
  const mulai = angka(-20, 30)
  return {
    ...entitas(i, angka(0, 90)),
    nama: NAMA_PROMO[i % NAMA_PROMO.length]!,
    kode: `OZO${(i + 10).toString().padStart(2, '0')}${pilih(['HEMAT', 'DISKON', 'PROMO', 'GRATIS'])}`,
    jenis,
    nilai: jenis === 'persen' ? angka(5, 40) : jenis === 'nominal' ? angka(10, 150) * 1000 : 0,
    minimal: angka(0, 10) * 50_000,
    kuota: angka(20, 500),
    terpakai: angka(0, 180),
    mulai: tanggalLalu(mulai),
    selesai: tanggalLalu(mulai - angka(14, 60)),
    aktif: acak() > 0.25,
  }
}
export const PROMO_CONTOH = Array.from({ length: 14 }, (_, k) => buatPromo(k + 1))

// ------------------------------------------------------------------ Karyawan & HR
export const DEPARTEMEN = ['Produksi', 'Penjualan', 'Keuangan', 'Gudang', 'Operasional'] as const
export const SHIFT = [
  { id: 's1', nama: 'Pagi', mulai: '07.00', selesai: '15.00', warna: 'warning' as const },
  { id: 's2', nama: 'Siang', mulai: '15.00', selesai: '23.00', warna: 'info' as const },
  { id: 's3', nama: 'Malam', mulai: '23.00', selesai: '07.00', warna: 'secondary' as const },
]

export type Karyawan = ReturnType<typeof buatKaryawan>
function buatKaryawan(i: number) {
  const nama = namaAcak()
  return {
    ...entitas(i, angka(60, 1400)),
    nip: `KRY-${(i + 1000).toString()}`,
    nama,
    avatar: avatarDari(nama),
    email: `${nama.toLowerCase().replace(/\s+/g, '.')}@ozora.id`,
    telepon: `08${angka(11, 89)}-${angka(1000, 9999)}-${angka(1000, 9999)}`,
    departemen: pilih(DEPARTEMEN),
    jabatan: pilih(JABATAN),
    shift: pilih(SHIFT).nama,
    status_kerja: pilih(['tetap', 'tetap', 'kontrak', 'harian'] as const),
    gaji_pokok: angka(28, 120) * 250_000,
    tunjangan: angka(2, 20) * 100_000,
    masuk_kerja: tanggalLalu(angka(60, 1400)),
    aktif: acak() > 0.1,
  }
}
export const KARYAWAN_CONTOH = Array.from({ length: 24 }, (_, k) => buatKaryawan(k + 1))

/** Kehadiran 30 hari terakhir untuk seluruh karyawan — dipakai peta kalor absensi. */
export const ABSENSI_CONTOH = KARYAWAN_CONTOH.flatMap((k) =>
  Array.from({ length: 30 }, (_, h) => {
    const tanggal = new Date(SEKARANG - h * HARI)
    const akhirPekan = tanggal.getDay() === 0
    const r = acak()
    const status = akhirPekan
      ? ('libur' as const)
      : r > 0.93 ? ('alfa' as const)
      : r > 0.86 ? ('izin' as const)
      : r > 0.78 ? ('terlambat' as const)
      : ('hadir' as const)
    return {
      id: `abs-${k.id}-${h}`,
      karyawan_id: k.id,
      karyawan_nama: k.nama,
      avatar: k.avatar,
      departemen: k.departemen,
      tanggal: tanggal.toISOString(),
      status,
      masuk: status === 'hadir' ? '07.5' : status === 'terlambat' ? '08.4' : null,
      pulang: status === 'hadir' || status === 'terlambat' ? '16.1' : null,
      menit_terlambat: status === 'terlambat' ? angka(5, 62) : 0,
    }
  }),
)

export type Cuti = ReturnType<typeof buatCuti>
function buatCuti(i: number) {
  const k = pilih(KARYAWAN_CONTOH)
  const lama = angka(1, 7)
  const mulai = angka(-14, 30)
  return {
    ...entitas(i, angka(0, 60)),
    karyawan_id: k.id,
    karyawan_nama: k.nama,
    avatar: k.avatar,
    departemen: k.departemen,
    jenis: pilih(['tahunan', 'sakit', 'melahirkan', 'penting', 'tanpa gaji'] as const),
    mulai: tanggalLalu(mulai),
    selesai: tanggalLalu(mulai - lama),
    lama,
    alasan: pilih([
      'Acara keluarga di luar kota.',
      'Pemulihan setelah sakit, ada surat dokter.',
      'Mengurus dokumen kependudukan.',
      'Menghadiri pernikahan saudara.',
    ]),
    status: pilih(['menunggu', 'menunggu', 'disetujui', 'ditolak'] as const),
  }
}
export const CUTI_CONTOH = Array.from({ length: 22 }, (_, k) => buatCuti(k + 1))

// ------------------------------------------------------------------ Ulasan
export type Ulasan = ReturnType<typeof buatUlasan>
function buatUlasan(i: number) {
  const p = pilih(PRODUK_CONTOH)
  const pel = pilih(PELANGGAN_CONTOH)
  const bintang = pilih([5, 5, 5, 4, 4, 3, 2, 1] as const)
  return {
    ...entitas(i, angka(0, 120)),
    produk_nama: p.nama,
    produk_gambar: p.gambar,
    pelanggan: pel.nama,
    avatar: pel.avatar_url,
    bintang,
    isi: bintang >= 4
      ? pilih([
          'Barang sesuai deskripsi, pengemasan rapi, pengiriman cepat.',
          'Sudah pesan ketiga kalinya. Konsisten bagus, penjual responsif.',
          'Kualitas melebihi harga. Puas sekali.',
        ])
      : bintang === 3
        ? 'Fungsinya baik, tapi warnanya sedikit berbeda dari foto.'
        : pilih([
            'Paket datang penyok. Isinya masih bisa dipakai, tapi kecewa.',
            'Pengiriman lama sekali, hampir dua minggu.',
          ]),
    dibalas: acak() > 0.55,
    ditampilkan: acak() > 0.15,
  }
}
export const ULASAN_CONTOH = Array.from({ length: 34 }, (_, k) => buatUlasan(k + 1))

// ------------------------------------------------------------------ Proyek
export type Proyek = ReturnType<typeof buatProyek>
const NAMA_PROYEK = ['Migrasi sistem kasir','Peluncuran lini produk baru','Renovasi gudang cabang','Integrasi pembayaran QRIS','Kampanye Ramadan','Sertifikasi halal','Pembukaan cabang Semarang','Digitalisasi arsip']

function buatProyek(i: number) {
  const tim = Array.from({ length: angka(2, 5) }, () => pilih(PENGGUNA_CONTOH))
  return {
    ...entitas(i, angka(10, 200)),
    nama: NAMA_PROYEK[i % NAMA_PROYEK.length]!,
    klien: pilih(PERUSAHAAN),
    status: pilih(['perencanaan', 'berjalan', 'berjalan', 'ditunda', 'selesai'] as const),
    prioritas: pilih(['rendah', 'sedang', 'tinggi'] as const),
    kemajuan: angka(5, 100),
    anggaran: angka(20, 400) * 1_000_000,
    terpakai: angka(5, 380) * 1_000_000,
    mulai: tanggalLalu(angka(30, 200)),
    tenggat: tanggalLalu(-angka(5, 90)),
    tim: tim.map((t) => ({ nama: t.nama, avatar: t.avatar_url })),
    tugas: { selesai: angka(2, 18), total: angka(18, 30) },
  }
}
export const PROYEK_CONTOH = Array.from({ length: 12 }, (_, k) => buatProyek(k + 1))
