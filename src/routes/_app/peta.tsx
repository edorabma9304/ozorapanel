import { createFileRoute } from '@tanstack/react-router'
import { MapPin, TrendingUp } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { PetaIndonesia } from '@/components/data/peta-indonesia'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Peringatan } from '@/components/ui/keadaan'
import { Bagan } from '@/components/bagan/bagan'
import { formatAngka, formatPersen } from '@/lib/format'
import { PROVINSI_CONTOH } from '@/lib/adapter/data-contoh'

const total = PROVINSI_CONTOH.reduce((a, b) => a + b.nilai, 0)
const teratas = [...PROVINSI_CONTOH].sort((a, b) => b.nilai - a.nilai)

function HalamanPeta() {
  return (
    <>
      <KepalaHalaman
        judul="Peta sebaran"
        deskripsi="Persebaran transaksi per provinsi di seluruh Indonesia."
        remah={[{ label: 'Halaman' }, { label: 'Peta' }]}
      />

      <Peringatan varian="info" judul="Peta disederhanakan, bukan kartografis">
        Bentuk pulau digambar sebagai poligon kasar supaya tidak perlu memuat berkas
        peta besar. Cukup untuk visualisasi sebaran; kalau butuh batas wilayah akurat,
        ganti isi komponen dengan path dari GeoJSON.
      </Peringatan>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total transaksi" nilai={formatAngka(total)} ikon={TrendingUp} warna="primary" />
        <KartuStatistik label="Provinsi terjangkau" nilai={PROVINSI_CONTOH.length} ikon={MapPin} warna="info" />
        <KartuStatistik label="Provinsi teratas" nilai={teratas[0]!.nama} ikon={MapPin} warna="success" keterangan={`${formatAngka(teratas[0]!.nilai)} transaksi`} />
        <KartuStatistik
          label="Kontribusi 5 besar"
          nilai={formatPersen(teratas.slice(0, 5).reduce((a, b) => a + b.nilai, 0) / total, 0)}
          ikon={TrendingUp}
          warna="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Sebaran nasional</JudulKartu>
              <DeskripsiKartu>Besar gelembung sebanding dengan jumlah transaksi</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <PetaIndonesia titik={PROVINSI_CONTOH} satuan="transaksi" />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Provinsi teratas</JudulKartu>
              <DeskripsiKartu>Sepuluh besar menurut jumlah transaksi</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-3.5">
            {teratas.slice(0, 10).map((p) => (
              <Progres
                key={p.kode}
                nilai={(p.nilai / teratas[0]!.nilai) * 100}
                warna="primary"
                tebal="sm"
                label={
                  <span className="flex items-baseline gap-2 text-sm">
                    {p.nama}
                    <span className="text-xs font-normal text-muted-foreground">{formatAngka(p.nilai)}</span>
                  </span>
                }
              />
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Perbandingan antar pulau</JudulKartu>
            <DeskripsiKartu>Jumlah transaksi dikelompokkan per gugus pulau</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="bar"
            tinggi={300}
            deret={[
              {
                name: 'Transaksi',
                data: [
                  { x: 'Jawa', y: PROVINSI_CONTOH.filter((p) => ['jk', 'jb', 'jt', 'yo', 'ji'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                  { x: 'Sumatera', y: PROVINSI_CONTOH.filter((p) => ['ac', 'su', 'sb', 'ri', 'ss', 'lp'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                  { x: 'Sulawesi', y: PROVINSI_CONTOH.filter((p) => ['sn', 'sa'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                  { x: 'Kalimantan', y: PROVINSI_CONTOH.filter((p) => ['kb', 'ks', 'kt'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                  { x: 'Bali & Nusa Tenggara', y: PROVINSI_CONTOH.filter((p) => ['ba', 'nb', 'nt'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                  { x: 'Maluku & Papua', y: PROVINSI_CONTOH.filter((p) => ['ma', 'pa'].includes(p.kode)).reduce((a, b) => a + b.nilai, 0) },
                ],
              },
            ]}
            opsi={{
              plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '60%' } },
              xaxis: { labels: { formatter: (v) => formatAngka(Number(v)) } },
            }}
          />
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/peta')({ component: HalamanPeta })
