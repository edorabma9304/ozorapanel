import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, Package, Receipt, ShoppingBag, Users, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import {
  DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu,
} from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { formatAngka, formatRp, formatRpRingkas, formatWaktuRelatif } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import {
  BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, DERET_PENGUNJUNG,
  PESANAN_CONTOH, PRODUK_CONTOH,
} from '@/lib/adapter/data-contoh'

const WARNA_STATUS = {
  baru: 'info',
  diproses: 'warning',
  dikirim: 'primary',
  selesai: 'success',
  batal: 'danger',
} as const

function Dasbor() {
  const { pengguna } = useAuth()

  const totalPendapatan = DERET_PENDAPATAN.reduce((a, b) => a + b, 0)
  const totalPengeluaran = DERET_PENGELUARAN.reduce((a, b) => a + b, 0)
  const laba = totalPendapatan - totalPengeluaran

  const terlaris = [...PRODUK_CONTOH].sort((a, b) => b.terjual - a.terjual).slice(0, 5)
  const pesananTerbaru = PESANAN_CONTOH.slice(0, 6)

  return (
    <>
      <KepalaHalaman
        judul={`Halo, ${pengguna?.nama.split(' ')[0] ?? 'Rekan'} 👋`}
        deskripsi="Ringkasan performa bisnis Anda dalam 12 bulan terakhir."
        remah={[{ label: 'Dasbor' }]}
        aksi={
          <>
            <Tombol varian="garis" asChild>
              <Link to="/apl/faktur">
                <Receipt /> Faktur
              </Link>
            </Tombol>
            <Tombol asChild>
              <Link to="/apl/pesanan">
                <ShoppingBag /> Lihat pesanan
              </Link>
            </Tombol>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik
          label="Pendapatan"
          nilai={formatRpRingkas(totalPendapatan)}
          ikon={Wallet}
          warna="primary"
          tren={0.082}
          keterangan="vs tahun lalu"
          deret={DERET_PENDAPATAN.map((n) => Math.round(n / 100_000))}
        />
        <KartuStatistik
          label="Pesanan"
          nilai={formatAngka(PESANAN_CONTOH.length * 14)}
          ikon={ShoppingBag}
          warna="success"
          tren={0.043}
          keterangan="vs bulan lalu"
          deret={DERET_PENGUNJUNG.slice(0, 12)}
        />
        <KartuStatistik
          label="Pelanggan baru"
          nilai={formatAngka(312)}
          ikon={Users}
          warna="warning"
          tren={-0.017}
          keterangan="vs bulan lalu"
          deret={DERET_PENGUNJUNG.slice(6, 18)}
        />
        <KartuStatistik
          label="Produk aktif"
          nilai={formatAngka(PRODUK_CONTOH.filter((p) => p.status === 'terbit').length)}
          ikon={Package}
          warna="info"
          keterangan="dari total katalog"
          deret={DERET_PENGUNJUNG.slice(12, 24)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Pendapatan &amp; pengeluaran</JudulKartu>
              <DeskripsiKartu>Perbandingan arus masuk dan keluar per bulan</DeskripsiKartu>
            </div>
            <Lencana warna="success" ukuran="sm">
              Laba {formatRpRingkas(laba)}
            </Lencana>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={330}
              deret={[
                { name: 'Pendapatan', data: DERET_PENDAPATAN },
                { name: 'Pengeluaran', data: DERET_PENGELUARAN },
              ]}
              opsi={{
                colors: ['#5d87ff', '#49beff'],
                plotOptions: { bar: { columnWidth: '48%', borderRadius: 5, borderRadiusApplication: 'end' } },
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Rincian tahunan</JudulKartu>
                <DeskripsiKartu>Kontribusi tiap kanal penjualan</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu>
              <Bagan
                jenis="donut"
                tinggi={260}
                deret={[44, 26, 18, 12]}
                opsi={{
                  labels: ['Toko online', 'Marketplace', 'Reseller', 'Offline'],
                  legend: { position: 'bottom', horizontalAlign: 'center' },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '72%',
                        labels: {
                          show: true,
                          total: { show: true, label: 'Total', fontWeight: 700 },
                        },
                      },
                    },
                  },
                  tooltip: { y: { formatter: (v) => `${v}%` } },
                }}
              />
            </IsiKartu>
          </Kartu>

          <Kartu>
            <IsiKartu className="pb-0">
              <p className="text-sm font-semibold text-muted-foreground">Target bulan ini</p>
              <p className="mt-1 text-2xl font-extrabold">{formatRpRingkas(48_000_000)}</p>
            </IsiKartu>
            <Bagan
              jenis="radialBar"
              tinggi={200}
              deret={[76]}
              opsi={{
                colors: ['#13deb9'],
                plotOptions: {
                  radialBar: {
                    hollow: { size: '62%' },
                    dataLabels: {
                      name: { show: false },
                      value: { fontSize: '22px', fontWeight: 800, offsetY: 8 },
                    },
                  },
                },
              }}
            />
            <KakiKartu className="justify-center text-sm text-muted-foreground">
              Tersisa {formatRp(11_520_000)} untuk mencapai target
            </KakiKartu>
          </Kartu>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Kartu className="lg:col-span-3">
          <KepalaKartu>
            <div>
              <JudulKartu>Produk terlaris</JudulKartu>
              <DeskripsiKartu>Lima produk dengan penjualan tertinggi</DeskripsiKartu>
            </div>
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/apl/produk">
                Semua <ArrowUpRight />
              </Link>
            </Tombol>
          </KepalaKartu>
          <IsiKartu className="px-0 pb-0 pt-3">
            <BingkaiTabel>
              <Tabel>
                <KepalaTabel>
                  <tr>
                    <SelKepala>Produk</SelKepala>
                    <SelKepala className="hidden sm:table-cell">Kategori</SelKepala>
                    <SelKepala className="text-right">Terjual</SelKepala>
                    <SelKepala className="text-right">Harga</SelKepala>
                  </tr>
                </KepalaTabel>
                <BadanTabel>
                  {terlaris.map((p) => (
                    <BarisTabel key={p.id}>
                      <Sel>
                        <div className="flex items-center gap-3">
                          <Avatar nama={p.nama} src={p.gambar} ukuran="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{p.nama}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.sku}</p>
                          </div>
                        </div>
                      </Sel>
                      <Sel className="hidden sm:table-cell">
                        <Lencana warna="primary" ukuran="sm">{p.kategori}</Lencana>
                      </Sel>
                      <Sel className="text-right font-semibold">{formatAngka(p.terjual)}</Sel>
                      <Sel className="text-right font-semibold">{formatRp(p.harga)}</Sel>
                    </BarisTabel>
                  ))}
                </BadanTabel>
              </Tabel>
            </BingkaiTabel>
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Pesanan terbaru</JudulKartu>
              <DeskripsiKartu>Enam transaksi terakhir</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <ol className="relative space-y-5 border-l border-border pl-5">
              {pesananTerbaru.map((p) => (
                <li key={p.id} className="relative">
                  <span className="absolute -left-[26px] top-1 size-2.5 rounded-full border-2 border-card bg-primary" />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.nomor}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.pelanggan_nama}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold">{formatRpRingkas(p.total)}</p>
                      <Lencana ukuran="sm" warna={WARNA_STATUS[p.status]}>
                        {p.status}
                      </Lencana>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatWaktuRelatif(p.tanggal)}
                  </p>
                </li>
              ))}
            </ol>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/')({
  component: Dasbor,
})
