import { createFileRoute } from '@tanstack/react-router'
import { Download, Eye, MoreVertical, PackageCheck, Plus, Printer, ShoppingCart } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Progres } from '@/components/ui/progres'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatRpRingkas, formatTanggal } from '@/lib/format'
import { PEMBELIAN_CONTOH, type Pembelian } from '@/lib/adapter/data-contoh'

const STATUS: Array<{ nilai: Pembelian['status']; label: string; warna: WarnaLencana }> = [
  { nilai: 'draf', label: 'Draf', warna: 'netral' },
  { nilai: 'dipesan', label: 'Dipesan', warna: 'info' },
  { nilai: 'sebagian', label: 'Diterima sebagian', warna: 'warning' },
  { nilai: 'diterima', label: 'Diterima', warna: 'success' },
  { nilai: 'batal', label: 'Batal', warna: 'danger' },
]

const total = PEMBELIAN_CONTOH.reduce((a, b) => a + b.total, 0)
const belumLunas = PEMBELIAN_CONTOH.filter((p) => p.dibayar < 1 && p.status !== 'batal')

function HalamanPembelian() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Pembelian>('pembelian', { urutAwal: { kolom: 'tanggal', arah: 'turun' } })

  if (!boleh('stok.lihat') && !boleh('laporan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Pembelian>> = [
    { kunci: 'nomor', judul: 'Nomor', urutkan: true, render: (p) => <span className="font-mono text-sm font-semibold">{p.nomor}</span> },
    {
      kunci: 'supplier_nama',
      judul: 'Supplier',
      urutkan: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar nama={p.supplier_nama} src={p.supplier_avatar} ukuran="sm" />
          <span className="truncate font-semibold">{p.supplier_nama}</span>
        </div>
      ),
    },
    { kunci: 'item', judul: 'Item', rata: 'tengah', sembunyiHp: true, render: (p) => formatAngka(p.item.length) },
    { kunci: 'total', judul: 'Total', urutkan: true, rata: 'kanan', render: (p) => <span className="font-bold">{formatRp(p.total)}</span> },
    {
      kunci: 'dibayar',
      judul: 'Pembayaran',
      sembunyiHp: true,
      render: (p) => (
        <div className="w-28">
          <Progres
            nilai={p.dibayar * 100}
            warna={p.dibayar === 1 ? 'success' : p.dibayar > 0 ? 'warning' : 'danger'}
            tebal="sm"
            tampilkanNilai
          />
        </div>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status',
      urutkan: true,
      render: (p) => {
        const s = STATUS.find((x) => x.nilai === p.status)
        return <Lencana warna={s?.warna ?? 'netral'}>{s?.label ?? p.status}</Lencana>
      },
    },
    { kunci: 'tanggal', judul: 'Tanggal', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (p) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggal(p.tanggal)}</span> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Pembelian"
        deskripsi="Pesanan pembelian ke supplier beserta status penerimaan dan pembayarannya."
        remah={[{ label: 'Aplikasi' }, { label: 'Pembelian' }]}
        aksi={
          <>
            <Tombol varian="garis"><Download /> Ekspor</Tombol>
            <Tombol><Plus /> Pesanan baru</Tombol>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total pembelian" nilai={formatRpRingkas(total)} ikon={ShoppingCart} warna="primary" />
        <KartuStatistik label="Menunggu diterima" nilai={PEMBELIAN_CONTOH.filter((p) => p.status === 'dipesan').length} ikon={PackageCheck} warna="info" />
        <KartuStatistik label="Diterima sebagian" nilai={PEMBELIAN_CONTOH.filter((p) => p.status === 'sebagian').length} ikon={PackageCheck} warna="warning" />
        <KartuStatistik
          label="Belum lunas"
          nilai={formatRpRingkas(belumLunas.reduce((a, b) => a + b.total * (1 - b.dibayar), 0))}
          ikon={ShoppingCart}
          warna="danger"
          keterangan={`${belumLunas.length} pesanan`}
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nomor atau nama supplier…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['status']}
          onUbah={(n) => t.ubahFilter('status', n)}
          totalSemua={PEMBELIAN_CONTOH.length}
          opsi={STATUS.map((s) => ({
            nilai: s.nilai,
            label: s.label,
            jumlah: PEMBELIAN_CONTOH.filter((p) => p.status === s.nilai).length,
          }))}
        />
        <TabelData<Pembelian>
          kolom={kolom}
          idBaris={(p) => p.id}
          {...t.propsTabel}
          aksi={() => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Aksi pembelian"><MoreVertical /></Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown><Eye /> Lihat detail</ItemDropdown>
                <ItemDropdown><PackageCheck /> Catat penerimaan</ItemDropdown>
                <ItemDropdown><Printer /> Cetak PO</ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/pembelian')({ component: HalamanPembelian })
