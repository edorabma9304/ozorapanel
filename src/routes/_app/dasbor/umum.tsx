import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowUpRight, CalendarDays, CheckCircle2, Circle, ClipboardList, Package, Plus,
  Receipt, TrendingUp, Users, Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Bagan } from '@/components/bagan/bagan'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar, TumpukanAvatar } from '@/components/ui/avatar'
import { Pemisah } from '@/components/ui/lapisan'
import { formatAngka, formatRp, formatRpRingkas, formatTanggal, formatWaktuRelatif } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import {
  ACARA_CONTOH, AUDIT_CONTOH, BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGUNJUNG,
  PENGGUNA_CONTOH,
} from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const TUGAS_AWAL = [
  { id: 't1', judul: 'Tinjau laporan stok mingguan', tenggat: '2026-09-01', prioritas: 'tinggi' as const, selesai: false },
  { id: 't2', judul: 'Setujui pengajuan cuti tim produksi', tenggat: '2026-08-31', prioritas: 'sedang' as const, selesai: false },
  { id: 't3', judul: 'Kirim faktur ke PT Sinar Abadi', tenggat: '2026-09-02', prioritas: 'tinggi' as const, selesai: true },
  { id: 't4', judul: 'Perbarui harga jual kategori Elektronik', tenggat: '2026-09-05', prioritas: 'rendah' as const, selesai: false },
  { id: 't5', judul: 'Jadwalkan rapat koordinasi bulanan', tenggat: '2026-09-03', prioritas: 'sedang' as const, selesai: false },
]

const WARNA_PRIORITAS = { tinggi: 'danger', sedang: 'warning', rendah: 'netral' } as const

const PINTASAN = [
  { label: 'Buat faktur', href: '/apl/faktur/baru', ikon: Receipt },
  { label: 'Tambah produk', href: '/apl/produk', ikon: Package },
  { label: 'Kelola pengguna', href: '/pengguna', ikon: Users },
  { label: 'Lihat pesanan', href: '/apl/pesanan', ikon: ClipboardList },
] as const

