import { createFileRoute } from '@tanstack/react-router'
import { Download, ScrollText } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatTanggalWaktu, formatWaktuRelatif } from '@/lib/format'
import type { Audit } from '@/lib/tipe'

const WARNA_AKSI: Record<string, WarnaLencana> = {
  buat: 'success',
  ubah: 'warning',
  hapus: 'danger',
  masuk: 'info',
  keluar: 'netral',
  ekspor: 'primary',
}

function HalamanAudit() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Audit>('audit', { urutAwal: { kolom: 'waktu', arah: 'turun' }, perHalamanAwal: 25 })

  if (!boleh('audit.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Audit>> = [
    {
      kunci: 'aktor_nama',
      judul: 'Pelaku',
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar nama={a.aktor_nama} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{a.aktor_nama}</p>
            <p className="truncate text-xs text-muted-foreground">{a.aktor_email}</p>
          </div>
        </div>
      ),
    },
    {
      kunci: 'aksi',
      judul: 'Aksi',
      urutkan: true,
      render: (a) => <Lencana warna={WARNA_AKSI[a.aksi] ?? 'netral'}>{a.aksi}</Lencana>,
    },
    { kunci: 'modul', judul: 'Modul', urutkan: true, render: (a) => <span className="font-medium">{a.modul}</span> },
    {
      kunci: 'ringkasan',
      judul: 'Keterangan',
      sembunyiHp: true,
      render: (a) => <span className="text-muted-foreground">{a.ringkasan}</span>,
    },
    {
      kunci: 'ip',
      judul: 'Alamat IP',
      sembunyiHp: true,
      render: (a) => <span className="font-mono text-xs text-muted-foreground">{a.ip}</span>,
    },
    {
      kunci: 'waktu',
      judul: 'Waktu',
      urutkan: true,
      rata: 'kanan',
      render: (a) => (
        <span className="whitespace-nowrap text-muted-foreground" title={formatTanggalWaktu(a.waktu)}>
          {formatWaktuRelatif(a.waktu)}
        </span>
      ),
    },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Jejak audit"
        deskripsi="Catatan setiap perubahan data penting — tidak dapat diubah maupun dihapus."
        remah={[{ label: 'Halaman' }, { label: 'Jejak audit' }]}
        aksi={
          <Tombol varian="garis">
            <Download /> Ekspor CSV
          </Tombol>
        }
      />

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari pelaku atau keterangan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['aksi']}
          onUbah={(n) => t.ubahFilter('aksi', n)}
          totalSemua={t.hasil.data?.total}
          opsi={Object.keys(WARNA_AKSI).map((a) => ({ nilai: a, label: a }))}
        />
        <TabelData<Audit>
          kolom={kolom}
          {...t.propsTabel}
          kosong={{ judul: 'Belum ada aktivitas tercatat', deskripsi: 'Setiap perubahan data akan muncul di sini.' }}
        />
      </Kartu>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ScrollText className="size-3.5" />
        Jejak audit bersifat hanya-baca. Simpan minimal 12 bulan sesuai kebijakan retensi data.
      </p>
    </>
  )
}

export const Route = createFileRoute('/_app/audit')({ component: HalamanAudit })
