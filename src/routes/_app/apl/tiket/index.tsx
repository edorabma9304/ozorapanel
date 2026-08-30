import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { MessageSquare, Plus, Ticket } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { formatAngka, formatWaktuRelatif } from '@/lib/format'
import { TIKET_CONTOH, type Tiket } from '@/lib/adapter/data-contoh'

const WARNA_PRIORITAS: Record<Tiket['prioritas'], WarnaLencana> = {
  rendah: 'netral',
  sedang: 'info',
  tinggi: 'warning',
  mendesak: 'danger',
}

const WARNA_STATUS: Record<Tiket['status'], WarnaLencana> = {
  terbuka: 'info',
  diproses: 'warning',
  menunggu: 'secondary',
  selesai: 'success',
}

function HalamanTiket() {
  const navigate = useNavigate()
  const t = useDaftarTabel<Tiket>('tiket', { urutAwal: { kolom: 'created_at', arah: 'turun' } })

  const kolom: Array<Kolom<Tiket>> = [
    { kunci: 'nomor', judul: 'Nomor', urutkan: true, render: (x) => <span className="font-mono text-sm font-semibold">{x.nomor}</span> },
    {
      kunci: 'judul',
      judul: 'Keluhan',
      urutkan: true,
      render: (x) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{x.judul}</p>
          <p className="truncate text-xs text-muted-foreground">{x.kategori}</p>
        </div>
      ),
    },
    {
      kunci: 'pelapor',
      judul: 'Pelapor',
      sembunyiHp: true,
      render: (x) => (
        <div className="flex items-center gap-2.5">
          <Avatar nama={x.pelapor} src={x.avatar} ukuran="xs" />
          <span className="truncate">{x.pelapor}</span>
        </div>
      ),
    },
    { kunci: 'prioritas', judul: 'Prioritas', urutkan: true, render: (x) => <Lencana warna={WARNA_PRIORITAS[x.prioritas]}>{x.prioritas}</Lencana> },
    { kunci: 'status', judul: 'Status', urutkan: true, render: (x) => <Lencana warna={WARNA_STATUS[x.status]}>{x.status}</Lencana> },
    {
      kunci: 'balasan',
      judul: 'Balasan',
      rata: 'tengah',
      sembunyiHp: true,
      render: (x) => (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <MessageSquare className="size-3.5" /> {x.balasan}
        </span>
      ),
    },
    { kunci: 'created_at', judul: 'Dibuat', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (x) => <span className="whitespace-nowrap text-muted-foreground">{formatWaktuRelatif(x.created_at)}</span> },
  ]

  const hitung = (s: Tiket['status']) => TIKET_CONTOH.filter((x) => x.status === s).length

  return (
    <>
      <KepalaHalaman
        judul="Tiket dukungan"
        deskripsi="Keluhan dan permintaan bantuan dari pelanggan."
        remah={[{ label: 'Aplikasi' }, { label: 'Tiket' }]}
        aksi={<Tombol><Plus /> Tiket baru</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Terbuka" nilai={hitung('terbuka')} ikon={Ticket} warna="info" />
        <KartuStatistik label="Diproses" nilai={hitung('diproses')} ikon={Ticket} warna="warning" />
        <KartuStatistik label="Menunggu balasan" nilai={hitung('menunggu')} ikon={Ticket} warna="secondary" />
        <KartuStatistik label="Selesai" nilai={hitung('selesai')} ikon={Ticket} warna="success" />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nomor tiket atau keluhan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['status']}
          onUbah={(n) => t.ubahFilter('status', n)}
          totalSemua={formatAngka(TIKET_CONTOH.length) ? TIKET_CONTOH.length : 0}
          opsi={(['terbuka', 'diproses', 'menunggu', 'selesai'] as const).map((s) => ({
            nilai: s,
            label: s,
            jumlah: hitung(s),
          }))}
        />
        <TabelData<Tiket>
          kolom={kolom}
          idBaris={(x) => x.id}
          onKlikBaris={(x) => void navigate({ to: '/apl/tiket/$id', params: { id: x.id } })}
          {...t.propsTabel}
          aksi={(x) => (
            <Tombol varian="hantu" ukuran="sm" asChild>
              <Link to="/apl/tiket/$id" params={{ id: x.id }}>Buka</Link>
            </Tombol>
          )}
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/tiket/')({ component: HalamanTiket })
