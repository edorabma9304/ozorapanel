import { createFileRoute } from '@tanstack/react-router'
import { CalendarOff, Check, Clock, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { SaringCepat } from '@/components/data/bilah-alat'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { KeadaanKosong, Konfirmasi, IsiKonfirmasi, PemicuKonfirmasi } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatTanggal, formatWaktuRelatif } from '@/lib/format'
import { CUTI_CONTOH, type Cuti } from '@/lib/adapter/data-contoh'

const WARNA_STATUS: Record<Cuti['status'], WarnaLencana> = {
  menunggu: 'warning',
  disetujui: 'success',
  ditolak: 'danger',
}

const WARNA_JENIS: Record<Cuti['jenis'], WarnaLencana> = {
  tahunan: 'primary',
  sakit: 'danger',
  melahirkan: 'secondary',
  penting: 'info',
  'tanpa gaji': 'netral',
}

const JATAH_TAHUNAN = 12

function HalamanCuti() {
  const { boleh } = useAuth()
  const [cuti, setCuti] = useState(CUTI_CONTOH)
  const [status, setStatus] = useState<string | undefined>('menunggu')

  if (!boleh('pengguna.lihat') && !boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  const hasil = status ? cuti.filter((c) => c.status === status) : cuti
  const hitung = (s: Cuti['status']) => cuti.filter((c) => c.status === s).length

  function putuskan(id: string, baru: Cuti['status'], nama: string) {
    setCuti((s) => s.map((c) => (c.id === id ? { ...c, status: baru } : c)))
    toast.success(baru === 'disetujui' ? `Cuti ${nama} disetujui.` : `Cuti ${nama} ditolak.`)
  }

  return (
    <>
      <KepalaHalaman
        judul="Cuti &amp; izin"
        deskripsi="Pengajuan cuti karyawan beserta alur persetujuannya."
        remah={[{ label: 'Aplikasi' }, { label: 'Cuti' }]}
        aksi={<Tombol><Plus /> Ajukan cuti</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Menunggu persetujuan" nilai={hitung('menunggu')} ikon={Clock} warna="warning" keterangan="perlu ditinjau" />
        <KartuStatistik label="Disetujui" nilai={hitung('disetujui')} ikon={Check} warna="success" />
        <KartuStatistik label="Ditolak" nilai={hitung('ditolak')} ikon={X} warna="danger" />
        <KartuStatistik
          label="Total hari diambil"
          nilai={formatAngka(cuti.filter((c) => c.status === 'disetujui').reduce((a, b) => a + b.lama, 0))}
          ikon={CalendarOff}
          warna="info"
          keterangan="tahun berjalan"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Sisa jatah cuti</JudulKartu>
              <DeskripsiKartu>{JATAH_TAHUNAN} hari per karyawan per tahun</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-3.5">
            {[...new Set(cuti.map((c) => c.karyawan_nama))].slice(0, 6).map((nama) => {
              const dipakai = cuti
                .filter((c) => c.karyawan_nama === nama && c.status === 'disetujui')
                .reduce((a, b) => a + b.lama, 0)
              const sisa = Math.max(0, JATAH_TAHUNAN - dipakai)
              return (
                <Progres
                  key={nama}
                  nilai={(dipakai / JATAH_TAHUNAN) * 100}
                  warna={sisa <= 2 ? 'danger' : sisa <= 5 ? 'warning' : 'success'}
                  tebal="sm"
                  label={
                    <span className="flex items-baseline gap-2 text-sm">
                      <span className="truncate">{nama}</span>
                      <span className="shrink-0 text-xs font-normal text-muted-foreground">sisa {sisa} hari</span>
                    </span>
                  }
                />
              )
            })}
          </IsiKartu>
        </Kartu>

        <div className="space-y-4 lg:col-span-2">
          <Kartu className="overflow-hidden pt-4">
            <SaringCepat
              nilai={status}
              onUbah={setStatus}
              totalSemua={cuti.length}
              opsi={(['menunggu', 'disetujui', 'ditolak'] as const).map((s) => ({
                nilai: s,
                label: s,
                jumlah: hitung(s),
              }))}
              className="border-b-0 pb-4"
            />
          </Kartu>

          {hasil.length === 0 ? (
            <Kartu>
              <KeadaanKosong judul="Tidak ada pengajuan" deskripsi="Semua pengajuan pada kategori ini sudah diproses." />
            </Kartu>
          ) : (
            hasil.map((c) => (
              <Kartu key={c.id}>
                <IsiKartu>
                  <div className="flex flex-wrap items-start gap-4">
                    <Avatar nama={c.karyawan_nama} src={c.avatar} ukuran="md" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-bold">{c.karyawan_nama}</p>
                        <Lencana warna="netral" ukuran="sm">{c.departemen}</Lencana>
                        <Lencana warna={WARNA_JENIS[c.jenis]} ukuran="sm">{c.jenis}</Lencana>
                        <Lencana warna={WARNA_STATUS[c.status]} ukuran="sm">{c.status}</Lencana>
                      </div>

                      <p className="mt-1.5 text-sm">
                        <span className="font-semibold">{c.lama} hari</span>
                        <span className="text-muted-foreground">
                          {' · '}{formatTanggal(c.mulai)} – {formatTanggal(c.selesai)}
                        </span>
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{c.alasan}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Diajukan {formatWaktuRelatif(c.created_at)}
                      </p>
                    </div>

                    {c.status === 'menunggu' ? (
                      <div className="flex shrink-0 gap-2">
                        <Konfirmasi>
                          <PemicuKonfirmasi asChild>
                            <Tombol varian="garis" ukuran="sm"><X /> Tolak</Tombol>
                          </PemicuKonfirmasi>
                          <IsiKonfirmasi
                            judul={`Tolak pengajuan cuti ${c.karyawan_nama}?`}
                            deskripsi="Karyawan akan menerima pemberitahuan beserta alasannya. Keputusan masih bisa diubah nanti."
                            labelLanjut="Ya, tolak"
                            onLanjut={() => putuskan(c.id, 'ditolak', c.karyawan_nama)}
                          />
                        </Konfirmasi>
                        <Tombol varian="sukses" ukuran="sm" onClick={() => putuskan(c.id, 'disetujui', c.karyawan_nama)}>
                          <Check /> Setujui
                        </Tombol>
                      </div>
                    ) : null}
                  </div>
                </IsiKartu>
              </Kartu>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/cuti')({ component: HalamanCuti })
