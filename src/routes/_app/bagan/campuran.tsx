import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGUNJUNG } from '@/lib/adapter/data-contoh'

function BaganCampuran() {
  return (
    <>
      <KepalaHalaman
        judul="Bagan campuran"
        deskripsi="Menggabungkan beberapa jenis bagan dan dua sumbu dalam satu gambar."
        remah={[{ label: 'Bagan' }, { label: 'Campuran' }]}
      />

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Batang &amp; garis dengan dua sumbu</JudulKartu>
            <DeskripsiKartu>Nilai dengan satuan berbeda bisa disandingkan</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="line"
            tinggi={360}
            deret={[
              { name: 'Pendapatan', type: 'column', data: DERET_PENDAPATAN },
              { name: 'Kunjungan', type: 'line', data: DERET_PENGUNJUNG.slice(0, 12) },
            ]}
            opsi={{
              stroke: { width: [0, 3.5], curve: 'smooth' },
              plotOptions: { bar: { columnWidth: '50%', borderRadius: 5, borderRadiusApplication: 'end' } },
              xaxis: { categories: BULAN_SINGKAT },
              yaxis: [
                { title: { text: 'Pendapatan' }, labels: { formatter: (v) => formatRpRingkas(v) } },
                { opposite: true, title: { text: 'Kunjungan' }, labels: { formatter: (v) => formatAngka(v) } },
              ],
              tooltip: { shared: true, intersect: false },
            }}
          />
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Area &amp; garis</JudulKartu>
              <DeskripsiKartu>Nilai aktual di atas rata-rata bergerak</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={300}
              deret={[
                { name: 'Aktual', type: 'area', data: DERET_PENDAPATAN },
                {
                  name: 'Rata-rata 3 bulan',
                  type: 'line',
                  data: DERET_PENDAPATAN.map((_, i, a) => {
                    const jendela = a.slice(Math.max(0, i - 2), i + 1)
                    return Math.round(jendela.reduce((x, y) => x + y, 0) / jendela.length)
                  }),
                },
              ]}
              opsi={{
                colors: ['#5d87ff', '#fa896b'],
                fill: { type: ['gradient', 'solid'], gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
                stroke: { width: [2, 3], curve: 'smooth', dashArray: [0, 5] },
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
              <JudulKartu>Sebaran</JudulKartu>
              <DeskripsiKartu>Hubungan antara dua besaran</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="scatter"
              tinggi={300}
              deret={[
                {
                  name: 'Produk',
                  data: Array.from({ length: 40 }, (_, i) => [
                    Math.round(50 + i * 7 + (i % 5) * 12),
                    Math.round(120 + (i % 9) * 38 + i * 4),
                  ]),
                },
              ]}
              opsi={{
                xaxis: { title: { text: 'Harga (ribu rupiah)' }, tickAmount: 8 },
                yaxis: { title: { text: 'Unit terjual' } },
                markers: { size: 6 },
                grid: { strokeDashArray: 4 },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/campuran')({ component: BaganCampuran })
