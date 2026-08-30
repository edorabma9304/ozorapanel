import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Check, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, JudulKartu, KepalaKartu, DeskripsiKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Tab, DaftarTab, PemicuTab, IsiTab, Pemisah } from '@/components/ui/lapisan'
import { formatAngka, formatPersen, formatRp, formatWaktuRelatif } from '@/lib/format'
import { PRODUK_CONTOH, gambarPeraga, namaAcak } from '@/lib/adapter/data-contoh'
import { useKeranjang } from '@/features/toko/keranjang'
import { cn } from '@/lib/utils'

const ULASAN = Array.from({ length: 4 }, (_, i) => {
  const nama = namaAcak()
  return {
    id: `ulasan-${i}`,
    nama,
    bintang: [5, 4, 5, 3][i]!,
    waktu: new Date(Date.now() - (i + 1) * 5 * 86_400_000).toISOString(),
    isi: [
      'Barang sesuai deskripsi, pengemasan rapi, pengiriman cepat.',
      'Kualitas bagus untuk harganya. Hanya saja warnanya sedikit berbeda dari foto.',
      'Sudah pesan ketiga kalinya. Konsisten bagus, penjual responsif.',
      'Fungsinya baik, tapi buku panduannya kurang lengkap.',
    ][i]!,
  }
})

