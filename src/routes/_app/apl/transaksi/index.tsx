import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowDownLeft, ArrowUpRight, Download, Eye, Wallet } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatRp, formatRpRingkas, formatTanggal } from '@/lib/format'
import { TRANSAKSI_KEUANGAN, type TransaksiKeuangan } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const WARNA_STATUS: Record<TransaksiKeuangan['status'], WarnaLencana> = {
  berhasil: 'success',
  tertunda: 'warning',
  gagal: 'danger',
}

const masuk = TRANSAKSI_KEUANGAN.filter((t) => t.jenis === 'masuk' && t.status === 'berhasil')
const keluar = TRANSAKSI_KEUANGAN.filter((t) => t.jenis === 'keluar' && t.status === 'berhasil')
const totalMasuk = masuk.reduce((a, b) => a + b.nominal, 0)
const totalKeluar = keluar.reduce((a, b) => a + b.nominal, 0)

function DaftarTransaksi() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<TransaksiKeuangan>('transaksi', {
    urutAwal: { kolom: 'tanggal', arah: 'turun' },
    perHalamanAwal: 25,
  })

  if (!boleh('laporan.lihat') && !boleh('pesanan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<TransaksiKeuangan>> = [
    { kunci: 'kode', judul: 'Kode', urutkan: true, render: (x) => <span className="font-mono text-sm font-semibold">{x.kode}</span> },
    {
      kunci: 'kategori',
      judul: 'Keterangan',
      urutkan: true,
      render: (x) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full',
              x.jenis === 'masuk' ? 'bg-success-soft text-success-kuat' : 'bg-danger-soft text-danger-kuat',
            )}
          >
            {x.jenis === 'masuk' ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{x.kategori}</p>
            <p className="truncate text-xs text-muted-foreground">{x.pihak}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'metode', judul: 'Metode', urutkan: true, sembunyiHp: true, render: (x) => <Lencana warna="netral" ukuran="sm">{x.metode}</Lencana> },
    {
      kunci: 'nominal',
      judul: 'Nominal',
      urutkan: true,
      rata: 'kanan',
      render: (x) => (
        <span className={cn('font-bold whitespace-nowrap', x.jenis === 'masuk' ? 'text-success-kuat' : 'text-danger-kuat')}>
          {x.jenis === 'masuk' ? '+' : '−'}{formatRp(x.nominal)}
        </span>
      ),
    },
    { kunci: 'status', judul: 'Status', urutkan: true, render: (x) => <Lencana warna={WARNA_STATUS[x.status]}>{x.status}</Lencana> },
    { kunci: 'tanggal', judul: 'Tanggal', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (x) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggal(x.tanggal)}</span> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Transaksi"
        deskripsi="Seluruh arus kas masuk dan keluar beserta status penyelesaiannya."
        remah={[{ label: 'Aplikasi' }, { label: 'Transaksi' }]}
        aksi={<Tombol varian="garis"><Download /> Ekspor CSV</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Kas masuk" nilai={formatRpRingkas(totalMasuk)} ikon={ArrowDownLeft} warna="success" tren={0.082} keterangan="vs periode lalu" />
        <KartuStatistik label="Kas keluar" nilai={formatRpRingkas(totalKeluar)} ikon={ArrowUpRight} warna="danger" tren={0.041} keterangan="vs periode lalu" />
        <KartuStatistik label="Arus kas bersih" nilai={formatRpRingkas(totalMasuk - totalKeluar)} ikon={Wallet} warna="primary" />
        <KartuStatistik
          label="Tertunda"
          nilai={TRANSAKSI_KEUANGAN.filter((x) => x.status === 'tertunda').length}
          ikon={Wallet}
          warna="warning"
          keterangan="menunggu konfirmasi"
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari kode, kategori, atau pihak…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['jenis']}
          onUbah={(n) => t.ubahFilter('jenis', n)}
          totalSemua={TRANSAKSI_KEUANGAN.length}
          opsi={[
            { nilai: 'masuk', label: 'Masuk', jumlah: TRANSAKSI_KEUANGAN.filter((x) => x.jenis === 'masuk').length },
            { nilai: 'keluar', label: 'Keluar', jumlah: TRANSAKSI_KEUANGAN.filter((x) => x.jenis === 'keluar').length },
          ]}
        />
        <TabelData<TransaksiKeuangan>
          kolom={kolom}
          idBaris={(x) => x.id}
          {...t.propsTabel}
          aksi={(x) => (
            <Tombol varian="hantu" ukuran="ikon-sm" asChild aria-label={`Detail ${x.kode}`}>
              <Link to="/apl/transaksi/$id" params={{ id: x.id }}><Eye /></Link>
            </Tombol>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/transaksi/')({ component: DaftarTransaksi })
