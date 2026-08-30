import { createFileRoute } from '@tanstack/react-router'
import {
  Bell, Check, ChevronRight, Download, ExternalLink, Package, Play, Star, Trash2, Truck, Upload,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { BagianPeraga } from '@/components/data/bagian-peraga'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres, ProgresCincin } from '@/components/ui/progres'
import { Korsel } from '@/components/ui/korsel'
import { Pita } from '@/components/ui/pita'
import { Tombol, GrupTombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Pemisah } from '@/components/ui/lapisan'
import { formatRp } from '@/lib/format'
import { gambarPeraga, PRODUK_CONTOH, PENGGUNA_CONTOH } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const WARNA = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const

function KomponenLanjutan() {
  const [tampil, setTampil] = useState('kisi')
  const [nilai, setNilai] = useState(64)

  return (
    <>
      <KepalaHalaman
        judul="Komponen lanjutan"
        deskripsi="Kemajuan, korsel, pita, grup tombol, daftar, dan notifikasi — pelengkap galeri komponen dasar."
        remah={[{ label: 'Elemen UI' }, { label: 'Komponen lanjutan' }]}
      />

      <BagianPeraga
        judul="Bilah kemajuan"
        deskripsi="Tiga ketebalan, enam warna, opsional bergaris untuk proses yang masih berjalan."
        aksi={
          <GrupTombol>
            <Tombol varian="garis" ukuran="sm" onClick={() => setNilai((n) => Math.max(0, n - 10))}>−10</Tombol>
            <Tombol varian="garis" ukuran="sm" onClick={() => setNilai((n) => Math.min(100, n + 10))}>+10</Tombol>
          </GrupTombol>
        }
      >
        <div className="w-full space-y-5">
          <Progres nilai={nilai} label="Kemajuan unggahan" tampilkanNilai />
          <Progres nilai={nilai} warna="success" tebal="sm" label="Tipis" tampilkanNilai />
          <Progres nilai={nilai} warna="warning" tebal="lg" label="Tebal" tampilkanNilai />
          <Progres nilai={nilai} warna="info" bergaris label="Bergaris (proses berjalan)" tampilkanNilai />
          <div className="grid gap-3 sm:grid-cols-3">
            {WARNA.slice(0, 3).map((w) => (
              <Progres key={w} nilai={nilai} warna={w} tebal="sm" label={w} />
            ))}
          </div>
        </div>
      </BagianPeraga>

      <BagianPeraga judul="Cincin kemajuan" deskripsi="SVG murni — tanpa ApexCharts, jadi ringan dipakai di kartu mana pun.">
        <ProgresCincin nilai={nilai} />
        <ProgresCincin nilai={nilai} warna="success" ukuran={112} tebal={10} />
        <ProgresCincin nilai={nilai} warna="warning" ukuran={128} tebal={12}>
          <span className="text-center">
            <span className="block text-lg font-extrabold">{nilai}</span>
            <span className="block text-[10px] text-muted-foreground">dari 100</span>
          </span>
        </ProgresCincin>
        <ProgresCincin nilai={100 - nilai} warna="danger" ukuran={80} tebal={7} />
      </BagianPeraga>

      <BagianPeraga judul="Grup tombol" deskripsi="Tersegmentasi — sudut membulat hanya di ujung.">
        <GrupTombol>
          <Tombol varian={tampil === 'kisi' ? 'utama' : 'garis'} onClick={() => setTampil('kisi')}>Kisi</Tombol>
          <Tombol varian={tampil === 'daftar' ? 'utama' : 'garis'} onClick={() => setTampil('daftar')}>Daftar</Tombol>
          <Tombol varian={tampil === 'papan' ? 'utama' : 'garis'} onClick={() => setTampil('papan')}>Papan</Tombol>
        </GrupTombol>

        <GrupTombol>
          <Tombol varian="garis" ukuran="ikon" aria-label="Unduh"><Download /></Tombol>
          <Tombol varian="garis" ukuran="ikon" aria-label="Unggah"><Upload /></Tombol>
          <Tombol varian="garis" ukuran="ikon" aria-label="Hapus"><Trash2 /></Tombol>
        </GrupTombol>

        <GrupTombol>
          <Tombol varian="halus" ukuran="sm">Harian</Tombol>
          <Tombol varian="halus" ukuran="sm">Mingguan</Tombol>
          <Tombol varian="halus" ukuran="sm">Bulanan</Tombol>
          <Tombol varian="halus" ukuran="sm">Tahunan</Tombol>
        </GrupTombol>
      </BagianPeraga>

      <BagianPeraga judul="Pita penanda" deskripsi="Tiga bentuk, dipasang di kartu ber-`relative overflow-hidden`.">
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {PRODUK_CONTOH.slice(0, 3).map((p, i) => (
            <Kartu key={p.id} className="relative overflow-hidden">
              <Pita
                warna={(['danger', 'success', 'warning'] as const)[i]}
                bentuk={(['sudut', 'ekor', 'lurus'] as const)[i]}
                posisi={i === 2 ? 'kanan-atas' : 'kiri-atas'}
              >
                {['-30%', 'Baru', 'Terlaris'][i]}
              </Pita>
              <IsiKartu className="pt-12">
                <div className="grid aspect-square place-items-center rounded-card bg-muted">
                  <img src={p.gambar} alt="" width={72} height={72} className="size-18 rounded-full" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-bold">{p.nama}</p>
                <p className="mt-1 font-extrabold">{formatRp(p.harga)}</p>
              </IsiKartu>
            </Kartu>
          ))}
        </div>
      </BagianPeraga>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Korsel</JudulKartu>
            <DeskripsiKartu>
              Memakai scroll-snap bawaan peramban — gesekan jari di ponsel langsung bekerja.
            </DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Korsel otomatis className="overflow-hidden rounded-card">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative grid h-64 place-items-center">
                <img src={gambarPeraga(`korsel-${i}`, 1200, 400)} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="relative text-center text-white drop-shadow">
                  <p className="text-2xl font-extrabold">Slide {i + 1}</p>
                  <p className="mt-1 text-sm opacity-90">Geser, klik panah, atau tunggu otomatis</p>
                </div>
              </div>
            ))}
          </Korsel>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Daftar</JudulKartu>
              <DeskripsiKartu>Tiga pola daftar yang paling sering dipakai</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-6">
            <div>
              <p className="mb-2.5 text-sm font-bold">Daftar bertanda</p>
              <ul className="space-y-2 text-sm">
                {['Stok tersinkron otomatis', 'Laporan bisa diekspor', 'Hak akses per peran'].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-success-kuat" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <Pemisah />

            <div>
              <p className="mb-2.5 text-sm font-bold">Daftar dengan avatar</p>
              <ul className="divide-y divide-border">
                {PENGGUNA_CONTOH.slice(1, 4).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{p.nama}</span>
                      <span className="block truncate text-xs text-muted-foreground">{p.jabatan}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </div>

            <Pemisah />

            <div>
              <p className="mb-2.5 text-sm font-bold">Daftar deskripsi</p>
              <dl className="space-y-2.5 text-sm">
                {[['Nomor pesanan', 'INV-2026-1042'], ['Kurir', 'JNE Reguler'], ['Estimasi tiba', '2–3 hari kerja']].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border pb-2.5 last:border-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Notifikasi &amp; tautan</JudulKartu>
              <DeskripsiKartu>Toast memakai sonner; tautan memakai token warna</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Tombol varian="garis" ukuran="sm" onClick={() => toast.success('Data berhasil disimpan.')}>Sukses</Tombol>
              <Tombol varian="garis" ukuran="sm" onClick={() => toast.error('Koneksi ke server terputus.')}>Galat</Tombol>
              <Tombol varian="garis" ukuran="sm" onClick={() => toast.warning('Stok tinggal 4 unit.')}>Perhatian</Tombol>
              <Tombol varian="garis" ukuran="sm" onClick={() => toast.info('Sinkronisasi berjalan di latar belakang.')}>Info</Tombol>
              <Tombol
                varian="garis"
                ukuran="sm"
                onClick={() =>
                  toast('Pesanan dihapus', {
                    description: 'INV-2026-1042 dipindahkan ke arsip.',
                    action: { label: 'Urungkan', onClick: () => toast.success('Dipulihkan.') },
                  })
                }
              >
                Dengan aksi
              </Tombol>
              <Tombol
                varian="garis"
                ukuran="sm"
                onClick={() => {
                  const janji = new Promise((r) => setTimeout(r, 1500))
                  toast.promise(janji, { loading: 'Mengunggah…', success: 'Berkas terunggah.', error: 'Gagal mengunggah.' })
                }}
              >
                Berproses
              </Tombol>
            </div>

            <Pemisah />

            <div className="space-y-3 text-sm">
              <p className="font-bold">Tautan</p>
              <p>
                Tautan dalam kalimat memakai{' '}
                <a href="#tautan" className="font-semibold text-primary-kuat hover:underline">warna primary</a>{' '}
                dan garis bawah saat disentuh kursor.
              </p>
              <p>
                Tautan keluar sebaiknya diberi ikon:{' '}
                <a
                  href="https://ozora.id"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-primary-kuat hover:underline"
                >
                  buka situs <ExternalLink className="size-3.5" />
                </a>
              </p>
              <div className="flex flex-wrap gap-3">
                <Lencana warna="primary" className="gap-1.5"><Bell className="size-3" /> 3 pemberitahuan</Lencana>
                <Lencana warna="success" className="gap-1.5"><Truck className="size-3" /> Dikirim</Lencana>
                <Lencana warna="warning" className="gap-1.5"><Package className="size-3" /> Dikemas</Lencana>
                <Lencana warna="info" className="gap-1.5"><Star className="size-3" /> 4,8</Lencana>
              </div>
            </div>
          </IsiKartu>
        </Kartu>
      </div>

      <BagianPeraga judul="Gambar" deskripsi="Rasio aspek tetap + lazy loading supaya tidak menggeser tata letak.">
        <div className="grid w-full gap-4 sm:grid-cols-3">
          {(['aspect-square', 'aspect-video', 'aspect-4/3'] as const).map((rasio, i) => (
            <figure key={rasio}>
              <img
                src={gambarPeraga(`rasio-${i}`, 600, 450)}
                alt={`Contoh gambar rasio ${rasio}`}
                width={600}
                height={450}
                loading="lazy"
                className={cn('w-full rounded-card object-cover', rasio)}
              />
              <figcaption className="mt-2 font-mono text-xs text-muted-foreground">{rasio}</figcaption>
            </figure>
          ))}
        </div>
        <div className="w-full">
          <p className="mb-2.5 text-sm font-bold">Dengan hamparan</p>
          <div className="relative overflow-hidden rounded-card">
            <img src={gambarPeraga('hamparan', 1200, 400)} alt="" width={1200} height={400} loading="lazy" className="aspect-21/9 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute bottom-0 p-5 text-white">
              <p className="text-lg font-extrabold">Judul di atas gambar</p>
              <p className="text-sm opacity-90">Gradien memastikan teks tetap terbaca.</p>
            </div>
            <Tombol varian="garis" ukuran="ikon" className="absolute right-4 top-4 border-white/40 bg-white/20 text-white" aria-label="Putar">
              <Play />
            </Tombol>
          </div>
        </div>
      </BagianPeraga>
    </>
  )
}

export const Route = createFileRoute('/_app/ui/lanjutan')({ component: KomponenLanjutan })
