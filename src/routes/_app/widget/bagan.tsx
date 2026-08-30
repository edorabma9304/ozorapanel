import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { Sparkline } from '@/components/bagan/sparkline'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, DERET_PENGUNJUNG } from '@/lib/adapter/data-contoh'

function HalamanWidgetBagan() {
  return (
    <>
      <KepalaHalaman
        judul="Widget bagan"
        deskripsi="Kombinasi kartu dan grafik yang sering dipakai di dasbor."
        remah={[{ label: 'Widget' }, { label: 'Bagan' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Pendapatan" nilai={formatRpRingkas(DERET_PENDAPATAN.reduce((a, b) => a + b, 0))} warna="primary" tren={0.082} deret={DERET_PENDAPATAN.map((n) => n / 100_000)} />
        <KartuStatistik label="Pengeluaran" nilai={formatRpRingkas(DERET_PENGELUARAN.reduce((a, b) => a + b, 0))} warna="danger" tren={0.031} deret={DERET_PENGELUARAN.map((n) => n / 100_000)} />
        <KartuStatistik label="Kunjungan" nilai={formatAngka(DERET_PENGUNJUNG.reduce((a, b) => a + b, 0))} warna="info" tren={0.054} deret={DERET_PENGUNJUNG} />
        <KartuStatistik label="Konversi" nilai="3,4%" warna="success" tren={0.008} deret={DERET_PENGUNJUNG.slice(6)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Arus kas</JudulKartu>
              <DeskripsiKartu>Pemasukan dan pengeluaran per bulan</DeskripsiKartu>
            </div>
            <Lencana warna="success">Surplus</Lencana>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={300}
              deret={[
                { name: 'Pemasukan', data: DERET_PENDAPATAN },
                { name: 'Pengeluaran', data: DERET_PENGELUARAN },
              ]}
              opsi={{
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Pencapaian target</JudulKartu>
              <DeskripsiKartu>Tiga indikator utama</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radialBar"
              tinggi={340}
              deret={[76, 62, 88]}
              opsi={{
                labels: ['Penjualan', 'Pelanggan baru', 'Kepuasan'],
                colors: ['#5d87ff', '#ffae1f', '#13deb9'],
                plotOptions: {
                  radialBar: {
                    hollow: { size: '38%' },
                    dataLabels: { total: { show: true, label: 'Rata-rata', fontWeight: 700 } },
                  },
                },
                legend: { show: true, position: 'bottom' },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { judul: 'Pesanan harian', nilai: formatAngka(184), deret: DERET_PENGUNJUNG.slice(0, 12), warna: '#5d87ff', jenis: 'area' as const },
          { judul: 'Pengembalian', nilai: formatAngka(12), deret: DERET_PENGUNJUNG.slice(8, 20), warna: '#fa896b', jenis: 'batang' as const },
          { judul: 'Ulasan baru', nilai: formatAngka(46), deret: DERET_PENGUNJUNG.slice(14, 26), warna: '#13deb9', jenis: 'garis' as const },
        ].map((k) => (
          <Kartu key={k.judul} className="overflow-hidden">
            <IsiKartu className="pb-0">
              <p className="text-sm font-semibold text-muted-foreground">{k.judul}</p>
              <p className="mt-1 text-2xl font-extrabold">{k.nilai}</p>
            </IsiKartu>
            <div className="mt-3 px-1 pb-1">
              <Sparkline nilai={k.deret} warna={k.warna} jenis={k.jenis} tinggi={70} />
            </div>
          </Kartu>
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/widget/bagan')({ component: HalamanWidgetBagan })
