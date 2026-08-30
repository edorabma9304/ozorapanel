import { createFileRoute } from '@tanstack/react-router'
import { Handshake, Phone, Target, UserPlus } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Avatar, TumpukanAvatar } from '@/components/ui/avatar'
import { Lencana } from '@/components/ui/lencana'
import { formatAngka, formatPersen, formatRp, formatRpRingkas, formatWaktuRelatif } from '@/lib/format'
import { DERET_PENGUNJUNG, PELANGGAN_CONTOH, PENGGUNA_CONTOH } from '@/lib/adapter/data-contoh'

const TAHAP = [
  { nama: 'Prospek masuk', jumlah: 248, nilai: 620_000_000, warna: 'primary' as const },
  { nama: 'Kualifikasi', jumlah: 164, nilai: 460_000_000, warna: 'info' as const },
  { nama: 'Penawaran', jumlah: 92, nilai: 310_000_000, warna: 'secondary' as const },
  { nama: 'Negosiasi', jumlah: 47, nilai: 185_000_000, warna: 'warning' as const },
  { nama: 'Menang', jumlah: 28, nilai: 122_000_000, warna: 'success' as const },
]

function DasborCrm() {
  const tim = PENGGUNA_CONTOH.filter((p) => p.peran === 'sales').slice(0, 5)
  const prospek = PELANGGAN_CONTOH.slice(0, 6)
  const maks = TAHAP[0]!.jumlah

  return (
    <>
      <KepalaHalaman
        judul="Dasbor CRM"
        deskripsi="Corong penjualan, performa tim, dan prospek yang perlu ditindaklanjuti."
        remah={[{ label: 'Beranda' }, { label: 'CRM' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Prospek baru" nilai={formatAngka(248)} ikon={UserPlus} warna="primary" tren={0.152} keterangan="bulan ini" deret={DERET_PENGUNJUNG.slice(0, 12)} />
        <KartuStatistik label="Kesepakatan menang" nilai={formatAngka(28)} ikon={Handshake} warna="success" tren={0.072} keterangan="bulan ini" deret={DERET_PENGUNJUNG.slice(6, 18)} />
        <KartuStatistik label="Nilai pipeline" nilai={formatRpRingkas(1_697_000_000)} ikon={Target} warna="info" tren={0.038} keterangan="total aktif" deret={DERET_PENGUNJUNG.slice(10, 22)} />
        <KartuStatistik label="Rasio menang" nilai={formatPersen(0.113, 1)} ikon={Phone} warna="warning" tren={-0.004} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(14, 26)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Corong penjualan</JudulKartu>
              <DeskripsiKartu>Jumlah kesepakatan per tahap</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {TAHAP.map((t) => (
              <div key={t.nama}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{t.nama}</span>
                  <span className="text-muted-foreground">
                    {formatAngka(t.jumlah)} · {formatRpRingkas(t.nilai)}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={
                      t.warna === 'primary' ? 'h-full rounded-full bg-primary'
                      : t.warna === 'info' ? 'h-full rounded-full bg-info'
                      : t.warna === 'secondary' ? 'h-full rounded-full bg-secondary'
                      : t.warna === 'warning' ? 'h-full rounded-full bg-warning'
                      : 'h-full rounded-full bg-success'
                    }
                    style={{ width: `${(t.jumlah / maks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-3">
          <KepalaKartu>
            <div>
              <JudulKartu>Kesepakatan menang vs kalah</JudulKartu>
              <DeskripsiKartu>Enam bulan terakhir</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="bar"
              tinggi={300}
              deret={[
                { name: 'Menang', data: [18, 22, 19, 26, 24, 28] },
                { name: 'Kalah', data: [12, 9, 14, 11, 13, 10] },
              ]}
              opsi={{
                colors: ['#13deb9', '#fa896b'],
                xaxis: { categories: ['Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'] },
                plotOptions: { bar: { columnWidth: '45%', borderRadius: 5, borderRadiusApplication: 'end' } },
              }}
            />
          </IsiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Performa tim penjualan</JudulKartu>
              <DeskripsiKartu>Pencapaian terhadap target bulan ini</DeskripsiKartu>
            </div>
            <TumpukanAvatar orang={tim.map((t) => ({ nama: t.nama, avatar: t.avatar_url }))} />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {tim.map((t, i) => {
              const capai = [0.92, 0.78, 0.64, 0.51, 0.44][i] ?? 0.4
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <Avatar nama={t.nama} src={t.avatar_url} ukuran="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{t.nama}</p>
                      <span className="shrink-0 text-xs font-bold">{formatPersen(capai, 0)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={capai >= 0.75 ? 'h-full rounded-full bg-success' : capai >= 0.5 ? 'h-full rounded-full bg-warning' : 'h-full rounded-full bg-danger'}
                        style={{ width: `${capai * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Perlu ditindaklanjuti</JudulKartu>
              <DeskripsiKartu>Prospek yang belum dihubungi kembali</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {prospek.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.perusahaan} · {formatWaktuRelatif(p.updated_at)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{formatRp(p.total_belanja)}</p>
                  <Lencana ukuran="sm" warna={p.status === 'aktif' ? 'success' : 'netral'}>
                    {p.status}
                  </Lencana>
                </div>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/crm')({ component: DasborCrm })
