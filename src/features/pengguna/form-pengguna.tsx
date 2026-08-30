import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { Dialog, IsiDialog, KakiDialog, TutupDialog } from '@/components/ui/lapisan'
import { KolomForm, propsKolom } from '@/components/form/kolom'
import { Masukan } from '@/components/ui/masukan'
import { PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { LABEL_PERAN, PERAN, adalahSuperadminBawaan } from '@/config/peran'
import { useSimpan } from '@/lib/kueri'
import type { Pengguna } from '@/lib/tipe'
import { NILAI_AWAL, skemaPengguna, type IsiPengguna } from './skema'

export function FormPengguna({
  terbuka,
  onUbah,
  pengguna,
}: {
  terbuka: boolean
  onUbah: (b: boolean) => void
  /** Kosong = mode tambah, terisi = mode ubah. */
  pengguna?: Pengguna | null
}) {
  const mode = pengguna ? 'ubah' : 'tambah'
  const simpan = useSimpan<Pengguna>('pengguna')
  const terkunci = adalahSuperadminBawaan(pengguna?.email)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IsiPengguna>({
    resolver: zodResolver(skemaPengguna),
    defaultValues: NILAI_AWAL,
  })

  // Isi ulang formulir setiap dialog dibuka, supaya data lama tidak tertinggal.
  useEffect(() => {
    if (!terbuka) return
    reset(
      pengguna
        ? {
            nama: pengguna.nama,
            email: pengguna.email,
            peran: pengguna.peran,
            jabatan: pengguna.jabatan ?? '',
            telepon: pengguna.telepon ?? '',
            aktif: pengguna.aktif,
          }
        : NILAI_AWAL,
    )
  }, [terbuka, pengguna, reset])

  async function onSimpan(isi: IsiPengguna) {
    await simpan.mutateAsync({ id: pengguna?.id, ...isi })
    onUbah(false)
  }

  return (
    <Dialog open={terbuka} onOpenChange={onUbah}>
      <IsiDialog
        judul={mode === 'tambah' ? 'Tambah pengguna' : 'Ubah pengguna'}
        deskripsi={
          mode === 'tambah'
            ? 'Pengguna baru bisa masuk setelah surelnya terdaftar di sini.'
            : 'Perubahan berlaku saat pengguna memuat ulang halaman.'
        }
        lebar="md"
      >
        <form onSubmit={(e) => void handleSubmit(onSimpan)(e)} className="space-y-4" noValidate>
          {terkunci ? (
            <Peringatan varian="perhatian">
              Ini surel superadmin bawaan. Perannya tidak dapat diturunkan.
            </Peringatan>
          ) : null}

          <KolomForm id="nama" label="Nama lengkap" wajib galat={errors.nama?.message}>
            <Masukan
              {...propsKolom('nama', errors.nama?.message)}
              {...register('nama')}
              placeholder="mis. Dewi Kusuma"
              autoComplete="name"
            />
          </KolomForm>

          <KolomForm
            id="email"
            label="Surel Google"
            wajib
            galat={errors.email?.message}
            petunjuk="Harus surel Google yang dipakai untuk masuk."
          >
            <Masukan
              {...propsKolom('email', errors.email?.message, 'petunjuk')}
              {...register('email')}
              type="email"
              placeholder="nama@gmail.com"
              autoComplete="email"
              disabled={mode === 'ubah'}
            />
          </KolomForm>

          <div className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="peran" label="Peran" wajib galat={errors.peran?.message}>
              <Controller
                control={control}
                name="peran"
                render={({ field }) => (
                  <PilihanRingkas
                    id="peran"
                    nilai={field.value}
                    onUbah={field.onChange}
                    opsi={PERAN.map((p) => ({ nilai: p, label: LABEL_PERAN[p] }))}
                  />
                )}
              />
            </KolomForm>

            <KolomForm id="jabatan" label="Jabatan" galat={errors.jabatan?.message}>
              <Masukan
                {...propsKolom('jabatan', errors.jabatan?.message)}
                {...register('jabatan')}
                placeholder="mis. Staf Keuangan"
              />
            </KolomForm>
          </div>

          <KolomForm
            id="telepon"
            label="Nomor HP"
            galat={errors.telepon?.message}
            petunjuk="Opsional. Dipakai untuk notifikasi WhatsApp."
          >
            <Masukan
              {...propsKolom('telepon', errors.telepon?.message, 'petunjuk')}
              {...register('telepon')}
              inputMode="tel"
              placeholder="0812-3456-7890"
            />
          </KolomForm>

          <Controller
            control={control}
            name="aktif"
            render={({ field }) => (
              <label htmlFor="aktif" className="flex items-center justify-between rounded-card border border-border p-4">
                <span>
                  <span className="block text-sm font-semibold">Akun aktif</span>
                  <span className="block text-xs text-muted-foreground">
                    Akun nonaktif tetap tersimpan, tetapi tidak bisa masuk.
                  </span>
                </span>
                <Sakelar id="aktif" checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />

          <KakiDialog>
            <TutupDialog asChild>
              <Tombol varian="garis" type="button">
                Batal
              </Tombol>
            </TutupDialog>
            <Tombol type="submit" memuat={isSubmitting || simpan.isPending}>
              {mode === 'tambah' ? 'Simpan pengguna' : 'Simpan perubahan'}
            </Tombol>
          </KakiDialog>
        </form>
      </IsiDialog>
    </Dialog>
  )
}