function DasborUmum() {
  const { pengguna } = useAuth()
  const [tugas, setTugas] = useState(TUGAS_AWAL)

  const tim = PENGGUNA_CONTOH.slice(1, 9)
  const aktivitas = AUDIT_CONTOH.slice(0, 6)
  const agenda = [...ACARA_CONTOH]
    .sort((a, b) => +new Date(a.tanggal) - +new Date(b.tanggal))
    .slice(0, 4)
  const belumSelesai = tugas.filter((t) => !t.selesai).length

  return (
    <>
      <KepalaHalaman
        judul="Dasbor umum"
        deskripsi="Ringkasan harian: tugas, agenda, aktivitas tim, dan pintasan yang paling sering dipakai."
        remah={[{ label: 'Beranda' }, { label: 'Umum' }]}
      />

      {/* Sapaan + pintasan */}
      <Kartu className="overflow-hidden bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <IsiKartu className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div aria-hidden className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <Avatar nama={pengguna?.nama ?? 'Pengguna'} src={pengguna?.avatar_url} ukuran="xl" className="ring-4 ring-white/25" />
            <div>
              <h2 className="text-xl font-extrabold">Selamat datang, {pengguna?.nama.split(' ')[0]}</h2>
              <p className="mt-1 text-sm opacity-90">
                Ada <b>{belumSelesai} tugas</b> menunggu dan <b>{agenda.length} agenda</b> dalam waktu dekat.
              </p>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-2 sm:flex">
            {PINTASAN.map((p) => (
              <Tombol
                key={p.href}
                varian="garis"
                ukuran="sm"
                asChild
                className="border-white/35 bg-white/15 text-white hover:bg-white/25"
              >
                <Link to={p.href}><p.ikon /> {p.label}</Link>
              </Tombol>
            ))}
          </div>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Pendapatan bulan ini" nilai={formatRpRingkas(DERET_PENDAPATAN[7] ?? 0)} ikon={Wallet} warna="primary" tren={0.071} keterangan="vs bulan lalu" deret={DERET_PENGUNJUNG.slice(0, 12)} />
        <KartuStatistik label="Tugas selesai" nilai={`${tugas.length - belumSelesai}/${tugas.length}`} ikon={CheckCircle2} warna="success" keterangan="minggu ini" />
        <KartuStatistik label="Anggota tim aktif" nilai={formatAngka(PENGGUNA_CONTOH.filter((p) => p.aktif).length)} ikon={Users} warna="info" keterangan={`dari ${PENGGUNA_CONTOH.length} terdaftar`} />
        <KartuStatistik label="Pertumbuhan" nilai="+12,4%" ikon={TrendingUp} warna="warning" tren={0.124} keterangan="rata-rata 3 bulan" deret={DERET_PENGUNJUNG.slice(10, 22)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Tren pendapatan</JudulKartu>
              <DeskripsiKartu>Dua belas bulan terakhir</DeskripsiKartu>
            </div>
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/dasbor/analitik">Detail <ArrowUpRight /></Link>
            </Tombol>
          </KepalaKartu>
          <IsiKartu>
            <Bagan
              jenis="area"
              tinggi={300}
              deret={[{ name: 'Pendapatan', data: DERET_PENDAPATAN }]}
              opsi={{
                xaxis: { categories: BULAN_SINGKAT },
                yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.02 } },
                tooltip: { y: { formatter: (v) => formatRp(v) } },
              }}
            />
          </IsiKartu>
        </Kartu>

        {/* Daftar tugas */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Tugas saya</JudulKartu>
              <DeskripsiKartu>{belumSelesai} belum selesai</DeskripsiKartu>
            </div>
            <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Tambah tugas"><Plus /></Tombol>
          </KepalaKartu>
          <IsiKartu className="space-y-1">
            {tugas.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTugas((s) => s.map((x) => (x.id === t.id ? { ...x, selesai: !x.selesai } : x)))}
                className="flex w-full items-start gap-3 rounded-control p-2.5 text-left transition-colors hover:bg-muted"
                aria-pressed={t.selesai}
              >
                {t.selesai ? (
                  <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-success-kuat" />
                ) : (
                  <Circle className="mt-0.5 size-4.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm font-medium', t.selesai && 'text-muted-foreground line-through')}>
                    {t.judul}
                  </span>
                  <span className="mt-1 flex items-center gap-2">
                    <Lencana warna={WARNA_PRIORITAS[t.prioritas]} ukuran="sm">{t.prioritas}</Lencana>
                    <span className="text-xs text-muted-foreground">{formatTanggal(t.tenggat)}</span>
                  </span>
                </span>
              </button>
            ))}
          </IsiKartu>
          <KakiKartu className="justify-center">
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/apl/kanban">Buka papan kanban</Link>
            </Tombol>
          </KakiKartu>
        </Kartu>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Agenda */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Agenda terdekat</JudulKartu>
              <DeskripsiKartu>Empat acara berikutnya</DeskripsiKartu>
            </div>
            <CalendarDays className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {agenda.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div className="w-11 shrink-0 rounded-card bg-muted py-1.5 text-center">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(a.tanggal))}
                  </p>
                  <p className="text-base font-extrabold leading-none">{new Date(a.tanggal).getDate()}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.judul}</p>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">{a.jenis}</p>
                </div>
              </div>
            ))}
          </IsiKartu>
          <KakiKartu className="justify-center">
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/apl/kalender">Lihat kalender</Link>
            </Tombol>
          </KakiKartu>
        </Kartu>

        {/* Aktivitas tim */}
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Aktivitas tim</JudulKartu>
              <DeskripsiKartu>Perubahan data terbaru</DeskripsiKartu>
            </div>
            <TumpukanAvatar orang={tim.map((t) => ({ nama: t.nama, avatar: t.avatar_url }))} maks={5} />
          </KepalaKartu>
          <IsiKartu>
            <ol className="relative space-y-5 border-l border-border pl-5">
              {aktivitas.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full border-2 border-card bg-primary" />
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-sm font-semibold">{a.aktor_nama}</p>
                    <Lencana warna="netral" ukuran="sm">{a.modul}</Lencana>
                    <span className="text-xs text-muted-foreground">{formatWaktuRelatif(a.waktu)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.ringkasan}</p>
                </li>
              ))}
            </ol>
          </IsiKartu>
          <KakiKartu className="justify-center">
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/audit">Buka jejak audit</Link>
            </Tombol>
          </KakiKartu>
        </Kartu>
      </div>

      {/* Tim */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Tim Anda</JudulKartu>
            <DeskripsiKartu>Delapan anggota yang paling aktif</DeskripsiKartu>
          </div>
          <Tombol varian="hantu" ukuran="sm" asChild>
            <Link to="/pengguna">Kelola <ArrowUpRight /></Link>
          </Tombol>
        </KepalaKartu>
        <IsiKartu>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tim.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-card border border-border p-3">
                <Avatar nama={t.nama} src={t.avatar_url} ukuran="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.jabatan}</p>
                </div>
              </div>
            ))}
          </div>
          <Pemisah className="my-5" />
          <p className="text-center text-xs text-muted-foreground">
            Total {formatAngka(PENGGUNA_CONTOH.length)} pengguna terdaftar di sistem
          </p>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/dasbor/umum')({ component: DasborUmum })