function Bintang({ nilai, ukuran = 'size-4' }: { nilai: number; ukuran?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${nilai} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((b) => (
        <Star
          key={b}
          className={cn(ukuran, b <= Math.round(nilai) ? 'fill-warning text-warning-kuat' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  )
}

function DetailProduk() {
  const { id } = Route.useParams()
  const p = PRODUK_CONTOH.find((x) => x.id === id)
  if (!p) throw notFound()

  const [qty, setQty] = useState(1)
  const [gambarAktif, setGambarAktif] = useState(0)
  const { tambah } = useKeranjang()

  const galeri = [p.gambar, gambarPeraga(`${p.id}-a`), gambarPeraga(`${p.id}-b`), gambarPeraga(`${p.id}-c`)]
  const margin = (p.harga - p.harga_modal) / p.harga
  const serupa = PRODUK_CONTOH.filter((x) => x.kategori === p.kategori && x.id !== p.id).slice(0, 4)

  return (
    <>
      <KepalaHalaman
        judul={p.nama}
        remah={[{ label: 'Aplikasi' }, { label: 'Etalase', href: '/apl/toko' }, { label: p.kategori }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/toko"><ArrowLeft /> Kembali ke etalase</Link>
          </Tombol>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <IsiKartu>
            <div className="grid aspect-square place-items-center rounded-card bg-muted">
              <img src={galeri[gambarAktif]} alt={p.nama} width={220} height={220} className="size-52 rounded-full object-cover" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {galeri.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGambarAktif(i)}
                  aria-label={`Lihat gambar ${i + 1}`}
                  aria-pressed={i === gambarAktif}
                  className={cn(
                    'grid aspect-square place-items-center rounded-card border-2 bg-muted transition-colors',
                    i === gambarAktif ? 'border-primary' : 'border-transparent hover:border-border',
                  )}
                >
                  <img src={g} alt="" width={56} height={56} loading="lazy" className="size-14 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <IsiKartu className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Lencana warna="primary">{p.kategori}</Lencana>
              <Lencana warna={p.stok > 20 ? 'success' : p.stok > 0 ? 'warning' : 'danger'}>
                {p.stok > 0 ? `Stok ${p.stok}` : 'Stok habis'}
              </Lencana>
            </div>

            <h1 className="text-2xl font-extrabold leading-snug tracking-tight">{p.nama}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Bintang nilai={p.rating} />
              <span className="font-semibold">{p.rating}</span>
              <span className="text-muted-foreground">· {formatAngka(p.terjual)} terjual</span>
              <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
            </div>

            <p className="text-3xl font-extrabold text-primary-kuat">{formatRp(p.harga)}</p>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {p.nama} dirancang untuk pemakaian harian dengan bahan yang tahan lama.
              Cocok untuk kebutuhan rumah maupun kantor, dan tersedia garansi resmi
              satu tahun dari distributor.
            </p>

            <Pemisah />

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-control border border-border">
                <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kurangi jumlah">
                  <Minus />
                </Tombol>
                <span className="w-12 text-center text-sm font-bold" aria-live="polite">{qty}</span>
                <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => setQty((q) => Math.min(p.stok || 1, q + 1))} aria-label="Tambah jumlah">
                  <Plus />
                </Tombol>
              </div>
              <p className="text-sm text-muted-foreground">
                Subtotal <span className="font-bold text-foreground">{formatRp(p.harga * qty)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Tombol
                ukuran="lg"
                disabled={p.stok === 0}
                onClick={() => {
                  tambah({ id: p.id, nama: p.nama, harga: p.harga, gambar: p.gambar }, qty)
                  toast.success(`${qty} × ${p.nama} masuk keranjang.`)
                }}
              >
                <ShoppingCart /> Tambah ke keranjang
              </Tombol>
              <Tombol varian="garis" ukuran="lg" asChild>
                <Link to="/apl/toko/checkout">Beli sekarang</Link>
              </Tombol>
            </div>

            <div className="space-y-2 rounded-card bg-muted/60 p-4 text-sm">
              {[
                { ikon: Truck, teks: 'Gratis ongkir untuk pembelian di atas Rp 500.000' },
                { ikon: Check, teks: 'Garansi resmi 1 tahun' },
                { ikon: Check, teks: 'Bisa dikembalikan dalam 7 hari' },
              ].map((b) => (
                <p key={b.teks} className="flex items-center gap-2.5">
                  <b.ikon className="size-4 shrink-0 text-success-kuat" /> {b.teks}
                </p>
              ))}
            </div>
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <IsiKartu>
          <Tab defaultValue="spesifikasi">
            <DaftarTab>
              <PemicuTab value="spesifikasi">Spesifikasi</PemicuTab>
              <PemicuTab value="ulasan">Ulasan ({ULASAN.length})</PemicuTab>
              <PemicuTab value="pengiriman">Pengiriman</PemicuTab>
            </DaftarTab>

            <IsiTab value="spesifikasi">
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                {[
                  ['SKU', p.sku],
                  ['Kategori', p.kategori],
                  ['Stok tersedia', formatAngka(p.stok)],
                  ['Total terjual', formatAngka(p.terjual)],
                  ['Harga modal', formatRp(p.harga_modal)],
                  ['Margin kotor', formatPersen(margin, 1)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </IsiTab>

            <IsiTab value="ulasan">
              <div className="space-y-5">
                {ULASAN.map((u) => (
                  <div key={u.id} className="flex gap-3 border-b border-border pb-5 last:border-0 last:pb-0">
                    <Avatar nama={u.nama} ukuran="sm" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{u.nama}</p>
                        <Bintang nilai={u.bintang} ukuran="size-3.5" />
                        <span className="text-xs text-muted-foreground">{formatWaktuRelatif(u.waktu)}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{u.isi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </IsiTab>

            <IsiTab value="pengiriman">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Pesanan diproses pada hari kerja, maksimal 1×24 jam setelah pembayaran diterima.</p>
                <p>Pengiriman memakai JNE, SiCepat, atau kurir instan untuk area dalam kota.</p>
                <p>Nomor resi dikirimkan lewat WhatsApp segera setelah paket diserahkan ke kurir.</p>
              </div>
            </IsiTab>
          </Tab>
        </IsiKartu>
      </Kartu>

      {serupa.length > 0 ? (
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Produk serupa</JudulKartu>
              <DeskripsiKartu>Dari kategori {p.kategori}</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {serupa.map((s) => (
                <Link
                  key={s.id}
                  to="/apl/toko/$id"
                  params={{ id: s.id }}
                  className="rounded-card border border-border p-4 transition-colors hover:border-primary"
                >
                  <div className="grid aspect-square place-items-center rounded-card bg-muted">
                    <img src={s.gambar} alt="" width={72} height={72} loading="lazy" className="size-18 rounded-full" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold">{s.nama}</p>
                  <p className="mt-1 font-bold">{formatRp(s.harga)}</p>
                </Link>
              ))}
            </div>
          </IsiKartu>
        </Kartu>
      ) : null}
    </>
  )
}

export const Route = createFileRoute('/_app/apl/toko/$id')({ component: DetailProduk })
