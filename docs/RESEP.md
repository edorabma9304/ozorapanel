# Resep

Langkah baku untuk pekerjaan yang paling sering muncul. Ikuti resepnya; jangan
menyusun pola baru bila sudah ada di sini.

---

## 1. Menambah halaman baru

**Tiga berkas yang disentuh — tidak lebih.**

1. Buat `src/routes/_app/<jalur>.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu, IsiKartu } from '@/components/ui/kartu'

function HalamanSaya() {
  return (
    <>
      <KepalaHalaman
        judul="Judul halaman"
        deskripsi="Satu kalimat menjelaskan isinya."
        remah={[{ label: 'Grup' }, { label: 'Judul halaman' }]}
      />
      <Kartu>
        <IsiKartu>…</IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/<jalur>')({ component: HalamanSaya })
```

2. Daftarkan di `src/config/menu.ts` (menu, breadcrumb, dan Cmd+K ikut otomatis):

```ts
{ judul: 'Halaman Saya', href: '/<jalur>', icon: FileText, izin: 'modul.lihat' }
```

3. Jalankan `pnpm build` supaya `routeTree.gen.ts` terbentuk ulang.

> Halaman publik (tanpa login) diletakkan di `src/routes/_auth/`.

---

## 2. Menambah modul CRUD lengkap

Jalur emas ada di `src/routes/_app/pengguna.tsx` + `src/features/pengguna/`.

**a. Tipe** — tambahkan di `src/lib/tipe.ts`:

```ts
export type Produk = Entitas & {
  nama: string
  harga: number
  stok: number
}
```

**b. Skema validasi** — `src/features/produk/skema.ts`:

```ts
export const skemaProduk = z.object({
  nama: z.string().trim().min(3, 'Nama minimal 3 huruf.'),
  harga: z.coerce.number().positive('Harga harus lebih besar dari nol.'),
  stok: z.coerce.number().int().nonnegative('Stok tidak boleh negatif.'),
})
export type IsiProduk = z.infer<typeof skemaProduk>
```

**c. Halaman daftar** — satu hook mengurus seluruh keadaan:

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

**d. Formulir** — salin `src/features/pengguna/form-pengguna.tsx`. Polanya:
`useForm` + `zodResolver` → `useSimpan('produk')` → tutup dialog.
`useSimpan` otomatis membuat bila `id` kosong dan mengubah bila `id` ada.

**e. Hapus** — bungkus item menu dengan `<Konfirmasi>` + `<IsiKonfirmasi>` lalu
panggil `useHapus('produk')`. Ini soft delete.

**f. Izin** — tambahkan `'produk.*'` pada peran yang berhak di
`src/config/peran.ts`, lalu pagari halaman dengan `if (!boleh('produk.lihat')) return <HalamanTanpaAkses />`.

---

## 3. Menambah bagan

```tsx
import { Bagan } from '@/components/bagan/bagan'

<Bagan
  jenis="area"
  tinggi={320}
  deret={[{ name: 'Pendapatan', data: [12, 19, 15, 22] }]}
  opsi={{
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'] },
    yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
  }}
/>
```

ApexCharts dimuat malas dan masuk chunk `vendor-charts` (~257 KB gzip). Untuk
grafik miniatur di dalam kartu, **pakai `<Sparkline>`** — SVG murni, nol dependensi.

---

## 3b. Menambah unggahan gambar

Jangan menulis `<input type="file">` sendiri — pakai komponen bersama:

```tsx
import { UnggahGambar } from '@/components/form/unggah-gambar'

<UnggahGambar
  label="Gambar utama"
  keterangan="JPG, PNG, atau WebP · maks. 8 MB"
  preset="produk"              // logo | favicon | sampul | produk | avatar
  rasioPratinjau="aspect-square"
  nilai={gambar}
  onUbah={setGambar}
/>
```

Yang dikerjakan komponen ini otomatis:

