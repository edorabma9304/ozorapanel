import { createFileRoute } from '@tanstack/react-router'
import { Award, Package, RefreshCcw, ShoppingCart, TrendingUp, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel } from '@/components/ui/tabel'
import { formatAngka, formatPersen, formatRp, formatRpRingkas } from '@/lib/format'
import {
  BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGUNJUNG, GERBANG_BAYAR, PELANGGAN_CONTOH,
  PRODUK_CONTOH, TRANSAKSI_CONTOH,
} from '@/lib/adapter/data-contoh'

function DasborToko() {
  const kategori = [...new Set(PRODUK_CONTOH.map((p) => p.kategori))]
  const perKategori = kategori.map(
    (k) => PRODUK_CONTOH.filter((p) => p.kategori === k).reduce((a, b) => a + b.terjual, 0),
  )
  const pembeliTeratas = [...PELANGGAN_CONTOH].sort((a, b) => b.total_belanja - a.total_belanja).slice(0, 6)
  const stokMenipis = PRODUK_CONTOH.filter((p) => p.stok < 20).slice(0, 5)

  return (
    <>
      <KepalaHalaman
        judul="Dasbor toko online"
        deskripsi="Performa penjualan, produk, dan pelanggan dalam satu tampilan."
        remah={[{ label: 'Beranda' }, { label: 'Toko online' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Penjualan bulan ini" nilai={formatRpRingkas(DERET_PENDAPATAN[7] ?? 0)} ikon={Wallet} warna="primary" tren={0.124} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(0, 14)} />
        <KartuStatistik label="Pesanan" nilai={formatAngka(1284)} ikon={ShoppingCart} warna="success" tren={0.061} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(4, 18)} />
        <KartuStatistik label="Nilai rata-rata" nilai={formatRp(387_500)} ikon={TrendingUp} warna="info" tren={-0.024} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(8, 22)} />
        <KartuStatistik label="Retur" nilai={formatAngka(38)} ikon={RefreshCcw} warna="danger" tren={0.008} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(12, 26)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Penjualan sepanjang tahun</JudulKartu>
              <DeskripsiKartu>Nilai transaksi per bulan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={320}
              deret={[{ name: 'Penjualan', data: DERET_PENDAPATAN }]}
              opsi={{
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                fill: { type: 'gradient', gradient: { shadeIntensity: 0.5, opacityFrom: 0.4, opacityTo: 0.02 } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Penjualan per kategori</JudulKartu>
              <DeskripsiKartu>Jumlah unit terjual</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="pie"
              tinggi={320}
              deret={perKategori}
              opsi={{ labels: kategori, legend: { position: 'bottom', horizontalAlign: 'center' } }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Pembeli teratas</JudulKartu>
              <DeskripsiKartu>Berdasarkan total belanja</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="px-0 pt-3">
            <BingkaiTabel>
              <Tabel>
                <KepalaTabel>
                  <tr>
                    <SelKepala>Pelanggan</SelKepala>
                    <SelKepala className="text-right">Pesanan</SelKepala>
                    <SelKepala className="text-right">Total belanja</SelKepala>
                  </tr>
                </KepalaTabel>
                <BadanTabel>
                  {pembeliTeratas.map((p) => (
                    <BarisTabel key={p.id}>
                      <Sel>
                        <div className="flex items-center gap-3">
                          <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{p.nama}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.kota}</p>
                          </div>
                        </div>
                      </Sel>
                      <Sel className="text-right">{formatAngka(p.jumlah_pesanan)}</Sel>
                      <Sel className="text-right font-semibold">{formatRpRingkas(p.total_belanja)}</Sel>
                    </BarisTabel>
                  ))}
                </BadanTabel>
              </Tabel>
            </BingkaiTabel>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Stok menipis</JudulKartu>
              <DeskripsiKartu>Perlu segera dipesan ulang</DeskripsiKartu>
            </div>
            <Lencana warna="warning">{stokMenipis.length} produk</Lencana>
          </KepalaKartu>
          <IsiKartu className="space-y-3">
            {stokMenipis.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar nama={p.nama} src={p.gambar} ukuran="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.nama}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={p.stok < 8 ? 'h-full rounded-full bg-danger' : 'h-full rounded-full bg-warning'}
                      style={{ width: `${Math.min(100, (p.stok / 40) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold">{p.stok}</span>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>


      {/* Gerbang pembayaran */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {GERBANG_BAYAR.map((g) => {
          const naik = g.nilai >= 0
          return (
            <Kartu key={g.nama} className="p-5">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-card text-sm font-extrabold',
                    g.warna === 'primary' && 'bg-primary-soft text-primary-kuat',
                    g.warna === 'success' && 'bg-success-soft text-success-kuat',
                    g.warna === 'info' && 'bg-info-soft text-info-kuat',
                    g.warna === 'danger' && 'bg-danger-soft text-danger-kuat',
                  )}
                >
                  {g.huruf}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-muted-foreground">{g.nama}</p>
                  <p className={cn('mt-0.5 text-lg font-extrabold', !naik && 'text-danger-kuat')}>
                    {naik ? '+' : ''}{formatRpRingkas(g.nilai)}
                  </p>
                </div>
                <Lencana warna={g.ubah >= 0 ? 'success' : 'danger'} ukuran="sm">
                  {g.ubah >= 0 ? '+' : '-'}{formatPersen(Math.abs(g.ubah), 1)}
                </Lencana>
              </div>
            </Kartu>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Segmentasi pelanggan */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Segmentasi pelanggan</JudulKartu>
              <DeskripsiKartu>Nilai transaksi menurut jenis pembeli</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="donut"
              tinggi={260}
              deret={[68, 32]}
              opsi={{
                labels: ['Badan usaha', 'Perorangan'],
                colors: ['#5d87ff', '#13deb9'],
                legend: { position: 'bottom', horizontalAlign: 'center' },
                plotOptions: { pie: { donut: { size: '72%' } } },
                tooltip: { y: { formatter: (v) => `${v}%` } },
              }}
            />
            <div className="mt-2 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-card bg-muted/60 p-3">
                <p className="text-sm font-extrabold">{formatRpRingkas(36_358_000)}</p>
                <p className="text-xs text-muted-foreground">Badan usaha</p>
              </div>
              <div className="rounded-card bg-muted/60 p-3">
                <p className="text-sm font-extrabold">{formatRpRingkas(5_296_000)}</p>
                <p className="text-xs text-muted-foreground">Perorangan</p>
              </div>
            </div>
          </IsiKartu>
        </Kartu>

        {/* Transaksi terbaru */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Transaksi terbaru</JudulKartu>
              <DeskripsiKartu>Aktivitas hari ini</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {TRANSAKSI_CONTOH.map((t) => (
                <li key={t.id} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2 border-card',
                      t.warna === 'primary' && 'bg-primary',
                      t.warna === 'success' && 'bg-success',
                      t.warna === 'warning' && 'bg-warning',
                      t.warna === 'danger' && 'bg-danger',
                      t.warna === 'info' && 'bg-info',
                      t.warna === 'secondary' && 'bg-secondary',
                    )}
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{t.judul}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{t.jam}</span>
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">{t.detail}</p>
                  <p className={cn('text-sm font-bold', t.nilai < 0 ? 'text-danger-kuat' : 'text-success-kuat')}>
                    {t.nilai < 0 ? '' : '+'}{formatRpRingkas(t.nilai)}
                  </p>
                </li>
              ))}
            </ol>
          </IsiKartu>
        </Kartu>

        {/* Statistik kuartal */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Sorotan kuartal</JudulKartu>
              <DeskripsiKartu>Peringkat tiga bulan terakhir</DeskripsiKartu>
            </div>
            <Award className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {[
              { label: 'Penjualan tertinggi', nama: pembeliTeratas[0]?.nama ?? '—', nilai: '+76', warna: 'success' as const },
              { label: 'Kategori terlaris', nama: kategori[0] ?? '—', nilai: '+68', warna: 'primary' as const },
              { label: 'Produk paling diulas', nama: [...PRODUK_CONTOH].sort((a, b) => b.terjual - a.terjual)[0]?.nama ?? '—', nilai: '+52', warna: 'warning' as const },
              { label: 'Kota pengiriman utama', nama: 'Yogyakarta', nilai: '+41', warna: 'info' as const },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3 border-b border-border pb-3.5 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="truncate text-sm font-semibold">{s.nama}</p>
                </div>
                <Lencana warna={s.warna}>{s.nilai}</Lencana>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Produk paling menguntungkan</JudulKartu>
            <DeskripsiKartu>Selisih harga jual dan harga modal, dikali unit terjual</DeskripsiKartu>
          </div>
          <Package className="size-5 text-muted-foreground" />
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="bar"
            tinggi={300}
            deret={[
              {
                name: 'Laba kotor',
                data: [...PRODUK_CONTOH]
                  .map((p) => ({ x: p.nama, y: (p.harga - p.harga_modal) * p.terjual }))
                  .sort((a, b) => b.y - a.y)
                  .slice(0, 8),
              },
            ]}
            opsi={{
              plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '58%' } },
              xaxis: { labels: { formatter: (v) => formatRpRingkas(Number(v)) } },
              tooltip: { y: { formatter: (v) => formatRp(v) } },
            }}
          />
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/toko')({ component: DasborToko })
