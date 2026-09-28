# Jelajah Dunia — aturan & arsitektur

Papan properti terinspirasi Monopoly, dimainkan **per tim** (2 pemain/tim,
2–8 tim). Halaman: `/permainan/monopoli`. Kode: `src/features/monopoli/`.

## Aturan

**Tim & giliran**
- Tiap tim punya 2 pion (bulat = Pemain 1, permata = Pemain 2) dengan warna sama.
- Urutan: Tim1 P1 → Tim1 P2 → Tim2 P1 → Tim2 P2 → … Dadu kembar = giliran tambahan;
  tiga kembar berturut-turut = masuk penjara.

**Uang dua lapis**
- *Dompet pribadi*: menerima gaji lewat Mulai, bonus, dan hadiah kartu.
- *Kas tim*: menerima sewa dan pot Parkir Bebas; membayar properti & bangunan.
- Tagihan (sewa, pajak, denda, kartu) ditarik berurutan: dompet pemain yang
  mendarat → kas tim → dompet rekan → jual bangunan otomatis (setengah harga).
  Bila masih kurang, tim **bangkrut**.
- Pembelian ditarik dari kas tim; kekurangan diambil dari dompet pemain aktif.
  Setor/tarik antara dompet dan kas bisa dilakukan kapan saja di giliran tim.

**Papan** (`papan.ts`)
- Jumlah petak = 8 + 8 × jumlah tim (2 tim = 24, 8 tim = 72).
- 4 sudut: Mulai, Penjara, Parkir Bebas, Masuk Penjara. 4 bandara di tengah sisi.
- Satu **wilayah** (Asia Tenggara, Asia Timur, Eropa, …) per tim, 8 petak:
  6 kota dalam 2 kelompok warna (3 kota) + 1 petak kartu + 1 petak pajak/bonus.
  Wilayah ke-i ditandai sebagai kampung halaman tim ke-i di peta tengah; ini
  hanya penanda, tidak mengubah sewa.
- Harga kota naik dari $60 (wilayah pertama) sampai $360 (wilayah terakhir).

**Sewa & bangunan**
- Sewa dasar ≈ harga/10. Kelompok lengkap → sewa tanah ×2 dan boleh membangun.
- Tingkat: Rumah → Vila → Menara → Pencakar langit; pengali sewa 4× / 10× / 25× / 45×.
- Bangun merata (beda tingkat dalam satu kelompok maks 1). Biaya = harga/2 per tingkat.
- Bandara: sewa $25/$50/$100/$200 menurut jumlah bandara pemilik. Mendarat di
  properti tim sendiri tidak menagih apa pun.

> Sewa sengaja hanya punya dua pengali: kelompok warna penuh (×2 untuk tanah
> kosong) dan tingkat bangunan. Tidak ada bonus tersembunyi, supaya pemain bisa
> menghitung sewa tanpa membuka aturan.

**Petak spesial**
- Pajak $100 masuk pot; Parkir Bebas mengambil seluruh pot ke kas tim.
- Bonus: +$50 dompet. Kesempatan: perpindahan & risiko. Harta Karun: rezeki.
- Penjara: bebas dengan kembar, kartu bebas, atau denda $50 (otomatis giliran ke-3).

**Menang & gugur**
- Kekayaan tim = kas + dompet + harga properti + biaya bangunan terpasang.
  Mencapai *target kekayaan* di akhir giliran = menang.
- Kerugian tim = akumulasi sewa/pajak/denda yang dibayar. Melewati *batas
  kerugian* atau bangkrut = gugur; semua properti kembali ke bank tanpa bangunan.
- Tim terakhir yang bertahan menang.

## Arsitektur

