import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm, propsKolom } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Pemisah } from '@/components/ui/lapisan'
import { formatRp } from '@/lib/format'

const skemaItem = z.object({
  nama: z.string().trim().min(2, 'Nama item minimal 2 huruf.'),
  qty: z.coerce.number().int().positive('Jumlah harus lebih dari 0.'),
  harga: z.coerce.number().nonnegative('Harga tidak boleh negatif.'),
})

const skemaFaktur = z.object({
  ke_nama: z.string().trim().min(2, 'Nama penerima wajib diisi.'),
  ke_email: z.string().trim().email('Format surel tidak valid.'),
  ke_alamat: z.string().trim().min(5, 'Alamat wajib diisi.'),
  tanggal: z.string().min(1, 'Tanggal wajib diisi.'),
  jatuh_tempo: z.string().min(1, 'Tanggal jatuh tempo wajib diisi.'),
  pajak_persen: z.coerce.number().min(0).max(100),
  catatan: z.string().trim().max(500).optional().or(z.literal('')),
  item: z.array(skemaItem).min(1, 'Tambahkan minimal satu item.'),
}).refine((d) => new Date(d.jatuh_tempo) >= new Date(d.tanggal), {
  message: 'Jatuh tempo tidak boleh sebelum tanggal faktur.',
  path: ['jatuh_tempo'],
})

type IsiFaktur = z.input<typeof skemaFaktur>

const hariIni = new Date().toISOString().slice(0, 10)
const duaMingguLagi = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)

