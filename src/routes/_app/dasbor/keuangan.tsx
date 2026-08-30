import { createFileRoute } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Landmark, PiggyBank, Receipt, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatPersen, formatRp, formatRpRingkas } from '@/lib/format'
import {
  BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, DERET_PENGUNJUNG, TRANSAKSI_KEUANGAN,
} from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const totalMasuk = DERET_PENDAPATAN.reduce((a, b) => a + b, 0)
const totalKeluar = DERET_PENGELUARAN.reduce((a, b) => a + b, 0)
const laba = totalMasuk - totalKeluar

const POS_BIAYA = ['Pembelian bahan', 'Gaji', 'Sewa', 'Listrik & air', 'Ongkir', 'Pemasaran']
const nilaiBiaya = POS_BIAYA.map((k) =>
  TRANSAKSI_KEUANGAN.filter((t) => t.kategori === k).reduce((a, b) => a + b.nominal, 0),
)

const UMUR_PIUTANG = [
  { label: 'Belum jatuh tempo', nilai: 48_200_000, warna: 'success' as const },
  { label: '1–30 hari', nilai: 21_400_000, warna: 'info' as const },
  { label: '31–60 hari', nilai: 12_800_000, warna: 'warning' as const },
  { label: 'Lebih dari 60 hari', nilai: 6_100_000, warna: 'danger' as const },
]
const totalPiutang = UMUR_PIUTANG.reduce((a, b) => a + b.nilai, 0)

