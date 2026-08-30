import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, ShoppingCart, SlidersHorizontal, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, JudulKartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { GrupRadio, ItemRadio, PilihanRingkas } from '@/components/ui/kendali'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { Dialog, PanelGeser, Pemisah } from '@/components/ui/lapisan'
import { formatAngka, formatRp } from '@/lib/format'
import { PRODUK_CONTOH } from '@/lib/adapter/data-contoh'
import { useKeranjang } from '@/features/toko/keranjang'
import { cn } from '@/lib/utils'

const KATEGORI = ['Semua', ...new Set(PRODUK_CONTOH.map((p) => p.kategori))]
const RENTANG = [
  { nilai: 'semua', label: 'Semua harga', min: 0, maks: Number.POSITIVE_INFINITY },
  { nilai: 'a', label: 'Di bawah Rp 500 rb', min: 0, maks: 500_000 },
  { nilai: 'b', label: 'Rp 500 rb – 2 jt', min: 500_000, maks: 2_000_000 },
  { nilai: 'c', label: 'Rp 2 jt – 5 jt', min: 2_000_000, maks: 5_000_000 },
  { nilai: 'd', label: 'Di atas Rp 5 jt', min: 5_000_000, maks: Number.POSITIVE_INFINITY },
]
const URUT = [
  { nilai: 'terbaru', label: 'Terbaru' },
  { nilai: 'termurah', label: 'Harga: rendah ke tinggi' },
  { nilai: 'termahal', label: 'Harga: tinggi ke rendah' },
  { nilai: 'terlaris', label: 'Paling laris' },
  { nilai: 'rating', label: 'Rating tertinggi' },
]

