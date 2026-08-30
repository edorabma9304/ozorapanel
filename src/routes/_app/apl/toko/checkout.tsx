import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Landmark, Minus, PartyPopper, Plus, QrCode,
  ShoppingCart, Trash2, Truck, Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, KakiKartu, JudulKartu, KepalaKartu, DeskripsiKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { GrupRadio, ItemRadio, PilihanRingkas } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { Pemisah } from '@/components/ui/lapisan'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { formatRp } from '@/lib/format'
import { useKeranjang } from '@/features/toko/keranjang'
import { hitungTotalPesanan } from '@/lib/hitung'
import { idAcak } from '@/lib/utils'
import { cn } from '@/lib/utils'

const LANGKAH = ['Keranjang', 'Alamat pengiriman', 'Pembayaran'] as const

const PENGIRIMAN = [
  { nilai: 'reguler', label: 'Reguler', keterangan: '3–5 hari kerja', ongkir: 22_000 },
  { nilai: 'kilat', label: 'Kilat', keterangan: '1–2 hari kerja', ongkir: 45_000 },
  { nilai: 'instan', label: 'Instan', keterangan: 'hari yang sama, dalam kota', ongkir: 80_000 },
]

const PEMBAYARAN = [
  { nilai: 'transfer', label: 'Transfer bank', keterangan: 'BCA, Mandiri, BNI, BRI', ikon: Landmark },
  { nilai: 'qris', label: 'QRIS', keterangan: 'Semua dompet digital', ikon: QrCode },
  { nilai: 'kartu', label: 'Kartu kredit / debit', keterangan: 'Visa, Mastercard', ikon: CreditCard },
  { nilai: 'cod', label: 'Bayar di tempat', keterangan: 'Khusus dalam kota', ikon: Wallet },
]

const DISKON = 0.05