| Berkas | Isi |
|---|---|
| `tipe.ts` | semua tipe data (murni JSON) |
| `papan.ts` | pembangkit papan + tata letak SVG + konstanta ekonomi |
| `kartu.ts` | dek Kesempatan & Harta Karun |
| `mesin.ts` | reducer murni `langkah(permainan, aksi)`, PRNG berbenih, penghitung sewa/kekayaan |
| `mesin.test.ts` | 29 test aturan |
| `aset.tsx` | pemuat PNG dari `public/permainan/monopoli/` + gambar SVG cadangan |
| `peta.tsx` | papan SVG interaktif (geser, zoom, tooltip, pion beranimasi, peta dunia tengah) |
| `hud.tsx` | panggung keputusan di lubang tengah papan — hanya fase yang sedang berjalan |
| `menu.tsx` | menu pojok kiri (tim, catatan, aturan, suara, keluar) + pemberitahuan peristiwa |
| `arena.tsx` | papan berjalan: animasi, suara, kamera — dipakai mode satu layar & daring |
| `dadu.tsx` | dadu 3D (kubus CSS) yang bergulir sebelum pion berjalan |
| `ruang.ts` | bentuk data ruang daring: peserta, kursi, obrolan |
| `mesin-ruang.ts` | reducer ruang + otorisasi kursi + penyaringan pandangan |
| `mesin-ruang.test.ts` | 17 test lobi, otorisasi, dan obrolan |
| `transport.ts` | antarmuka transport + jalur antar tab (BroadcastChannel) |
| `transport-supabase.ts` | transport lintas perangkat (dimuat malas) |
| `daring.tsx` | layar pilih, lobi, dan papan mode bersama |
| `obrolan.tsx` | kotak obrolan: saluran semua & tim |
| `jelajah-dunia.tsx` | pintu masuk: pilih satu layar atau main bersama |
| `suara.ts` | musik latar & efek suara hasil sintesis Web Audio + pemetaan peristiwa |
| `suara.test.ts` | 5 test pemetaan peristiwa ke bunyi |
| `pengaturan.tsx` | layar persiapan |
| `simpan.ts` | simpan/muat permainan di localStorage |

**Aturan tampilan.** Papan tengah hanya memuat keputusan saat ini. Daftar tim,
catatan peristiwa, dan aturan ada di menu pojok kiri, dibuka saat dibutuhkan.
Jangan kembalikan panel yang selalu terbuka: itu yang dulu membuat permainan
terasa rumit.

**Urutan lemparan.** Mesin menentukan mata dadu saat tombol ditekan, tetapi pion
menunggu: `permainan.tsx` menahan fase `bergerak` selama dadu 3D bergulir, dan
menahan bunyi serta pemberitahuan lain sampai dadunya berhenti supaya hasilnya
tidak bocor lebih dulu.

**Suara** disintesis, tanpa berkas audio, dengan alasan yang sama seperti gambar
cadangan: permainan utuh tanpa menunggu aset. Sakelar musik dan efek ada di menu
pojok kiri dan tersimpan di localStorage.

Mesin tidak tahu apa-apa soal UI: animasi dadu dan langkah pion diatur rute
(`src/routes/_app/permainan/monopoli.tsx`) lewat fase `bergerak` → aksi `tiba`.
Untuk mode daring, cukup jalankan `langkah()` di server dan siarkan `Permainan`.


---

## Mode bersama (daring)

Semua orang online bersamaan, masuk lewat kode ruang lima huruf, tanpa perlu
akun. Ada obrolan untuk semua dan untuk rekan setim.

**Pembagian tanggung jawab**

- `mesin.ts` tahu aturan permainan, tidak tahu apa pun soal pemain atau akun.
- `mesin-ruang.ts` tahu siapa duduk di kursi mana dan menolak perintah yang
  bukan haknya. Keduanya murni, jadi bisa dijalankan di browser maupun server.
- `transport.ts` adalah satu-satunya seam ke backend. Mengganti backend berarti
  menulis satu berkas transport.

**Aturan otorisasi**

| Perintah | Siapa yang boleh |
|---|---|
| atur, mulai, bubar | tuan rumah |
| duduk, berdiri | peserta mana pun, kursi kosong |
| aksi permainan biasa | pemegang kursi yang sedang giliran |
| menyerah | anggota tim itu |
| `tiba`, `terapkan-kartu` | siapa pun di ruang |
| obrolan tim | peserta yang sudah punya kursi |

`tiba` dan `terapkan-kartu` sengaja dibuka untuk semua karena tidak butuh
keputusan. Kalau pemain yang sedang giliran menutup tabnya di tengah langkah,
klien lain tetap bisa memajukan papan, jadi permainan tidak menggantung.

**Rahasia bandar.** Benih PRNG dan urutan kartu ada di dalam keadaan permainan.
`pandangan()` membuangnya sebelum keadaan dikirim ke pemain, dan juga menyaring
obrolan tim lain. Transport apa pun WAJIB memakainya — tanpa itu pemain bisa
meramalkan dadu dan mengintip kartu.

## Menerbitkan ke GitHub Pages

Cara tercepat memberi orang lain tautan, gratis dan tanpa akun tambahan:

```bash
pnpm game:terbit
```

Hasilnya ada di `https://<pengguna>.github.io/<repo>/`. GitHub menyalakan Pages
sendiri begitu branch `gh-pages` muncul pertama kali; tidak perlu menyentuh
Settings.

