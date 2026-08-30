import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, DERET_PENGUNJUNG } from '@/lib/adapter/data-contoh'

function BaganGaris() {
  return (
    <>
      <KepalaHalaman
        judul="Bagan garis"
        deskripsi="Untuk menunjukkan tren sepanjang waktu."
        remah={[{ label: 'Bagan' }, { label: 'Garis' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Garis tunggal</JudulKartu>
              <DeskripsiKartu>Satu deret, kurva halus</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={300}
              deret={[{ name: 'Pendapatan', data: DERET_PENDAPATAN }]}
              opsi={{
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Banyak deret</JudulKartu>
              <DeskripsiKartu>Perbandingan dua nilai</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={300}
              deret={[
                { name: 'Pemasukan', data: DERET_PENDAPATAN },
                { name: 'Pengeluaran', data: DERET_PENGELUARAN },
              ]}
              opsi={{
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Bertitik</JudulKartu>
              <DeskripsiKartu>Menandai setiap pengukuran</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={300}
              deret={[{ name: 'Kunjungan', data: DERET_PENGUNJUNG.slice(0, 12) }]}
              opsi={{
                colors: ['#13deb9'],
                markers: { size: 5, strokeWidth: 2, hover: { size: 7 } },
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatAngka(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Bertangga</JudulKartu>
              <DeskripsiKartu>Untuk nilai yang berubah mendadak, bukan bertahap</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="line"
              tinggi={300}
              deret={[{ name: 'Harga jual', data: [150, 150, 165, 165, 165, 180, 180, 175, 175, 190, 190, 195] }]}
              opsi={{
                colors: ['#ffae1f'],
                stroke: { curve: 'stepline', width: 3 },
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => `${formatAngka(v)} rb` } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/garis')({ component: BaganGaris })
