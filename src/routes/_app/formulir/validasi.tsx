import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CircleCheck, Save } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm, propsKolom } from '@/components/form/kolom'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'

/**
 * Contoh validasi dengan Zod + React Hook Form.
 * Pesan galat WAJIB dalam Bahasa Indonesia dan menjelaskan cara memperbaiki,
 * bukan sekadar menyatakan "tidak valid".
 */
const skema = z
  .object({
    nama: z.string().trim().min(3, 'Nama minimal 3 huruf.'),
    email: z.string().trim().email('Gunakan format surel yang benar, mis. nama@domain.com.'),
    telepon: z
      .string()
      .trim()
      .regex(/^0\d[\d\s-]{7,15}$/, 'Nomor HP harus diawali 0 dan berisi 9–17 digit.'),
    npwp: z
      .string()
      .trim()
      .regex(/^\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}$/, 'Format NPWP: 00.000.000.0-000.000')
      .optional()
      .or(z.literal('')),
    harga: z.coerce.number().positive('Harga harus lebih besar dari nol.'),
    diskon: z.coerce.number().min(0).max(100, 'Diskon tidak boleh lebih dari 100%.'),
    mulai: z.string().min(1, 'Tanggal mulai wajib diisi.'),
    selesai: z.string().min(1, 'Tanggal selesai wajib diisi.'),
  })
  .refine((d) => new Date(d.selesai) > new Date(d.mulai), {
    message: 'Tanggal selesai harus setelah tanggal mulai.',
    path: ['selesai'],
  })

type Isi = z.input<typeof skema>

function HalamanValidasi() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<Isi>({
    resolver: zodResolver(skema),
    mode: 'onBlur', // validasi saat pindah kolom — bukan tiap ketukan tombol
    defaultValues: {
      nama: '', email: '', telepon: '', npwp: '',
      harga: 0, diskon: 0, mulai: '', selesai: '',
    },
  })

  return (
    <>
      <KepalaHalaman
        judul="Validasi formulir"
        deskripsi="Zod sebagai sumber kebenaran skema, React Hook Form sebagai pengelola keadaan."
        remah={[{ label: 'Formulir' }, { label: 'Validasi' }]}
      />

      <Peringatan varian="perhatian" judul="Validasi di sini hanya untuk pengalaman pengguna">
        Backend WAJIB memvalidasi ulang setiap masukan. Apa pun yang dikirim dari peramban
        bisa dipalsukan — lihat <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">.claude/rules/api.md</code>.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Coba isi formulirnya</JudulKartu>
              <DeskripsiKartu>Kosongkan kolom lalu pindah fokus untuk melihat pesan galatnya.</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <form
              onSubmit={(e) =>
                void handleSubmit((d) => {
                  console.warn('Data valid:', d)
                  toast.success('Formulir lolos validasi.')
                })(e)
              }
              noValidate
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <KolomForm id="v-nama" label="Nama" wajib galat={errors.nama?.message}>
                  <Masukan {...propsKolom('v-nama', errors.nama?.message)} {...register('nama')} placeholder="Minimal 3 huruf" />
                </KolomForm>
                <KolomForm id="v-email" label="Surel" wajib galat={errors.email?.message}>
                  <Masukan {...propsKolom('v-email', errors.email?.message)} {...register('email')} type="email" placeholder="nama@domain.com" />
                </KolomForm>
                <KolomForm id="v-telepon" label="Nomor HP" wajib galat={errors.telepon?.message}>
                  <Masukan {...propsKolom('v-telepon', errors.telepon?.message)} {...register('telepon')} inputMode="tel" placeholder="0812-3456-7890" />
                </KolomForm>
                <KolomForm id="v-npwp" label="NPWP" galat={errors.npwp?.message} petunjuk="Opsional.">
                  <Masukan {...propsKolom('v-npwp', errors.npwp?.message, 'petunjuk')} {...register('npwp')} placeholder="00.000.000.0-000.000" />
                </KolomForm>
                <KolomForm id="v-harga" label="Harga" wajib galat={errors.harga?.message}>
                  <Masukan {...propsKolom('v-harga', errors.harga?.message)} {...register('harga')} type="number" className="text-right" />
                </KolomForm>
                <KolomForm id="v-diskon" label="Diskon (%)" galat={errors.diskon?.message}>
                  <Masukan {...propsKolom('v-diskon', errors.diskon?.message)} {...register('diskon')} type="number" className="text-right" />
                </KolomForm>
                <KolomForm id="v-mulai" label="Mulai berlaku" wajib galat={errors.mulai?.message}>
                  <Masukan {...propsKolom('v-mulai', errors.mulai?.message)} {...register('mulai')} type="date" />
                </KolomForm>
                <KolomForm id="v-selesai" label="Berakhir" wajib galat={errors.selesai?.message}>
                  <Masukan {...propsKolom('v-selesai', errors.selesai?.message)} {...register('selesai')} type="date" />
                </KolomForm>
              </div>

              {isSubmitSuccessful ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-success-kuat">
                  <CircleCheck className="size-4" /> Semua isian valid.
                </p>
              ) : null}

              <Tombol type="submit"><Save /> Validasi &amp; simpan</Tombol>
            </form>
          </IsiKartu>
        </Kartu>

        <Kartu className="h-fit">
          <KepalaKartu>
            <div>
              <JudulKartu>Aturan yang dipakai</JudulKartu>
              <DeskripsiKartu>Ringkasan skema Zod di halaman ini</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <ul className="space-y-3 text-sm">
              {[
                ['Nama', 'wajib, minimal 3 huruf'],
                ['Surel', 'wajib, format surel'],
                ['Nomor HP', 'wajib, diawali 0, 9–17 digit'],
                ['NPWP', 'opsional, pola 00.000.000.0-000.000'],
                ['Harga', 'wajib, angka positif'],
                ['Diskon', '0–100'],
                ['Tanggal', 'selesai harus setelah mulai'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b border-border pb-2.5 last:border-0">
                  <span className="font-semibold">{k}</span>
                  <span className="text-right text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/formulir/validasi')({ component: HalamanValidasi })
