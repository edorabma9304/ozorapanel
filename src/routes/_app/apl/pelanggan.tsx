import { createFileRoute } from '@tanstack/react-router'
import { Mail, MoreVertical, Phone, Plus, Users } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatRpRingkas } from '@/lib/format'
import { PELANGGAN_CONTOH, type Pelanggan } from '@/lib/adapter/data-contoh'

function HalamanPelanggan() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Pelanggan>('pelanggan', { urutAwal: { kolom: 'total_belanja', arah: 'turun' } })

  if (!boleh('pelanggan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Pelanggan>> = [
    {
      kunci: 'nama',
      judul: 'Pelanggan',
      urutkan: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar nama={p.nama} src={p.avatar_url} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.nama}</p>
            <p className="truncate text-xs text-muted-foreground">{p.email}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'perusahaan', judul: 'Perusahaan', urutkan: true, sembunyiHp: true, render: (p) => p.perusahaan },
    { kunci: 'kota', judul: 'Kota', urutkan: true, sembunyiHp: true, render: (p) => <span className="text-muted-foreground">{p.kota}</span> },
    { kunci: 'jumlah_pesanan', judul: 'Pesanan', urutkan: true, rata: 'kanan', render: (p) => formatAngka(p.jumlah_pesanan) },
    { kunci: 'total_belanja', judul: 'Total belanja', urutkan: true, rata: 'kanan', render: (p) => <span className="font-bold">{formatRp(p.total_belanja)}</span> },
    { kunci: 'status', judul: 'Status', render: (p) => <Lencana warna={p.status === 'aktif' ? 'success' : 'netral'}>{p.status}</Lencana> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Pelanggan"
        deskripsi="Basis pelanggan beserta riwayat belanjanya."
        remah={[{ label: 'Aplikasi' }, { label: 'Pelanggan' }]}
        aksi={boleh('pelanggan.buat') ? <Tombol><Plus /> Tambah pelanggan</Tombol> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total pelanggan" nilai={formatAngka(PELANGGAN_CONTOH.length)} ikon={Users} warna="primary" />
        <KartuStatistik label="Aktif" nilai={formatAngka(PELANGGAN_CONTOH.filter((p) => p.status === 'aktif').length)} ikon={Users} warna="success" />
        <KartuStatistik
          label="Nilai seumur hidup"
          nilai={formatRpRingkas(PELANGGAN_CONTOH.reduce((a, b) => a + b.total_belanja, 0))}
          ikon={Users}
          warna="info"
        />
        <KartuStatistik
          label="Rata-rata belanja"
          nilai={formatRpRingkas(PELANGGAN_CONTOH.reduce((a, b) => a + b.total_belanja, 0) / PELANGGAN_CONTOH.length)}
          ikon={Users}
          warna="warning"
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama, surel, atau perusahaan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['status']}
          onUbah={(n) => t.ubahFilter('status', n)}
          totalSemua={t.hasil.data?.total}
          opsi={[
            { nilai: 'aktif', label: 'Aktif' },
            { nilai: 'nonaktif', label: 'Nonaktif' },
          ]}
        />
        <TabelData<Pelanggan>
          kolom={kolom}
          idBaris={(p) => p.id}
          {...t.propsTabel}
          aksi={(p) => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi untuk ${p.nama}`}>
                  <MoreVertical />
                </Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown asChild><a href={`mailto:${p.email}`}><Mail /> Kirim surel</a></ItemDropdown>
                <ItemDropdown asChild><a href={`tel:${p.telepon}`}><Phone /> Telepon</a></ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/pelanggan')({ component: HalamanPelanggan })