| Tahap | Perilaku |
|---|---|
| Tipe berkas | Dibaca dari byte awal, bukan ekstensi — berkas yang diganti nama ditolak |
| Ukuran | Ditolak bila melebihi batas preset (favicon 1 MB, logo 2 MB, sampul & produk 8 MB) |
| Dimensi | Ditolak bila di bawah minimum agar tidak pecah |
| Potong | Ke tengah mengikuti rasio preset (favicon & produk persegi, sampul 16:9) |
| Ciutkan | Ke sisi terpanjang preset — gambar kecil tidak pernah diperbesar |
| Sandikan | WebP bila didukung, PNG bila butuh transparansi, SVG diteruskan apa adanya |

Preset diatur di `src/lib/gambar.ts`. Tambahkan preset baru di sana, bukan
dengan mengoper `aturan`/`kompresi` satu per satu di tiap halaman.

> Validasi ini untuk pengalaman pengguna. Server **wajib** memeriksa ulang tipe
> dan ukuran berkas — lihat `.claude/rules/security.md`.

---

## 4. Menyambungkan ke Supabase

1. Isi `.env.local`:
   ```
   VITE_DATA_DRIVER=supabase
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
2. Buat tabel dengan kolom wajib: `id uuid pk`, `created_at`, `updated_at`, `deleted_at`.
3. **Aktifkan RLS pada setiap tabel** dan tulis policy-nya. Driver ini bersandar
   pada RLS — tidak ada pengecekan izin di sisi server yang lain.
4. Tabel `pengguna` wajib ada (id, email, nama, peran, aktif, avatar_url).
   Peran dibaca dari tabel ini, bukan dari JWT claim.
5. Untuk pencarian teks, tambahkan kolom `pencarian` bertipe `tsvector`
   (driver memanggil `.textSearch('pencarian', …)`).

Driver yang tidak dipakai **tidak ikut ke bundle** — `@driver` di-alias saat build.

---

## 5. Menyambungkan ke backend sendiri (Laravel dll.)

1. `VITE_DATA_DRIVER=rest` dan `VITE_API_BASE_URL=https://api.contoh.id`
2. Sediakan endpoint berikut dengan balasan `{ success, data, message }`:

| Metode | Jalur | Keterangan |
|---|---|---|
| GET | `/api/<koleksi>` | mendukung `halaman`, `per_halaman`, `cari`, `urut`, filter |
| GET | `/api/<koleksi>/:id` | |
| POST | `/api/<koleksi>` | |
| PATCH | `/api/<koleksi>/:id` | |
| DELETE | `/api/<koleksi>/:id` | soft delete |
| POST | `/api/<koleksi>/:id/pulihkan` | |
| GET | `/api/auth/saya` | 401 bila belum masuk |
| GET | `/api/auth/google` | mulai OAuth, alihkan balik ke `?redirect=` |
| POST | `/api/auth/keluar` | |

Sesi memakai cookie `httpOnly` — token tidak pernah disimpan di localStorage.

---

## 6. Menambah peran baru

Sunting `src/config/peran.ts` saja:

```ts
export const PERAN = [..., 'gudang'] as const
export const LABEL_PERAN = { ..., gudang: 'Gudang' }
export const WARNA_PERAN = { ..., gudang: 'info' }
export const MATRIKS_IZIN = { ..., gudang: ['dasbor.lihat', 'stok.*', 'profil.*'] }
```

Sidebar, palet perintah, dan penjagaan halaman langsung mengikuti. Tambahkan
test-nya di `peran.test.ts` — RBAC wajib punya test.

---

## 7. Menerbitkan ke server

`pnpm build` menghasilkan folder `dist/` statis. Tidak ada proses Node yang perlu jalan.

**cPanel / hosting bersama** — salin isi `dist/` ke `public_html/`, lalu buat
`.htaccess` agar semua jalur diarahkan ke `index.html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**nginx**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

Build di mesin lokal lalu `rsync` folder `dist/` — jangan build di VPS kecil.
