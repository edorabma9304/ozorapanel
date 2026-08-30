import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Package, ShoppingBag, Star, TrendingUp, Users, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Sparkline } from '@/components/bagan/sparkline'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar, TumpukanAvatar } from '@/components/ui/avatar'
import { formatAngka, formatPersen, formatRp, formatRpRingkas } from '@/lib/format'
import { DERET_PENGUNJUNG, PENGGUNA_CONTOH, PRODUK_CONTOH } from '@/lib/adapter/data-contoh'

function HalamanWidgetKartu() {
  const produk = PRODUK_CONTOH[3]!

  return (
    <>
      <KepalaHalaman
        judul="Widget kartu"
        deskripsi="Blok siap pakai untuk menyusun dasbor baru dengan cepat."
        remah={[{ label: 'Widget' }, { label: 'Kartu' }]}
      />

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Kartu statistik</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KartuStatistik label="Pendapatan" nilai={formatRpRingkas(48_500_000)} ikon={Wallet} warna="primary" tren={0.124} keterangan="vs bulan lalu" />
          <KartuStatistik label="Pesanan" nilai={formatAngka(1284)} ikon={ShoppingBag} warna="success" tren={-0.031} keterangan="vs bulan lalu" />
          <KartuStatistik label="Pelanggan" nilai={formatAngka(842)} ikon={Users} warna="warning" keterangan="total terdaftar" />
          <KartuStatistik label="Produk" nilai={formatAngka(60)} ikon={Package} warna="info" keterangan="aktif di katalog" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Dengan grafik mini</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KartuStatistik label="Kunjungan" nilai={formatAngka(24_820)} warna="primary" tren={0.082} deret={DERET_PENGUNJUNG} />
          <KartuStatistik label="Konversi" nilai={formatPersen(0.034, 1)} warna="success" tren={0.011} deret={DERET_PENGUNJUNG.slice(5)} />
          <KartuStatistik label="Retur" nilai={formatAngka(38)} warna="danger" tren={0.006} deret={DERET_PENGUNJUNG.slice(10)} />
          <KartuStatistik label="Ulasan" nilai={formatAngka(412)} warna="warning" tren={0.045} deret={DERET_PENGUNJUNG.slice(2)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Kartu konten</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Kartu dasar</JudulKartu>
                <DeskripsiKartu>Kepala, isi, dan kaki</DeskripsiKartu>
              </div>
              <Lencana warna="primary">Baru</Lencana>
            </KepalaKartu>
            <IsiKartu>
              <p className="text-sm text-muted-foreground">
                Susunan paling umum: judul di atas, isi di tengah, tombol aksi di bawah.
              </p>
            </IsiKartu>
            <KakiKartu className="justify-end">
              <Tombol varian="garis" ukuran="sm">Batal</Tombol>
              <Tombol ukuran="sm">Simpan</Tombol>
            </KakiKartu>
          </Kartu>

          <Kartu className="overflow-hidden">
            <div className="grid aspect-video place-items-center bg-primary-soft">
              <img src={produk.gambar} alt="" width={80} height={80} className="size-20 rounded-full" />
            </div>
            <IsiKartu>
              <Lencana warna="primary" ukuran="sm">{produk.kategori}</Lencana>
              <h3 className="mt-2 text-base font-bold">{produk.nama}</h3>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-warning text-warning-kuat" /> {produk.rating} · {formatAngka(produk.terjual)} terjual
              </p>
              <p className="mt-3 text-lg font-extrabold">{formatRp(produk.harga)}</p>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <IsiKartu className="text-center">
              <Avatar nama={PENGGUNA_CONTOH[2]!.nama} src={PENGGUNA_CONTOH[2]!.avatar_url} ukuran="xl" className="mx-auto" />
              <h3 className="mt-3 text-base font-bold">{PENGGUNA_CONTOH[2]!.nama}</h3>
              <p className="text-sm text-muted-foreground">{PENGGUNA_CONTOH[2]!.jabatan}</p>
              <div className="mt-4 flex justify-center gap-6 text-center">
                <div>
                  <p className="text-lg font-extrabold">128</p>
                  <p className="text-xs text-muted-foreground">Pesanan</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold">{formatRpRingkas(84_000_000)}</p>
                  <p className="text-xs text-muted-foreground">Nilai</p>
                </div>
              </div>
              <Tombol className="mt-5 w-full" varian="halus">Lihat profil</Tombol>
            </IsiKartu>
          </Kartu>

          <Kartu className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
            <IsiKartu>
              <p className="text-sm font-semibold opacity-90">Saldo tersedia</p>
              <p className="mt-2 text-3xl font-extrabold">{formatRp(12_480_000)}</p>
              <p className="mt-1 flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="size-4" /> naik {formatPersen(0.082)} bulan ini
              </p>
              <div className="mt-5 flex gap-2">
                <Tombol varian="garis" ukuran="sm" className="border-white/40 bg-white/15 text-white hover:bg-white/25">
                  Tarik dana
                </Tombol>
                <Tombol varian="hantu" ukuran="sm" className="text-white hover:bg-white/15">
                  Riwayat <ArrowUpRight />
                </Tombol>
              </div>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Proyek berjalan</JudulKartu>
                <DeskripsiKartu>Migrasi data pelanggan</DeskripsiKartu>
              </div>
              <TumpukanAvatar orang={PENGGUNA_CONTOH.slice(0, 4).map((p) => ({ nama: p.nama, avatar: p.avatar_url }))} maks={3} ukuran="xs" />
            </KepalaKartu>
            <IsiKartu>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Kemajuan</span>
                <span className="font-bold">68%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-primary" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Tenggat 14 September 2026</p>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <IsiKartu>
              <p className="text-sm font-semibold text-muted-foreground">Tren mingguan</p>
              <p className="mt-1 text-2xl font-extrabold">{formatAngka(8_420)}</p>
              <div className="mt-4">
                <Sparkline nilai={DERET_PENGUNJUNG.slice(0, 14)} warna="#13deb9" tinggi={72} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>Sen</span>
                <span>Ming</span>
              </div>
            </IsiKartu>
          </Kartu>
        </div>
      </section>
    </>
  )
}

export const Route = createFileRoute('/_app/widget/kartu')({ component: HalamanWidgetKartu })
