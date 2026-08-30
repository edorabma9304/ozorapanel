import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, Eye, Save, Send, X } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm, propsKolom } from '@/components/form/kolom'
import { PenyuntingKaya } from '@/components/form/penyunting'
import { UnggahGambar } from '@/components/form/unggah-gambar'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Dialog, IsiDialog } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { slug as keSlug } from '@/lib/utils'
import { formatTanggal } from '@/lib/format'

const KATEGORI = ['Keuangan', 'Operasional', 'Pemasaran', 'Teknologi']
const MAKS_JUDUL_SEO = 60
const MAKS_DESKRIPSI_SEO = 160

const skema = z.object({
  judul: z.string().trim().min(8, 'Judul minimal 8 huruf.').max(120, 'Judul maksimal 120 huruf.'),
  slug: z.string().trim().regex(/^[a-z0-9-]{3,120}$/, 'Slug hanya huruf kecil, angka, dan tanda hubung.'),
  kategori: z.string().min(1, 'Pilih kategori artikel.'),
  ringkasan: z.string().trim().min(20, 'Ringkasan minimal 20 huruf.').max(300, 'Ringkasan maksimal 300 huruf.'),
  isi: z.string().min(30, 'Isi artikel masih terlalu pendek.'),
  judul_seo: z.string().trim().max(MAKS_JUDUL_SEO, `Maksimal ${MAKS_JUDUL_SEO} karakter.`).optional().or(z.literal('')),
  deskripsi_seo: z.string().trim().max(MAKS_DESKRIPSI_SEO, `Maksimal ${MAKS_DESKRIPSI_SEO} karakter.`).optional().or(z.literal('')),
  status: z.enum(['draf', 'terbit', 'terjadwal']),
  tanggal_terbit: z.string().optional().or(z.literal('')),
  izinkan_komentar: z.boolean(),
})

type Isi = z.input<typeof skema>

