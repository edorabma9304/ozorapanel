import { createFileRoute } from '@tanstack/react-router'
import { Building2, Mail, MoreVertical, Phone, Plus, Truck, Wallet } from 'lucide-react'
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
import { formatRp, formatRpRingkas } from '@/lib/format'
import { SUPPLIER_CONTOH, type Supplier } from '@/lib/adapter/data-contoh'

const totalHutang = SUPPLIER_CONTOH.reduce((a, b) => a + b.hutang, 0)

function HalamanSupplier() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Supplier>('supplier', { urutAwal: { kolom: 'nama', arah: 'naik' } })

  if (!boleh('stok.lihat') && !boleh('laporan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Supplier>> = [
    {
      kunci: 'nama',
      judul: 'Supplier',
      urutkan: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar nama={s.nama} src={s.avatar} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{s.nama}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{s.kode}</p>
          </div>
        </div>
      ),
    },
    {
      kunci: 'pic',
      judul: 'Narahubung',
      sembunyiHp: true,
      render: (s) => (
        <div className="min-w-0">
          <p className="truncate">{s.pic}</p>
          <p className="truncate text-xs text-muted-foreground">{s.telepon}</p>
        </div>
      ),
    },
    { kunci: 'kota', judul: 'Kota', urutkan: true, sembunyiHp: true, render: (s) => <span className="text-muted-foreground">{s.kota}</span> },
    { kunci: 'termin', judul: 'Termin', urutkan: true, rata: 'tengah', render: (s) => <Lencana warna="netral" ukuran="sm">{s.termin === 0 ? 'Tunai' : `${s.termin} hari`}</Lencana> },
    { kunci: 'total_pembelian', judul: 'Total pembelian', urutkan: true, rata: 'kanan', render: (s) => <span className="font-semibold">{formatRp(s.total_pembelian)}</span> },
    {
      kunci: 'hutang',
      judul: 'Hutang',
      urutkan: true,
      rata: 'kanan',
      render: (s) => (
        <span className={s.hutang > 0 ? 'font-bold text-danger-kuat' : 'text-muted-foreground'}>
          {s.hutang > 0 ? formatRp(s.hutang) : '—'}
        </span>
      ),
    },
    { kunci: 'aktif', judul: 'Status', render: (s) => <Lencana warna={s.aktif ? 'success' : 'netral'}>{s.aktif ? 'Aktif' : 'Nonaktif'}</Lencana> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Supplier"
        deskripsi="Daftar pemasok beserta termin pembayaran dan sisa hutang."
        remah={[{ label: 'Aplikasi' }, { label: 'Supplier' }]}
        aksi={<Tombol><Plus /> Tambah supplier</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total supplier" nilai={SUPPLIER_CONTOH.length} ikon={Building2} warna="primary" />
        <KartuStatistik label="Aktif" nilai={SUPPLIER_CONTOH.filter((s) => s.aktif).length} ikon={Truck} warna="success" />
        <KartuStatistik label="Total hutang" nilai={formatRpRingkas(totalHutang)} ikon={Wallet} warna="danger" keterangan="belum jatuh tempo & lewat" />
        <KartuStatistik
          label="Nilai pembelian"
          nilai={formatRpRingkas(SUPPLIER_CONTOH.reduce((a, b) => a + b.total_pembelian, 0))}
          ikon={Wallet}
          warna="info"
          keterangan="sepanjang kerja sama"
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama, kode, atau narahubung…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['kota']}
          onUbah={(n) => t.ubahFilter('kota', n)}
          totalSemua={SUPPLIER_CONTOH.length}
          opsi={[...new Set(SUPPLIER_CONTOH.map((s) => s.kota))].map((k) => ({
            nilai: k,
            label: k,
            jumlah: SUPPLIER_CONTOH.filter((s) => s.kota === k).length,
          }))}
        />
        <TabelData<Supplier>
          kolom={kolom}
          idBaris={(s) => s.id}
          {...t.propsTabel}
          aksi={(s) => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${s.nama}`}><MoreVertical /></Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown asChild><a href={`mailto:${s.email}`}><Mail /> Kirim surel</a></ItemDropdown>
                <ItemDropdown asChild><a href={`tel:${s.telepon}`}><Phone /> Telepon</a></ItemDropdown>
                <ItemDropdown><Plus /> Buat pesanan pembelian</ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/supplier')({ component: HalamanSupplier })
