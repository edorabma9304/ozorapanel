import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight, Boxes, ChartPie, Check, LayoutDashboard, Menu, Moon, Palette,
  ShieldCheck, Smartphone, Sparkles, Star, Sun, Users, X, Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/layout/logo'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Kartu, IsiKartu } from '@/components/ui/kartu'
import { Avatar } from '@/components/ui/avatar'
import { Akordeon, ItemAkordeon, PemicuAkordeon, IsiAkordeon } from '@/components/ui/lapisan'
import { useTema } from '@/lib/tema'
import { formatRp } from '@/lib/format'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Modul', href: '#modul' },
  { label: 'Harga', href: '#harga' },
  { label: 'Tanya jawab', href: '#tanya-jawab' },
]

const FITUR = [
  { ikon: ShieldCheck, judul: 'Akses per peran', teks: 'Lima peran bawaan dengan matriks izin yang bisa disesuaikan, ditegakkan sampai ke lapisan basis data.' },
  { ikon: Zap, judul: 'Ringan sejak awal', teks: 'Muatan awal di bawah 200 KB. Modul berat seperti bagan hanya diunduh saat benar-benar dibuka.' },
  { ikon: Moon, judul: 'Mode gelap sungguhan', teks: 'Bukan sekadar membalik warna — setiap token punya pasangan gelap yang dirancang terpisah.' },
  { ikon: Smartphone, judul: 'Layak pakai di ponsel', teks: 'Tabel bisa digeser, kolom kurang penting menyembunyikan diri, menu berubah jadi panel geser.' },
  { ikon: Boxes, judul: 'Bebas pilih backend', teks: 'Satu lapisan adapter. Supabase, REST, atau data tiruan — cukup ganti satu variabel.' },
  { ikon: Palette, judul: 'Token desain terpusat', teks: 'Ganti seluruh nuansa aplikasi dari satu berkas CSS, tanpa menyentuh komponen.' },
]

const MODUL = [
  'Dasbor', 'Pesanan', 'Pelanggan', 'Produk', 'Etalase & checkout', 'Faktur',
  'Kalender', 'Papan kanban', 'Obrolan', 'Surel', 'Catatan', 'Kontak',
  'Blog', 'Tiket dukungan', 'Pengguna & peran', 'Jejak audit', 'Kunci API', 'Integrasi',
]

const HARGA = [
  { nama: 'Mulai', harga: 149_000, fitur: ['1 cabang', '3 pengguna', 'Katalog & pesanan', 'Laporan dasar'] },
  { nama: 'Tumbuh', harga: 399_000, unggulan: true, fitur: ['5 cabang', '15 pengguna', 'Stok & produksi', 'Notifikasi WhatsApp', 'Jejak audit'] },
  { nama: 'Skala', harga: 899_000, fitur: ['Cabang tanpa batas', 'Pengguna tanpa batas', 'Kunci API', 'Peran khusus', 'SLA 99,9%'] },
]

const TESTIMONI = [
  { nama: 'Dewi Kusuma', jabatan: 'Pemilik, Toko Berkah Jaya', teks: 'Dulu rekap penjualan makan waktu dua jam tiap malam. Sekarang tinggal buka dasbor sebelum tutup toko.' },
  { nama: 'Rizky Pratama', jabatan: 'Manajer Operasional, CV Mitra Jaya', teks: 'Yang paling membantu itu hak akses per peran. Tim gudang tidak lagi bisa mengubah harga tanpa sengaja.' },
  { nama: 'Sari Anggraini', jabatan: 'Staf Keuangan, PT Sinar Abadi', teks: 'Faktur dan jejak audit jadi satu tempat. Waktu audit internal kemarin, semuanya tinggal diekspor.' },
]

const TANYA = [
  { t: 'Apakah bisa dipakai tanpa koneksi internet?', j: 'Panel ini butuh koneksi untuk menyimpan data ke server. Namun antarmukanya tetap ringan, jadi masih nyaman dipakai di jaringan yang lambat.' },
  { t: 'Bagaimana kalau kami sudah punya sistem sendiri?', j: 'Panel ini bisa disambungkan ke backend mana pun lewat lapisan adapter. Anda cukup menyediakan endpoint REST dengan bentuk balasan yang sudah ditentukan.' },
  { t: 'Apakah data kami aman?', j: 'Autentikasi memakai Google, jadi tidak ada kata sandi yang kami simpan. Izin ditegakkan di sisi server, dan setiap perubahan data penting tercatat di jejak audit.' },
  { t: 'Bisa dicoba dulu?', j: 'Bisa. Masuk ke mode peraga dan pilih peran mana pun untuk melihat langsung perbedaan hak aksesnya, tanpa perlu mendaftar.' },
]