function PanelSaring({
  kategori, setKategori, rentang, setRentang, hanyaTersedia, setHanyaTersedia, onReset,
}: {
  kategori: string
  setKategori: (n: string) => void
  rentang: string
  setRentang: (n: string) => void
  hanyaTersedia: boolean
  setHanyaTersedia: (b: boolean) => void
  onReset: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <JudulKartu className="text-sm">Kategori</JudulKartu>
        <div className="mt-3 space-y-1">
          {KATEGORI.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              className={cn(
                'flex w-full items-center justify-between rounded-control px-3 py-2 text-sm transition-colors',
                kategori === k ? 'bg-primary-soft font-semibold text-primary-kuat' : 'hover:bg-muted',
              )}
              aria-pressed={kategori === k}
            >
              {k}
              <span className="text-xs text-muted-foreground">
                {k === 'Semua'
                  ? PRODUK_CONTOH.length
                  : PRODUK_CONTOH.filter((p) => p.kategori === k).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Pemisah />

      <div>
        <JudulKartu className="text-sm">Rentang harga</JudulKartu>
        <GrupRadio value={rentang} onValueChange={setRentang} className="mt-3 space-y-2.5">
          {RENTANG.map((r) => (
            <label key={r.nilai} htmlFor={`harga-${r.nilai}`} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <ItemRadio id={`harga-${r.nilai}`} value={r.nilai} /> {r.label}
            </label>
          ))}
        </GrupRadio>
      </div>

      <Pemisah />

      <div>
        <JudulKartu className="text-sm">Ketersediaan</JudulKartu>
        <label htmlFor="stok-ada" className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            id="stok-ada"
            type="checkbox"
            checked={hanyaTersedia}
            onChange={(e) => setHanyaTersedia(e.target.checked)}
            className="size-4 accent-primary"
          />
          Hanya tampilkan yang ada stok
        </label>
      </div>

      <Tombol varian="garis" className="w-full" onClick={onReset}>
        Atur ulang filter
      </Tombol>
    </div>
  )
}

function Etalase() {
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const [rentang, setRentang] = useState('semua')
  const [urut, setUrut] = useState('terbaru')
  const [hanyaTersedia, setHanyaTersedia] = useState(false)
  const [saringHp, setSaringHp] = useState(false)
  const { tambah, jumlah } = useKeranjang()

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    const r = RENTANG.find((x) => x.nilai === rentang)!
    const disaring = PRODUK_CONTOH.filter(
      (p) =>
        p.status === 'terbit' &&
        (!q || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
        (kategori === 'Semua' || p.kategori === kategori) &&
        p.harga >= r.min &&
        p.harga <= r.maks &&
        (!hanyaTersedia || p.stok > 0),
    )
    const urutkan = {
      terbaru: (a: typeof disaring[number], b: typeof disaring[number]) => +new Date(b.created_at) - +new Date(a.created_at),
      termurah: (a: typeof disaring[number], b: typeof disaring[number]) => a.harga - b.harga,
      termahal: (a: typeof disaring[number], b: typeof disaring[number]) => b.harga - a.harga,
      terlaris: (a: typeof disaring[number], b: typeof disaring[number]) => b.terjual - a.terjual,
      rating: (a: typeof disaring[number], b: typeof disaring[number]) => b.rating - a.rating,
    }[urut]!
    return [...disaring].sort(urutkan)
  }, [cari, kategori, rentang, urut, hanyaTersedia])

  function reset() {
    setCari('')
    setKategori('Semua')
    setRentang('semua')
    setHanyaTersedia(false)
  }

  const propsSaring = { kategori, setKategori, rentang, setRentang, hanyaTersedia, setHanyaTersedia, onReset: reset }

  return (
    <>
      <KepalaHalaman
        judul="Etalase"
        deskripsi="Katalog belanja dengan penyaring, pengurutan, dan keranjang."
        remah={[{ label: 'Aplikasi' }, { label: 'Etalase' }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/toko/checkout">
              <ShoppingCart /> Keranjang
              {jumlah > 0 ? <Lencana warna="primary" padat ukuran="sm">{jumlah}</Lencana> : null}
            </Link>
          </Tombol>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Kartu className="hidden h-fit lg:block">
          <IsiKartu>
            <PanelSaring {...propsSaring} />
          </IsiKartu>
        </Kartu>

        <div className="space-y-4">
          <Kartu>
            <IsiKartu className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-52 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Masukan
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari produk…"
                  className="pl-9"
                  aria-label="Cari produk"
                />
              </div>
              <PilihanRingkas
                nilai={urut}
                onUbah={setUrut}
                opsi={URUT.map((u) => ({ nilai: u.nilai, label: u.label }))}
                className="w-56"
              />
              <Tombol varian="garis" className="lg:hidden" onClick={() => setSaringHp(true)}>
                <SlidersHorizontal /> Filter
              </Tombol>
            </IsiKartu>
          </Kartu>

          <p className="text-sm text-muted-foreground">
            Menampilkan {formatAngka(hasil.length)} produk
          </p>

          {hasil.length === 0 ? (
            <Kartu>
              <KeadaanKosong
                ikon={ShoppingCart}
                judul="Produk tidak ditemukan"
                deskripsi="Produk yang Anda cari tidak tersedia. Coba ubah filter atau kata kuncinya."
                aksi={<Tombol varian="garis" onClick={reset}>Atur ulang filter</Tombol>}
              />
            </Kartu>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {hasil.map((p) => (
                <Kartu key={p.id} className="group flex flex-col overflow-hidden transition-shadow hover:shadow-raised">
                  <Link to="/apl/toko/$id" params={{ id: p.id }} className="block">
                    <div className="relative grid aspect-4/3 place-items-center bg-muted">
                      <img src={p.gambar} alt={p.nama} width={96} height={96} loading="lazy" className="size-24 rounded-full transition-transform duration-300 group-hover:scale-110" />
                      {p.stok === 0 ? (
                        <span className="absolute inset-0 grid place-items-center bg-background/70 text-sm font-bold">
                          Stok habis
                        </span>
                      ) : p.stok < 20 ? (
                        <Lencana warna="danger" ukuran="sm" className="absolute left-3 top-3">
                          Sisa {p.stok}
                        </Lencana>
                      ) : null}
                    </div>
                  </Link>

                  <IsiKartu className="flex flex-1 flex-col gap-1.5">
                    <Lencana warna="primary" ukuran="sm" className="w-fit">{p.kategori}</Lencana>
                    <h3 className="line-clamp-2 text-sm font-bold">
                      <Link to="/apl/toko/$id" params={{ id: p.id }} className="hover:text-primary-kuat">
                        {p.nama}
                      </Link>
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3.5 fill-warning text-warning-kuat" /> {p.rating} · {formatAngka(p.terjual)} terjual
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <p className="text-base font-extrabold">{formatRp(p.harga)}</p>
                      <Tombol
                        ukuran="ikon-sm"
                        disabled={p.stok === 0}
                        aria-label={`Tambah ${p.nama} ke keranjang`}
                        onClick={() => {
                          tambah({ id: p.id, nama: p.nama, harga: p.harga, gambar: p.gambar })
                          toast.success(`${p.nama} masuk keranjang.`)
                        }}
                      >
                        <ShoppingCart />
                      </Tombol>
                    </div>
                  </IsiKartu>
                </Kartu>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={saringHp} onOpenChange={setSaringHp}>
        <PanelGeser judul="Filter produk" sisi="kiri">
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            <PanelSaring {...propsSaring} />
          </div>
        </PanelGeser>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/toko/')({ component: Etalase })
