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
| `menu.tsx` | menu pojok kiri (tim, catatan, aturan) + pemberitahuan peristiwa |
| `pengaturan.tsx` | layar persiapan |
| `simpan.ts` | simpan/muat permainan di localStorage |

**Aturan tampilan.** Papan tengah hanya memuat keputusan saat ini. Daftar tim,
catatan peristiwa, dan aturan ada di menu pojok kiri, dibuka saat dibutuhkan.
Jangan kembalikan panel yang selalu terbuka: itu yang dulu membuat permainan
terasa rumit.

Mesin tidak tahu apa-apa soal UI: animasi dadu dan langkah pion diatur rute
(`src/routes/_app/permainan/monopoli.tsx`) lewat fase `bergerak` → aksi `tiba`.
Untuk mode daring, cukup jalankan `langkah()` di server dan siarkan `Permainan`.
