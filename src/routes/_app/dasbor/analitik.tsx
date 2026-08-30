import { createFileRoute } from '@tanstack/react-router'
import { Clock, Eye, MousePointerClick, Users } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { Sparkline } from '@/components/bagan/sparkline'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { formatAngka, formatPersen } from '@/lib/format'
import { DERET_KONVERSI, DERET_PENGUNJUNG } from '@/lib/adapter/data-contoh'

const SUMBER = [
  { nama: 'Pencarian organik', nilai: 42, warna: '#5d87ff' },
  { nama: 'Media sosial', nilai: 27, warna: '#49beff' },
  { nama: 'Langsung', nilai: 18, warna: '#13deb9' },
  { nama: 'Rujukan', nilai: 13, warna: '#ffae1f' },
]

const HALAMAN_TERATAS = [
  { jalur: '/produk/kursi-ergonomis-pro', tayang: 18420, durasi: '3m 12d', pentalan: 0.31 },
  { jalur: '/', tayang: 15310, durasi: '1m 48d', pentalan: 0.44 },
  { jalur: '/promo/akhir-bulan', tayang: 9870, durasi: '2m 36d', pentalan: 0.28 },
  { jalur: '/produk/headset-nirkabel-max', tayang: 7640, durasi: '2m 05d', pentalan: 0.37 },
  { jalur: '/kontak', tayang: 4120, durasi: '0m 52d', pentalan: 0.61 },
]

function DasborAnalitik() {
  const hari = Array.from({ length: 30 }, (_, i) => `${i + 1}`)

  return (
    <>
      <KepalaHalaman
        judul="Dasbor analitik"
        deskripsi="Lalu lintas, keterlibatan, dan konversi 30 hari terakhir."
        remah={[{ label: 'Beranda' }, { label: 'Analitik' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Pengunjung" nilai={formatAngka(DERET_PENGUNJUNG.reduce((a, b) => a + b, 0))} ikon={Users} warna="primary" tren={0.093} keterangan="30 hari" deret={DERET_PENGUNJUNG} />
        <KartuStatistik label="Tayangan halaman" nilai={formatAngka(184_920)} ikon={Eye} warna="secondary" tren={0.041} keterangan="30 hari" deret={DERET_PENGUNJUNG.map((n) => n * 3)} />
        <KartuStatistik label="Rasio konversi" nilai={formatPersen(0.0342, 2)} ikon={MousePointerClick} warna="success" tren={0.006} keterangan="30 hari" deret={DERET_KONVERSI.map((n) => n * 100)} />
        <KartuStatistik label="Durasi rata-rata" nilai="2m 41d" ikon={Clock} warna="warning" tren={-0.012} keterangan="30 hari" deret={DERET_PENGUNJUNG.map((n) => n / 2)} />
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Pengunjung &amp; konversi harian</JudulKartu>
            <DeskripsiKartu>Dua sumbu: jumlah pengunjung dan persentase konversi</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="line"
            tinggi={340}
            deret={[
              { name: 'Pengunjung', type: 'column', data: DERET_PENGUNJUNG },
              { name: 'Konversi (%)', type: 'line', data: DERET_KONVERSI },
            ]}
            opsi={{
              xaxis: { categories: hari, tickAmount: 10 },
              yaxis: [
                { title: { text: 'Pengunjung' }, labels: { formatter: (v) => formatAngka(v) } },
                { opposite: true, title: { text: 'Konversi (%)' }, max: 6 },
              ],
              stroke: { width: [0, 3], curve: 'smooth' },
              plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, borderRadiusApplication: 'end' } },
            }}
          />
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Sumber lalu lintas</JudulKartu>
              <DeskripsiKartu>Bagian dari total kunjungan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {SUMBER.map((s) => (
              <div key={s.nama}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.nama}</span>
                  <span className="font-bold">{s.nilai}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${s.nilai}%`, background: s.warna }} />
                </div>
              </div>
            ))}
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Perangkat</JudulKartu>
              <DeskripsiKartu>Sesi menurut jenis perangkat</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="donut"
              tinggi={260}
              deret={[68, 26, 6]}
              opsi={{
                labels: ['Ponsel', 'Desktop', 'Tablet'],
                legend: { position: 'bottom', horizontalAlign: 'center' },
                plotOptions: { pie: { donut: { size: '70%' } } },
                tooltip: { y: { formatter: (v) => `${v}%` } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Kesehatan situs</JudulKartu>
              <DeskripsiKartu>Core Web Vitals 7 hari terakhir</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-5">
            {[
              { label: 'LCP', nilai: '1,9 d', target: '< 2,5 d', baik: true, deret: [2.4, 2.2, 2.1, 2.0, 1.95, 1.92, 1.9] },
              { label: 'INP', nilai: '148 md', target: '< 200 md', baik: true, deret: [210, 190, 176, 168, 160, 152, 148] },
              { label: 'CLS', nilai: '0,04', target: '< 0,1', baik: true, deret: [0.09, 0.08, 0.07, 0.06, 0.05, 0.045, 0.04] },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-4">
                <div className="w-14 shrink-0">
                  <p className="text-xs font-bold text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-extrabold">{m.nilai}</p>
                </div>
                <div className="flex-1">
                  <Sparkline nilai={m.deret} warna="#13deb9" tinggi={34} jenis="garis" />
                </div>
                <Lencana warna={m.baik ? 'success' : 'danger'} ukuran="sm">
                  {m.target}
                </Lencana>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Halaman teratas</JudulKartu>
            <DeskripsiKartu>Diurutkan menurut jumlah tayangan</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-3">
          {HALAMAN_TERATAS.map((h) => (
            <div key={h.jalur} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border pb-3 last:border-0 last:pb-0">
              <code className="flex-1 truncate font-mono text-sm">{h.jalur}</code>
              <span className="text-sm font-semibold">{formatAngka(h.tayang)}</span>
              <span className="w-20 text-right text-sm text-muted-foreground">{h.durasi}</span>
              <Lencana ukuran="sm" warna={h.pentalan > 0.5 ? 'danger' : h.pentalan > 0.4 ? 'warning' : 'success'}>
                pentalan {formatPersen(h.pentalan, 0)}
              </Lencana>
            </div>
          ))}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/analitik')({ component: DasborAnalitik })