function Beranda() {
  const { efektif, setTema } = useTema()
  const [menuHp, setMenuHp] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      {/* Navigasi */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/beranda" aria-label="Beranda">
            <Logo />
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-control px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Tombol
              varian="hantu"
              ukuran="ikon"
              aria-label="Ganti tema"
              onClick={() => setTema(efektif === 'gelap' ? 'terang' : 'gelap')}
            >
              {efektif === 'gelap' ? <Sun /> : <Moon />}
            </Tombol>
            <Tombol asChild className="hidden sm:inline-flex">
              <Link to="/masuk">Masuk</Link>
            </Tombol>
            <Tombol varian="hantu" ukuran="ikon" className="md:hidden" onClick={() => setMenuHp((m) => !m)} aria-label="Buka menu">
              {menuHp ? <X /> : <Menu />}
            </Tombol>
          </div>
        </div>

        {menuHp ? (
          <nav className="border-t border-border p-3 md:hidden" aria-label="Navigasi ponsel">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuHp(false)}
                className="block rounded-control px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                {n.label}
              </a>
            ))}
            <Tombol asChild className="mt-2 w-full">
              <Link to="/masuk">Masuk</Link>
            </Tombol>
          </nav>
        ) : null}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
          <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-primary/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-32 size-96 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <Lencana warna="primary" className="mx-auto">
              <Sparkles className="size-3" /> Vite 8 · React 19 · Tailwind 4
            </Lencana>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Panel admin yang siap pakai untuk{' '}
              <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                usaha Indonesia
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Pesanan, stok, keuangan, dan tim dalam satu tempat — dengan hak akses per peran,
              mode gelap, dan antarmuka Bahasa Indonesia sejak baris pertama.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Tombol ukuran="lg" asChild>
                <Link to="/masuk">Coba mode peraga <ArrowRight /></Link>
              </Tombol>
              <Tombol varian="garis" ukuran="lg" asChild>
                <a href="#fitur">Lihat fitur</a>
              </Tombol>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Tanpa pendaftaran · Tanpa kartu kredit · Langsung bisa dicoba
            </p>
          </div>

          {/* Pratinjau antarmuka — murni CSS, bukan tangkapan layar */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <Kartu className="overflow-hidden shadow-raised">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-danger" />
                <span className="size-2.5 rounded-full bg-warning" />
                <span className="size-2.5 rounded-full bg-success" />
                <span className="ml-3 truncate font-mono text-xs text-muted-foreground">panel.usahaanda.id</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[180px_1fr]">
                <div className="space-y-1.5 border-r border-border p-3">
                  {[LayoutDashboard, ChartPie, Boxes, Users].map((Ikon, i) => (
                    <div key={i} className={cn('flex items-center gap-2.5 rounded-control px-2.5 py-2', i === 0 && 'bg-primary text-primary-foreground')}>
                      <Ikon className="size-4 shrink-0" />
                      <span className={cn('hidden h-2 flex-1 rounded-full sm:block', i === 0 ? 'bg-primary-foreground/40' : 'bg-muted-foreground/25')} />
                    </div>
                  ))}
                </div>
                <div className="space-y-3 p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {['primary', 'success', 'warning'].map((w) => (
                      <div key={w} className="rounded-card border border-border p-3">
                        <span className="block h-2 w-10 rounded-full bg-muted-foreground/25" />
                        <span className={cn('mt-2 block h-4 w-16 rounded', w === 'primary' && 'bg-primary/70', w === 'success' && 'bg-success/70', w === 'warning' && 'bg-warning/70')} />
                      </div>
                    ))}
                  </div>
                  <div className="flex h-32 items-end gap-2 rounded-card border border-border p-3">
                    {[45, 70, 38, 88, 60, 76, 52, 94].map((t, i) => (
                      <span key={i} className={cn('flex-1 rounded-t', i % 2 ? 'bg-secondary/60' : 'bg-primary/70')} style={{ height: `${t}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </Kartu>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <Lencana warna="primary">Fitur</Lencana>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Dibangun dari kebutuhan nyata</h2>
              <p className="mt-3 text-muted-foreground">
                Bukan daftar fitur pemasaran — setiap butir di bawah lahir dari masalah yang
                benar-benar muncul saat mengelola usaha sehari-hari.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FITUR.map((f) => (
                <Kartu key={f.judul} className="transition-shadow hover:shadow-raised">
                  <IsiKartu>
                    <span className="grid size-11 place-items-center rounded-card bg-primary-soft text-primary-kuat">
                      <f.ikon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{f.judul}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.teks}</p>
                  </IsiKartu>
                </Kartu>
              ))}
            </div>
          </div>
        </section>

        {/* Modul */}
        <section id="modul" className="scroll-mt-20 border-t border-border bg-muted/40 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <Lencana warna="secondary">Modul</Lencana>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Delapan belas modul siap pakai</h2>
              <p className="mt-3 text-muted-foreground">
                Semuanya sudah tersambung ke lapisan data yang sama, jadi menambah modul baru
                tinggal menyalin pola yang ada.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-2.5">
              {MODUL.map((m) => (
                <span
                  key={m}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-soft"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Harga */}
        <section id="harga" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <Lencana warna="success">Harga</Lencana>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Bayar sesuai ukuran tim</h2>
              <p className="mt-3 text-muted-foreground">Bisa naik atau turun paket kapan saja, tanpa penalti.</p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {HARGA.map((p) => (
                <Kartu key={p.nama} className={cn('relative flex flex-col', p.unggulan && 'border-primary shadow-raised lg:-my-2')}>
                  {p.unggulan ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Lencana warna="primary" padat><Sparkles className="size-3" /> Paling populer</Lencana>
                    </span>
                  ) : null}
                  <IsiKartu className="flex flex-1 flex-col">
                    <h3 className="text-lg font-bold">{p.nama}</h3>
                    <p className="mt-4">
                      <span className="text-3xl font-extrabold tracking-tight">{formatRp(p.harga)}</span>
                      <span className="text-sm text-muted-foreground"> /bulan</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {p.fitur.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 size-4 shrink-0 text-success-kuat" strokeWidth={3} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Tombol className="mt-7 w-full" varian={p.unggulan ? 'utama' : 'garis'} ukuran="lg" asChild>
                      <Link to="/masuk">Pilih {p.nama}</Link>
                    </Tombol>
                  </IsiKartu>
                </Kartu>
              ))}
            </div>
          </div>
        </section>

        {/* Testimoni */}
        <section className="border-t border-border bg-muted/40 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <Lencana warna="warning">Testimoni</Lencana>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Kata mereka yang memakainya</h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {TESTIMONI.map((t) => (
                <Kartu key={t.nama}>
                  <IsiKartu>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((b) => (
                        <Star key={b} className="size-4 fill-warning text-warning-kuat" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed">&ldquo;{t.teks}&rdquo;</p>
                    <div className="mt-5 flex items-center gap-3">
                      <Avatar nama={t.nama} ukuran="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{t.nama}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.jabatan}</p>
                      </div>
                    </div>
                  </IsiKartu>
                </Kartu>
              ))}
            </div>
          </div>
        </section>

        {/* Tanya jawab */}
        <section id="tanya-jawab" className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <Lencana warna="info">Tanya jawab</Lencana>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight">Pertanyaan yang sering muncul</h2>
            </div>

            <Kartu className="mt-10">
              <IsiKartu>
                <Akordeon type="single" collapsible defaultValue="t-0">
                  {TANYA.map((q, i) => (
                    <ItemAkordeon key={q.t} value={`t-${i}`}>
                      <PemicuAkordeon>{q.t}</PemicuAkordeon>
                      <IsiAkordeon>{q.j}</IsiAkordeon>
                    </ItemAkordeon>
                  ))}
                </Akordeon>
              </IsiKartu>
            </Kartu>
          </div>
        </section>

        {/* Ajakan */}
        <section className="border-t border-border px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <Kartu className="overflow-hidden bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <IsiKartu className="relative py-14 text-center">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
                <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Siap merapikan operasional Anda?
                </h2>
                <p className="relative mx-auto mt-3 max-w-md text-sm opacity-90">
                  Masuk ke mode peraga dan coba sendiri — tidak perlu mendaftar apa pun.
                </p>
                <Tombol
                  varian="garis"
                  ukuran="lg"
                  className="relative mt-7 border-white/40 bg-white/15 text-white hover:bg-white/25"
                  asChild
                >
                  <Link to="/masuk">Mulai sekarang <ArrowRight /></Link>
                </Tombol>
              </IsiKartu>
            </Kartu>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Ozora. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#fitur" className="hover:text-primary-kuat">Fitur</a>
            <a href="#harga" className="hover:text-primary-kuat">Harga</a>
            <Link to="/masuk" className="hover:text-primary-kuat">Masuk</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const Route = createFileRoute('/beranda')({ component: Beranda })
