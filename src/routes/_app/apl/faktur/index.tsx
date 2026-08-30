import { createFileRoute, Link } from '@tanstack/react-router'
import { Clock, Download, Eye, FileText, MoreVertical, Plus, Printer } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { formatRp, formatRpRingkas, formatTanggal } from '@/lib/format'
import { FAKTUR_CONTOH, type Faktur } from '@/lib/adapter/data-contoh'

const STATUS: Array<{ nilai: Faktur['status']; label: string; warna: WarnaLencana }> = [
  { nilai: 'lunas', label: 'Lunas', warna: 'success' },
  { nilai: 'tertunda', label: 'Tertunda', warna: 'warning' },
  { nilai: 'jatuh_tempo', label: 'Jatuh tempo', warna: 'danger' },
  { nilai: 'draf', label: 'Draf', warna: 'netral' },
]

function totalStatus(s: Faktur['status']) {
  return FAKTUR_CONTOH.filter((f) => f.status === s).reduce((a, b) => a + b.total, 0)
}

function HalamanFaktur() {
  const t = useDaftarTabel<Faktur>('faktur', { urutAwal: { kolom: 'tanggal', arah: 'turun' } })

  const kolom: Array<Kolom<Faktur>> = [
    { kunci: 'nomor', judul: 'Nomor', urutkan: true, render: (f) => <span className="font-mono text-sm font-semibold">{f.nomor}</span> },
    { kunci: 'tanggal', judul: 'Tanggal', urutkan: true, sembunyiHp: true, render: (f) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggal(f.tanggal)}</span> },
    { kunci: 'jatuh_tempo', judul: 'Jatuh tempo', urutkan: true, sembunyiHp: true, render: (f) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggal(f.jatuh_tempo)}</span> },
    { kunci: 'ke_nama', judul: 'Ditagihkan ke', urutkan: true, render: (f) => (
      <div className="min-w-0">
        <p className="truncate font-semibold">{f.ke_nama}</p>
        <p className="truncate text-xs text-muted-foreground">{f.ke_email}</p>
      </div>
    ) },
    { kunci: 'total', judul: 'Total', urutkan: true, rata: 'kanan', render: (f) => <span className="font-bold">{formatRp(f.total)}</span> },
    {
      kunci: 'status',
      judul: 'Status',
      urutkan: true,
      render: (f) => {
        const s = STATUS.find((x) => x.nilai === f.status)
        return <Lencana warna={s?.warna ?? 'netral'}>{s?.label ?? f.status}</Lencana>
      },
    },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Daftar faktur"
        deskripsi="Tagihan yang sudah diterbitkan beserta status pembayarannya."
        remah={[{ label: 'Aplikasi' }, { label: 'Faktur' }]}
        aksi={
          <Tombol asChild>
            <Link to="/apl/faktur/baru"><Plus /> Buat faktur</Link>
          </Tombol>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Jatuh tempo" nilai={formatRpRingkas(totalStatus('jatuh_tempo'))} ikon={Clock} warna="danger" />
        <KartuStatistik label="Draf" nilai={formatRpRingkas(totalStatus('draf'))} ikon={FileText} warna="netral" />
        <KartuStatistik label="Tertunda" nilai={formatRpRingkas(totalStatus('tertunda'))} ikon={Clock} warna="warning" />
        <KartuStatistik label="Lunas" nilai={formatRpRingkas(totalStatus('lunas'))} ikon={FileText} warna="success" />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nomor atau nama penerima…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
          kanan={<Tombol varian="garis"><Download /> Ekspor</Tombol>}
        />
        <SaringCepat
          nilai={t.filter['status']}
          onUbah={(n) => t.ubahFilter('status', n)}
          totalSemua={FAKTUR_CONTOH.length}
          opsi={STATUS.map((s) => ({
            nilai: s.nilai,
            label: s.label,
            jumlah: FAKTUR_CONTOH.filter((f) => f.status === s.nilai).length,
          }))}
        />
        <TabelData<Faktur>
          kolom={kolom}
          idBaris={(f) => f.id}
          {...t.propsTabel}
          aksi={(f) => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${f.nomor}`}><MoreVertical /></Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown asChild>
                  <Link to="/apl/faktur/$id" params={{ id: f.id }}><Eye /> Lihat</Link>
                </ItemDropdown>
                <ItemDropdown><Printer /> Cetak</ItemDropdown>
                <ItemDropdown><Download /> Unduh PDF</ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/faktur/')({ component: HalamanFaktur })
