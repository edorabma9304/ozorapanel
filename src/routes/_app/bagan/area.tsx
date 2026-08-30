import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, DERET_PENGUNJUNG } from '@/lib/adapter/data-contoh'

const gradien = { type: 'gradient' as const, gradient: { shadeIntensity: 0.5, opacityFrom: 0.4, opacityTo: 0.02 } }

function BaganArea() {
  return (
    <>
      <KepalaHalaman
        judul="Bagan area"
        deskripsi="Garis dengan isian — menekankan besaran, bukan hanya arah."
        remah={[{ label: 'Bagan' }, { label: 'Area' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Area gradien</JudulKartu>
              <DeskripsiKartu>Bentuk paling umum di dasbor</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={300}
              deret={[{ name: 'Pendapatan', data: DERET_PENDAPATAN }]}
              opsi={{
                fill: gradien,
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
              <JudulKartu>Bertumpuk</JudulKartu>
              <DeskripsiKartu>Menunjukkan total sekaligus komposisinya</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={300}
              deret={[
                { name: 'Toko online', data: DERET_PENGUNJUNG.slice(0, 12) },
                { name: 'Marketplace', data: DERET_PENGUNJUNG.slice(6, 18).map((n) => Math.round(n * 0.6)) },
                { name: 'Offline', data: DERET_PENGUNJUNG.slice(12, 24).map((n) => Math.round(n * 0.35)) },
              ]}
              opsi={{
                chart: { stacked: true },
                fill: gradien,
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatAngka(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Area dua deret dengan sumbu rupiah</JudulKartu>
              <DeskripsiKartu>Selisih antara pemasukan dan pengeluaran langsung terbaca</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={340}
              deret={[
                { name: 'Pemasukan', data: DERET_PENDAPATAN },
                { name: 'Pengeluaran', data: DERET_PENGELUARAN },
              ]}
              opsi={{
                fill: gradien,
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/area')({ component: BaganArea })
