import type { Kartu } from './tipe'

/** Kartu Kesempatan: risiko & perpindahan. Kartu Harta Karun: rezeki. */
export const KARTU: Kartu[] = [
  { id: 'k1', jenis: 'kesempatan', teks: 'Tiket promo! Terbang ke Mulai dan terima gaji.', efek: { jenis: 'pindah', ke: 'mulai' } },
  { id: 'k2', jenis: 'kesempatan', teks: 'Penerbangan dialihkan. Pindah ke bandara terdekat.', efek: { jenis: 'pindah', ke: 'bandara-terdekat' } },
  { id: 'k3', jenis: 'kesempatan', teks: 'Paspor kedaluwarsa. Masuk Penjara tanpa lewat Mulai.', efek: { jenis: 'pindah', ke: 'penjara' } },
  { id: 'k4', jenis: 'kesempatan', teks: 'Salah naik bus. Mundur 3 petak.', efek: { jenis: 'pindah', ke: 'mundur-3' } },
  { id: 'k5', jenis: 'kesempatan', teks: 'Traktir semua tim makan malam. Bayar $20 ke tiap tim lain.', efek: { jenis: 'bayar-tiap-tim', jumlah: 20 } },
  { id: 'k6', jenis: 'kesempatan', teks: 'Denda parkir sembarangan. Bayar $40 ke bank.', efek: { jenis: 'uang', jumlah: -40, ke: 'pribadi' } },
  { id: 'k7', jenis: 'kesempatan', teks: 'Renovasi wajib! Bayar $25 per tingkat bangunan milik tim.', efek: { jenis: 'perbaikan', perTingkat: 25 } },
  { id: 'k8', jenis: 'kesempatan', teks: 'Koper hilang di bandara. Bayar $60 ganti rugi.', efek: { jenis: 'uang', jumlah: -60, ke: 'pribadi' } },
  { id: 'k9', jenis: 'kesempatan', teks: 'Menang lomba foto perjalanan. Terima $100.', efek: { jenis: 'uang', jumlah: 100, ke: 'pribadi' } },
  { id: 'k10', jenis: 'kesempatan', teks: 'Kartu bebas penjara — simpan sampai dibutuhkan.', efek: { jenis: 'kartu-bebas' } },
  { id: 'k11', jenis: 'kesempatan', teks: 'Biaya visa naik. Kas tim berkurang $50.', efek: { jenis: 'uang', jumlah: -50, ke: 'kas' } },
  { id: 'k12', jenis: 'kesempatan', teks: 'Overbooking! Bayar $30 dan terima permintaan maaf.', efek: { jenis: 'uang', jumlah: -30, ke: 'pribadi' } },

  { id: 'h1', jenis: 'harta', teks: 'Bank salah hitung. Kas tim bertambah $100.', efek: { jenis: 'uang', jumlah: 100, ke: 'kas' } },
  { id: 'h2', jenis: 'harta', teks: 'Pengembalian pajak. Terima $20.', efek: { jenis: 'uang', jumlah: 20, ke: 'pribadi' } },
  { id: 'h3', jenis: 'harta', teks: 'Warisan dari paman jauh. Terima $80.', efek: { jenis: 'uang', jumlah: 80, ke: 'pribadi' } },
  { id: 'h4', jenis: 'harta', teks: 'Ulang tahun! Tiap tim lain memberi $10.', efek: { jenis: 'terima-tiap-tim', jumlah: 10 } },
  { id: 'h5', jenis: 'harta', teks: 'Peti harta karun terkubur di pantai. Terima $50.', efek: { jenis: 'uang', jumlah: 50, ke: 'pribadi' } },
  { id: 'h6', jenis: 'harta', teks: 'Bonus loyalitas maskapai. Kas tim bertambah $60.', efek: { jenis: 'uang', jumlah: 60, ke: 'kas' } },
  { id: 'h7', jenis: 'harta', teks: 'Jual suvenir langka. Terima $40.', efek: { jenis: 'uang', jumlah: 40, ke: 'pribadi' } },
  { id: 'h8', jenis: 'harta', teks: 'Kartu bebas penjara — simpan sampai dibutuhkan.', efek: { jenis: 'kartu-bebas' } },
  { id: 'h9', jenis: 'harta', teks: 'Biaya dokter saat liburan. Bayar $30.', efek: { jenis: 'uang', jumlah: -30, ke: 'pribadi' } },
  { id: 'h10', jenis: 'harta', teks: 'Temukan dompet dan kembalikan. Hadiah $25.', efek: { jenis: 'uang', jumlah: 25, ke: 'pribadi' } },
  { id: 'h11', jenis: 'harta', teks: 'Investasi hostel laku keras. Kas tim bertambah $120.', efek: { jenis: 'uang', jumlah: 120, ke: 'kas' } },
  { id: 'h12', jenis: 'harta', teks: 'Terbang gratis ke Mulai. Terima gaji.', efek: { jenis: 'pindah', ke: 'mulai' } },
]

export const PETA_KARTU: Record<string, Kartu> = Object.fromEntries(KARTU.map((k) => [k.id, k]))
