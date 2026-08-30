# Arsitektur & alasannya

Catatan keputusan. Baca ini sebelum mengusulkan perubahan besar — sebagian besar
"kenapa tidak pakai X" sudah dijawab di sini.

## Kenapa SPA, bukan Next.js

Panel admin berada di balik login, jadi SSR dan SEO tidak memberi nilai apa pun.
Yang tersisa hanyalah biayanya: proses Node yang harus terus hidup, supervisor
atau PM2, dan build yang berat di VPS kecil.

Hasil `pnpm build` adalah folder statis. Bisa ditaruh di `public_html` cPanel,
di-`rsync` ke VPS, atau ditaruh di CDN mana pun. Tidak ada yang perlu dijaga tetap hidup.

## Kenapa lapisan adapter

Satu template dipakai untuk banyak project dengan backend berbeda — Supabase di
satu tempat, Laravel di tempat lain. Kalau halaman memanggil `supabase.from(...)`
langsung, setiap project berarti membongkar ulang seluruh halaman.

Dengan `AdapterData`, seluruh aplikasi hanya mengenal `data.koleksi<T>('nama')`.
Menukar backend berarti menulis satu berkas driver.

Bonus yang tidak terduga: `@driver` di-alias saat build berdasarkan
`VITE_DATA_DRIVER`, jadi **driver yang tidak dipakai tidak ikut ke bundle**.
Memakai `mock` berarti kode Supabase (~54 KB gzip) tidak pernah terkirim ke browser.

## Kenapa driver `mock` ada

Supaya template bisa dijalankan dan didemokan tanpa backend sama sekali, dan
supaya setiap peran bisa dicoba lewat tombol di halaman masuk. Datanya
deterministik (PRNG ber-seed) agar tangkapan layar dan test tidak berubah-ubah.

## Kenapa tidak memakai pustaka tabel

Paginasi, pengurutan, dan pencarian dikerjakan di server lewat adapter. Model
baris sisi-klien milik TanStack Table jadi tidak terpakai, sementara paketnya
tetap ikut ke bundle. `TabelData` ditulis sendiri: lebih kecil, dan tipe kolomnya
persis sesuai kebutuhan.

Pengecualian yang disadari: menyeret kartu kanban tidak bisa diakses papan ketik,
karena itu setiap kartu punya menu "Pindahkan ke" sebagai jalur setara.

## Kenapa ApexCharts, padahal berat

257 KB (gzip) memang besar, tapi dimuat malas dan dipisah ke chunk sendiri —
halaman tanpa bagan tidak ikut menanggungnya. Sebagai gantinya, tampilannya
persis seperti referensi tanpa harus menulis ulang seluruh bagan.

Yang diperbaiki: kartu statistik dipakai hampir di semua halaman, jadi grafik
miniaturnya **tidak** memakai Apex melainkan `<Sparkline>` — SVG murni, sekitar
30 baris, nol dependensi.

## Kenapa oxlint, bukan ESLint

TypeScript 7 (compiler Go) belum didukung `typescript-eslint`. oxlint ditulis
dalam Rust, tidak butuh TypeScript untuk berjalan, dan menyelesaikan seluruh
`src/` dalam waktu di bawah satu detik.

## Kenapa Tailwind v4 CSS-first

Tidak ada `tailwind.config.js`. Seluruh token desain hidup sebagai variabel CSS
di `src/styles/globals.css`, dalam blok `@theme`. Mode gelap mendefinisikan ulang
variabel yang sama — komponen tidak perlu tahu tema mana yang aktif.

Konsekuensinya: **jangan pernah merangkai nama kelas saat runtime.** Tailwind
memindai kode secara statis, jadi `` `bg-${warna}` `` tidak akan pernah dihasilkan.

## Kenapa RBAC berbasis string

`punyaIzin(peran, 'pesanan.hapus')` dengan wildcard (`pesanan.*`, `*`) dan
penolakan eksplisit (`!pengguna.hapus`). Satu matriks di `src/config/peran.ts`
mengatur sidebar, palet perintah, penjagaan halaman, dan tombol aksi sekaligus.

Penjagaan di klien hanya untuk tampilan. Otorisasi sebenarnya harus ditegakkan
di backend — RLS Supabase atau middleware API.

## Anggaran ukuran

Muatan awal halaman dasbor, dalam gzip:

| Chunk | Ukuran |
|---|---|
| vendor-react | 56 KB |
| vendor-radix | 44 KB |
| vendor-tanstack | 36 KB |
| index (aplikasi) | 22 KB |
| CSS | 14 KB |
| **Total** | **± 172 KB** |

`vendor-charts` (257 KB) hanya diunduh saat halaman yang memuat bagan dibuka.
Setelah `pnpm demo:strip`, chunk itu hilang sama sekali bila aplikasi Anda
memang tidak memakai bagan.

## Waktu muat terukur

Diukur dengan Chromium di localhost, hasil `pnpm build`:

| Tahap | Produksi | Dev |
|---|---|---|
| Halaman masuk tampil | 204 ms | 384 ms |
| Login → dasbor siap | 150 ms | 195 ms |
| Bagan tergambar | +334 ms | +343 ms |
| Buka /pengguna | 179 ms | 245 ms |
| Jumlah permintaan | 116 | 390 |

**Mode dev memang jauh lebih berat** — Vite menyajikan setiap modul sebagai
berkas terpisah tanpa minifikasi, jadi 390 permintaan dan puluhan MB transfer
itu normal dan tidak mencerminkan produksi. Selalu ukur dengan
`pnpm build && pnpm preview`, jangan dengan `pnpm dev`.

## Yang sengaja tidak dipakai

| Tidak dipakai | Alasan |
|---|---|
| Google Fonts | permintaan jaringan tambahan + jejak privasi; font di-host sendiri |
| date-fns/dayjs di `format.ts` | `Intl` bawaan sudah menangani locale id-ID |
| Pustaka animasi | transisi CSS lebih murah dan tidak memblokir utas utama |
| Barrel export `components/ui/index.ts` | impor langsung menjaga tree-shaking tetap tajam |
| Token di localStorage | driver REST memakai cookie httpOnly |
