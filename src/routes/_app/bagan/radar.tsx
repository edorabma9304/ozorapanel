import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Peringatan } from '@/components/ui/keadaan'

function BaganRadar() {
  return (
    <>
      <KepalaHalaman
        judul="Bagan radar"
        deskripsi="Membandingkan beberapa dimensi sekaligus dalam satu bentuk."
        remah={[{ label: 'Bagan' }, { label: 'Radar' }]}
      />

      <Peringatan varian="perhatian" judul="Pakai seperlunya">
        Radar mudah menyesatkan: luas areanya tumbuh kuadratik, jadi selisih kecil
        terlihat besar. Bagus untuk membandingkan profil, buruk untuk membaca nilai persis.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Profil satu tim</JudulKartu>
              <DeskripsiKartu>Penilaian enam aspek operasional</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radar"
              tinggi={340}
              deret={[{ name: 'Tim Produksi', data: [88, 72, 65, 91, 78, 84] }]}
              opsi={{
                xaxis: { categories: ['Kecepatan', 'Kualitas', 'Biaya', 'Kepatuhan', 'Kerja sama', 'Ketepatan'] },
                yaxis: { max: 100, min: 0, tickAmount: 4, labels: { show: false } },
                markers: { size: 4 },
                fill: { opacity: 0.25 },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Perbandingan dua tim</JudulKartu>
              <DeskripsiKartu>Produksi dan Penjualan berdampingan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radar"
              tinggi={340}
              deret={[
                { name: 'Produksi', data: [88, 72, 65, 91, 78, 84] },
                { name: 'Penjualan', data: [74, 86, 82, 68, 90, 71] },
              ]}
              opsi={{
                xaxis: { categories: ['Kecepatan', 'Kualitas', 'Biaya', 'Kepatuhan', 'Kerja sama', 'Ketepatan'] },
                yaxis: { max: 100, min: 0, tickAmount: 4, labels: { show: false } },
                markers: { size: 4 },
                fill: { opacity: 0.2 },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Penilaian produk terhadap standar</JudulKartu>
              <DeskripsiKartu>Nilai aktual dibandingkan target internal</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="radar"
              tinggi={400}
              deret={[
                { name: 'Nilai aktual', data: [82, 74, 91, 66, 88, 79, 85] },
                { name: 'Target', data: [80, 80, 80, 80, 80, 80, 80] },
              ]}
              opsi={{
                colors: ['#5d87ff', '#fa896b'],
                xaxis: { categories: ['Daya tahan', 'Kemasan', 'Harga', 'Pengiriman', 'Layanan', 'Ketersediaan', 'Ulasan'] },
                yaxis: { max: 100, min: 0, tickAmount: 4, labels: { show: false } },
                // Jangan pakai array per-deret di radar — lihat catatan di atas.
                stroke: { width: 2.5, curve: 'straight' },
                fill: { opacity: 0.18 },
                markers: { size: 4 },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/bagan/radar')({ component: BaganRadar })
