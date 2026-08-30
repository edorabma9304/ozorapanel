import { createFileRoute } from '@tanstack/react-router'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { ACARA_CONTOH } from '@/lib/adapter/data-contoh'
import { formatTanggal } from '@/lib/format'
import { cn } from '@/lib/utils'

const NAMA_HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const WARNA_JENIS: Record<string, WarnaLencana> = {
  rapat: 'primary',
  tenggat: 'danger',
  libur: 'success',
  acara: 'warning',
}

/** Bangun kisi 6×7 yang selalu mulai hari Senin. */
function kisiBulan(tahun: number, bulan: number) {
  const pertama = new Date(tahun, bulan, 1)
  const geser = (pertama.getDay() + 6) % 7 // Minggu(0) -> 6
  const mulai = new Date(tahun, bulan, 1 - geser)
  return Array.from({ length: 42 }, (_, i) => new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate() + i))
}

const kunciTanggal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function HalamanKalender() {
  const hariIni = new Date()
  const [kursor, setKursor] = useState(new Date(hariIni.getFullYear(), hariIni.getMonth(), 1))

  const acaraPerTanggal = useMemo(() => {
    const peta = new Map<string, typeof ACARA_CONTOH>()
    for (const a of ACARA_CONTOH) {
      const k = kunciTanggal(new Date(a.tanggal))
      peta.set(k, [...(peta.get(k) ?? []), a])
    }
    return peta
  }, [])

  const hari = kisiBulan(kursor.getFullYear(), kursor.getMonth())
  const namaBulan = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(kursor)

  const mendatang = [...ACARA_CONTOH]
    .filter((a) => new Date(a.tanggal) >= new Date(hariIni.toDateString()))
    .sort((a, b) => +new Date(a.tanggal) - +new Date(b.tanggal))
    .slice(0, 6)

  function geserBulan(delta: number) {
    setKursor((k) => new Date(k.getFullYear(), k.getMonth() + delta, 1))
  }

  return (
    <>
      <KepalaHalaman
        judul="Kalender"
        deskripsi="Jadwal rapat, tenggat, dan agenda tim."
        remah={[{ label: 'Aplikasi' }, { label: 'Kalender' }]}
        aksi={<Tombol><CalendarPlus /> Tambah acara</Tombol>}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Kartu className="lg:col-span-3">
          <KepalaKartu>
            <JudulKartu className="capitalize">{namaBulan}</JudulKartu>
            <div className="flex items-center gap-1">
              <Tombol varian="garis" ukuran="ikon-sm" onClick={() => geserBulan(-1)} aria-label="Bulan sebelumnya">
                <ChevronLeft />
              </Tombol>
              <Tombol varian="garis" ukuran="sm" onClick={() => setKursor(new Date(hariIni.getFullYear(), hariIni.getMonth(), 1))}>
                Hari ini
              </Tombol>
              <Tombol varian="garis" ukuran="ikon-sm" onClick={() => geserBulan(1)} aria-label="Bulan berikutnya">
                <ChevronRight />
              </Tombol>
            </div>
          </KepalaKartu>

          <IsiKartu className="pt-4">
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-card border border-border bg-border">
              {NAMA_HARI.map((h) => (
                <div key={h} className="bg-muted px-2 py-2 text-center text-xs font-bold uppercase text-muted-foreground">
                  {h}
                </div>
              ))}

              {hari.map((d) => {
                const diBulanIni = d.getMonth() === kursor.getMonth()
                const iniHariIni = d.toDateString() === hariIni.toDateString()
                const acara = acaraPerTanggal.get(kunciTanggal(d)) ?? []
                return (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      'min-h-24 bg-card p-1.5 transition-colors',
                      !diBulanIni && 'bg-muted/40 text-muted-foreground/60',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-grid size-6 place-items-center rounded-full text-xs font-bold',
                        iniHariIni && 'bg-primary text-primary-foreground',
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <div className="mt-1 space-y-1">
                      {acara.slice(0, 2).map((a) => (
                        <p
                          key={a.id}
                          title={a.judul}
                          className={cn(
                            'truncate rounded px-1.5 py-0.5 text-[11px] font-semibold',
                            a.jenis === 'rapat' && 'bg-primary-soft text-primary-kuat',
                            a.jenis === 'tenggat' && 'bg-danger-soft text-danger-kuat',
                            a.jenis === 'libur' && 'bg-success-soft text-success-kuat',
                            a.jenis === 'acara' && 'bg-warning-soft text-warning-kuat',
                          )}
                        >
                          {a.judul}
                        </p>
                      ))}
                      {acara.length > 2 ? (
                        <p className="px-1.5 text-[11px] text-muted-foreground">+{acara.length - 2} lagi</p>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu className="h-fit">
          <KepalaKartu>
            <div>
              <JudulKartu>Agenda terdekat</JudulKartu>
              <DeskripsiKartu>Enam acara berikutnya</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {mendatang.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="w-11 shrink-0 rounded-card bg-muted py-1.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(a.tanggal))}
                  </p>
                  <p className="text-base font-extrabold leading-none">{new Date(a.tanggal).getDate()}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.judul}</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Lencana ukuran="sm" warna={WARNA_JENIS[a.jenis] ?? 'netral'}>{a.jenis}</Lencana>
                    <span className="text-xs text-muted-foreground">{formatTanggal(a.tanggal)}</span>
                  </p>
                </div>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/kalender')({ component: HalamanKalender })
