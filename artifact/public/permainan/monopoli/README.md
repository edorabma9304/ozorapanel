# Aset Jelajah Dunia

Letakkan potongan PNG (latar transparan) di folder ini dengan nama persis di
bawah. Selama berkas belum ada, permainan memakai gambar SVG cadangan yang
digambar dalam kode (`src/features/monopoli/aset.tsx`), jadi tidak ada yang rusak.

| Berkas | Isi | Ukuran anjuran |
|---|---|---|
| `kartu-kesempatan.png` | kartu merah muda "?" | 360×500 |
| `kartu-harta.png` | kartu biru peti harta | 360×500 |
| `kartu-perjalanan.png` | kartu biru pesawat | 360×500 |
| `petak-pajak.png` | petak TAX (kantong uang) | 256×256 |
| `petak-bonus.png` | petak BONUS (bintang) | 256×256 |
| `petak-parkir.png` | petak FREE PARKING | 256×256 |
| `petak-mulai.png` | petak GO | 256×256 |
| `petak-penjara.png` | petak JAIL | 256×256 |
| `ikon-dunia.png` | bola dunia + pesawat | 256×256 |
| `ikon-peti.png` | peti harta | 256×256 |
| `ikon-tanya.png` | lingkaran "?" | 256×256 |
| `ikon-bintang.png` | bintang emas | 256×256 |
| `uang-1.png` … `uang-100.png` | lembar $1, $5, $10, $20, $50, $100 | 400×200 |
| `bangunan-rumah.png` | rumah merah (tingkat 1) | 256×256 |
| `bangunan-vila.png` | vila hijau (tingkat 2) | 256×256 |
| `bangunan-menara.png` | menara biru (tingkat 3) | 256×256 |
| `bangunan-pencakar.png` | pencakar langit emas (tingkat 4) | 256×256 |
| `pion-<warna>-bulat.png` | pion bulat (Pemain 1) | 256×256 |
| `pion-<warna>-permata.png` | pion permata (Pemain 2) | 256×256 |

`<warna>` salah satu dari: `merah`, `biru`, `hijau`, `kuning`, `ungu`,
`oranye`, `pink`, `sian` — total 16 berkas pion.

Dadu tidak perlu PNG: digambar SVG supaya bisa menampilkan nilai 1–6 dan
dianimasikan.
