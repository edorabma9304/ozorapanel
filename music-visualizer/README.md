# Music Visualizer

Aplikasi web pembuat video visualizer musik — jalan sepenuhnya di browser, tanpa install, tanpa server.

## Fitur

- **Playlist multi-lagu** (MP3/WAV/FLAC/dll) dengan shuffle, repeat, dan chapter YouTube otomatis
- **7 gaya visual** (Circular, Ring, Bars, Mirror, Wave, Particles, Fire Spectrum + Sparks) dengan gradasi 2 warna
- **Background** foto / video / slideshow multi-foto dengan blur & kontrol gelap
- **Export MP4 cepat** via WebCodecs (hingga 8K, hardware-accelerated, ditulis langsung ke disk) + fallback rekam real-time
- **Batch export** — tiap lagu jadi file video terpisah
- **Lirik sinkron** (.lrc), **watermark**, **thumbnail PNG**, trim durasi, normalisasi volume, fade antar lagu
- **Posisi & ukuran kustom** — seret logo/judul/artis/watermark di layar, scroll untuk ubah ukuran
- **Preset bernama** untuk kerja berulang
- **Multi-Live Studio** (`live.html`) — kelola siaran YouTube 24/7 multi-channel, generate script ffmpeg siap pakai

## Performa render

Preview dan export dirancang agar tidak patah-patah:

- **Tanpa `shadowBlur` per frame.** Pendar cincin/gelombang/api digambar dengan
  goresan berlapis; teks + bayangannya dirender sekali ke sprite. Ini penyebab
  lag terbesar sebelumnya, terutama di 4K/8K.
- **Skala render adaptif.** Pilihan *Kualitas Preview* (Otomatis / Tinggi /
  Sedang / Rendah) di panel. Mode Otomatis memantau laju frame dan menurunkan
  resolusi kanvas sendiri bila perangkat tidak kuat, lalu menaikkannya lagi.
  Meter `fps · skala` ada di bar bawah. Pengaturan ini hanya untuk layar —
  video hasil export selalu di resolusi penuh.
- **Latar diburamkan sekali**, bukan lewat CSS `filter`/`backdrop-filter`
  yang dihitung ulang GPU setiap frame.
- **Gradien di-cache** dan gambar besar dikecilkan saat dimuat; rekam real-time
  hanya merender adegan sekali per frame.

## Struktur

| File | Isi |
|---|---|
| `index.html` | Aplikasi utama (satu file, semua inline) |
| `live.html` | Dashboard Multi-Live Studio |
| `netlify.toml` | Konfigurasi deploy Netlify |

## Deploy

Drag-drop folder ini ke [app.netlify.com/drop](https://app.netlify.com/drop), atau hubungkan repo ini ke Netlify untuk auto-deploy setiap push. Butuh HTTPS agar export MP4 cepat (WebCodecs) aktif — Netlify sudah otomatis HTTPS.

Untuk hasil terbaik gunakan Chrome/Edge. Export disarankan 1080p/1440p · 60fps (sudah otomatis via "Kualitas otomatis").
