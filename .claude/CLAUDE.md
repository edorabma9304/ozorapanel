# Ozora Panel — panduan kerja

Template panel admin. Baca berkas ini lebih dulu; jangan menelusuri kode untuk
menemukan pola yang sudah ditulis di sini.

## Stack

Vite 8 · React 19 · TypeScript 7 · TanStack Router (berbasis berkas) ·
TanStack Query · Tailwind 4 (CSS-first) · Radix UI · Zod 4 · React Hook Form ·
ApexCharts (dimuat malas) · oxlint · Vitest

## Perintah

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Server pengembangan di :5180 |
| `pnpm build` | Build produksi + bangkitkan `routeTree.gen.ts` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | oxlint |
| `pnpm test` | Vitest |
| `pnpm demo:strip` | Buang seluruh halaman peraga (sekali, saat memulai project baru) |

Driver `mock` berjalan tanpa jeda buatan. Setel `VITE_MOCK_JEDA_MS=300` di
`.env.local` hanya bila ingin menguji tampilan skeleton dan keadaan memuat.

`routeTree.gen.ts` **dibangkitkan otomatis** — jangan disunting, jangan di-commit.
Setelah menambah berkas rute, jalankan `pnpm build` (atau `pnpm dev`) agar tipenya terbentuk.

## Aturan yang tidak boleh dilanggar

1. **Jangan panggil `fetch` atau `supabase` dari komponen.** Semua akses data lewat
   `data.koleksi<T>('nama')` di `src/lib/adapter`. Menukar backend = menulis satu
   berkas driver, bukan menyunting halaman.
2. **Pakai token warna, bukan warna mentah.** `bg-primary`, bukan `bg-blue-500`.
   Token ada di `src/styles/globals.css`; warna mentah tidak ikut mode gelap.
3. **Jangan rangkai nama kelas Tailwind saat runtime.** `` `bg-${warna}` `` tidak akan
   pernah ter-generate. Pakai peta statis (contoh: `WARNA_TITIK` di `topbar.tsx`).
4. **Tambah halaman = tambah entri di `src/config/menu.ts`.** Jangan menyunting `Sidebar`.
5. **Penjagaan izin di klien hanya untuk tampilan.** Otorisasi sebenarnya wajib di
   backend (RLS Supabase / middleware API).
6. **Soft delete, bukan hapus permanen.** `hapus()` mengisi `deleted_at`.
7. **Teks UI dalam Bahasa Indonesia.** Pesan galat harus menjelaskan cara memperbaiki.
8. **Jangan gunakan `import * as` untuk lucide-react.** Impor ikon satu per satu.
9. **Semua unggahan gambar lewat `<UnggahGambar>`.** Komponen itu memeriksa tipe
   dari byte awal berkas (bukan ekstensi), memvalidasi ukuran & dimensi, lalu
   mengompres otomatis. Pilih `preset`: logo, favicon, sampul, produk, avatar.
10. **Jangan memanggil `navigate()` saat render.** Pakai `<Navigate>`. Efek samping
   di fase render bisa memicu loop navigasi.
11. **Jangan membaca lokasi router yang hidup lalu mengirimkannya sebagai `search`
    milik `<Navigate>`.** Nilainya berubah setiap navigasi, jadi `<Navigate>`
    menembak ulang tanpa henti sampai tab kehabisan memori. Tangkap tujuannya
    sekali dengan `useState(() => …)` — lihat `src/routes/_app.tsx`.

## Peta berkas

```
src/
├── config/
│   ├── app.ts          env tervalidasi Zod — satu-satunya pembaca import.meta.env
│   ├── merek.ts        logo, favicon, warna merek (bisa diganti dari Pengaturan)
│   ├── peran.ts        5 peran + MATRIKS_IZIN + punyaIzin()
│   └── menu.ts         SUMBER TUNGGAL menu, breadcrumb, dan Cmd+K
├── lib/
│   ├── adapter/        kontrak.ts + mock.ts | supabase.ts | rest.ts
│   ├── auth.tsx        PenyediaAuth, useAuth(), <Izinkan>
│   ├── tema.tsx        terang / gelap / ikuti sistem
│   ├── kueri.ts        useDaftar, useDetail, useSimpan, useHapus, usePulihkan
│   ├── use-daftar-tabel.ts  keadaan halaman daftar (cari+filter+urut+paginasi)
│   ├── format.ts       formatRp, formatTanggal, … (SEMUA ada test-nya)
│   ├── gambar.ts       validasi + kompresi gambar (tanda tangan byte, potong,
│   │                   ciutkan, WebP/PNG) + PRESET per jenis unggahan
│   └── tipe.ts         Entitas, Pengguna, Halaman<T>, GalatApi, pesanRamah
├── components/
│   ├── ui/             primitif: tombol, kartu, masukan, kendali, lapisan, keadaan…
│   ├── layout/         sidebar, topbar, kepala-halaman, palet-perintah
│   ├── data/           tabel-data, bilah-alat, paginasi, kartu-statistik
│   ├── bagan/          bagan.tsx (Apex, malas) + sparkline.tsx (SVG, nol dependensi)
│   │                   JEBAKAN: radar tidak menerima array per-deret untuk
│   │                   fill/markers/stroke — hasilnya NaN. Pakai skalar.
│   └── form/           kolom.tsx (pembungkus kolom), unggah-gambar.tsx
│                       (SATU komponen unggah untuk semua gambar — validasi
│                       + kompresi otomatis; jangan tulis <input type=file>
│                       sendiri), dan penyunting.tsx
│                       (teks kaya, contenteditable, nol dependensi —
│                       HTML-nya WAJIB disanitasi di server sebelum ditampilkan)
├── features/
│   ├── pengguna/       JALUR EMAS: skema Zod + form dialog
│   └── toko/           keranjang belanja (store modul + useSyncExternalStore)
└── routes/             rute berbasis berkas (_app = wajib login, _auth = publik)
```

## Menambah modul CRUD baru

Salin `src/routes/_app/pengguna.tsx` + `src/features/pengguna/`. Langkah lengkap
ada di `docs/RESEP.md` — baca itu, jangan menyusun ulang polanya sendiri.

## Yang sengaja TIDAK ada

- Tidak ada pustaka tabel (TanStack Table). `TabelData` ditulis sendiri; paginasi
  dan pengurutan dikerjakan server lewat adapter.
- Tidak ada pustaka animasi. Semua transisi berbasis CSS.
- Tidak ada Google Fonts. Font di-host sendiri lewat `@fontsource-variable`.
- Tidak ada tanggal/waktu dari pustaka pihak ketiga di `format.ts` — cukup `Intl`.
