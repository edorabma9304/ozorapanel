import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Peringatan } from '@/components/ui/keadaan'

function BaganDonat() {
  return (
    <>
      <KepalaHalaman
        judul="Donat, pai, & radial"
        deskripsi="Untuk menunjukkan bagian dari satu keseluruhan."
        remah={[{ label: 'Bagan' }, { label: 'Donat & pai' }]}
      />

      <Peringatan varian="perhatian" judul="Batasi jumlah irisan">
        Mata manusia buruk dalam membandingkan sudut. Di atas lima irisan, bagan batang
        mendatar hampir selalu lebih mudah dibaca daripada pai.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Donat</JudulKartu>
              <DeskripsiKartu>Dengan total di tengah</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="donut"
              tinggi={300}
              deret={[44, 26, 18, 12]}
              opsi={{
                labels: ['Toko online', 'Marketplace', 'Reseller', 'Offline'],
                legend: { position: 'bottom', horizontalAlign: 'center' },
                plotOptions: {
                  pie: { donut: { size: '72%', labels: { show: true, total: { show: true, label: 'Total', fontWeight: 700 } } } },
                },
                tooltip: { y: { formatter: (v) => `${v}%` } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Pai</JudulKartu>
              <DeskripsiKartu>Tanpa lubang tengah</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="pie"
              tinggi={300}
              deret={[38, 27, 21, 14]}
              opsi={{
                labels: ['Transfer bank', 'QRIS', 'Kartu kredit', 'COD'],
                legend: { position: 'bottom', horizontalAlign: 'center' },
                tooltip: { y: { formatter: (v) => `${v}%` } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Radial</JudulKartu>
              <DeskripsiKartu>Cocok untuk pencapaian target</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radialBar"
              tinggi={300}
              deret={[76, 62, 88]}
              opsi={{
                labels: ['Penjualan', 'Pelanggan', 'Kepuasan'],
                colors: ['#5d87ff', '#ffae1f', '#13deb9'],
                plotOptions: {
                  radialBar: { hollow: { size: '36%' }, dataLabels: { total: { show: true, label: 'Rata-rata', fontWeight: 700 } } },
                },
                legend: { show: true, position: 'bottom' },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-3">
          <KepalaKartu>
            <div>
              <JudulKartu>Radial tunggal besar</JudulKartu>
              <DeskripsiKartu>Satu angka yang ingin ditonjolkan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radialBar"
              tinggi={300}
              deret={[82]}
              opsi={{
                colors: ['#5d87ff'],
                labels: ['Ketepatan pengiriman'],
                plotOptions: {
                  radialBar: {
                    hollow: { size: '68%' },
                    dataLabels: {
                      name: { fontSize: '14px', offsetY: -10 },
                      value: { fontSize: '32px', fontWeight: 800, offsetY: 6 },
                    },
                  },
                },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/donat')({ component: BaganDonat })
