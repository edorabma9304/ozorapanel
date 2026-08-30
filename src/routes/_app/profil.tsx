import { createFileRoute } from '@tanstack/react-router'
import { Mail, MapPin, Phone, Save, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Avatar } from '@/components/ui/avatar'
import { Lencana } from '@/components/ui/lencana'
import { Tab, DaftarTab, PemicuTab, IsiTab, Pemisah } from '@/components/ui/lapisan'
import { useAuth } from '@/lib/auth'
import { LABEL_PERAN, WARNA_PERAN } from '@/config/peran'
import { formatTanggal } from '@/lib/format'

function HalamanProfil() {
  const { pengguna } = useAuth()
  if (!pengguna) return null

  return (
    <>
      <KepalaHalaman
        judul="Profil saya"
        deskripsi="Informasi akun dan preferensi pribadi Anda."
        remah={[{ label: 'Halaman' }, { label: 'Profil' }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-1">
          <IsiKartu className="text-center">
            <Avatar nama={pengguna.nama} src={pengguna.avatar_url} ukuran="xl" className="mx-auto" />
            <h2 className="mt-4 text-lg font-bold">{pengguna.nama}</h2>
            <p className="text-sm text-muted-foreground">{pengguna.jabatan ?? 'Anggota tim'}</p>
            <Lencana warna={WARNA_PERAN[pengguna.peran]} className="mt-3">
              {LABEL_PERAN[pengguna.peran]}
            </Lencana>

            <Pemisah className="my-5" />

            <dl className="space-y-3 text-left text-sm">
              <div className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <dd className="truncate">{pengguna.email}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <dd>{pengguna.telepon ?? 'Belum diisi'}</dd>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <dd>Bergabung {formatTanggal(pengguna.created_at, 'panjang')}</dd>
              </div>
            </dl>
          </IsiKartu>
          <KakiKartu>
            <Tombol varian="garis" className="w-full" onClick={() => toast.info('Pilih berkas gambar (maks. 2 MB).')}>
              <Upload /> Ganti foto
            </Tombol>
          </KakiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <IsiKartu>
            <Tab defaultValue="umum">
              <DaftarTab>
                <PemicuTab value="umum">Informasi umum</PemicuTab>
                <PemicuTab value="keamanan">Keamanan</PemicuTab>
              </DaftarTab>

              <IsiTab value="umum">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    toast.success('Profil tersimpan.')
                  }}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <KolomForm id="p-nama" label="Nama lengkap">
                      <Masukan id="p-nama" defaultValue={pengguna.nama} />
                    </KolomForm>
                    <KolomForm id="p-jabatan" label="Jabatan">
                      <Masukan id="p-jabatan" defaultValue={pengguna.jabatan ?? ''} />
                    </KolomForm>
                  </div>

                  <KolomForm id="p-email" label="Surel" petunjuk="Surel terikat akun Google dan tidak dapat diubah di sini.">
                    <Masukan id="p-email" defaultValue={pengguna.email} disabled />
                  </KolomForm>

                  <KolomForm id="p-telepon" label="Nomor HP">
                    <Masukan id="p-telepon" defaultValue={pengguna.telepon ?? ''} inputMode="tel" />
                  </KolomForm>

                  <KolomForm id="p-bio" label="Tentang saya">
                    <AreaTeks id="p-bio" placeholder="Ceritakan sedikit tentang peran Anda di tim…" />
                  </KolomForm>

                  <Tombol type="submit">
                    <Save /> Simpan perubahan
                  </Tombol>
                </form>
              </IsiTab>

              <IsiTab value="keamanan">
                <div className="space-y-5">
                  <div>
                    <JudulKartu>Metode masuk</JudulKartu>
                    <DeskripsiKartu>
                      Panel ini hanya menerima Google Sign-In. Tidak ada kata sandi yang disimpan.
                    </DeskripsiKartu>
                  </div>

                  <div className="rounded-card border border-border p-4">
                    <p className="text-sm font-semibold">Sesi aktif</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Terakhir masuk {formatTanggal(pengguna.terakhir_masuk, 'panjang')}
                    </p>
                  </div>

                  <div className="rounded-card border border-border p-4">
                    <p className="text-sm font-semibold">Verifikasi dua langkah</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dikelola langsung di akun Google Anda.
                    </p>
                    <Tombol varian="garis" ukuran="sm" className="mt-3" asChild>
                      <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer noopener">
                        Buka pengaturan Google
                      </a>
                    </Tombol>
                  </div>
                </div>
              </IsiTab>
            </Tab>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/profil')({ component: HalamanProfil })
