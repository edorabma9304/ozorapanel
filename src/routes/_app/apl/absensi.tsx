import { createFileRoute } from '@tanstack/react-router'
import { CalendarCheck, Clock, Download, TriangleAlert, UserX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { SaringCepat } from '@/components/data/bilah-alat'
import { Bagan } from '@/components/bagan/bagan'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Tooltip } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatPersen, formatTanggal } from '@/lib/format'
import { ABSENSI_CONTOH, DEPARTEMEN, KARYAWAN_CONTOH } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

type Status = 'hadir' | 'terlambat' | 'izin' | 'alfa' | 'libur'

/** Warna sel peta kalor — ditulis lengkap karena Tailwind memindai kode statis. */
const SEL_STATUS: Record<Status, string> = {
  hadir: 'bg-success',
  terlambat: 'bg-warning',
  izin: 'bg-info',
  alfa: 'bg-danger',
  libur: 'bg-muted',
}

function HalamanAbsensi() {
  const { boleh } = useAuth()
  const [departemen, setDepartemen] = useState<string | undefined>()

  const karyawan = useMemo(
    () => KARYAWAN_CONTOH.filter((k) => k.aktif && (!departemen || k.departemen === departemen)),
    [departemen],
  )

  const catatan = useMemo(
    () => ABSENSI_CONTOH.filter((a) => karyawan.some((k) => k.id === a.karyawan_id)),
    [karyawan],
  )

  const hariKerja = catatan.filter((a) => a.status !== 'libur')
  const hitung = (s: Status) => hariKerja.filter((a) => a.status === s).length
  const rasioHadir = hariKerja.length ? (hitung('hadir') + hitung('terlambat')) / hariKerja.length : 0

  // Tanggal 30 hari terakhir, terbaru di kanan.
  const tanggal = useMemo(() => {
    const dasar = new Date('2026-08-30T00:00:00+07:00')
    return Array.from({ length: 30 }, (_, i) => new Date(dasar.getTime() - (29 - i) * 86_400_000))
  }, [])

  const perHari = tanggal.map((d) => {
    const kunci = d.toDateString()
    const hari = catatan.filter((a) => new Date(a.tanggal).toDateString() === kunci && a.status !== 'libur')
    return {
      tanggal: d,
      hadir: hari.filter((a) => a.status === 'hadir').length,
      terlambat: hari.filter((a) => a.status === 'terlambat').length,
      absen: hari.filter((a) => a.status === 'alfa' || a.status === 'izin').length,
    }
  })

  if (!boleh('pengguna.lihat') && !boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  return (
    <>
      <KepalaHalaman
        judul="Absensi"
        deskripsi="Kehadiran 30 hari terakhir, lengkap dengan peta kalor per karyawan."
        remah={[{ label: 'Aplikasi' }, { label: 'Absensi' }]}
        aksi={<Tombol varian="garis"><Download /> Ekspor rekap</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Tingkat kehadiran" nilai={formatPersen(rasioHadir, 1)} ikon={CalendarCheck} warna="success" keterangan="30 hari terakhir" />
        <KartuStatistik label="Terlambat" nilai={formatAngka(hitung('terlambat'))} ikon={Clock} warna="warning" keterangan="kejadian" />
        <KartuStatistik label="Izin" nilai={formatAngka(hitung('izin'))} ikon={UserX} warna="info" keterangan="kejadian" />
        <KartuStatistik label="Tanpa keterangan" nilai={formatAngka(hitung('alfa'))} ikon={TriangleAlert} warna="danger" keterangan="perlu ditindaklanjuti" />
      </div>

      <Kartu className="overflow-hidden pt-4">
        <SaringCepat
          nilai={departemen}
          onUbah={setDepartemen}
          totalSemua={KARYAWAN_CONTOH.filter((k) => k.aktif).length}
          opsi={DEPARTEMEN.map((d) => ({
            nilai: d,
            label: d,
            jumlah: KARYAWAN_CONTOH.filter((k) => k.aktif && k.departemen === d).length,
          }))}
          className="border-b-0 pb-4"
        />
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Kehadiran harian</JudulKartu>
            <DeskripsiKartu>Bertumpuk: hadir, terlambat, dan absen</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Bagan
            jenis="bar"
            tinggi={300}
            deret={[
              { name: 'Hadir', data: perHari.map((h) => h.hadir) },
              { name: 'Terlambat', data: perHari.map((h) => h.terlambat) },
              { name: 'Absen', data: perHari.map((h) => h.absen) },
            ]}
            opsi={{
              chart: { stacked: true },
              colors: ['#13deb9', '#ffae1f', '#fa896b'],
              xaxis: {
                categories: perHari.map((h) => String(h.tanggal.getDate())),
                tickAmount: 10,
              },
              plotOptions: { bar: { columnWidth: '65%', borderRadius: 3, borderRadiusApplication: 'end' } },
            }}
          />
        </IsiKartu>
      </Kartu>

      {/* Peta kalor */}
      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Peta kehadiran per karyawan</JudulKartu>
            <DeskripsiKartu>Satu kotak = satu hari. Arahkan kursor untuk melihat detailnya.</DeskripsiKartu>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            {(['hadir', 'terlambat', 'izin', 'alfa', 'libur'] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className={cn('size-3 rounded-sm', SEL_STATUS[s])} />
                {s}
              </span>
            ))}
          </div>
        </KepalaKartu>

        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-max p-4 pt-0">
            {karyawan.slice(0, 14).map((k) => {
              const baris = tanggal.map((d) => {
                const kunci = d.toDateString()
                return catatan.find(
                  (a) => a.karyawan_id === k.id && new Date(a.tanggal).toDateString() === kunci,
                )
              })
              const hadir = baris.filter((b) => b?.status === 'hadir' || b?.status === 'terlambat').length
              const total = baris.filter((b) => b && b.status !== 'libur').length

              return (
                <div key={k.id} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                  <div className="flex w-52 shrink-0 items-center gap-2.5">
                    <Avatar nama={k.nama} src={k.avatar} ukuran="xs" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{k.nama}</p>
                      <p className="truncate text-xs text-muted-foreground">{k.departemen}</p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {baris.map((b, i) => (
                      <Tooltip
                        key={i}
                        isi={
                          <span>
                            {formatTanggal(tanggal[i]!)} · {b?.status ?? 'tidak ada data'}
                            {b?.menit_terlambat ? ` (${b.menit_terlambat} menit)` : ''}
                          </span>
                        }
                      >
                        <span
                          className={cn(
                            'size-4 rounded-sm transition-transform hover:scale-125',
                            SEL_STATUS[(b?.status ?? 'libur') as Status],
                          )}
                        />
                      </Tooltip>
                    ))}
                  </div>

                  <div className="ml-4 w-28 shrink-0">
                    <Progres
                      nilai={total ? (hadir / total) * 100 : 0}
                      warna={total && hadir / total >= 0.9 ? 'success' : 'warning'}
                      tebal="sm"
                      tampilkanNilai
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Kartu>

      {/* Paling sering terlambat */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Paling sering terlambat</JudulKartu>
            <DeskripsiKartu>Lima karyawan dengan keterlambatan terbanyak</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-3">
          {karyawan
            .map((k) => ({
              k,
              telat: catatan.filter((a) => a.karyawan_id === k.id && a.status === 'terlambat').length,
              menit: catatan
                .filter((a) => a.karyawan_id === k.id)
                .reduce((a, b) => a + b.menit_terlambat, 0),
            }))
            .sort((a, b) => b.telat - a.telat)
            .slice(0, 5)
            .map(({ k, telat, menit }) => (
              <div key={k.id} className="flex items-center gap-3">
                <Avatar nama={k.nama} src={k.avatar} ukuran="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{k.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">{k.jabatan}</p>
                </div>
                <Lencana warna={telat > 5 ? 'danger' : 'warning'}>{telat}× terlambat</Lencana>
                <span className="w-20 shrink-0 text-right text-sm text-muted-foreground">{formatAngka(menit)} menit</span>
              </div>
            ))}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/absensi')({ component: HalamanAbsensi })
