import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, MapPin, PackageCheck, Truck, TriangleAlert } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { Progres } from '@/components/ui/progres'
import { PetaIndonesia } from '@/components/data/peta-indonesia'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { formatAngka, formatPersen, formatWaktuRelatif } from '@/lib/format'
import {
  BULAN_SINGKAT, DERET_PENGUNJUNG, PESANAN_CONTOH, PROVINSI_CONTOH,
} from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const KURIR = [
  { nama: 'JNE', kiriman: 1284, tepat: 0.94, biaya: 22_000, warna: 'primary' as const },
  { nama: 'SiCepat', kiriman: 862, tepat: 0.91, biaya: 19_500, warna: 'danger' as const },
  { nama: 'J&T', kiriman: 640, tepat: 0.88, biaya: 20_000, warna: 'warning' as const },
  { nama: 'Kurir instan', kiriman: 318, tepat: 0.97, biaya: 32_000, warna: 'success' as const },
]

const TAHAP = [
  { label: 'Menunggu dikemas', jumlah: 42, warna: 'info' as const, ikon: Clock },
  { label: 'Sedang dikemas', jumlah: 28, warna: 'warning' as const, ikon: PackageCheck },
  { label: 'Diserahkan ke kurir', jumlah: 96, warna: 'primary' as const, ikon: Truck },
  { label: 'Dalam perjalanan', jumlah: 184, warna: 'secondary' as const, ikon: Truck },
  { label: 'Terkirim', jumlah: 1_642, warna: 'success' as const, ikon: CheckCircle2 },
]

const MASALAH = [
  { nomor: 'INV-2026-1088', masalah: 'Alamat tidak ditemukan', kota: 'Bekasi', umur: 2 },
  { nomor: 'INV-2026-1054', masalah: 'Penerima tidak di tempat (3×)', kota: 'Surabaya', umur: 4 },
  { nomor: 'INV-2026-1031', masalah: 'Paket rusak saat transit', kota: 'Medan', umur: 1 },
  { nomor: 'INV-2026-0997', masalah: 'Retur — pembeli membatalkan', kota: 'Denpasar', umur: 6 },
]

const totalKiriman = KURIR.reduce((a, b) => a + b.kiriman, 0)

function DasborLogistik() {
  const dalamPerjalanan = PESANAN_CONTOH.filter((p) => p.status === 'dikirim').slice(0, 6)

  return (
    <>
      <KepalaHalaman
        judul="Dasbor logistik"
        deskripsi="Status pengiriman, performa kurir, dan sebaran tujuan di seluruh Indonesia."
        remah={[{ label: 'Beranda' }, { label: 'Logistik' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Dalam perjalanan" nilai={formatAngka(184)} ikon={Truck} warna="primary" tren={0.058} keterangan="vs minggu lalu" deret={DERET_PENGUNJUNG.slice(0, 12)} />
        <KartuStatistik label="Terkirim bulan ini" nilai={formatAngka(1_642)} ikon={CheckCircle2} warna="success" tren={0.081} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(6, 18)} />
        <KartuStatistik label="Ketepatan waktu" nilai={formatPersen(0.928, 1)} ikon={Clock} warna="info" tren={0.012} keterangan="vs bulan lalu" />
        <KartuStatistik label="Bermasalah" nilai={MASALAH.length} ikon={TriangleAlert} warna="danger" keterangan="perlu tindak lanjut" />
      </div>

      {/* Corong status pengiriman */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Status pengiriman</JudulKartu>
            <DeskripsiKartu>Jumlah paket di setiap tahap</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {TAHAP.map((t) => (
              <div key={t.label} className="rounded-card border border-border p-4">
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-card',
                    t.warna === 'info' && 'bg-info-soft text-info-kuat',
                    t.warna === 'warning' && 'bg-warning-soft text-warning-kuat',
                    t.warna === 'primary' && 'bg-primary-soft text-primary-kuat',
                    t.warna === 'secondary' && 'bg-secondary-soft text-secondary-kuat',
                    t.warna === 'success' && 'bg-success-soft text-success-kuat',
                  )}
                >
                  <t.ikon className="size-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold">{formatAngka(t.jumlah)}</p>
                <p className="text-xs text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Tujuan pengiriman</JudulKartu>
              <DeskripsiKartu>Sebaran paket per provinsi</DeskripsiKartu>
            </div>
            <MapPin className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu>
            <PetaIndonesia titik={PROVINSI_CONTOH} satuan="paket" />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Performa kurir</JudulKartu>
              <DeskripsiKartu>Ketepatan waktu pengiriman</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {KURIR.map((k) => (
              <div key={k.nama}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold">{k.nama}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatAngka(k.kiriman)} paket · {formatPersen(k.kiriman / totalKiriman, 0)}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Progres
                    nilai={k.tepat * 100}
                    warna={k.tepat >= 0.93 ? 'success' : k.tepat >= 0.9 ? 'warning' : 'danger'}
                    tebal="sm"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tepat waktu {formatPersen(k.tepat, 1)}
                </p>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Volume pengiriman</JudulKartu>
              <DeskripsiKartu>Dua belas bulan terakhir per kurir</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={KURIR.map((k, i) => ({
                name: k.nama,
                data: DERET_PENGUNJUNG.slice(i, i + 12).map((n) => Math.round(n / (i + 2))),
              }))}
              opsi={{
                chart: { stacked: true },
                xaxis: { categories: BULAN_SINGKAT },
                plotOptions: { bar: { columnWidth: '55%', borderRadius: 4, borderRadiusApplication: 'end' } },
                yaxis: { labels: { formatter: (v) => formatAngka(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Perlu tindak lanjut</JudulKartu>
              <DeskripsiKartu>Pengiriman yang tersendat</DeskripsiKartu>
            </div>
            <Lencana warna="danger">{MASALAH.length}</Lencana>
          </KepalaKartu>
          <IsiKartu className="space-y-3">
            {MASALAH.map((m) => (
              <div key={m.nomor} className="flex items-start gap-3 rounded-card border border-border p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-card bg-danger-soft text-danger-kuat">
                  <TriangleAlert className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold">{m.nomor}</p>
                  <p className="truncate text-sm text-muted-foreground">{m.masalah}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.kota}</p>
                </div>
                <Lencana warna={m.umur > 3 ? 'danger' : 'warning'} ukuran="sm">
                  {m.umur} hari
                </Lencana>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Sedang dalam perjalanan</JudulKartu>
            <DeskripsiKartu>Enam paket terbaru yang sudah diserahkan ke kurir</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-4">
          {dalamPerjalanan.map((p, i) => {
            const kemajuan = [82, 64, 45, 30, 92, 18][i] ?? 50
            return (
              <div key={p.id} className="flex flex-col gap-2 rounded-card border border-border p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar nama={p.pelanggan_nama} src={p.pelanggan_avatar} ukuran="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-semibold">{p.nomor}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.pelanggan_nama} · {formatWaktuRelatif(p.tanggal)}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <Progres nilai={kemajuan} warna={kemajuan > 80 ? 'success' : 'primary'} tebal="sm" tampilkanNilai />
                </div>
              </div>
            )
          })}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/logistik')({ component: DasborLogistik })