function TulisArtikel() {
  const { boleh, pengguna } = useAuth()
  const navigate = useNavigate()
  const [isi, setIsi] = useState('')
  const [label, setLabel] = useState<string[]>([])
  const [drafLabel, setDrafLabel] = useState('')
  const [sampul, setSampul] = useState('')
  const [pratinjau, setPratinjau] = useState(false)

  const {
    register, control, handleSubmit, setValue,
    formState: { errors, isSubmitting },
  } = useForm<Isi>({
    resolver: zodResolver(skema),
    defaultValues: {
      judul: '', slug: '', kategori: '', ringkasan: '', isi: '',
      judul_seo: '', deskripsi_seo: '', status: 'draf', tanggal_terbit: '',
      izinkan_komentar: true,
    },
  })

  const judul = useWatch({ control, name: 'judul' }) ?? ''
  const judulSeo = useWatch({ control, name: 'judul_seo' }) ?? ''
  const deskripsiSeo = useWatch({ control, name: 'deskripsi_seo' }) ?? ''
  const status = useWatch({ control, name: 'status' })
  const slugArtikel = useWatch({ control, name: 'slug' }) ?? ''

  if (!boleh('katalog.buat') && !boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  async function simpan(data: Isi) {
    console.warn('Artikel disimpan:', { ...data, label, sampul })
    toast.success(data.status === 'terbit' ? 'Artikel diterbitkan.' : 'Artikel disimpan sebagai draf.')
    await navigate({ to: '/apl/blog' })
  }

  return (
    <>
      <KepalaHalaman
        judul="Tulis artikel"
        deskripsi="Penyunting teks kaya dengan pengaturan SEO per artikel."
        remah={[{ label: 'Aplikasi' }, { label: 'Blog', href: '/apl/blog' }, { label: 'Tulis' }]}
        aksi={
          <>
            <Tombol varian="garis" asChild>
              <Link to="/apl/blog"><ArrowLeft /> Batal</Link>
            </Tombol>
            <Tombol varian="garis" onClick={() => setPratinjau(true)}>
              <Eye /> Pratinjau
            </Tombol>
          </>
        }
      />

      <form onSubmit={(e) => void handleSubmit(simpan)(e)} noValidate className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Kartu>
            <IsiKartu className="space-y-4">
              <KolomForm id="b-judul" label="Judul artikel" wajib galat={errors.judul?.message}>
                <Masukan
                  {...propsKolom('b-judul', errors.judul?.message)}
                  {...register('judul', {
                    onChange: (e) => setValue('slug', keSlug(e.target.value), { shouldValidate: true }),
                  })}
                  placeholder="mis. Cara Menyusun Laporan Keuangan Bulanan"
                  className="text-lg font-bold"
                />
              </KolomForm>

              <KolomForm
                id="b-slug"
                label="Slug URL"
                wajib
                galat={errors.slug?.message}
                petunjuk="Terisi otomatis dari judul. Ubah bila perlu — jangan diubah setelah terbit."
              >
                <div className="flex">
                  <span className="grid place-items-center rounded-l-control border border-r-0 border-input bg-muted px-3 font-mono text-xs text-muted-foreground">
                    /blog/
                  </span>
                  <Masukan
                    {...propsKolom('b-slug', errors.slug?.message, 'petunjuk')}
                    {...register('slug')}
                    className="rounded-l-none font-mono"
                  />
                </div>
              </KolomForm>

              <KolomForm id="b-ringkasan" label="Ringkasan" wajib galat={errors.ringkasan?.message} petunjuk="Tampil di daftar artikel dan hasil pencarian.">
                <AreaTeks
                  {...propsKolom('b-ringkasan', errors.ringkasan?.message, 'petunjuk')}
                  {...register('ringkasan')}
                  className="min-h-20"
                  placeholder="Satu sampai dua kalimat yang membuat orang ingin membaca…"
                />
              </KolomForm>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Isi artikel</JudulKartu>
                <DeskripsiKartu>Pilih teks lalu gunakan bilah alat untuk memformatnya</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu>
              <Controller
                control={control}
                name="isi"
                render={({ field }) => (
                  <PenyuntingKaya
                    id="b-isi"
                    nilai={field.value}
                    onUbah={(html) => {
                      field.onChange(html)
                      setIsi(html)
                    }}
                    placeholder="Mulai menulis artikel Anda…"
                  />
                )}
              />
              {errors.isi ? (
                <p className="mt-1.5 text-xs text-danger-kuat" role="alert">{errors.isi.message}</p>
              ) : null}
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>SEO artikel</JudulKartu>
                <DeskripsiKartu>Kosongkan untuk memakai judul dan ringkasan di atas</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <KolomForm
                id="b-judul-seo"
                label="Judul SEO"
                galat={errors.judul_seo?.message}
                petunjuk={`${judulSeo.length} / ${MAKS_JUDUL_SEO} karakter`}
              >
                <Masukan
                  {...propsKolom('b-judul-seo', errors.judul_seo?.message, 'petunjuk')}
                  {...register('judul_seo')}
                  placeholder={judul || 'Judul yang tampil di Google'}
                />
              </KolomForm>

              <KolomForm
                id="b-deskripsi-seo"
                label="Deskripsi SEO"
                galat={errors.deskripsi_seo?.message}
                petunjuk={`${deskripsiSeo.length} / ${MAKS_DESKRIPSI_SEO} karakter`}
              >
                <AreaTeks
                  {...propsKolom('b-deskripsi-seo', errors.deskripsi_seo?.message, 'petunjuk')}
                  {...register('deskripsi_seo')}
                  className="min-h-20"
                />
              </KolomForm>

              <div className="rounded-card border border-border p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Pratinjau hasil pencarian
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  ozora.id › blog › {slugArtikel || 'slug-artikel'}
                </p>
                <p className="mt-0.5 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
                  {(judulSeo || judul || 'Judul artikel').slice(0, MAKS_JUDUL_SEO)}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {deskripsiSeo || 'Deskripsi akan diambil dari ringkasan artikel bila dikosongkan.'}
                </p>
              </div>
            </IsiKartu>
          </Kartu>
        </div>

        {/* Panel samping */}
        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <JudulKartu>Publikasi</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <KolomForm id="b-status" label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <PilihanRingkas
                      id="b-status"
                      nilai={field.value}
                      onUbah={field.onChange}
                      opsi={[
                        { nilai: 'draf', label: 'Draf' },
                        { nilai: 'terbit', label: 'Terbitkan sekarang' },
                        { nilai: 'terjadwal', label: 'Jadwalkan' },
                      ]}
                    />
                  )}
                />
              </KolomForm>

              {status === 'terjadwal' ? (
                <KolomForm id="b-tanggal" label="Tanggal terbit" wajib>
                  <Masukan id="b-tanggal" type="datetime-local" {...register('tanggal_terbit')} />
                </KolomForm>
              ) : null}

              <KolomForm id="b-kategori" label="Kategori" wajib galat={errors.kategori?.message}>
                <Controller
                  control={control}
                  name="kategori"
                  render={({ field }) => (
                    <PilihanRingkas
                      id="b-kategori"
                      nilai={field.value}
                      onUbah={field.onChange}
                      placeholder="Pilih kategori…"
                      opsi={KATEGORI.map((k) => ({ nilai: k, label: k }))}
                    />
                  )}
                />
              </KolomForm>

              <KolomForm id="b-label" label="Label">
                <div className="flex flex-wrap items-center gap-1.5 rounded-control border border-input bg-card p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
                  {label.map((l) => (
                    <Lencana key={l} warna="primary" className="gap-1">
                      {l}
                      <button type="button" onClick={() => setLabel((s) => s.filter((x) => x !== l))} aria-label={`Hapus label ${l}`}>
                        <X className="size-3" />
                      </button>
                    </Lencana>
                  ))}
                  <input
                    id="b-label"
                    value={drafLabel}
                    onChange={(e) => setDrafLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && drafLabel.trim()) {
                        e.preventDefault()
                        if (!label.includes(drafLabel.trim())) setLabel((s) => [...s, drafLabel.trim()])
                        setDrafLabel('')
                      }
                    }}
                    placeholder={label.length === 0 ? 'Ketik lalu Enter…' : ''}
                    className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
                  />
                </div>
              </KolomForm>

              <Controller
                control={control}
                name="izinkan_komentar"
                render={({ field }) => (
                  <label htmlFor="b-komentar" className="flex cursor-pointer items-center justify-between gap-3 rounded-card border border-border p-3.5">
                    <span className="text-sm font-semibold">Izinkan komentar</span>
                    <Sakelar id="b-komentar" checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Gambar sampul</JudulKartu>
                <DeskripsiKartu>Rasio 16:9, minimal 1200×675</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu>
              <UnggahGambar
                label="Sampul artikel"
                keterangan="JPG, PNG, atau WebP · minimal lebar 800px · maks. 8 MB"
                preset="sampul"
                rasioPratinjau="aspect-video"
                nilai={sampul}
                onUbah={setSampul}
              />
            </IsiKartu>
          </Kartu>

          <Kartu>
            <IsiKartu className="space-y-2">
              <Tombol type="submit" className="w-full" ukuran="lg" memuat={isSubmitting}>
                {status === 'terbit' ? <><Send /> Terbitkan</> : <><Save /> Simpan draf</>}
              </Tombol>
              <p className="text-center text-xs text-muted-foreground">
                Penulis: {pengguna?.nama} · {formatTanggal(new Date())}
              </p>
            </IsiKartu>
          </Kartu>
        </div>
      </form>

      {/* Pratinjau */}
      <Dialog open={pratinjau} onOpenChange={setPratinjau}>
        <IsiDialog judul="Pratinjau artikel" deskripsi="Perkiraan tampilan setelah diterbitkan." lebar="xl">
          <article className="scrollbar-thin max-h-[70dvh] overflow-y-auto">
            {sampul ? <img src={sampul} alt="" className="aspect-video w-full rounded-card object-cover" /> : null}
            <h1 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight">
              {judul || 'Judul artikel'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {pengguna?.nama} · {formatTanggal(new Date(), 'panjang')}
            </p>
            <Peringatan varian="info" className="mt-4">
              Isi di bawah dirender apa adanya untuk pratinjau. Saat benar-benar
              diterbitkan, HTML wajib disanitasi lebih dulu di server dengan DOMPurify.
            </Peringatan>
            <div
              className="mt-5 text-sm leading-relaxed [&_a]:text-primary-kuat [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_img]:mt-3 [&_img]:rounded-card [&_ol]:mt-2.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-2.5 [&_pre]:mt-3 [&_pre]:rounded-card [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:pl-6"
              // oxlint-disable-next-line no-danger -- pratinjau lokal, isi belum pernah keluar dari peramban ini
              dangerouslySetInnerHTML={{ __html: isi || '<p>Isi artikel akan tampil di sini.</p>' }}
            />
          </article>
        </IsiDialog>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/blog/baru')({ component: TulisArtikel })
