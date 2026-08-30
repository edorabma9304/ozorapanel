import { createFileRoute } from '@tanstack/react-router'
import { Download, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Peringatan } from '@/components/ui/keadaan'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { formatAngka, formatRp } from '@/lib/format'
import { PRODUK_CONTOH, type Produk } from '@/lib/adapter/data-contoh'

function HalamanTabelData() {
  const t = useDaftarTabel<Produk>('produk', {
    urutAwal: { kolom: 'nama', arah: 'naik' },
    perHalamanAwal: 10,
  })

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
    { kunci: 'kategori', judul: 'Kategori', urutkan: true, render: (p) => <Lencana warna="primary" ukuran="sm">{p.kategori}</Lencana> },
    { kunci: 'harga', judul: 'Harga', urutkan: true, rata: 'kanan', render: (p) => formatRp(p.harga) },
    { kunci: 'stok', judul: 'Stok', urutkan: true, rata: 'kanan', render: (p) => formatAngka(p.stok) },
    { kunci: 'terjual', judul: 'Terjual', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (p) => formatAngka(p.terjual) },
    { kunci: 'rating', judul: 'Rating', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (p) => p.rating },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Tabel data"
        deskripsi="Tabel lengkap dengan pencarian, filter, pengurutan, pemilihan baris, dan paginasi."
        remah={[{ label: 'Tabel' }, { label: 'Tabel data' }]}
      />

      <Peringatan varian="info" judul="Semua diproses di sisi server">
        Pencarian, filter, urut, dan paginasi dikirim ke adapter data, bukan disaring di peramban.
        Artinya tabel ini tetap ringan meski datanya jutaan baris. Pencarian sudah ter-debounce 300 ms.
      </Peringatan>

      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Katalog produk</JudulKartu>
            <DeskripsiKartu>
              {t.terpilih.length > 0
                ? `${t.terpilih.length} baris dipilih`
                : `${formatAngka(t.hasil.data?.total ?? 0)} produk`}
            </DeskripsiKartu>
          </div>
          {t.terpilih.length > 0 ? (
            <div className="flex gap-2">
              <Tombol varian="garis" ukuran="sm" onClick={() => toast.success(`${t.terpilih.length} baris diekspor.`)}>
                <Download /> Ekspor terpilih
              </Tombol>
              <Tombol varian="bahaya" ukuran="sm" onClick={() => { toast.success(`${t.terpilih.length} baris diarsipkan.`); t.setTerpilih([]) }}>
                <Trash2 /> Arsipkan
              </Tombol>
            </div>
          ) : null}
        </KepalaKartu>

        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari produk atau SKU…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />

        <SaringCepat
          nilai={t.filter['kategori']}
          onUbah={(n) => t.ubahFilter('kategori', n)}
          totalSemua={PRODUK_CONTOH.length}
          opsi={kategori.map((k) => ({
            nilai: k,
            label: k,
            jumlah: PRODUK_CONTOH.filter((p) => p.kategori === k).length,
          }))}
        />

        <TabelData<Produk>
          kolom={kolom}
          idBaris={(p) => p.id}
          {...t.propsTabel}
          aksi={(p) => (
            <Dropdown>
              <PemicuDropdown asChild>
                <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi untuk ${p.nama}`}><MoreVertical /></Tombol>
              </PemicuDropdown>
              <IsiDropdown>
                <ItemDropdown><Pencil /> Ubah</ItemDropdown>
                <ItemDropdown bahaya><Trash2 /> Arsipkan</ItemDropdown>
              </IsiDropdown>
            </Dropdown>
          )}
        />
      </Kartu>

      <Kartu>
        <IsiKartu>
          <h2 className="text-base font-bold">Cara memakainya</h2>
          <pre className="mt-3 overflow-x-auto rounded-card bg-muted p-4 font-mono text-xs leading-relaxed scrollbar-thin">
{`const t = useDaftarTabel<Produk>('produk', {
  urutAwal: { kolom: 'nama', arah: 'naik' },
})

<TabelData<Produk>
  kolom={kolom}
  idBaris={(p) => p.id}
  {...t.propsTabel}
/>`}
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Satu hook mengurus seluruh keadaan tabel. Panduan lengkapnya ada di{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">docs/RESEP.md</code>.
          </p>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/tabel/data')({ component: HalamanTabelData })
