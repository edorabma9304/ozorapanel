import { createFileRoute } from '@tanstack/react-router'
import { Building2, Mail, Phone, Plus, Star } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dialog, PanelGeser } from '@/components/ui/lapisan'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { KONTAK_CONTOH, type Kontak } from '@/lib/adapter/data-contoh'
import { formatTanggal } from '@/lib/format'

const DEPARTEMEN = ['Penjualan', 'Dukungan', 'Keuangan', 'Operasional']

function HalamanKontak() {
  const t = useDaftarTabel<Kontak>('kontak', { urutAwal: { kolom: 'nama', arah: 'naik' } })
  const [detail, setDetail] = useState<Kontak | null>(null)

  const kolom: Array<Kolom<Kontak>> = [
    {
      kunci: 'nama',
      judul: 'Nama',
      urutkan: true,
      render: (k) => (
        <div className="flex items-center gap-3">
          <Avatar nama={k.nama} src={k.avatar} ukuran="sm" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-semibold">
              {k.nama}
              {k.favorit ? <Star className="size-3.5 shrink-0 fill-warning text-warning-kuat" /> : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">{k.jabatan}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'perusahaan', judul: 'Perusahaan', urutkan: true, sembunyiHp: true, render: (k) => k.perusahaan },
    { kunci: 'departemen', judul: 'Departemen', urutkan: true, render: (k) => <Lencana warna="primary" ukuran="sm">{k.departemen}</Lencana> },
    { kunci: 'email', judul: 'Surel', sembunyiHp: true, render: (k) => <span className="text-muted-foreground">{k.email}</span> },
    { kunci: 'telepon', judul: 'Telepon', sembunyiHp: true, render: (k) => <span className="text-muted-foreground">{k.telepon}</span> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Kontak"
        deskripsi="Direktori orang-orang yang sering Anda hubungi."
        remah={[{ label: 'Aplikasi' }, { label: 'Kontak' }]}
        aksi={<Tombol><Plus /> Tambah kontak</Tombol>}
      />

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama, perusahaan, atau surel…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['departemen']}
          onUbah={(n) => t.ubahFilter('departemen', n)}
          totalSemua={KONTAK_CONTOH.length}
          opsi={DEPARTEMEN.map((d) => ({ nilai: d, label: d }))}
        />
        <TabelData<Kontak>
          kolom={kolom}
          idBaris={(k) => k.id}
          onKlikBaris={setDetail}
          {...t.propsTabel}
        />
      </Kartu>

      <Dialog open={Boolean(detail)} onOpenChange={(b) => !b && setDetail(null)}>
        {detail ? (
          <PanelGeser judul="Detail kontak">
            <div className="scrollbar-thin flex-1 overflow-y-auto">
              <div className="text-center">
                <Avatar nama={detail.nama} src={detail.avatar} ukuran="xl" className="mx-auto" />
                <h3 className="mt-3 text-lg font-bold">{detail.nama}</h3>
                <p className="text-sm text-muted-foreground">{detail.jabatan}</p>
                <Lencana warna="primary" className="mt-2">{detail.departemen}</Lencana>
              </div>

              <dl className="mt-7 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 shrink-0 text-muted-foreground" />
                  <dd>{detail.perusahaan}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <dd className="truncate">{detail.email}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <dd>{detail.telepon}</dd>
                </div>
              </dl>

              <p className="mt-6 text-xs text-muted-foreground">
                Ditambahkan {formatTanggal(detail.created_at, 'panjang')}
              </p>

              <div className="mt-6 flex gap-2">
                <Tombol className="flex-1" asChild>
                  <a href={`mailto:${detail.email}`}><Mail /> Surel</a>
                </Tombol>
                <Tombol varian="garis" className="flex-1" asChild>
                  <a href={`tel:${detail.telepon}`}><Phone /> Telepon</a>
                </Tombol>
              </div>
            </div>
          </PanelGeser>
        ) : null}
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/kontak')({ component: HalamanKontak })
