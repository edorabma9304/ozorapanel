import { createFileRoute } from '@tanstack/react-router'
import { Award, Handshake, Target, TrendingUp, Users, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { Progres, ProgresCincin } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatPersen, formatRp, formatRpRingkas } from '@/lib/format'
import {
  BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGUNJUNG, PELANGGAN_CONTOH, PENGGUNA_CONTOH,
  PRODUK_CONTOH,
} from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const TARGET_BULAN = 60_000_000
const tercapai = DERET_PENDAPATAN[7] ?? 0

function DasborPenjualan() {
  const { boleh } = useAuth()
  if (!boleh('pesanan.lihat')) return <HalamanTanpaAkses />

  const tim = PENGGUNA_CONTOH.filter((p) => p.peran === 'sales' || p.peran === 'admin').slice(0, 6)
  const terlaris = [...PRODUK_CONTOH].sort((a, b) => b.terjual - a.terjual).slice(0, 6)
  const pembeli = [...PELANGGAN_CONTOH].sort((a, b) => b.total_belanja - a.total_belanja).slice(0, 5)
  const kategori = [...new Set(PRODUK_CONTOH.map((p) => p.kategori))]

  return (
    <>
      <KepalaHalaman
        judul="Dasbor penjualan"
        deskripsi="Pencapaian target, performa tim, produk terlaris, dan pembeli terbesar."
        remah={[{ label: 'Beranda' }, { label: 'Penjualan' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Penjualan bulan ini" nilai={formatRpRingkas(tercapai)} ikon={Wallet} warna="primary" tren={0.118} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(0, 12)} />
        <KartuStatistik label="Kesepakatan menang" nilai={formatAngka(38)} ikon={Handshake} warna="success" tren={0.064} keterangan="bulan ini" deret={DERET_PENGUNJUNG.slice(6, 18)} />
        <KartuStatistik label="Pelanggan baru" nilai={formatAngka(94)} ikon={Users} warna="info" tren={0.027} keterangan="bulan ini" deret={DERET_PENGUNJUNG.slice(10, 22)} />
        <KartuStatistik label="Nilai rata-rata" nilai={formatRp(1_240_000)} ikon={TrendingUp} warna="warning" tren={-0.018} keterangan="per transaksi" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Target bulan ini</JudulKartu>
              <DeskripsiKartu>Terhadap {formatRpRingkas(TARGET_BULAN)}</DeskripsiKartu>
            </div>
            <Target className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="flex flex-col items-center gap-4">
            <ProgresCincin
              nilai={(tercapai / TARGET_BULAN) * 100}
              ukuran={168}
              tebal={14}
              warna={tercapai >= TARGET_BULAN ? 'success' : 'primary'}
            >
              <span className="text-center">
                <span className="block text-2xl font-extrabold">{formatPersen(tercapai / TARGET_BULAN, 0)}</span>
                <span className="block text-xs text-muted-foreground">tercapai</span>
              </span>
            </ProgresCincin>
            <div className="w-full space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tercapai</span>
                <span className="font-bold">{formatRp(tercapai)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa</span>
                <span className="font-bold text-warning-kuat">{formatRp(Math.max(0, TARGET_BULAN - tercapai))}</span>
              </div>
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Penjualan vs target</JudulKartu>
              <DeskripsiKartu>Perbandingan realisasi dan target sepanjang tahun</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={320}
              deret={[
                { name: 'Realisasi', type: 'column', data: DERET_PENDAPATAN },
                { name: 'Target', type: 'line', data: BULAN_SINGKAT.map(() => TARGET_BULAN) },
              ]}
              opsi={{
                colors: ['#5d87ff', '#fa896b'],
                stroke: { width: [0, 3], curve: 'straight', dashArray: [0, 6] },
                plotOptions: { bar: { columnWidth: '55%', borderRadius: 5, borderRadiusApplication: 'end' } },
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { shared: true, intersect: false, y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Peringkat tim penjualan</JudulKartu>
              <DeskripsiKartu>Pencapaian terhadap target pribadi</DeskripsiKartu>
            </div>
            <Award className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {tim.map((t, i) => {
              const capai = [1.12, 0.94, 0.81, 0.68, 0.55, 0.42][i] ?? 0.4
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold',
                      i === 0 ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <Avatar nama={t.nama} src={t.avatar_url} ukuran="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{t.nama}</p>
                      <span className="shrink-0 text-xs font-bold">{formatPersen(capai, 0)}</span>
                    </div>
                    <div className="mt-1.5">
                      <Progres
                        nilai={Math.min(100, capai * 100)}
                        warna={capai >= 1 ? 'success' : capai >= 0.7 ? 'primary' : capai >= 0.5 ? 'warning' : 'danger'}
                        tebal="sm"
                      />
                    </div>
                  </div>
                  {capai >= 1 ? <Lencana warna="success" ukuran="sm">Tercapai</Lencana> : null}
                </div>
              )
            })}
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Penjualan per kategori</JudulKartu>
              <DeskripsiKartu>Kontribusi tiap kategori produk</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={320}
              deret={[
                {
                  name: 'Nilai penjualan',
                  data: kategori.map((k) => ({
                    x: k,
                    y: PRODUK_CONTOH.filter((p) => p.kategori === k).reduce((a, b) => a + b.harga * b.terjual, 0),
                  })),
                },
              ]}
              opsi={{
                plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '58%', distributed: true } },
                legend: { show: false },
                xaxis: { labels: { formatter: (v) => formatRpRingkas(Number(v)) } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu className="overflow-hidden">
          <KepalaKartu className="pb-4">
            <div>
              <JudulKartu>Produk terlaris</JudulKartu>
              <DeskripsiKartu>Enam produk dengan unit terjual tertinggi</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <BingkaiTabel>
            <Tabel>
              <KepalaTabel>
                <tr>
                  <SelKepala>Produk</SelKepala>
                  <SelKepala className="text-right">Terjual</SelKepala>
                  <SelKepala className="text-right">Nilai</SelKepala>
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
                          <p className="truncate text-xs text-muted-foreground">{p.kategori}</p>
                        </div>
                      </div>
                    </Sel>
                    <Sel className="text-right">{formatAngka(p.terjual)}</Sel>
                    <Sel className="text-right font-bold">{formatRpRingkas(p.harga * p.terjual)}</Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
            </Tabel>
          </BingkaiTabel>
        </Kartu>

        <Kartu className="overflow-hidden">
          <KepalaKartu className="pb-4">
            <div>
              <JudulKartu>Pembeli terbesar</JudulKartu>
              <DeskripsiKartu>Berdasarkan total belanja sepanjang waktu</DeskripsiKartu>
            </div>
          </KepalaKartu>
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
                {pembeli.map((p) => (
                  <BarisTabel key={p.id}>
                    <Sel>
                      <div className="flex items-center gap-3">
                        <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.nama}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.perusahaan}</p>
                        </div>
                      </div>
                    </Sel>
                    <Sel className="text-right">{formatAngka(p.jumlah_pesanan)}</Sel>
                    <Sel className="text-right font-bold">{formatRpRingkas(p.total_belanja)}</Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
            </Tabel>
          </BingkaiTabel>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/penjualan')({ component: DasborPenjualan })