function Checkout() {
  const { baris, subtotal, ubahQty, hapus, kosongkan } = useKeranjang()
  const [langkah, setLangkah] = useState(0)
  const [kirim, setKirim] = useState('reguler')
  const [bayar, setBayar] = useState('transfer')
  const [selesai, setSelesai] = useState(false)
  const [nomorPesanan, setNomorPesanan] = useState('')
  const navigate = useNavigate()

  const ongkir = baris.length > 0 ? PENGIRIMAN.find((p) => p.nilai === kirim)!.ongkir : 0
  const { potongan, total } = hitungTotalPesanan(baris, {
    diskonPersen: DISKON * 100,
    ongkir,
  })

  if (selesai) {
    return (
      <>
        <KepalaHalaman
          judul="Pesanan diterima"
          remah={[{ label: 'Aplikasi' }, { label: 'Etalase', href: '/apl/toko' }, { label: 'Checkout' }]}
        />
        <Kartu>
          <IsiKartu className="py-14 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success-kuat">
              <PartyPopper className="size-8" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold">Terima kasih!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Pesanan Anda sudah kami terima dan akan diproses pada hari kerja berikutnya.
              Nomor resi dikirim lewat WhatsApp begitu paket diserahkan ke kurir.
            </p>
            <p className="mt-4 font-mono text-sm font-bold">{nomorPesanan}</p>
            <Tombol className="mt-7" asChild>
              <Link to="/apl/toko">Belanja lagi</Link>
            </Tombol>
          </IsiKartu>
        </Kartu>
      </>
    )
  }

  return (
    <>
      <KepalaHalaman
        judul="Checkout"
        deskripsi="Tiga langkah: periksa keranjang, isi alamat, lalu pilih pembayaran."
        remah={[{ label: 'Aplikasi' }, { label: 'Etalase', href: '/apl/toko' }, { label: 'Checkout' }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/toko"><ArrowLeft /> Lanjut belanja</Link>
          </Tombol>
        }
      />

      {/* Penanda langkah */}
      <Kartu>
        <IsiKartu>
          <ol className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {LANGKAH.map((l, i) => {
              const lewat = i < langkah
              const aktif = i === langkah
              return (
                <li key={l} className="flex flex-1 items-center gap-3">
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-colors',
                      lewat
                        ? 'border-success bg-success text-success-foreground'
                        : aktif
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground',
                    )}
                  >
                    {lewat ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={cn('text-sm font-bold', !aktif && !lewat && 'text-muted-foreground')}>{l}</span>
                  {i < LANGKAH.length - 1 ? (
                    <span className={cn('hidden h-0.5 flex-1 rounded sm:block', lewat ? 'bg-success' : 'bg-border')} />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {langkah === 0 ? (
            <Kartu className="overflow-hidden">
              <KepalaKartu className="pb-4">
                <div>
                  <JudulKartu>Isi keranjang</JudulKartu>
                  <DeskripsiKartu>{baris.length} jenis barang</DeskripsiKartu>
                </div>
                {baris.length > 0 ? (
                  <Tombol varian="hantu" ukuran="sm" onClick={kosongkan}>
                    <Trash2 /> Kosongkan
                  </Tombol>
                ) : null}
              </KepalaKartu>

              {baris.length === 0 ? (
                <KeadaanKosong
                  ikon={ShoppingCart}
                  judul="Keranjang masih kosong"
                  deskripsi="Tambahkan produk dari etalase untuk melanjutkan."
                  aksi={<Tombol asChild><Link to="/apl/toko">Ke etalase</Link></Tombol>}
                />
              ) : (
                <BingkaiTabel>
                  <Tabel>
                    <KepalaTabel>
                      <tr>
                        <SelKepala>Produk</SelKepala>
                        <SelKepala className="text-center">Jumlah</SelKepala>
                        <SelKepala className="text-right">Harga</SelKepala>
                        <SelKepala className="text-right">Subtotal</SelKepala>
                        <SelKepala className="w-12" />
                      </tr>
                    </KepalaTabel>
                    <BadanTabel>
                      {baris.map((b) => (
                        <BarisTabel key={b.id}>
                          <Sel>
                            <div className="flex items-center gap-3">
                              <img src={b.gambar} alt="" width={40} height={40} className="size-10 rounded-full" />
                              <span className="truncate font-semibold">{b.nama}</span>
                            </div>
                          </Sel>
                          <Sel>
                            <div className="mx-auto flex w-fit items-center rounded-control border border-border">
                              <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => ubahQty(b.id, b.qty - 1)} aria-label={`Kurangi ${b.nama}`}>
                                <Minus />
                              </Tombol>
                              <span className="w-9 text-center text-sm font-bold">{b.qty}</span>
                              <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => ubahQty(b.id, b.qty + 1)} aria-label={`Tambah ${b.nama}`}>
                                <Plus />
                              </Tombol>
                            </div>
                          </Sel>
                          <Sel className="text-right">{formatRp(b.harga)}</Sel>
                          <Sel className="text-right font-bold">{formatRp(b.harga * b.qty)}</Sel>
                          <Sel className="text-right">
                            <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => hapus(b.id)} aria-label={`Hapus ${b.nama}`}>
                              <Trash2 className="text-danger-kuat" />
                            </Tombol>
                          </Sel>
                        </BarisTabel>
                      ))}
                    </BadanTabel>
                  </Tabel>
                </BingkaiTabel>
              )}
            </Kartu>
          ) : langkah === 1 ? (
            <Kartu>
              <KepalaKartu>
                <div>
                  <JudulKartu>Alamat pengiriman</JudulKartu>
                  <DeskripsiKartu>Ke mana pesanan dikirim</DeskripsiKartu>
                </div>
              </KepalaKartu>
              <IsiKartu className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <KolomForm id="c-nama" label="Nama penerima" wajib>
                    <Masukan id="c-nama" placeholder="Nama lengkap" autoComplete="name" />
                  </KolomForm>
                  <KolomForm id="c-telepon" label="Nomor HP" wajib>
                    <Masukan id="c-telepon" inputMode="tel" placeholder="0812-3456-7890" autoComplete="tel" />
                  </KolomForm>
                </div>
                <KolomForm id="c-alamat" label="Alamat lengkap" wajib>
                  <AreaTeks id="c-alamat" placeholder="Jalan, nomor rumah, RT/RW, patokan…" autoComplete="street-address" />
                </KolomForm>
                <div className="grid gap-4 sm:grid-cols-3">
                  <KolomForm id="c-provinsi" label="Provinsi">
                    <PilihanRingkas
                      id="c-provinsi"
                      nilai="diy"
                      onUbah={() => undefined}
                      opsi={[
                        { nilai: 'diy', label: 'DI Yogyakarta' },
                        { nilai: 'jateng', label: 'Jawa Tengah' },
                        { nilai: 'jatim', label: 'Jawa Timur' },
                        { nilai: 'dki', label: 'DKI Jakarta' },
                      ]}
                    />
                  </KolomForm>
                  <KolomForm id="c-kota" label="Kota / kabupaten">
                    <Masukan id="c-kota" defaultValue="Sleman" />
                  </KolomForm>
                  <KolomForm id="c-pos" label="Kode pos">
                    <Masukan id="c-pos" inputMode="numeric" defaultValue="55281" autoComplete="postal-code" />
                  </KolomForm>
                </div>

                <Pemisah />

                <div>
                  <JudulKartu className="text-sm">Metode pengiriman</JudulKartu>
                  <GrupRadio value={kirim} onValueChange={setKirim} className="mt-3 space-y-2.5">
                    {PENGIRIMAN.map((o) => (
                      <label
                        key={o.nilai}
                        htmlFor={`kirim-${o.nilai}`}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-card border p-3.5 transition-colors',
                          kirim === o.nilai ? 'border-primary bg-primary-soft/40' : 'border-border hover:border-primary/40',
                        )}
                      >
                        <ItemRadio id={`kirim-${o.nilai}`} value={o.nilai} />
                        <Truck className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">{o.label}</span>
                          <span className="block text-xs text-muted-foreground">{o.keterangan}</span>
                        </span>
                        <span className="text-sm font-bold">{formatRp(o.ongkir)}</span>
                      </label>
                    ))}
                  </GrupRadio>
                </div>
              </IsiKartu>
            </Kartu>
          ) : (
            <Kartu>
              <KepalaKartu>
                <div>
                  <JudulKartu>Metode pembayaran</JudulKartu>
                  <DeskripsiKartu>Pilih cara membayar pesanan ini</DeskripsiKartu>
                </div>
              </KepalaKartu>
              <IsiKartu>
                <GrupRadio value={bayar} onValueChange={setBayar} className="space-y-2.5">
                  {PEMBAYARAN.map((o) => (
                    <label
                      key={o.nilai}
                      htmlFor={`bayar-${o.nilai}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-card border p-3.5 transition-colors',
                        bayar === o.nilai ? 'border-primary bg-primary-soft/40' : 'border-border hover:border-primary/40',
                      )}
                    >
                      <ItemRadio id={`bayar-${o.nilai}`} value={o.nilai} />
                      <o.ikon className="size-5 shrink-0 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{o.label}</span>
                        <span className="block text-xs text-muted-foreground">{o.keterangan}</span>
                      </span>
                    </label>
                  ))}
                </GrupRadio>

                {bayar === 'kartu' ? (
                  <div className="mt-5 grid gap-4 rounded-card border border-border p-4 sm:grid-cols-2">
                    <KolomForm id="k-nomor" label="Nomor kartu" className="sm:col-span-2">
                      <Masukan id="k-nomor" inputMode="numeric" placeholder="0000 0000 0000 0000" autoComplete="cc-number" />
                    </KolomForm>
                    <KolomForm id="k-exp" label="Masa berlaku">
                      <Masukan id="k-exp" placeholder="MM/YY" autoComplete="cc-exp" />
                    </KolomForm>
                    <KolomForm id="k-cvc" label="CVC">
                      <Masukan id="k-cvc" inputMode="numeric" placeholder="123" autoComplete="cc-csc" />
                    </KolomForm>
                  </div>
                ) : null}
              </IsiKartu>
            </Kartu>
          )}
        </div>

        {/* Ringkasan pesanan */}
        <Kartu className="h-fit">
          <KepalaKartu>
            <JudulKartu>Ringkasan pesanan</JudulKartu>
          </KepalaKartu>
          <IsiKartu>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatRp(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Diskon 5%</dt>
                <dd className="font-semibold text-danger-kuat">-{formatRp(potongan)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ongkos kirim</dt>
                <dd className="font-semibold">{ongkir === 0 ? 'Gratis' : formatRp(ongkir)}</dd>
              </div>
              <div className="flex justify-between text-base border-t border-border pt-2.5">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold text-primary-kuat">{formatRp(total)}</dd>
              </div>
            </dl>
          </IsiKartu>
          <KakiKartu className="justify-between">
            <Tombol varian="garis" onClick={() => setLangkah((l) => Math.max(0, l - 1))} disabled={langkah === 0}>
              <ArrowLeft /> Kembali
            </Tombol>
            {langkah < LANGKAH.length - 1 ? (
              <Tombol onClick={() => setLangkah((l) => l + 1)} disabled={baris.length === 0}>
                Lanjut <ArrowRight />
              </Tombol>
            ) : (
              <Tombol
                varian="sukses"
                onClick={() => {
                  // Nomor dibuat di penangan peristiwa — memanggil Math.random()
                  // saat render membuat nomornya berubah tiap render ulang.
                  setNomorPesanan(`INV-2026-${idAcak(4).toUpperCase()}`)
                  kosongkan()
                  setSelesai(true)
                  toast.success('Pesanan berhasil dibuat.')
                  void navigate({ to: '/apl/toko/checkout' })
                }}
              >
                <Check /> Bayar sekarang
              </Tombol>
            )}
          </KakiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/toko/checkout')({ component: Checkout })
