import { createFileRoute } from '@tanstack/react-router'
import { Download, Eye, MoreVertical, Printer, Truck } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatTanggal } from '@/lib/format'
import { PESANAN_CONTOH, type Pesanan } from '@/lib/adapter/data-contoh'

const STATUS: Array<{ nilai: Pesanan['status']; label: string; warna: WarnaLencana }> = [
  { nilai: 'baru', label: 'Baru', warna: 'info' },
  { nilai: 'diproses', label: 'Diproses', warna: 'warning' },
  { nilai: 'dikirim', label: 'Dikirim', warna: 'primary' },
  { nilai: 'selesai', label: 'Selesai', warna: 'success' },
  { nilai: 'batal', label: 'Batal', warna: 'danger' },
]

const WARNA_BAYAR: Record<Pesanan['status_bayar'], WarnaLencana> = {
  lunas: 'success',
  belum: 'danger',
  sebagian: 'warning',
}

function HalamanPesanan() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Pesanan>('pesanan', { urutAwal: { kolom: 'tanggal', arah: 'turun' } })

  if (!boleh('pesanan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Pesanan>> = [
    { kunci: 'nomor', judul: 'Nomor', urutkan: true, render: (p) => <span className="font-mono text-sm font-semibold">{p.nomor}</span> },
    {
      kunci: 'pelanggan_nama',
      judul: 'Pelanggan',
      urutkan: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar nama={p.pelanggan_nama} src={p.pelanggan_avatar} ukuran="sm" />
          <span className="truncate font-semibold">{p.pelanggan_nama}</span>
        </div>
      ),
    },
    { kunci: 'item', judul: 'Item', rata: 'tengah', sembunyiHp: true, render: (p) => formatAngka(p.item.length) },
    { kunci: 'total', judul: 'Total', urutkan: true, rata: 'kanan', render: (p) => <span className="font-bold">{formatRp(p.total + p.ongkir)}</span> },
    {
      kunci: 'status_bayar',
      judul: 'Bayar',
      sembunyiHp: true,
      render: (p) => <Lencana warna={WARNA_BAYAR[p.status_bayar]}>{p.status_bayar}</Lencana>,
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

  const hitung = (s: Pesanan['status']) => PESANAN_CONTOH.filter((p) => p.status === s).length

  return (
    <>
      <KepalaHalaman
        judul="Pesanan"
        deskripsi="Seluruh transaksi masuk beserta status pembayaran dan pengirimannya."
        remah={[{ label: 'Aplikasi' }, { label: 'Pesanan' }]}
        aksi={
          <Tombol varian="garis">
            <Download /> Ekspor
          </Tombol>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Perlu diproses" nilai={hitung('baru')} warna="info" ikon={Truck} />
        <KartuStatistik label="Sedang dikirim" nilai={hitung('dikirim')} warna="primary" ikon={Truck} />
        <KartuStatistik label="Selesai" nilai={hitung('selesai')} warna="success" ikon={Truck} />
        <KartuStatistik
          label="Nilai belum lunas"
          nilai={formatRp(PESANAN_CONTOH.filter((p) => p.status_bayar !== 'lunas').reduce((a, b) => a + b.total, 0))}
          warna="danger"
          ikon={Truck}
        />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nomor atau nama pelanggan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['status']}
          onUbah={(n) => t.ubahFilter('status', n)}
          totalSemua={t.hasil.data?.total}
          opsi={STATUS.map((s) => ({ nilai: s.nilai, label: s.label, jumlah: hitung(s.nilai) }))}
        />
        <TabelData<Pesanan>
          kolom={kolom}
          idBaris={(p) => p.id}
          {...t.propsTabel}
          aksi={() => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Aksi pesanan">
                  <MoreVertical />
                </Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown><Eye /> Lihat detail</ItemDropdown>
                <ItemDropdown><Printer /> Cetak label</ItemDropdown>
                <ItemDropdown><Download /> Unduh faktur</ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/pesanan')({ component: HalamanPesanan })
