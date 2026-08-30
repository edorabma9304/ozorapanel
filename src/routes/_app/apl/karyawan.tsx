import { createFileRoute } from '@tanstack/react-router'
import { Briefcase, Mail, MoreVertical, Phone, Plus, UserRound, Users } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Tombol, GrupTombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatTanggal } from '@/lib/format'
import { DEPARTEMEN, KARYAWAN_CONTOH, SHIFT, type Karyawan } from '@/lib/adapter/data-contoh'

const WARNA_STATUS: Record<Karyawan['status_kerja'], WarnaLencana> = {
  tetap: 'success',
  kontrak: 'warning',
  harian: 'info',
}

function HalamanKaryawan() {
  const { boleh } = useAuth()
  const [tampilan, setTampilan] = useState<'kartu' | 'tabel'>('tabel')
  const t = useDaftarTabel<Karyawan>('karyawan', { urutAwal: { kolom: 'nama', arah: 'naik' }, perHalamanAwal: 12 })

  if (!boleh('pengguna.lihat') && !boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Karyawan>> = [
    {
      kunci: 'nama',
      judul: 'Karyawan',
      urutkan: true,
      render: (k) => (
        <div className="flex items-center gap-3">
          <Avatar nama={k.nama} src={k.avatar} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{k.nama}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{k.nip}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'departemen', judul: 'Departemen', urutkan: true, render: (k) => <Lencana warna="primary" ukuran="sm">{k.departemen}</Lencana> },
    { kunci: 'jabatan', judul: 'Jabatan', sembunyiHp: true, render: (k) => <span className="text-muted-foreground">{k.jabatan}</span> },
    { kunci: 'shift', judul: 'Shift', urutkan: true, sembunyiHp: true, render: (k) => k.shift },
    { kunci: 'status_kerja', judul: 'Status', urutkan: true, render: (k) => <Lencana warna={WARNA_STATUS[k.status_kerja]}>{k.status_kerja}</Lencana> },
    { kunci: 'masuk_kerja', judul: 'Bergabung', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (k) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggal(k.masuk_kerja)}</span> },
  ]

  const perDepartemen = DEPARTEMEN.map((d) => ({
    nama: d,
    jumlah: KARYAWAN_CONTOH.filter((k) => k.departemen === d).length,
  }))

  return (
    <>
      <KepalaHalaman
        judul="Karyawan"
        deskripsi="Data kepegawaian, departemen, shift, dan status kerja."
        remah={[{ label: 'Aplikasi' }, { label: 'Karyawan' }]}
        aksi={<Tombol><Plus /> Tambah karyawan</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total karyawan" nilai={KARYAWAN_CONTOH.length} ikon={Users} warna="primary" />
        <KartuStatistik label="Aktif" nilai={KARYAWAN_CONTOH.filter((k) => k.aktif).length} ikon={UserRound} warna="success" />
        <KartuStatistik label="Karyawan tetap" nilai={KARYAWAN_CONTOH.filter((k) => k.status_kerja === 'tetap').length} ikon={Briefcase} warna="info" />
        <KartuStatistik
          label="Beban gaji bulanan"
          nilai={formatRp(KARYAWAN_CONTOH.filter((k) => k.aktif).reduce((a, b) => a + b.gaji_pokok + b.tunjangan, 0))}
          ikon={Briefcase}
          warna="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Sebaran departemen</JudulKartu>
              <DeskripsiKartu>Jumlah karyawan per bagian</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-3.5">
            {perDepartemen.map((d) => (
              <Progres
                key={d.nama}
                nilai={(d.jumlah / KARYAWAN_CONTOH.length) * 100}
                warna="primary"
                tebal="sm"
                label={
                  <span className="flex items-baseline gap-2 text-sm">
                    {d.nama}
                    <span className="text-xs font-normal text-muted-foreground">{d.jumlah} orang</span>
                  </span>
                }
              />
            ))}
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Jadwal shift</JudulKartu>
              <DeskripsiKartu>Pembagian jam kerja dan jumlah orangnya</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="grid gap-4 sm:grid-cols-3">
            {SHIFT.map((s) => {
              const jumlah = KARYAWAN_CONTOH.filter((k) => k.shift === s.nama).length
              return (
                <div key={s.id} className="rounded-card border border-border p-4">
                  <Lencana warna={s.warna}>{s.nama}</Lencana>
                  <p className="mt-3 text-lg font-extrabold">{s.mulai} – {s.selesai}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatAngka(jumlah)} karyawan</p>
                </div>
              )
            })}
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama, NIP, atau jabatan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
          kanan={
            <GrupTombol>
              <Tombol varian={tampilan === 'tabel' ? 'halus' : 'garis'} ukuran="sm" onClick={() => setTampilan('tabel')} aria-pressed={tampilan === 'tabel'}>Tabel</Tombol>
              <Tombol varian={tampilan === 'kartu' ? 'halus' : 'garis'} ukuran="sm" onClick={() => setTampilan('kartu')} aria-pressed={tampilan === 'kartu'}>Kartu</Tombol>
            </GrupTombol>
          }
        />
        <SaringCepat
          nilai={t.filter['departemen']}
          onUbah={(n) => t.ubahFilter('departemen', n)}
          totalSemua={KARYAWAN_CONTOH.length}
          opsi={perDepartemen.map((d) => ({ nilai: d.nama, label: d.nama, jumlah: d.jumlah }))}
        />

        {tampilan === 'tabel' ? (
          <TabelData<Karyawan>
            kolom={kolom}
            idBaris={(k) => k.id}
            {...t.propsTabel}
            aksi={(k) => (
              <Dropdown>
                <PemicuDropdown asChild>
                  <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${k.nama}`}><MoreVertical /></Tombol>
                </PemicuDropdown>
                <IsiDropdown>
                  <ItemDropdown asChild><a href={`mailto:${k.email}`}><Mail /> Kirim surel</a></ItemDropdown>
                  <ItemDropdown asChild><a href={`tel:${k.telepon}`}><Phone /> Telepon</a></ItemDropdown>
                </IsiDropdown>
              </Dropdown>
            )}
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {(t.hasil.data?.data ?? []).map((k) => (
              <Kartu key={k.id} className="text-center">
                <IsiKartu>
                  <Avatar nama={k.nama} src={k.avatar} ukuran="xl" className="mx-auto" />
                  <p className="mt-3 truncate font-bold">{k.nama}</p>
                  <p className="truncate text-sm text-muted-foreground">{k.jabatan}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    <Lencana warna="primary" ukuran="sm">{k.departemen}</Lencana>
                    <Lencana warna={WARNA_STATUS[k.status_kerja]} ukuran="sm">{k.status_kerja}</Lencana>
                  </div>
                  <p className="mt-3 font-mono text-xs text-muted-foreground">{k.nip}</p>
                </IsiKartu>
              </Kartu>
            ))}
          </div>
        )}
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/karyawan')({ component: HalamanKaryawan })
