import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, FolderKanban, MoreVertical, Plus, TrendingUp, Wallet } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { SaringCepat } from '@/components/data/bilah-alat'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { TumpukanAvatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { formatPersen, formatRp, formatRpRingkas, formatTanggal } from '@/lib/format'
import { PROYEK_CONTOH, type Proyek } from '@/lib/adapter/data-contoh'

const WARNA_STATUS: Record<Proyek['status'], WarnaLencana> = {
  perencanaan: 'info',
  berjalan: 'primary',
  ditunda: 'warning',
  selesai: 'success',
}

const WARNA_PRIORITAS: Record<Proyek['prioritas'], WarnaLencana> = {
  rendah: 'netral',
  sedang: 'info',
  tinggi: 'danger',
}

function HalamanProyek() {
  const [status, setStatus] = useState<string | undefined>()
  const hasil = status ? PROYEK_CONTOH.filter((p) => p.status === status) : PROYEK_CONTOH

  const anggaran = PROYEK_CONTOH.reduce((a, b) => a + b.anggaran, 0)
  const terpakai = PROYEK_CONTOH.reduce((a, b) => a + b.terpakai, 0)

  return (
    <>
      <KepalaHalaman
        judul="Proyek"
        deskripsi="Inisiatif yang sedang berjalan beserta kemajuan, anggaran, dan timnya."
        remah={[{ label: 'Aplikasi' }, { label: 'Proyek' }]}
        aksi={<Tombol><Plus /> Proyek baru</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total proyek" nilai={PROYEK_CONTOH.length} ikon={FolderKanban} warna="primary" />
        <KartuStatistik label="Sedang berjalan" nilai={PROYEK_CONTOH.filter((p) => p.status === 'berjalan').length} ikon={TrendingUp} warna="info" />
        <KartuStatistik label="Total anggaran" nilai={formatRpRingkas(anggaran)} ikon={Wallet} warna="success" />
        <KartuStatistik
          label="Anggaran terpakai"
          nilai={formatPersen(terpakai / anggaran, 0)}
          ikon={Wallet}
          warna={terpakai / anggaran > 0.85 ? 'danger' : 'warning'}
          keterangan={formatRpRingkas(terpakai)}
        />
      </div>

      <Kartu className="overflow-hidden pt-4">
        <SaringCepat
          nilai={status}
          onUbah={setStatus}
          totalSemua={PROYEK_CONTOH.length}
          opsi={(['perencanaan', 'berjalan', 'ditunda', 'selesai'] as const).map((s) => ({
            nilai: s,
            label: s,
            jumlah: PROYEK_CONTOH.filter((p) => p.status === s).length,
          }))}
          className="border-b-0 pb-4"
        />
      </Kartu>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong ikon={FolderKanban} judul="Tidak ada proyek" deskripsi="Coba pilih status lain." />
        </Kartu>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hasil.map((p) => {
            const lewatAnggaran = p.terpakai > p.anggaran
            return (
              <Kartu key={p.id} className="flex flex-col transition-shadow hover:shadow-raised">
                <IsiKartu className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Lencana warna={WARNA_STATUS[p.status]}>{p.status}</Lencana>
                      <Lencana warna={WARNA_PRIORITAS[p.prioritas]} ukuran="sm">{p.prioritas}</Lencana>
                    </div>
                    <Dropdown>
                      <PemicuDropdown asChild>
                        <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${p.nama}`}><MoreVertical /></Tombol>
                      </PemicuDropdown>
                      <IsiDropdown>
                        <ItemDropdown>Lihat detail</ItemDropdown>
                        <ItemDropdown>Ubah proyek</ItemDropdown>
                        <ItemDropdown bahaya>Arsipkan</ItemDropdown>
                      </IsiDropdown>
                    </Dropdown>
                  </div>

                  <JudulKartu className="mt-3">{p.nama}</JudulKartu>
                  <DeskripsiKartu>{p.klien}</DeskripsiKartu>

                  <div className="mt-4">
                    <Progres
                      nilai={p.kemajuan}
                      warna={p.kemajuan === 100 ? 'success' : p.kemajuan > 50 ? 'primary' : 'warning'}
                      label={<span className="text-xs text-muted-foreground">Kemajuan</span>}
                      tampilkanNilai
                    />
                  </div>

                  <dl className="mt-4 flex-1 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Tugas</dt>
                      <dd className="font-semibold">{p.tugas.selesai}/{p.tugas.total}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Anggaran</dt>
                      <dd className="font-semibold">{formatRp(p.anggaran)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Terpakai</dt>
                      <dd className={lewatAnggaran ? 'font-bold text-danger-kuat' : 'font-semibold'}>
                        {formatRp(p.terpakai)}
                      </dd>
                    </div>
                  </dl>

                  {lewatAnggaran ? (
                    <p className="mt-3 rounded-card bg-danger-soft p-2.5 text-xs text-danger-kuat">
                      Anggaran terlampaui {formatRp(p.terpakai - p.anggaran)}.
                    </p>
                  ) : null}
                </IsiKartu>

                <KakiKartu className="justify-between">
                  <TumpukanAvatar orang={p.tim} maks={4} ukuran="xs" />
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {formatTanggal(p.tenggat)}
                  </span>
                </KakiKartu>
              </Kartu>
            )
          })}
        </div>
      )}
    </>
  )
}

export const Route = createFileRoute('/_app/apl/proyek')({ component: HalamanProyek })