Branch `gh-pages` hanya berisi hasil build dan ditimpa setiap penerbitan —
jangan menyuntingnya langsung.

Yang terbit adalah build statis, jadi **hanya mode satu layar**. Mode bersama
lintas perangkat butuh server ruang; pilih salah satu jalur di bawah.

Tersedia juga `pnpm game:satu`, yang menanam gaya, skrip, dan font ke dalam
satu berkas HTML — bisa dikirim lewat pesan biasa dan dibuka dengan klik dua
kali, tanpa server sama sekali.

## Memasang backend lintas perangkat

Tanpa backend, mode bersama hanya menyambung antar tab di browser yang sama
(BroadcastChannel). Ada tiga jalur untuk lintas perangkat, semuanya memakai
mesin yang sama dan bicara ke antarmuka `Transport` yang sama.

| Jalur | Transport | Cocok untuk |
|---|---|---|
| Worker Cloudflare | `transport-http.ts` | tautan permanen, satu deploy, paket gratis |
| Server Node sendiri | `transport-http.ts` | satu VPS, atau mencoba di jaringan lokal |
| Supabase | `transport-supabase.ts` | sudah memakai Supabase untuk hal lain |

Klien memilih sendiri, dengan urutan: `VITE_SERVER_RUANG` → Supabase →
BroadcastChannel (lihat `jelajah-dunia.tsx`).

### 1. Worker Cloudflare (disarankan)

Satu deploy menyajikan permainan sekaligus ruangnya, di satu URL.

```bash
pnpm dlx wrangler login   # sekali saja, membuka browser
pnpm cf:deploy            # build + terbitkan
```

Hasilnya `https://jelajah-dunia.<subdomain>.workers.dev`. Ganti `name` di
`wrangler.jsonc` kalau ingin nama lain. Untuk mencoba dulu di komputer sendiri
dengan runtime Cloudflare asli: `pnpm cf:dev` lalu buka `:8787`.

Satu ruang = satu Durable Object, dan Cloudflare menjamin hanya ada satu
salinannya yang menjalankan perintah satu per satu — tepat untuk permainan
bergiliran, dan itulah sebabnya tidak perlu kunci optimistik di sini.
Keadaannya ditulis ke penyimpanan objek, jadi ruang selamat walau objeknya
sempat ditidurkan.

`run_worker_first: ["/api/*"]` di `wrangler.jsonc` wajib ada. Tanpa itu
`/api/*` ikut dilayani sebagai berkas statis dan tidak pernah sampai ke Worker.

### 2. Server Node sendiri

Satu proses tanpa dependensi yang menyajikan `dist-game/` sekaligus ruangnya.

```bash
pnpm mesin:salin                          # salin mesin ke server/mesin/
VITE_SERVER_RUANG=/api pnpm game:build    # build permainan
pnpm game:server                          # jalan di :5190
```

Atau ketiganya sekaligus: `pnpm game:bersama`.

Keadaan hanya di memori — server mati berarti ruang hilang. Itu memang
pilihannya: permainan berlangsung satu duduk, bukan berhari-hari.

### 3. Supabase

```bash
supabase db push                       # buat tabel + RLS
pnpm mesin:salin                       # salin mesin ke dalam fungsi
supabase functions deploy ruang        # pasang Edge Function
```

Lalu isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di `.env.local`.
Transport Supabase dimuat malas, jadi pustaka `@supabase/supabase-js` hanya
diunduh kalau mode bersama benar-benar dibuka.

Di sini beberapa contoh fungsi bisa berjalan bersamaan, jadi penyimpanannya
memakai kunci optimistik pada kolom `urut`: tulis hanya bila nomor urut belum
berubah sejak dibaca, dengan empat kali percobaan ulang.

Tabel `ruang_permainan` menyalakan RLS tanpa satu pun policy, jadi kunci anon
tidak bisa menyentuhnya. Hanya Edge Function dengan service role yang bisa,
dan di situlah otorisasi ditegakkan.

### Yang sama di ketiganya

Alur satu perubahan selalu: klien mengirim perintah ke server, server
menjalankan `langkahRuang`, lalu mengabarkan **nomor urut** terbaru. Klien yang
mendengar mengambil pandangannya masing-masing lewat `lihat`.

Yang dikabarkan sengaja hanya nomor urutnya, tidak pernah isi ruangnya: obrolan
tim dan rahasia bandar berbeda per penerima, jadi satu siaran bersama pasti
membocorkan sesuatu ke seseorang.

Semuanya juga menjajaki ulang tiap 8 detik sebagai jaring pengaman, jadi satu
kabar yang hilang tidak membuat papan tersangkut.
