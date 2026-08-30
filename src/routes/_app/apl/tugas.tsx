import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays, CheckCircle2, Circle, MessageSquare, MoreVertical, Paperclip, Plus, Search, Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { IsiKartu, Kartu, JudulKartu, KepalaKartu, DeskripsiKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { KotakCentang } from '@/components/ui/kendali'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { SaringCepat } from '@/components/data/bilah-alat'
import { formatAngka, formatTanggal } from '@/lib/format'
import { TUGAS_CONTOH } from '@/lib/adapter/data-contoh'
import { idAcak, cn } from '@/lib/utils'

const DAFTAR = ['Hari ini', 'Minggu ini', 'Menunggu', 'Selesai'] as const
const WARNA_PRIORITAS: Record<string, WarnaLencana> = {
  rendah: 'netral',
  sedang: 'info',
  tinggi: 'danger',
}

function DaftarTugas() {
  const [tugas, setTugas] = useState(TUGAS_CONTOH)
  const [cari, setCari] = useState('')
  const [daftar, setDaftar] = useState<string | undefined>()
  const [draf, setDraf] = useState('')

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return tugas.filter((t) => (!q || t.judul.toLowerCase().includes(q)) && (!daftar || t.daftar === daftar))
  }, [tugas, cari, daftar])

  const selesai = tugas.filter((t) => t.selesai).length
  const kemajuan = tugas.length ? (selesai / tugas.length) * 100 : 0

  function tambah(e: React.FormEvent) {
    e.preventDefault()
    const judul = draf.trim()
    if (!judul) return
    const waktu = new Date().toISOString()
    setTugas((s) => [
      {
        id: idAcak(8),
        created_at: waktu,
        updated_at: waktu,
        deleted_at: null,
        judul,
        keterangan: '',
        daftar: 'Hari ini',
        prioritas: 'sedang',
        selesai: false,
        penanggung: 'Saya',
        avatar: '',
        tenggat: waktu,
        subtugas: { selesai: 0, total: 0 },
        lampiran: 0,
        komentar: 0,
      },
      ...s,
    ])
    setDraf('')
    toast.success('Tugas ditambahkan.')
  }

  return (
    <>
      <KepalaHalaman
        judul="Daftar tugas"
        deskripsi="Pekerjaan tim dalam bentuk daftar. Untuk tampilan papan, buka menu Papan Kanban."
        remah={[{ label: 'Aplikasi' }, { label: 'Tugas' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total tugas" nilai={formatAngka(tugas.length)} ikon={CheckCircle2} warna="primary" />
        <KartuStatistik label="Selesai" nilai={formatAngka(selesai)} ikon={CheckCircle2} warna="success" />
        <KartuStatistik label="Belum selesai" nilai={formatAngka(tugas.length - selesai)} ikon={Circle} warna="warning" />
        <KartuStatistik
          label="Prioritas tinggi"
          nilai={formatAngka(tugas.filter((t) => t.prioritas === 'tinggi' && !t.selesai).length)}
          ikon={Circle}
          warna="danger"
        />
      </div>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Kemajuan keseluruhan</JudulKartu>
            <DeskripsiKartu>{selesai} dari {tugas.length} tugas selesai</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Progres nilai={kemajuan} warna={kemajuan > 66 ? 'success' : kemajuan > 33 ? 'warning' : 'danger'} tebal="lg" tampilkanNilai />
        </IsiKartu>
      </Kartu>

      <Kartu className="overflow-hidden">
        <IsiKartu className="pb-4">
          <form onSubmit={tambah} className="flex gap-2">
            <Masukan
              value={draf}
              onChange={(e) => setDraf(e.target.value)}
              placeholder="Tambah tugas baru lalu tekan Enter…"
              aria-label="Tugas baru"
            />
            <Tombol type="submit" disabled={!draf.trim()}><Plus /> Tambah</Tombol>
          </form>

          <div className="relative mt-3 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Masukan
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari tugas…"
              className="pl-9"
              aria-label="Cari tugas"
            />
          </div>
        </IsiKartu>

        <SaringCepat
          nilai={daftar}
          onUbah={setDaftar}
          totalSemua={tugas.length}
          opsi={DAFTAR.map((d) => ({
            nilai: d,
            label: d,
            jumlah: tugas.filter((t) => t.daftar === d).length,
          }))}
        />

        {hasil.length === 0 ? (
          <KeadaanKosong judul="Tidak ada tugas" deskripsi="Semua beres, atau coba ubah filternya." />
        ) : (
          <ul className="divide-y divide-border">
            {hasil.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50">
                <KotakCentang
                  id={`tugas-${t.id}`}
                  checked={t.selesai}
                  onCheckedChange={() =>
                    setTugas((s) => s.map((x) => (x.id === t.id ? { ...x, selesai: !x.selesai } : x)))
                  }
                  className="mt-1"
                  aria-label={`Tandai ${t.judul}`}
                />

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`tugas-${t.id}`}
                    className={cn('block cursor-pointer text-sm font-semibold', t.selesai && 'text-muted-foreground line-through')}
                  >
                    {t.judul}
                  </label>
                  {t.keterangan ? (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{t.keterangan}</p>
                  ) : null}

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <Lencana warna={WARNA_PRIORITAS[t.prioritas] ?? 'netral'} ukuran="sm">{t.prioritas}</Lencana>
                    <Lencana warna="netral" ukuran="sm">{t.daftar}</Lencana>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" /> {formatTanggal(t.tenggat)}
                    </span>
                    {t.subtugas.total > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {t.subtugas.selesai}/{t.subtugas.total} subtugas
                      </span>
                    ) : null}
                    {t.lampiran > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="size-3.5" /> {t.lampiran}
                      </span>
                    ) : null}
                    {t.komentar > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="size-3.5" /> {t.komentar}
                      </span>
                    ) : null}
                  </div>
                </div>

                <Avatar nama={t.penanggung} src={t.avatar} ukuran="sm" className="mt-0.5 shrink-0" />

                <Dropdown>
                  <PemicuDropdown asChild>
                    <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${t.judul}`}><MoreVertical /></Tombol>
                  </PemicuDropdown>
                  <IsiDropdown>
                    <ItemDropdown
                      bahaya
                      onSelect={() => {
                        setTugas((s) => s.filter((x) => x.id !== t.id))
                        toast.success('Tugas dihapus.')
                      }}
                    >
                      <Trash2 /> Hapus
                    </ItemDropdown>
                  </IsiDropdown>
                </Dropdown>
              </li>
            ))}
          </ul>
        )}
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/tugas')({ component: DaftarTugas })