function FakturBaru() {
  const navigate = useNavigate()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IsiFaktur>({
    resolver: zodResolver(skemaFaktur),
    defaultValues: {
      ke_nama: '',
      ke_email: '',
      ke_alamat: '',
      tanggal: hariIni,
      jatuh_tempo: duaMingguLagi,
      pajak_persen: 11,
      catatan: '',
      item: [{ nama: '', qty: 1, harga: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'item' })

  // Hitung total langsung dari nilai formulir — jangan simpan sebagai state turunan.
  const item = useWatch({ control, name: 'item' })
  const pajakPersen = useWatch({ control, name: 'pajak_persen' })
  const subtotal = (item ?? []).reduce((a, b) => a + Number(b?.qty ?? 0) * Number(b?.harga ?? 0), 0)
  const pajak = Math.round((subtotal * Number(pajakPersen ?? 0)) / 100)

  async function simpan(isi: IsiFaktur) {
    console.warn('Faktur disimpan:', isi)
    toast.success('Faktur berhasil dibuat.')
    await navigate({ to: '/apl/faktur' })
  }

  return (
    <>
      <KepalaHalaman
        judul="Buat faktur"
        deskripsi="Isi data penerima dan rincian item. Total dihitung otomatis."
        remah={[{ label: 'Aplikasi' }, { label: 'Faktur', href: '/apl/faktur' }, { label: 'Buat baru' }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/faktur"><ArrowLeft /> Batal</Link>
          </Tombol>
        }
      />

      <form onSubmit={(e) => void handleSubmit(simpan)(e)} noValidate className="space-y-4">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Penerima faktur</JudulKartu>
              <DeskripsiKartu>Kepada siapa tagihan ini ditujukan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="ke_nama" label="Nama / perusahaan" wajib galat={errors.ke_nama?.message}>
              <Masukan {...propsKolom('ke_nama', errors.ke_nama?.message)} {...register('ke_nama')} placeholder="PT Sinar Abadi" />
            </KolomForm>
            <KolomForm id="ke_email" label="Surel" wajib galat={errors.ke_email?.message}>
              <Masukan {...propsKolom('ke_email', errors.ke_email?.message)} {...register('ke_email')} type="email" placeholder="keuangan@perusahaan.id" />
            </KolomForm>
            <KolomForm id="ke_alamat" label="Alamat" wajib galat={errors.ke_alamat?.message} className="sm:col-span-2">
              <AreaTeks {...propsKolom('ke_alamat', errors.ke_alamat?.message)} {...register('ke_alamat')} placeholder="Jl. Sudirman No. 45, Jakarta Selatan" className="min-h-20" />
            </KolomForm>
            <KolomForm id="tanggal" label="Tanggal faktur" wajib galat={errors.tanggal?.message}>
              <Masukan {...propsKolom('tanggal', errors.tanggal?.message)} {...register('tanggal')} type="date" />
            </KolomForm>
            <KolomForm id="jatuh_tempo" label="Jatuh tempo" wajib galat={errors.jatuh_tempo?.message}>
              <Masukan {...propsKolom('jatuh_tempo', errors.jatuh_tempo?.message)} {...register('jatuh_tempo')} type="date" />
            </KolomForm>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Rincian item</JudulKartu>
              <DeskripsiKartu>{fields.length} baris</DeskripsiKartu>
            </div>
            <Tombol type="button" varian="halus" ukuran="sm" onClick={() => append({ nama: '', qty: 1, harga: 0 })}>
              <Plus /> Tambah baris
            </Tombol>
          </KepalaKartu>

          <IsiKartu className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} className="grid items-start gap-3 sm:grid-cols-[1fr_100px_160px_auto]">
                <KolomForm id={`item-${i}-nama`} label={i === 0 ? 'Deskripsi' : ''} galat={errors.item?.[i]?.nama?.message}>
                  <Masukan
                    {...propsKolom(`item-${i}-nama`, errors.item?.[i]?.nama?.message)}
                    {...register(`item.${i}.nama`)}
                    placeholder="Nama barang atau jasa"
                  />
                </KolomForm>
                <KolomForm id={`item-${i}-qty`} label={i === 0 ? 'Jumlah' : ''} galat={errors.item?.[i]?.qty?.message}>
                  <Masukan
                    {...propsKolom(`item-${i}-qty`, errors.item?.[i]?.qty?.message)}
                    {...register(`item.${i}.qty`)}
                    type="number"
                    min={1}
                    className="text-right"
                  />
                </KolomForm>
                <KolomForm id={`item-${i}-harga`} label={i === 0 ? 'Harga satuan' : ''} galat={errors.item?.[i]?.harga?.message}>
                  <Masukan
                    {...propsKolom(`item-${i}-harga`, errors.item?.[i]?.harga?.message)}
                    {...register(`item.${i}.harga`)}
                    type="number"
                    min={0}
                    step={500}
                    className="text-right"
                  />
                </KolomForm>
                <div className={i === 0 ? 'pt-7' : ''}>
                  <Tombol
                    type="button"
                    varian="hantu"
                    ukuran="ikon"
                    onClick={() => remove(i)}
                    disabled={fields.length === 1}
                    aria-label={`Hapus baris ${i + 1}`}
                  >
                    <Trash2 className="text-danger-kuat" />
                  </Tombol>
                </div>
              </div>
            ))}

            {errors.item?.root ? (
              <p className="text-xs text-danger-kuat" role="alert">{errors.item.root.message}</p>
            ) : null}

            <Pemisah className="my-2" />

            <div className="flex justify-end">
              <dl className="w-full max-w-72 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatRp(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    PPN
                    <Masukan {...register('pajak_persen')} type="number" min={0} max={100} className="h-8 w-16 text-right" aria-label="Persentase pajak" />
                    %
                  </dt>
                  <dd className="font-semibold">{formatRp(pajak)}</dd>
                </div>
                <Pemisah />
                <div className="flex justify-between text-base">
                  <dt className="font-bold">Total</dt>
                  <dd className="font-extrabold text-primary-kuat">{formatRp(subtotal + pajak)}</dd>
                </div>
              </dl>
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <IsiKartu>
            <KolomForm id="catatan" label="Catatan" petunjuk="Muncul di bagian bawah faktur. Opsional.">
              <AreaTeks id="catatan" {...register('catatan')} placeholder="Pembayaran melalui transfer bank…" />
            </KolomForm>
          </IsiKartu>
        </Kartu>

        <div className="flex justify-end gap-2">
          <Tombol type="button" varian="garis" asChild>
            <Link to="/apl/faktur">Batal</Link>
          </Tombol>
          <Tombol type="submit" memuat={isSubmitting}>
            <Save /> Simpan faktur
          </Tombol>
        </div>
      </form>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/faktur/baru')({ component: FakturBaru })
