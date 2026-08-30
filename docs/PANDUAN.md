# Panduan Ozora Panel

Dokumen ini menjelaskan cara memakai template dari nol sampai naik ke server.
Untuk resep singkat, lihat [RESEP.md](RESEP.md). Untuk alasan di balik keputusan
arsitektur, lihat [ARSITEKTUR.md](ARSITEKTUR.md).

---

## Daftar isi

1. [Menjalankan pertama kali](#1-menjalankan-pertama-kali)
2. [Struktur project](#2-struktur-project)
3. [Empat konsep inti](#3-empat-konsep-inti)
4. [Masuk & hak akses](#4-masuk--hak-akses)
5. [Isi template](#5-isi-template)
6. [Pengaturan aplikasi](#6-pengaturan-aplikasi)
7. [Memulai project baru](#7-memulai-project-baru)
8. [Menyambungkan backend](#8-menyambungkan-backend)
9. [Menyesuaikan tampilan](#9-menyesuaikan-tampilan)
10. [Pengujian](#10-pengujian)
11. [Menerbitkan ke server](#11-menerbitkan-ke-server)
12. [Jebakan yang sudah pernah menggigit](#12-jebakan-yang-sudah-pernah-menggigit)
13. [Rujukan perintah](#13-rujukan-perintah)

---

## 1. Menjalankan pertama kali

Butuh **Node 20+** dan **pnpm 9+**.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Buka <http://localhost:5180>. Anda akan diarahkan ke halaman masuk.

Bawaannya memakai driver data `mock`, jadi **tidak perlu backend apa pun**. Di
halaman masuk ada bagian **Mode peraga** berisi lima tombol peran — tekan salah
satunya untuk langsung masuk.

> Coba masuk sebagai **Superadmin**, lalu keluar dan masuk lagi sebagai **Sales**.
> Perhatikan menunya menyusut dan halaman `/pengguna` menolak akses. Itu sistem
> perannya bekerja, bukan sekadar menyembunyikan tombol.

### Isi `.env.local`

| Variabel | Isi | Bawaan |
|---|---|---|
| `VITE_APP_NAME` | Nama aplikasi | `Ozora Panel` |
| `VITE_DATA_DRIVER` | `mock`, `supabase`, atau `rest` | `mock` |
| `VITE_MOCK_JEDA_MS` | Jeda buatan driver mock, untuk menguji skeleton | `0` |
| `VITE_SUPABASE_URL` | Alamat project Supabase | kosong |
| `VITE_SUPABASE_ANON_KEY` | Kunci anon (**jangan** service_role) | kosong |
| `VITE_API_BASE_URL` | Alamat backend REST | kosong |

Semua environment variable divalidasi dengan Zod saat aplikasi start. Salah ketik
nama variabel akan menghentikan aplikasi dengan pesan jelas, bukan `undefined`
yang menyebar diam-diam.

---

## 2. Struktur project

```
src/
├── config/                 Konfigurasi yang sering diubah per project
│   ├── app.ts              Env tervalidasi — SATU-SATUNYA pembaca import.meta.env
│   ├── merek.ts            Logo, favicon, warna (bisa diganti dari panel)
│   ├── peran.ts            Lima peran + matriks izin
│   └── menu.ts             SUMBER TUNGGAL menu, breadcrumb, dan pencarian ⌘K
│
├── lib/                    Logika tanpa UI
│   ├── adapter/            Kontrak data + tiga driver (mock/supabase/rest)
│   ├── auth.tsx            PenyediaAuth, useAuth(), <Izinkan>
│   ├── tema.tsx            Terang / gelap / ikut sistem
│   ├── kueri.ts            Hook CRUD generik di atas TanStack Query
│   ├── use-daftar-tabel.ts Keadaan halaman daftar (cari + filter + urut + halaman)
│   ├── hitung.ts           Kalkulasi bisnis — SEMUANYA ada test-nya
│   ├── format.ts           formatRp, formatTanggal, … — SEMUANYA ada test-nya
│   ├── gambar.ts           Validasi + kompresi gambar
│   ├── sesi-idle.ts        Keluar otomatis setelah menganggur
│   └── tipe.ts             Tipe domain, GalatApi, pesanRamah()
│
├── components/
│   ├── ui/                 Primitif: tombol, kartu, masukan, kendali, lapisan…
│   ├── layout/             Sidebar, topbar, kepala halaman, palet perintah
│   ├── data/               TabelData, BilahAlat, Paginasi, KartuStatistik, Peta
│   ├── bagan/              Bagan Apex (malas) + Sparkline SVG (nol dependensi)
│   └── form/               KolomForm, UnggahGambar, PenyuntingKaya
│
├── features/               Modul bisnis
│   ├── pengguna/           JALUR EMAS — salin ini saat membuat CRUD baru
│   └── toko/               Keranjang belanja
│
└── routes/                 Rute berbasis berkas
    ├── __root.tsx          Akar + penanganan galat
    ├── _app.tsx            Gerbang login + kerangka aplikasi
    ├── _auth.tsx           Tata letak halaman publik
    └── …
```

**Aturan penamaan berkas:** nama berkas rute = jalur URL-nya. `_app/apl/kasir.tsx`
menjadi `/apl/kasir`. Berkas berawalan `_` adalah tata letak tanpa jalur sendiri.
Berkas berawalan `$` adalah parameter — `$id.tsx` menangkap `/faktur/abc123`.

> `src/routeTree.gen.ts` **dibangkitkan otomatis** dan di-gitignore. Setelah
> menambah berkas rute, jalankan `pnpm build` atau `pnpm dev` agar tipenya terbentuk.

---

## 3. Empat konsep inti

Pahami empat hal ini dan sisanya mengikuti sendiri.

### 3.1 Lapisan adapter — satu pintu ke data

Tidak ada satu pun komponen yang memanggil `fetch` atau `supabase` langsung.
Semua lewat satu antarmuka:

```ts
import { data } from '@/lib/adapter'

const halaman = await data.koleksi<Produk>('produk').daftar({ halaman: 1, cari: 'kursi' })
const satu    = await data.koleksi<Produk>('produk').ambil('id-123')
await data.koleksi<Produk>('produk').buat({ nama: 'Kursi Baru', harga: 500_000 })
await data.koleksi<Produk>('produk').ubah('id-123', { harga: 550_000 })
await data.koleksi<Produk>('produk').hapus('id-123')      // soft delete
await data.koleksi<Produk>('produk').pulihkan('id-123')
```

Dalam praktik, Anda jarang memanggil ini langsung — pakai hook-nya:

```tsx
const { data: halaman, isPending } = useDaftar<Produk>('produk', { halaman, cari })
const { data: produk }             = useDetail<Produk>('produk', id)
const simpan                       = useSimpan<Produk>('produk')
const hapus                        = useHapus('produk')
```

Menukar backend berarti mengganti satu variabel environment, bukan menyunting halaman.

### 3.2 Peran & izin

Izin ditulis sebagai teks `"modul.aksi"`:

```ts
punyaIzin('finance', 'pesanan.hapus')   // true  — finance punya 'pesanan.*'
punyaIzin('sales', 'laporan.lihat')     // false — di luar jangkauan sales
punyaIzin('admin', 'pengguna.hapus')    // false — ada penolakan '!pengguna.hapus'
```

Urutan penilaian: **penolakan eksplisit** (`!modul.aksi`) menang, lalu cocok
persis, lalu wildcard modul (`modul.*`), terakhir wildcard penuh (`*`).

Dipakai di tiga tempat:

```tsx
// 1. Pagari seluruh halaman
const { boleh } = useAuth()
if (!boleh('pengguna.lihat')) return <HalamanTanpaAkses />

// 2. Sembunyikan satu bagian
<Izinkan izin="pengguna.hapus">
  <Tombol varian="bahaya">Hapus</Tombol>
</Izinkan>

// 3. Sembunyikan entri menu — cukup isi `izin` di src/config/menu.ts
{ judul: 'Pengguna', href: '/pengguna', izin: 'pengguna.lihat' }
```

> **Ini hanya lapisan tampilan.** Otorisasi sebenarnya wajib ditegakkan di backend
> — Row Level Security Supabase atau middleware API. Klien selalu bisa dimanipulasi.

### 3.3 Token desain

Tidak ada `tailwind.config.js`. Semua warna hidup sebagai variabel CSS di
`src/styles/globals.css`:

| Token | Kegunaan |
|---|---|
| `bg-primary` + `text-primary-foreground` | Isi solid — tombol utama, item aktif |
| `bg-primary-soft` + `text-primary-kuat` | Lencana lembut, latar sorotan |
| `text-primary-kuat` | Teks berwarna di atas latar terang |
| `border-border`, `bg-card`, `bg-muted` | Netral |

Semua nilainya dihitung agar lolos **WCAG 2.1 AA** (kontras ≥ 4,5:1). Varian
`-kuat` ada justru karena warna merek yang cerah tidak terbaca sebagai teks.

**Dua larangan keras:**

```tsx
// SALAH — warna mentah tidak ikut mode gelap
<div className="bg-blue-500 text-white">

// SALAH — Tailwind memindai kode secara statis, kelas ini tidak akan pernah dibuat
<div className={`bg-${warna}`}>

// BENAR
<div className="bg-primary text-primary-foreground">
const WARNA = { sukses: 'bg-success', gagal: 'bg-danger' } as const
<div className={WARNA[status]}>
```

### 3.4 Menu sebagai sumber tunggal

`src/config/menu.ts` mengatur sidebar, breadcrumb, **dan** pencarian ⌘K sekaligus.
Menambah halaman berarti menambah satu entri di sana — bukan menyunting `Sidebar.tsx`.

```ts
{
  judul: 'Ritel & Stok',
  demo: true,                      // ikut terbuang oleh `pnpm demo:strip`
  item: [
    { judul: 'Kasir', href: '/apl/kasir', icon: ScanLine, izin: 'pesanan.lihat',
      lencana: 'Baru', warnaLencana: 'primary' },
    { judul: 'Faktur', icon: Receipt, anak: [          // submenu
      { judul: 'Daftar', href: '/apl/faktur' },
      { judul: 'Buat', href: '/apl/faktur/baru' },
    ]},
  ],
}
```

---

## 4. Masuk & hak akses

### Alur masuk

Mengikuti `.claude/rules/auth.md`: **hanya Google Sign-In**, tidak ada login manual.

1. Pengguna menekan "Masuk dengan Google"
2. Sistem menerima surel dari Google
3. Surel dicek di tabel `pengguna`:
   - **Terdaftar** → masuk dengan peran tersimpan
   - **Belum terdaftar & termasuk superadmin bawaan** → otomatis jadi Superadmin
   - **Belum terdaftar & surel biasa** → ditolak, "Hubungi administrator"

Dua surel di `src/config/peran.ts` otomatis menjadi Superadmin dan tidak bisa
diturunkan siapa pun.

### Lima peran bawaan

| Peran | Jangkauan |
|---|---|
| Superadmin | Semua, termasuk kelola pengguna |
| Admin | Semua operasional, kecuali menghapus pengguna |
| Finance | Pesanan, pelanggan, pengeluaran, laporan, audit |
| Produksi | Stok, resep, produksi, katalog |
| Sales | Pesanan, pelanggan, katalog (baca saja) |

Mengubahnya cukup di `MATRIKS_IZIN` — sidebar, ⌘K, dan penjagaan halaman ikut menyesuaikan.
Halaman `/hak-akses` menampilkan matriks penuh plus alat mencoba sudut pandang tiap peran.

### Keluar otomatis

Sesi ditutup setelah **30 menit tanpa aktivitas**, dengan peringatan 2 menit
sebelumnya. Aktivitas terakhir disimpan di `localStorage`, jadi membuka banyak
tab tidak membuat sesi hidup selamanya. Ubah ambangnya di `src/lib/sesi-idle.ts`.

---

## 5. Isi template

### Dasbor (9)

Modern, Toko online, Analitik, CRM, Umum, Keuangan, Penjualan, Logistik, dan
halaman Peta sebaran.

### Aplikasi

| Modul | Yang bisa dicoba |
|---|---|
| **Kasir** | Grid produk sentuh, keranjang, diskon, tunai/QRIS/kartu, tombol pecahan uang, hitung kembalian, struk cetak |
| **Etalase** | Filter kategori & harga, urut, keranjang, detail produk, checkout tiga langkah |
| **Faktur** | Daftar, buat (item dinamis, total hidup), detail siap cetak |
| **Transaksi** | Kas masuk/keluar, detail dengan riwayat status berjenjang |
| **Stok** | Mutasi, kapasitas gudang, stok menipis/habis, dialog penyesuaian |
| **Pembelian & Supplier** | PO, status penerimaan, termin, sisa hutang |
| **Promo** | Kode salin-sekali-klik, kuota terpakai, sakelar aktif |
| **Karyawan, Absensi, Cuti, Penggajian** | Peta kalor kehadiran 30 hari, alur setujui/tolak, slip gaji dari data absensi |
| **Kalender, Kanban, Tugas, Proyek** | Agenda, seret kartu, daftar tugas, anggaran proyek |
| **Obrolan, Surel, Catatan, Kontak, Berkas** | Aplikasi perkantoran |
| **Blog** | Daftar, detail, dan **penyunting teks kaya** dengan SEO per artikel |
| **Tiket** | Daftar + halaman balas dengan percakapan dua arah |
| **Asisten AI** | Antarmuka obrolan siap disambungkan ke model |
| **Profil pengguna** | Lini masa, pengikut, teman, galeri |

### Elemen UI, formulir, tabel, bagan

Galeri komponen, komponen lanjutan (kemajuan, korsel, pita, grup tombol),
ikon, animasi, warna & tipografi; lima halaman formulir; tabel dasar & tabel data;
enam jenis bagan.

### Halaman sistem

Pengguna & peran, Hak akses, Profil, Pengaturan, Pusat laporan, Jejak audit,
Integrasi, Kunci API, Tagihan, Harga, Tanya jawab, Halaman depan, Halaman kosong.

### Autentikasi & status

Masuk, Daftar, Lupa sandi, Dua faktor, Perawatan, Segera hadir, Berhasil,
Galat 404 / 500 / 503.

---

## 6. Pengaturan aplikasi

Semua di `/pengaturan`, terbagi tujuh bagian.

### Merek — `/pengaturan/merek`

Ganti logo (terang & gelap terpisah), favicon, dan warna merek. Perubahan
langsung terlihat tanpa memuat ulang.

Setiap gambar yang diunggah otomatis:

| Tahap | Perilaku |
|---|---|
| Tipe berkas | Dibaca dari **byte awal**, bukan ekstensi — berkas yang diganti nama ditolak |
| Ukuran | Favicon 1 MB · logo 2 MB · sampul & produk 8 MB |
| Dimensi | Ditolak bila di bawah minimum |
| Potong | Ke tengah mengikuti rasio preset |
| Ciutkan | Ke sisi terpanjang preset — gambar kecil tidak pernah diperbesar |
| Sandikan | WebP bila didukung, PNG bila butuh transparansi, SVG diteruskan apa adanya |

### SEO & analitik — `/pengaturan/seo`

Judul & deskripsi meta dengan penghitung karakter dan pratinjau hasil Google;
GA4, Google Tag Manager, Search Console, Bing Webmaster, Meta Pixel — masing-masing
dengan validasi format; editor `robots.txt`; sakelar noindex; panel kesehatan SEO.

> Panel hanya **menyimpan ID**-nya. Backend yang menyuntikkan tag ke HTML.
> Memasang skrip pihak ketiga dari frontend membuka XSS dan tidak lolos CSP ketat.

### Surel (SMTP) — `/pengaturan/surel`

Preset Gmail, Amazon SES, Mailgun, Brevo, dan cPanel yang mengisi host & port
otomatis. Ada tombol uji kirim.

> Gmail wajib memakai **App Password**, bukan sandi akun. Kata sandi SMTP tidak
> pernah dikirim ke peramban — simpan sebagai environment variable di server.

### Telegram — `/pengaturan/telegram`

Token bot dan chat ID dengan validasi format, templat pesan berpratinjau,
enam sakelar peristiwa, dan panduan empat langkah dari @BotFather.

### Umum, Tampilan, Notifikasi

Identitas perusahaan & lokalisasi; pilihan tema; peristiwa yang dikabarkan.

---

## 7. Memulai project baru

```bash
cp -r "ozora dashboard panel" project-baru && cd project-baru
rm -rf .git && git init
pnpm install
pnpm demo:strip          # buang ~55 halaman peraga
pnpm build && pnpm typecheck
```

`pnpm demo:strip` **menyisakan**: kerangka aplikasi, autentikasi + RBAC,
halaman Pengguna (contoh CRUD lengkap), Profil, Pengaturan, Jejak audit,
Kunci API, halaman galat, dan seluruh pustaka komponen.

Lalu sesuaikan berurutan:

1. `src/config/app.ts` — nama aplikasi & prefiks localStorage
2. `src/config/peran.ts` — peran, surel superadmin, matriks izin
3. `src/config/menu.ts` — menu sesuai modul Anda
4. `src/styles/globals.css` — warna merek (blok `:root`)
5. `.env.local` — driver data dan kredensialnya

### Menambah modul CRUD

Salin `src/routes/_app/pengguna.tsx` + `src/features/pengguna/`. Langkah lengkap
ada di [RESEP.md §2](RESEP.md). Ringkasnya:

```tsx
const t = useDaftarTabel<Produk>('produk', { urutAwal: { kolom: 'nama', arah: 'naik' } })

const kolom: Array<Kolom<Produk>> = [
  { kunci: 'nama', judul: 'Nama', urutkan: true, render: (p) => p.nama },
  { kunci: 'harga', judul: 'Harga', urutkan: true, rata: 'kanan', render: (p) => formatRp(p.harga) },
]

<Kartu className="overflow-hidden">
  <BilahAlat cari={t.cari} onCari={t.setCari} adaFilterAktif={t.adaFilterAktif} onBersihkan={t.bersihkanFilter} />
  <SaringCepat nilai={t.filter['status']} onUbah={(n) => t.ubahFilter('status', n)} opsi={…} />
  <TabelData<Produk> kolom={kolom} idBaris={(p) => p.id} {...t.propsTabel} />
</Kartu>
```

Satu hook mengurus pencarian ter-debounce, filter, pengurutan, paginasi,
dan pemilihan baris sekaligus.

---

## 8. Menyambungkan backend

### Supabase

```env
VITE_DATA_DRIVER=supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Yang harus disiapkan di Supabase:

1. Setiap tabel punya `id uuid pk`, `created_at`, `updated_at`, `deleted_at`
2. **Row Level Security aktif di setiap tabel** — driver ini bersandar penuh padanya
3. Tabel `pengguna` (id, email, nama, peran, aktif, avatar_url); peran dibaca dari
   tabel ini, **bukan** dari JWT claim yang bisa dipalsukan klien
4. Kolom `pencarian` bertipe `tsvector` untuk pencarian teks

### Backend sendiri (Laravel, Express, Go…)

```env
VITE_DATA_DRIVER=rest
VITE_API_BASE_URL=https://api.contoh.id
```

Sediakan endpoint dengan bentuk balasan `{ success, data, message }`:

| Metode | Jalur |
|---|---|
| GET | `/api/<koleksi>` — mendukung `halaman`, `per_halaman`, `cari`, `urut`, dan filter |
| GET | `/api/<koleksi>/:id` |
| POST | `/api/<koleksi>` |
| PATCH | `/api/<koleksi>/:id` |
| DELETE | `/api/<koleksi>/:id` — soft delete |
| POST | `/api/<koleksi>/:id/pulihkan` |
| GET | `/api/auth/saya` — balas 401 bila belum masuk |
| GET | `/api/auth/google` — mulai OAuth, alihkan balik ke `?redirect=` |
| POST | `/api/auth/keluar` |

Sesi memakai cookie `httpOnly` — token tidak pernah disimpan di localStorage.

> Driver yang tidak dipakai **tidak ikut ke bundle**. `@driver` di-alias saat build
> berdasarkan `VITE_DATA_DRIVER`, jadi memakai `mock` berarti kode Supabase tidak
> pernah terkirim ke peramban.

---

## 9. Menyesuaikan tampilan

### Mengganti warna merek

Dua cara:

- **Lewat panel** — `/pengaturan/merek`, tersimpan per peramban. Cocok untuk mencoba.
- **Permanen** — sunting blok `:root` di `src/styles/globals.css`.

Kalau mengganti warna secara permanen, **periksa kontrasnya**. Palet bawaan
sudah dihitung agar lolos WCAG AA; warna cerah seperti mint atau kuning tidak
akan lolos dengan teks putih. Aturannya: warna isi butuh ≥ 4,5:1 terhadap
warnanya sendiri sebagai teks, dan varian `-kuat` butuh ≥ 4,5:1 terhadap latar terang.

### Mode gelap

Setiap token punya pasangan gelap di blok `.dark`. Komponen tidak perlu tahu
tema mana yang aktif — cukup pakai token.

Pilihan tema (terang / gelap / ikut sistem) disimpan di localStorage dan
diterapkan **sebelum paint pertama** lewat skrip kecil di `index.html`, sehingga
tidak ada kedipan putih saat memuat halaman dalam mode gelap.

### Menambah komponen

Letakkan primitif tanpa logika bisnis di `src/components/ui/`, komponen
yang mengenal data di `src/components/data/`. Contoh pemakaiannya masukkan ke
halaman galeri (`/ui/komponen` atau `/ui/lanjutan`) supaya mudah ditemukan lagi.

---

## 10. Pengujian

```bash
pnpm test          # sekali jalan
pnpm test:watch    # ikut perubahan berkas
```

**Yang wajib punya test** (mengikuti `.claude/rules/testing.md`):

- Fungsi kalkulasi — semuanya ada di `src/lib/hitung.ts`
- Pemformatan — `src/lib/format.ts`
- Hak akses — `src/config/peran.ts`
- Validasi — mis. `src/lib/gambar.ts`

Semua fungsi itu **murni**: tanpa React, tanpa jaringan. Menaruhnya di `lib/`
membuatnya bisa diuji tanpa merender apa pun.

```ts
describe('hitungTotalPesanan', () => {
  it('menghitung pajak SETELAH diskon, bukan sebelum', () => {
    const r = hitungTotalPesanan(item, { diskonPersen: 10, pajakPersen: 11 })
    expect(r.pajak).toBe(24_750)
  })
})
```

> Kalau Anda menulis kalkulasi baru langsung di dalam komponen, pindahkan ke
> `lib/hitung.ts` lebih dulu. Kalkulasi di dalam JSX tidak bisa diuji tanpa
> merender seluruh halaman.

---

## 11. Menerbitkan ke server

`pnpm build` menghasilkan folder `dist/` yang seluruhnya statis. **Tidak ada
proses Node yang perlu berjalan.**

### cPanel / hosting bersama

Salin isi `dist/` ke `public_html/`, lalu buat `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### nginx / VPS

```nginx
root /var/www/panel/dist;

location / {
  try_files $uri $uri/ /index.html;
}

location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

**Bangun di mesin lokal, lalu `rsync` foldernya** — jangan build di VPS kecil:

```bash
pnpm build
rsync -avz --delete dist/ user@server:/var/www/panel/dist/
```

### Ukuran muatan

Muatan awal ± **190 KB gzip**. `vendor-charts` (257 KB) hanya diunduh saat
halaman berbagan dibuka, dan hilang sama sekali setelah `demo:strip` bila
aplikasi Anda tidak memakai bagan.

---

## 12. Jebakan yang sudah pernah menggigit

Daftar ini bukan teori — semuanya pernah terjadi saat template ini dibangun.

| Jebakan | Akibatnya | Cara benar |
|---|---|---|
| `<Navigate>` diberi `search` dari lokasi router yang hidup | Loop navigasi tak berujung, tab kehabisan memori | Tangkap tujuan sekali dengan `useState(() => …)` |
| Memanggil `navigate()` saat render | Efek samping di fase render, bisa memicu loop | Pakai `<Navigate>` |
| `Tombol asChild` dengan dua anak | Radix `Slot` gagal, semua tombol-tautan rusak diam-diam | `asChild` hanya meneruskan satu anak |
| `Math.now()` / `Math.random()` saat render | Nilainya berubah tiap render ulang | Hitung di tingkat modul atau di penangan peristiwa |
| Membaca `ref.current` saat render | Nilainya tertinggal satu ketukan | Turunkan dari prop atau state |
| Array per-deret pada bagan **radar** | ApexCharts menghasilkan `NaN`, poligon gagal digambar | Pakai nilai skalar |
| Merangkai kelas Tailwind saat runtime | Kelasnya tidak pernah dibuat | Peta statis |
| `import * as` dari lucide-react | Satu halaman membengkak 158 KB gzip | Impor ikon satu per satu |
| Mengukur performa dengan `pnpm dev` | 390 permintaan tanpa minifikasi — bukan gambaran produksi | `pnpm build && pnpm preview` |
| `<Pemisah>` di dalam `<dl>` | Melanggar struktur definition list | Pakai `border-t` pada baris berikutnya |
| Transparansi teks di atas warna solid | Kontras turun di bawah 4,5:1 | Hindari `opacity-*` pada teks |

---

## 13. Rujukan perintah

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Server pengembangan di :5180 |
| `pnpm build` | Build produksi + bangkitkan `routeTree.gen.ts` |
| `pnpm preview` | Uji hasil build di :5181 |
| `pnpm typecheck` | Pemeriksaan tipe |
| `pnpm lint` | oxlint |
| `pnpm lint:fix` | oxlint dengan perbaikan otomatis |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest sekali jalan |
| `pnpm test:watch` | Vitest mengikuti perubahan |
| `pnpm analyze` | Visualisasi ukuran bundle |
| `pnpm demo:strip` | Buang seluruh halaman peraga (sekali saja) |

---

## Dokumen lain

| Berkas | Isi |
|---|---|
| [RESEP.md](RESEP.md) | Langkah baku: tambah halaman, modul CRUD, unggahan gambar, bagan, peran |
| [ARSITEKTUR.md](ARSITEKTUR.md) | Keputusan arsitektur beserta alasannya |
| [ci/README.md](ci/README.md) | Alur kerja CI dan cara mengaktifkannya |
| [../.claude/CLAUDE.md](../.claude/CLAUDE.md) | Aturan ringkas untuk asisten kode |
