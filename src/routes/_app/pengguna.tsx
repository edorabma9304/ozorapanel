import { createFileRoute } from '@tanstack/react-router'
import { MoreVertical, Pencil, Plus, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import {
  Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown,
} from '@/components/ui/lapisan'
import { Konfirmasi, IsiKonfirmasi, PemicuKonfirmasi } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { FormPengguna } from '@/features/pengguna/form-pengguna'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useHapus } from '@/lib/kueri'
import { useAuth } from '@/lib/auth'
import { LABEL_PERAN, PERAN, WARNA_PERAN, adalahSuperadminBawaan } from '@/config/peran'
import { formatTanggal, formatWaktuRelatif } from '@/lib/format'
import type { Pengguna } from '@/lib/tipe'

/**
 * ============================================================================
 * JALUR EMAS — salin halaman ini saat membuat modul CRUD baru.
 *
 * Polanya: useDaftarTabel (pencarian + filter + urut + paginasi)
 *          → BilahAlat + SaringCepat → TabelData → dialog form → konfirmasi hapus.
 * Panduan langkah demi langkah ada di docs/RESEP.md.
 * ============================================================================
 */
function HalamanPengguna() {
  const { boleh, pengguna: sesi } = useAuth()
  const [formTerbuka, setFormTerbuka] = useState(false)
  const [sedangDiubah, setSedangDiubah] = useState<Pengguna | null>(null)

  const t = useDaftarTabel<Pengguna>('pengguna', {
    urutAwal: { kolom: 'nama', arah: 'naik' },
    perHalamanAwal: 10,
  })
  const hapus = useHapus('pengguna', 'Pengguna dinonaktifkan.')

  // Penjagaan tampilan. Otorisasi sesungguhnya tetap di backend (RLS/middleware).
  if (!boleh('pengguna.lihat')) return <HalamanTanpaAkses />

  function bukaTambah() {
    setSedangDiubah(null)
    setFormTerbuka(true)
  }

  function bukaUbah(p: Pengguna) {
    setSedangDiubah(p)
    setFormTerbuka(true)
  }

  const kolom: Array<Kolom<Pengguna>> = [
    {
      kunci: 'nama',
      judul: 'Pengguna',
      urutkan: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-semibold">
              {p.nama}
              {adalahSuperadminBawaan(p.email) ? (
                <ShieldCheck className="size-3.5 shrink-0 text-primary-kuat" aria-label="Superadmin bawaan" />
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      kunci: 'peran',
      judul: 'Peran',
      urutkan: true,
      render: (p) => <Lencana warna={WARNA_PERAN[p.peran]}>{LABEL_PERAN[p.peran]}</Lencana>,
    },
    {
      kunci: 'jabatan',
      judul: 'Jabatan',
      sembunyiHp: true,
      render: (p) => <span className="text-muted-foreground">{p.jabatan || '—'}</span>,
    },
    {
      kunci: 'aktif',
      judul: 'Status',
      render: (p) => (
        <Lencana warna={p.aktif ? 'success' : 'netral'}>{p.aktif ? 'Aktif' : 'Nonaktif'}</Lencana>
      ),
    },
    {
      kunci: 'terakhir_masuk',
      judul: 'Terakhir masuk',
      urutkan: true,
      sembunyiHp: true,
      render: (p) => (
        <span className="text-muted-foreground" title={formatTanggal(p.terakhir_masuk, 'panjang')}>
          {p.terakhir_masuk ? formatWaktuRelatif(p.terakhir_masuk) : 'Belum pernah'}
        </span>
      ),
    },
  ]

  const total = t.hasil.data?.total ?? 0

  return (
    <>
      <KepalaHalaman
        judul="Pengguna & peran"
        deskripsi="Kelola siapa saja yang bisa masuk dan sejauh mana aksesnya."
        remah={[{ label: 'Halaman' }, { label: 'Pengguna & peran' }]}
        aksi={
          boleh('pengguna.buat') ? (
            <Tombol onClick={bukaTambah}>
              <Plus /> Tambah pengguna
            </Tombol>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total pengguna" nilai={total} ikon={Users} warna="primary" />
        <KartuStatistik
          label="Aktif"
          nilai={t.hasil.data?.data.filter((p) => p.aktif).length ?? 0}
          ikon={ShieldCheck}
          warna="success"
          keterangan="pada halaman ini"
        />
        <KartuStatistik label="Peran tersedia" nilai={PERAN.length} ikon={UserPlus} warna="info" />
        <KartuStatistik
          label="Sesi Anda"
          nilai={sesi ? LABEL_PERAN[sesi.peran] : '—'}
          ikon={ShieldCheck}
          warna="warning"
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama atau surel…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
          kanan={
            t.terpilih.length > 0 ? (
              <Lencana warna="primary" padat>
                {t.terpilih.length} dipilih
              </Lencana>
            ) : null
          }
        />

        <SaringCepat
          nilai={t.filter['peran']}
          onUbah={(n) => t.ubahFilter('peran', n)}
          totalSemua={total}
          opsi={PERAN.map((p) => ({ nilai: p, label: LABEL_PERAN[p] }))}
        />

        <TabelData<Pengguna>
          kolom={kolom}
          idBaris={(p) => p.id}
          {...t.propsTabel}
          kosong={{
            judul: 'Belum ada pengguna',
            deskripsi: 'Tambahkan anggota tim agar mereka bisa masuk ke panel.',
            aksi: boleh('pengguna.buat') ? (
              <Tombol onClick={bukaTambah}>
                <Plus /> Tambah pengguna
              </Tombol>
            ) : undefined,
          }}
          aksi={(p) => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi untuk ${p.nama}`}>
                  <MoreVertical />
                </Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown onSelect={() => bukaUbah(p)} disabled={!boleh('pengguna.ubah')}>
                  <Pencil /> Ubah
                </ItemDropdown>

                <Konfirmasi>
                  <PemicuKonfirmasi asChild>
                    <ItemDropdown
                      bahaya
                      onSelect={(e) => e.preventDefault()}
                      disabled={!boleh('pengguna.hapus') || adalahSuperadminBawaan(p.email)}
                    >
                      <Trash2 /> Nonaktifkan
                    </ItemDropdown>
                  </PemicuKonfirmasi>
                  <IsiKonfirmasi
                    judul={`Nonaktifkan ${p.nama}?`}
                    deskripsi="Akun tidak dihapus permanen — datanya tetap tersimpan dan bisa dipulihkan, tetapi pengguna tidak lagi bisa masuk."
                    labelLanjut="Ya, nonaktifkan"
                    memuat={hapus.isPending}
                    onLanjut={() => hapus.mutate(p.id)}
                  />
                </Konfirmasi>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>

      <FormPengguna terbuka={formTerbuka} onUbah={setFormTerbuka} pengguna={sedangDiubah} />
    </>
  )
}

export const Route = createFileRoute('/_app/pengguna')({ component: HalamanPengguna })