function DasborKeuangan() {
  const { boleh } = useAuth()
  if (!boleh('laporan.lihat')) return <HalamanTanpaAkses />

  return (
    <>
      <KepalaHalaman
        judul="Dasbor keuangan"
        deskripsi="Arus kas, laba rugi, struktur biaya, dan umur piutang dalam satu tampilan."
        remah={[{ label: 'Beranda' }, { label: 'Keuangan' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Pendapatan" nilai={formatRpRingkas(totalMasuk)} ikon={ArrowDownLeft} warna="success" tren={0.094} keterangan="vs tahun lalu" deret={DERET_PENDAPATAN.map((n) => n / 100_000)} />
        <KartuStatistik label="Pengeluaran" nilai={formatRpRingkas(totalKeluar)} ikon={ArrowUpRight} warna="danger" tren={0.052} keterangan="vs tahun lalu" deret={DERET_PENGELUARAN.map((n) => n / 100_000)} />
        <KartuStatistik label="Laba kotor" nilai={formatRpRingkas(laba)} ikon={PiggyBank} warna="primary" tren={0.137} keterangan={`margin ${formatPersen(laba / totalMasuk, 1)}`} />
        <KartuStatistik label="Piutang beredar" nilai={formatRpRingkas(totalPiutang)} ikon={Receipt} warna="warning" keterangan="dari 34 faktur" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Arus kas bulanan</JudulKartu>
              <DeskripsiKartu>Pemasukan, pengeluaran, dan garis laba bersih</DeskripsiKartu>
            </div>
            <Lencana warna={laba > 0 ? 'success' : 'danger'}>
              {laba > 0 ? 'Surplus' : 'Defisit'} {formatRpRingkas(Math.abs(laba))}
            </Lencana>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={340}
              deret={[
                { name: 'Pemasukan', type: 'column', data: DERET_PENDAPATAN },
                { name: 'Pengeluaran', type: 'column', data: DERET_PENGELUARAN },
                { name: 'Laba bersih', type: 'line', data: DERET_PENDAPATAN.map((n, i) => n - (DERET_PENGELUARAN[i] ?? 0)) },
              ]}
              opsi={{
                colors: ['#13deb9', '#fa896b', '#5d87ff'],
                stroke: { width: [0, 0, 3.5], curve: 'smooth' },
                plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, borderRadiusApplication: 'end' } },
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { shared: true, intersect: false, y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Struktur biaya</JudulKartu>
              <DeskripsiKartu>Ke mana uang keluar</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="donut"
              tinggi={300}
              deret={nilaiBiaya}
              opsi={{
                labels: POS_BIAYA,
                legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '11px' },
                plotOptions: {
                  pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total biaya', fontWeight: 700, formatter: () => formatRpRingkas(nilaiBiaya.reduce((a, b) => a + b, 0)) } } } },
                },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Umur piutang</JudulKartu>
              <DeskripsiKartu>Semakin tua, semakin kecil kemungkinan tertagih</DeskripsiKartu>
            </div>
            <Landmark className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {UMUR_PIUTANG.map((u) => (
              <Progres
                key={u.label}
                nilai={(u.nilai / totalPiutang) * 100}
                warna={u.warna}
                label={
                  <span className="flex items-baseline gap-2">
                    {u.label}
                    <span className="text-xs font-normal text-muted-foreground">{formatRp(u.nilai)}</span>
                  </span>
                }
                tampilkanNilai
              />
            ))}
            <p className="rounded-card bg-danger-soft p-3 text-xs text-danger-kuat">
              {formatRp(UMUR_PIUTANG[3]!.nilai)} sudah lewat 60 hari — prioritaskan penagihannya.
            </p>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Rasio keuangan</JudulKartu>
              <DeskripsiKartu>Indikator kesehatan usaha</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radialBar"
              tinggi={300}
              deret={[
                Math.round((laba / totalMasuk) * 100),
                72,
                58,
              ]}
              opsi={{
                labels: ['Margin laba', 'Rasio lancar', 'Perputaran kas'],
                colors: ['#5d87ff', '#13deb9', '#ffae1f'],
                plotOptions: {
                  radialBar: { hollow: { size: '38%' }, dataLabels: { total: { show: true, label: 'Rata-rata', fontWeight: 700 } } },
                },
                legend: { show: true, position: 'bottom' },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Pengeluaran terbesar</JudulKartu>
            <DeskripsiKartu>Delapan transaksi keluar dengan nominal tertinggi</DeskripsiKartu>
          </div>
          <Wallet className="size-4 text-muted-foreground" />
        </KepalaKartu>
        <BingkaiTabel>
          <Tabel>
            <KepalaTabel>
              <tr>
                <SelKepala>Kode</SelKepala>
                <SelKepala>Kategori</SelKepala>
                <SelKepala className="hidden sm:table-cell">Pihak</SelKepala>
                <SelKepala className="text-right">Nominal</SelKepala>
                <SelKepala className="text-right">Porsi</SelKepala>
              </tr>
            </KepalaTabel>
            <BadanTabel>
              {[...TRANSAKSI_KEUANGAN]
                .filter((t) => t.jenis === 'keluar')
                .sort((a, b) => b.nominal - a.nominal)
                .slice(0, 8)
                .map((t) => (
                  <BarisTabel key={t.id}>
                    <Sel className="font-mono text-sm font-semibold">{t.kode}</Sel>
                    <Sel>{t.kategori}</Sel>
                    <Sel className="hidden text-muted-foreground sm:table-cell">{t.pihak}</Sel>
                    <Sel className="text-right font-bold text-danger-kuat">{formatRp(t.nominal)}</Sel>
                    <Sel className="text-right">
                      <span className={cn('text-xs font-semibold', t.nominal / totalKeluar > 0.05 ? 'text-danger-kuat' : 'text-muted-foreground')}>
                        {formatPersen(t.nominal / totalKeluar, 1)}
                      </span>
                    </Sel>
                  </BarisTabel>
                ))}
            </BadanTabel>
          </Tabel>
        </BingkaiTabel>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Proyeksi saldo kas</JudulKartu>
            <DeskripsiKartu>Berdasarkan rata-rata tiga bulan terakhir</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="area"
            tinggi={280}
            deret={[{ name: 'Saldo kas', data: DERET_PENGUNJUNG.slice(0, 12).map((n, i) => 40_000_000 + n * 12_000 + i * 1_800_000) }]}
            opsi={{
              colors: ['#5d87ff'],
              xaxis: { categories: BULAN_SINGKAT },
              yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
              fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.02 } },
              tooltip: { y: { formatter: (v) => formatRp(v) } },
              annotations: {
                yaxis: [{ y: 50_000_000, borderColor: '#fa896b', strokeDashArray: 5, label: { text: 'Batas aman kas', style: { background: '#fa896b', color: '#fff' } } }],
              },
            }}
          />
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/keuangan')({ component: DasborKeuangan })
