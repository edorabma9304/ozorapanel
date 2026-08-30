import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, Save } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm, propsKolom } from '@/components/form/kolom'
import { UnggahGambar } from '@/components/form/unggah-gambar'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatPersen, formatRp } from '@/lib/format'
import { hitungMargin } from '@/lib/hitung'
import { PRODUK_CONTOH } from '@/lib/adapter/data-contoh'

const KATEGORI = [...new Set(PRODUK_CONTOH.map((p) => p.kategori))]

const skema = z.object({
  nama: z.string().trim().min(3, 'Nama produk minimal 3 huruf.').max(120, 'Maksimal 120 huruf.'),
  sku: z.string().trim().regex(/^[A-Z0-9-]{3,20}$/, 'SKU hanya huruf kapital, angka, dan tanda hubung (3–20 karakter).'),
  kategori: z.string().min(1, 'Pilih kategori produk.'),
  deskripsi: z.string().trim().max(1000, 'Maksimal 1000 karakter.').optional().or(z.literal('')),
  harga_modal: z.coerce.number().nonnegative('Harga modal tidak boleh negatif.'),
  harga: z.coerce.number().positive('Harga jual harus lebih besar dari nol.'),
  stok: z.coerce.number().int().nonnegative('Stok tidak boleh negatif.'),
  berat: z.coerce.number().positive('Berat harus lebih besar dari nol.'),
  status: z.enum(['terbit', 'draf', 'arsip']),
  tampilkan_di_katalog: z.boolean(),
}).refine((d) => d.harga >= d.harga_modal, {
  message: 'Harga jual tidak boleh di bawah harga modal.',
  path: ['harga'],
})

type Isi = z.input<typeof skema>

