import { createFileRoute } from '@tanstack/react-router'
import {
  Banknote, CreditCard, Minus, Plus, Printer, QrCode, Search, ShoppingCart, Trash2, UserPlus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, JudulKartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Dialog, IsiDialog, KakiDialog, Pemisah, TutupDialog } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatTanggalWaktu } from '@/lib/format'
import { PELANGGAN_CONTOH, PRODUK_CONTOH } from '@/lib/adapter/data-contoh'
import { idAcak, cn } from '@/lib/utils'
import { hitungTotalPesanan } from '@/lib/hitung'

type Baris = { id: string; nama: string; harga: number; gambar: string; qty: number }

const KATEGORI = ['Semua', ...new Set(PRODUK_CONTOH.map((p) => p.kategori))]
const PAJAK = 0.11

const BAYAR = [
  { nilai: 'tunai', label: 'Tunai', ikon: Banknote },
  { nilai: 'qris', label: 'QRIS', ikon: QrCode },
  { nilai: 'kartu', label: 'Kartu', ikon: CreditCard },
] as const

/** Pecahan uang untuk tombol cepat pembayaran tunai. */
const PECAHAN = [5_000, 10_000, 20_000, 50_000, 100_000]

function Kasir() {
  const { boleh, pengguna } = useAuth()
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState('Semua')
  const [keranjang, setKeranjang] = useState<Baris[]>([])
  const [pelanggan, setPelanggan] = useState('umum')
  const [diskonPersen, setDiskonPersen] = useState(0)
  const [metode, setMetode] = useState<string>('tunai')
  const [tunai, setTunai] = useState(0)
  const [struk, setStruk] = useState<{ nomor: string; waktu: string; baris: Baris[]; total: number; bayar: number } | null>(null)

  const produk = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return PRODUK_CONTOH.filter(
      (p) =>
        p.status === 'terbit' &&
        p.stok > 0 &&
        (kategori === 'Semua' || p.kategori === kategori) &&
        (!q || p.nama.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)),
    ).slice(0, 24)
  }, [cari, kategori])

  // Perhitungan dipusatkan di lib/hitung agar bisa diuji terpisah dari UI.
  const { subtotal, potongan, pajak, total } = hitungTotalPesanan(keranjang, {
    diskonPersen,
    pajakPersen: PAJAK * 100,
  })
  const kembalian = Math.max(0, tunai - total)

  if (!boleh('pesanan.buat') && !boleh('pesanan.lihat')) return <HalamanTanpaAkses />

  function tambah(p: (typeof PRODUK_CONTOH)[number]) {
    setKeranjang((k) => {
      const ada = k.find((x) => x.id === p.id)
      return ada
        ? k.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x))
        : [...k, { id: p.id, nama: p.nama, harga: p.harga, gambar: p.gambar, qty: 1 }]
    })
  }

  function ubahQty(id: string, delta: number) {
    setKeranjang((k) =>
      k.flatMap((x) => (x.id === id ? (x.qty + delta <= 0 ? [] : [{ ...x, qty: x.qty + delta }]) : [x])),
    )
  }

  function bayar() {
    if (keranjang.length === 0) return
    if (metode === 'tunai' && tunai < total) {
      toast.error('Uang tunai belum mencukupi total belanja.')
      return
    }
    setStruk({
      nomor: `POS-${idAcak(6).toUpperCase()}`,
      waktu: new Date().toISOString(),
      baris: keranjang,
      total,
      bayar: metode === 'tunai' ? tunai : total,
    })
    setKeranjang([])
    setDiskonPersen(0)
    setTunai(0)
    toast.success('Transaksi berhasil.')
  }

  return (
    <>
      <KepalaHalaman
        judul="Kasir"
        deskripsi="Layar penjualan langsung: pilih produk, atur jumlah, lalu proses pembayaran."
        remah={[{ label: 'Aplikasi' }, { label: 'Kasir' }]}
        aksi={
          <Lencana warna="primary" padat>
            Kasir: {pengguna?.nama.split(' ')[0]}
          </Lencana>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Katalog */}
        <div className="space-y-4">
          <Kartu>
            <IsiKartu className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Masukan
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari produk atau pindai barcode…"
                  className="pl-9"
                  aria-label="Cari produk"
                  autoFocus
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {KATEGORI.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKategori(k)}
                    aria-pressed={kategori === k}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                      kategori === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </IsiKartu>
          </Kartu>

          {produk.length === 0 ? (
            <Kartu>
              <KeadaanKosong judul="Produk tidak ditemukan" deskripsi="Coba kata kunci atau kategori lain." />
            </Kartu>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {produk.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => tambah(p)}
                  className="rounded-card border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-raised"
                >
                  <div className="grid aspect-square place-items-center rounded-card bg-muted">
                    <img src={p.gambar} alt="" width={64} height={64} loading="lazy" className="size-16 rounded-full" />
                  </div>
                  <p className="mt-2.5 line-clamp-2 text-sm font-semibold leading-snug">{p.nama}</p>
                  <p className="mt-1 font-extrabold text-primary-kuat">{formatRp(p.harga)}</p>
                  <p className="text-xs text-muted-foreground">Stok {formatAngka(p.stok)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Keranjang */}
        <Kartu className="flex max-h-[80dvh] flex-col lg:sticky lg:top-20">
          <div className="flex items-center justify-between gap-3 border-b border-border p-4">
            <JudulKartu className="flex items-center gap-2">
              <ShoppingCart className="size-4" /> Keranjang
              {keranjang.length > 0 ? <Lencana warna="primary" padat ukuran="sm">{keranjang.length}</Lencana> : null}
            </JudulKartu>
            {keranjang.length > 0 ? (
              <Tombol varian="hantu" ukuran="sm" onClick={() => setKeranjang([])}>
                <Trash2 /> Kosongkan
              </Tombol>
            ) : null}
          </div>

          <div className="border-b border-border p-4">
            <label htmlFor="k-pelanggan" className="mb-1.5 block text-sm font-semibold">Pelanggan</label>
            <div className="flex gap-2">
              <PilihanRingkas
                id="k-pelanggan"
                nilai={pelanggan}
                onUbah={setPelanggan}
                opsi={[
                  { nilai: 'umum', label: 'Pelanggan umum' },
                  ...PELANGGAN_CONTOH.slice(0, 8).map((p) => ({ nilai: p.id, label: p.nama })),
                ]}
              />
              <Tombol varian="garis" ukuran="ikon" aria-label="Tambah pelanggan baru"><UserPlus /></Tombol>
            </div>
          </div>

          <div
            className="scrollbar-thin min-h-32 flex-1 overflow-y-auto"
            // WCAG 2.1.1 mewajibkan area yang bisa digulir dapat dijangkau papan
            // ketik. Aturan lint melarang tabIndex di elemen non-interaktif, tapi
            // pola role=region + tabIndex justru yang direkomendasikan WCAG.
            // oxlint-disable-next-line no-noninteractive-tabindex
            tabIndex={0}
            role="region"
            aria-label="Isi keranjang"
          >
            {keranjang.length === 0 ? (
              <KeadaanKosong
                ikon={ShoppingCart}
                judul="Keranjang kosong"
                deskripsi="Klik produk di sebelah kiri untuk menambahkannya."
                className="py-10"
              />
            ) : (
              <ul className="divide-y divide-border">
                {keranjang.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 p-3">
                    <img src={b.gambar} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{b.nama}</p>
                      <p className="text-xs text-muted-foreground">{formatRp(b.harga)}</p>
                    </div>
                    <div className="flex shrink-0 items-center rounded-control border border-border">
                      <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => ubahQty(b.id, -1)} aria-label={`Kurangi ${b.nama}`}>
                        <Minus />
                      </Tombol>
                      <span className="w-8 text-center text-sm font-bold">{b.qty}</span>
                      <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => ubahQty(b.id, 1)} aria-label={`Tambah ${b.nama}`}>
                        <Plus />
                      </Tombol>
                    </div>
                    <p className="w-20 shrink-0 text-right text-sm font-bold">{formatRp(b.harga * b.qty)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="k-diskon" className="text-sm text-muted-foreground">Diskon</label>
              <div className="flex items-center gap-1.5">
                <Masukan
                  id="k-diskon"
                  type="number"
                  min={0}
                  max={100}
                  value={diskonPersen}
                  onChange={(e) => setDiskonPersen(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="h-8 w-16 text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatRp(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Potongan</dt>
                <dd className="font-semibold text-danger-kuat">-{formatRp(potongan)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">PPN 11%</dt>
                <dd className="font-semibold">{formatRp(pajak)}</dd>
              </div>
              <div className="flex justify-between text-lg border-t border-border pt-2.5">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold text-primary-kuat">{formatRp(total)}</dd>
              </div>
            </dl>

            <div className="grid grid-cols-3 gap-2">
              {BAYAR.map((b) => (
                <button
                  key={b.nilai}
                  type="button"
                  onClick={() => setMetode(b.nilai)}
                  aria-pressed={metode === b.nilai}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-card border-2 p-2.5 text-xs font-semibold transition-colors',
                    metode === b.nilai ? 'border-primary bg-primary-soft text-primary-kuat' : 'border-border hover:border-primary/40',
                  )}
                >
                  <b.ikon className="size-4" />
                  {b.label}
                </button>
              ))}
            </div>

            {metode === 'tunai' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="k-tunai" className="text-sm text-muted-foreground">Uang diterima</label>
                  <Masukan
                    id="k-tunai"
                    type="number"
                    min={0}
                    step={1000}
                    value={tunai || ''}
                    onChange={(e) => setTunai(Number(e.target.value))}
                    className="h-9 w-36 text-right font-bold"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {PECAHAN.map((p) => (
                    <Tombol key={p} varian="garis" ukuran="sm" className="px-1 text-[11px]" onClick={() => setTunai((t) => t + p)}>
                      {p / 1000}rb
                    </Tombol>
                  ))}
                </div>
                <div className="flex justify-between rounded-card bg-muted p-2.5 text-sm">
                  <span className="text-muted-foreground">Kembalian</span>
                  <span className="font-extrabold text-success-kuat">{formatRp(kembalian)}</span>
                </div>
              </div>
            ) : null}

            <Tombol className="w-full" ukuran="lg" onClick={bayar} disabled={keranjang.length === 0}>
              Proses pembayaran · {formatRp(total)}
            </Tombol>
          </div>
        </Kartu>
      </div>

      {/* Struk */}
      <Dialog open={Boolean(struk)} onOpenChange={(b) => !b && setStruk(null)}>
        {struk ? (
          <IsiDialog judul="Transaksi berhasil" deskripsi="Struk siap dicetak atau dikirim ke pelanggan." lebar="sm">
            <div className="rounded-card border border-dashed border-border p-4 font-mono text-xs">
              <p className="text-center font-bold">OZORA PANEL</p>
              <p className="text-center text-muted-foreground">Jl. Merdeka No. 12, Yogyakarta</p>
              <Pemisah className="my-3" />
              <p>No. {struk.nomor}</p>
              <p>{formatTanggalWaktu(struk.waktu)}</p>
              <Pemisah className="my-3" />
              {struk.baris.map((b) => (
                <div key={b.id} className="flex justify-between gap-2">
                  <span className="truncate">{b.qty}× {b.nama}</span>
                  <span className="shrink-0">{formatRp(b.harga * b.qty)}</span>
                </div>
              ))}
              <Pemisah className="my-3" />
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>{formatRp(struk.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar</span>
                <span>{formatRp(struk.bayar)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>{formatRp(Math.max(0, struk.bayar - struk.total))}</span>
              </div>
              <Pemisah className="my-3" />
              <p className="text-center text-muted-foreground">Terima kasih atas kunjungan Anda</p>
            </div>

            <KakiDialog>
              <TutupDialog asChild>
                <Tombol varian="garis">Tutup</Tombol>
              </TutupDialog>
              <Tombol onClick={() => window.print()}><Printer /> Cetak struk</Tombol>
            </KakiDialog>
          </IsiDialog>
        ) : null}
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/kasir')({ component: Kasir })
