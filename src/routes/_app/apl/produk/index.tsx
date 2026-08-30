import { createFileRoute } from '@tanstack/react-router'
import { Grid3x3, List, MoreVertical, Package, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { Rangka } from '@/components/ui/rangka'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { Paginasi } from '@/components/data/paginasi'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatPersen, formatRp } from '@/lib/format'
import { PRODUK_CONTOH, type Produk } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const WARNA_STATUS: Record<Produk['status'], WarnaLencana> = {
  terbit: 'success',
  draf: 'warning',
  arsip: 'netral',
}

function KartuProduk({ p }: { p: Produk }) {
  const margin = (p.harga - p.harga_modal) / p.harga
  return (
    <Kartu className="group flex flex-col overflow-hidden transition-shadow hover:shadow-raised">
      <div className="grid aspect-4/3 place-items-center bg-muted">
        <img src={p.gambar} alt={p.nama} width={96} height={96} loading="lazy" className="size-24 rounded-full" />
      </div>
      <IsiKartu className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Lencana warna="primary" ukuran="sm">{p.kategori}</Lencana>
          <Lencana warna={WARNA_STATUS[p.status]} ukuran="sm">{p.status}</Lencana>
        </div>
        <h3 className="line-clamp-2 text-sm font-bold">{p.nama}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-warning text-warning-kuat" /> {p.rating} · {formatAngka(p.terjual)} terjual
        </p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-base font-extrabold">{formatRp(p.harga)}</p>
            <p className="text-xs text-muted-foreground">margin {formatPersen(margin, 0)}</p>
          </div>
          <Lencana warna={p.stok < 20 ? 'danger' : 'netral'} ukuran="sm">
            stok {p.stok}
          </Lencana>
        </div>
      </IsiKartu>
    </Kartu>
  )
}

function HalamanProduk() {
  const { boleh } = useAuth()
  const [tampilan, setTampilan] = useState<'kisi' | 'tabel'>('kisi')
  const t = useDaftarTabel<Produk>('produk', {
    urutAwal: { kolom: 'terjual', arah: 'turun' },
    perHalamanAwal: 12,
  })

  if (!boleh('katalog.lihat')) return <HalamanTanpaAkses />

  const kategori = [...new Set(PRODUK_CONTOH.map((p) => p.kategori))]

  const kolom: Array<Kolom<Produk>> = [
    {
      kunci: 'nama',
      judul: 'Produk',
      urutkan: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar nama={p.nama} src={p.gambar} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.nama}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{p.sku}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'kategori', judul: 'Kategori', urutkan: true, sembunyiHp: true, render: (p) => <Lencana warna="primary" ukuran="sm">{p.kategori}</Lencana> },
    { kunci: 'harga', judul: 'Harga', urutkan: true, rata: 'kanan', render: (p) => <span className="font-bold">{formatRp(p.harga)}</span> },
    { kunci: 'stok', judul: 'Stok', urutkan: true, rata: 'kanan', render: (p) => <Lencana warna={p.stok < 20 ? 'danger' : 'netral'}>{p.stok}</Lencana> },
    { kunci: 'terjual', judul: 'Terjual', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (p) => formatAngka(p.terjual) },
    { kunci: 'status', judul: 'Status', render: (p) => <Lencana warna={WARNA_STATUS[p.status]}>{p.status}</Lencana> },
  ]

  const hal = t.hasil.data

  return (
    <>
      <KepalaHalaman
        judul="Produk"
        deskripsi="Katalog lengkap beserta harga, stok, dan performa penjualan."
        remah={[{ label: 'Aplikasi' }, { label: 'Produk' }]}
        aksi={boleh('katalog.buat') ? <Tombol><Plus /> Tambah produk</Tombol> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total produk" nilai={formatAngka(PRODUK_CONTOH.length)} ikon={Package} warna="primary" />
        <KartuStatistik label="Terbit" nilai={formatAngka(PRODUK_CONTOH.filter((p) => p.status === 'terbit').length)} ikon={Package} warna="success" />
        <KartuStatistik label="Stok menipis" nilai={formatAngka(PRODUK_CONTOH.filter((p) => p.stok < 20).length)} ikon={Package} warna="danger" />
        <KartuStatistik label="Kategori" nilai={kategori.length} ikon={Package} warna="info" />
      </div>

      <Kartu className="overflow-hidden">
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama produk atau SKU…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
          kanan={
            <div className="flex rounded-control border border-border p-0.5">
              <Tombol
                varian={tampilan === 'kisi' ? 'halus' : 'hantu'}
                ukuran="ikon-sm"
                onClick={() => setTampilan('kisi')}
                aria-label="Tampilan kisi"
                aria-pressed={tampilan === 'kisi'}
              >
                <Grid3x3 />
              </Tombol>
              <Tombol
                varian={tampilan === 'tabel' ? 'halus' : 'hantu'}
                ukuran="ikon-sm"
                onClick={() => setTampilan('tabel')}
                aria-label="Tampilan tabel"
                aria-pressed={tampilan === 'tabel'}
              >
                <List />
              </Tombol>
            </div>
          }
        />

        <SaringCepat
          nilai={t.filter['kategori']}
          onUbah={(n) => t.ubahFilter('kategori', n)}
          totalSemua={t.hasil.data?.total}
          opsi={kategori.map((k) => ({ nilai: k, label: k }))}
        />

        {tampilan === 'tabel' ? (
          <TabelData<Produk>
            kolom={kolom}
            idBaris={(p) => p.id}
            {...t.propsTabel}
            aksi={() => (
              <Dropdown>
                <PemicuDropdown asChild>
                  <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Aksi produk"><MoreVertical /></Tombol>
                </PemicuDropdown>
                <IsiDropdown>
                  <ItemDropdown><Pencil /> Ubah</ItemDropdown>
                  <ItemDropdown bahaya><Trash2 /> Arsipkan</ItemDropdown>
                </IsiDropdown>
              </Dropdown>
            )}
          />
        ) : (
          <>
            <div className={cn('grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', t.hasil.isFetching && 'opacity-60')}>
              {t.hasil.isPending
                ? Array.from({ length: 8 }, (_, i) => <Rangka key={i} className="h-72" />)
                : hal?.data.map((p) => <KartuProduk key={p.id} p={p} />)}
            </div>
            {!t.hasil.isPending && hal?.data.length === 0 ? (
              <KeadaanKosong judul="Produk tidak ditemukan" deskripsi="Coba ubah kata kunci atau pilih kategori lain." />
            ) : null}
            {hal ? (
              <Paginasi
                halaman={hal.halaman}
                totalHalaman={hal.totalHalaman}
                total={hal.total}
                perHalaman={hal.perHalaman}
                onHalaman={t.propsTabel.onHalaman}
                onPerHalaman={t.propsTabel.onPerHalaman}
              />
            ) : null}
          </>
        )}
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/produk/')({ component: HalamanProduk })