function ProdukBaru() {
  const { boleh } = useAuth()
  const navigate = useNavigate()
  const [gambar, setGambar] = useState<string[]>([])

  const {
    register, control, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Isi>({
    resolver: zodResolver(skema),
    defaultValues: {
      nama: '', sku: '', kategori: '', deskripsi: '',
      harga_modal: 0, harga: 0, stok: 0, berat: 500,
      status: 'draf', tampilkan_di_katalog: true,
    },
  })

  const hargaModal = Number(useWatch({ control, name: 'harga_modal' }) ?? 0)
  const hargaJual = Number(useWatch({ control, name: 'harga' }) ?? 0)
  const margin = hitungMargin(hargaJual, hargaModal)

  if (!boleh('katalog.buat')) return <HalamanTanpaAkses />

  async function simpan(isi: Isi) {
    console.warn('Produk baru:', isi, gambar)
    toast.success('Produk berhasil disimpan.')
    await navigate({ to: '/apl/produk' })
  }

  return (
    <>
      <KepalaHalaman
        judul="Tambah produk"
        deskripsi="Isi data produk. Margin dihitung otomatis dari harga modal dan harga jual."
        remah={[{ label: 'Aplikasi' }, { label: 'Produk', href: '/apl/produk' }, { label: 'Tambah' }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/produk"><ArrowLeft /> Batal</Link>
          </Tombol>
        }
      />

      <form onSubmit={(e) => void handleSubmit(simpan)(e)} noValidate className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Informasi produk</JudulKartu>
                <DeskripsiKartu>Nama dan SKU wajib unik</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <KolomForm id="p-nama" label="Nama produk" wajib galat={errors.nama?.message}>
                <Masukan {...propsKolom('p-nama', errors.nama?.message)} {...register('nama')} placeholder="mis. Kursi Ergonomis Pro" />
              </KolomForm>

              <div className="grid gap-4 sm:grid-cols-2">
                <KolomForm id="p-sku" label="SKU" wajib galat={errors.sku?.message} petunjuk="Huruf kapital, angka, dan tanda hubung.">
                  <Masukan
                    {...propsKolom('p-sku', errors.sku?.message, 'petunjuk')}
                    {...register('sku')}
                    placeholder="SKU-1024"
                    className="font-mono uppercase"
                  />
                </KolomForm>

                <KolomForm id="p-kategori" label="Kategori" wajib galat={errors.kategori?.message}>
                  <Controller
                    control={control}
                    name="kategori"
                    render={({ field }) => (
                      <PilihanRingkas
                        id="p-kategori"
                        nilai={field.value}
                        onUbah={field.onChange}
                        placeholder="Pilih kategori…"
                        opsi={KATEGORI.map((k) => ({ nilai: k, label: k }))}
                      />
                    )}
                  />
                </KolomForm>
              </div>

              <KolomForm id="p-deskripsi" label="Deskripsi" galat={errors.deskripsi?.message}>
                <AreaTeks {...propsKolom('p-deskripsi', errors.deskripsi?.message)} {...register('deskripsi')} className="min-h-32" placeholder="Jelaskan bahan, ukuran, dan keunggulan produk…" />
              </KolomForm>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Harga &amp; stok</JudulKartu>
                <DeskripsiKartu>Margin dihitung otomatis</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <KolomForm id="p-modal" label="Harga modal" galat={errors.harga_modal?.message}>
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-control border border-r-0 border-input bg-muted px-3 text-sm font-semibold text-muted-foreground">Rp</span>
                    <Masukan {...propsKolom('p-modal', errors.harga_modal?.message)} {...register('harga_modal')} type="number" min={0} step={500} className="rounded-l-none text-right" />
                  </div>
                </KolomForm>

                <KolomForm id="p-harga" label="Harga jual" wajib galat={errors.harga?.message}>
                  <div className="flex">
                    <span className="grid place-items-center rounded-l-control border border-r-0 border-input bg-muted px-3 text-sm font-semibold text-muted-foreground">Rp</span>
                    <Masukan {...propsKolom('p-harga', errors.harga?.message)} {...register('harga')} type="number" min={0} step={500} className="rounded-l-none text-right" />
                  </div>
                </KolomForm>

                <KolomForm id="p-stok" label="Stok awal" galat={errors.stok?.message}>
                  <Masukan {...propsKolom('p-stok', errors.stok?.message)} {...register('stok')} type="number" min={0} className="text-right" />
                </KolomForm>

                <KolomForm id="p-berat" label="Berat" galat={errors.berat?.message} petunjuk="Dipakai untuk menghitung ongkir.">
                  <div className="flex">
                    <Masukan {...propsKolom('p-berat', errors.berat?.message, 'petunjuk')} {...register('berat')} type="number" min={1} className="rounded-r-none text-right" />
                    <span className="grid place-items-center rounded-r-control border border-l-0 border-input bg-muted px-3 text-sm font-semibold text-muted-foreground">gram</span>
                  </div>
                </KolomForm>
              </div>

              <div className="rounded-card bg-muted/60 p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Laba per unit</dt>
                    <dd className="font-semibold">{formatRp(Math.max(0, hargaJual - hargaModal))}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Margin kotor</dt>
                    <dd className={margin < 0.2 ? 'font-bold text-danger-kuat' : 'font-bold text-success-kuat'}>
                      {formatPersen(Math.max(0, margin), 1)}
                    </dd>
                  </div>
                </dl>
                {hargaJual > 0 && margin < 0.2 ? (
                  <p className="mt-2 text-xs text-danger-kuat">
                    Margin di bawah 20%. Periksa lagi harga modalnya.
                  </p>
                ) : null}
              </div>
            </IsiKartu>
          </Kartu>
        </div>

        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Gambar produk</JudulKartu>
                <DeskripsiKartu>Maksimal 5 gambar, 2 MB per berkas</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu className="space-y-3">
              {/* Slot pertama = gambar utama, sisanya galeri tambahan. */}
              {[0, 1, 2].map((i) => (
                <UnggahGambar
                  key={i}
                  label={i === 0 ? 'Gambar utama' : `Gambar tambahan ${i}`}
                  keterangan={i === 0 ? 'JPG, PNG, atau WebP · minimal lebar 400px · maks. 8 MB' : undefined}
                  preset="produk"
                  rasioPratinjau="aspect-square"
                  nilai={gambar[i] ?? ''}
                  onUbah={(v) =>
                    setGambar((g) => {
                      const baru = [...g]
                      baru[i] = v
                      return baru.filter((x, k) => x !== '' || k < 3)
                    })
                  }
                />
              ))}
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <JudulKartu>Publikasi</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <KolomForm id="p-status" label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <PilihanRingkas
                      id="p-status"
                      nilai={field.value}
                      onUbah={field.onChange}
                      opsi={[
                        { nilai: 'draf', label: 'Draf' },
                        { nilai: 'terbit', label: 'Terbit' },
                        { nilai: 'arsip', label: 'Arsip' },
                      ]}
                    />
                  )}
                />
              </KolomForm>

              <Controller
                control={control}
                name="tampilkan_di_katalog"
                render={({ field }) => (
                  <label htmlFor="p-katalog" className="flex items-center justify-between gap-3 rounded-card border border-border p-3.5">
                    <span>
                      <span className="block text-sm font-semibold">Tampilkan di etalase</span>
                      <span className="block text-xs text-muted-foreground">Produk terlihat oleh pembeli</span>
                    </span>
                    <Sakelar id="p-katalog" checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />

              <Peringatan varian="info">
                Produk berstatus draf tidak muncul di etalase meski sakelar di atas menyala.
              </Peringatan>

              <Tombol type="submit" className="w-full" ukuran="lg" memuat={isSubmitting}>
                <Save /> Simpan produk
              </Tombol>
            </IsiKartu>
          </Kartu>
        </div>
      </form>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/produk/baru')({ component: ProdukBaru })
