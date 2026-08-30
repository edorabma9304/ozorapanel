import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, PRODUK_CONTOH } from '@/lib/adapter/data-contoh'

const kategori = [...new Set(PRODUK_CONTOH.map((p) => p.kategori))]
const perKategori = kategori.map((k) =>
  PRODUK_CONTOH.filter((p) => p.kategori === k).reduce((a, b) => a + b.terjual, 0),
)

function BaganBatang() {
  return (
    <>
      <KepalaHalaman
        judul="Bagan batang"
        deskripsi="Untuk membandingkan nilai antar kategori."
        remah={[{ label: 'Bagan' }, { label: 'Batang' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Batang tegak</JudulKartu>
              <DeskripsiKartu>Pilihan bawaan untuk deret waktu</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={[{ name: 'Pendapatan', data: DERET_PENDAPATAN }]}
              opsi={{
                plotOptions: { bar: { columnWidth: '50%', borderRadius: 5, borderRadiusApplication: 'end' } },
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
              <JudulKartu>Batang mendatar</JudulKartu>
              <DeskripsiKartu>Lebih baik bila label kategorinya panjang</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={[{ name: 'Unit terjual', data: perKategori }]}
              opsi={{
                colors: ['#13deb9'],
                plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%' } },
                xaxis: { categories: kategori, labels: { formatter: (v) => formatAngka(Number(v)) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Berkelompok</JudulKartu>
              <DeskripsiKartu>Dua deret berdampingan per kategori</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={[
                { name: 'Pemasukan', data: DERET_PENDAPATAN.slice(0, 6) },
                { name: 'Pengeluaran', data: DERET_PENGELUARAN.slice(0, 6) },
              ]}
              opsi={{
                plotOptions: { bar: { columnWidth: '55%', borderRadius: 5, borderRadiusApplication: 'end' } },
                xaxis: { categories: BULAN_SINGKAT.slice(0, 6) },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Bertumpuk</JudulKartu>
              <DeskripsiKartu>Komposisi di dalam total tiap batang</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={[
                { name: 'Lunas', data: [42, 38, 51, 46, 55, 61] },
                { name: 'Tertunda', data: [12, 18, 9, 14, 11, 8] },
                { name: 'Jatuh tempo', data: [5, 3, 7, 4, 6, 2] },
              ]}
              opsi={{
                chart: { stacked: true },
                colors: ['#13deb9', '#ffae1f', '#fa896b'],
                plotOptions: { bar: { columnWidth: '50%', borderRadius: 4, borderRadiusApplication: 'end' } },
                xaxis: { categories: BULAN_SINGKAT.slice(0, 6) },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/batang')({ component: BaganBatang })
