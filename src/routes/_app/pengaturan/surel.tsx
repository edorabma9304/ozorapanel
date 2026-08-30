import { createFileRoute } from '@tanstack/react-router'
import { Check, Eye, EyeOff, Mail, Save, Send, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan } from '@/components/ui/masukan'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { tunggu } from '@/lib/utils'

/** Preset penyedia yang paling sering dipakai di Indonesia. */
const PENYEDIA = [
  { nilai: 'gmail', label: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: 587, enkripsi: 'tls' },
  { nilai: 'ses', label: 'Amazon SES', host: 'email-smtp.ap-southeast-1.amazonaws.com', port: 587, enkripsi: 'tls' },
  { nilai: 'mailgun', label: 'Mailgun', host: 'smtp.mailgun.org', port: 587, enkripsi: 'tls' },
  { nilai: 'brevo', label: 'Brevo (Sendinblue)', host: 'smtp-relay.brevo.com', port: 587, enkripsi: 'tls' },
  { nilai: 'cpanel', label: 'cPanel / hosting sendiri', host: 'mail.domainanda.id', port: 465, enkripsi: 'ssl' },
  { nilai: 'lain', label: 'Lainnya (isi manual)', host: '', port: 587, enkripsi: 'tls' },
] as const

const ENKRIPSI = [
  { nilai: 'tls', label: 'STARTTLS (port 587)' },
  { nilai: 'ssl', label: 'SSL/TLS (port 465)' },
  { nilai: 'none', label: 'Tanpa enkripsi' },
]

type Uji = 'diam' | 'menguji' | 'berhasil' | 'gagal'

function PengaturanSurel() {
  const [penyedia, setPenyedia] = useState('gmail')
  const [host, setHost] = useState('smtp.gmail.com')
  const [port, setPort] = useState(587)
  const [enkripsi, setEnkripsi] = useState('tls')
  const [pengguna, setPengguna] = useState('notifikasi@ozora.id')
  const [sandi, setSandi] = useState('')
  const [lihatSandi, setLihatSandi] = useState(false)
  const [dariNama, setDariNama] = useState('Ozora Panel')
  const [dariSurel, setDariSurel] = useState('notifikasi@ozora.id')
  const [balasKe, setBalasKe] = useState('')
  const [tujuanUji, setTujuanUji] = useState('')
  const [uji, setUji] = useState<Uji>('diam')

  function pilihPenyedia(n: string) {
    setPenyedia(n)
    const p = PENYEDIA.find((x) => x.nilai === n)
    if (p && p.nilai !== 'lain') {
      setHost(p.host)
      setPort(p.port)
      setEnkripsi(p.enkripsi)
    }
  }

  async function kirimUji() {
    if (!tujuanUji.trim()) {
      toast.error('Isi dulu alamat surel tujuan pengujian.')
      return
    }
    setUji('menguji')
    await tunggu(1200)
    // Driver mock: anggap berhasil bila host dan pengguna terisi.
    const ok = Boolean(host && pengguna)
    setUji(ok ? 'berhasil' : 'gagal')
    if (ok) toast.success(`Surel uji dikirim ke ${tujuanUji}.`)
    else toast.error('Gagal terhubung ke server SMTP. Periksa host dan kredensialnya.')
  }

  return (
    <>
      <Peringatan varian="bahaya" judul="Kata sandi SMTP tidak pernah dikirim ke peramban">
        Backend hanya mengirimkan status &ldquo;terisi / kosong&rdquo;. Simpan sandinya
        sebagai environment variable di server, bukan di basis data yang bisa terbaca
        dari panel — lihat <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">.claude/rules/security.md</code>.
      </Peringatan>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Server pengiriman surel</JudulKartu>
            <DeskripsiKartu>Dipakai untuk notifikasi, faktur, dan slip gaji</DeskripsiKartu>
          </div>
          {uji === 'berhasil' ? (
            <Lencana warna="success"><Check className="size-3" /> Koneksi berhasil</Lencana>
          ) : uji === 'gagal' ? (
            <Lencana warna="danger"><TriangleAlert className="size-3" /> Koneksi gagal</Lencana>
          ) : null}
        </KepalaKartu>

        <IsiKartu>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('Pengaturan SMTP tersimpan.')
            }}
          >
            <KolomForm id="sm-penyedia" label="Penyedia" petunjuk="Memilih penyedia akan mengisi host dan port otomatis.">
              <PilihanRingkas
                id="sm-penyedia"
                nilai={penyedia}
                onUbah={pilihPenyedia}
                opsi={PENYEDIA.map((p) => ({ nilai: p.nilai, label: p.label }))}
              />
            </KolomForm>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <KolomForm id="sm-host" label="Host SMTP" wajib>
                <Masukan id="sm-host" value={host} onChange={(e) => setHost(e.target.value)} className="font-mono" placeholder="smtp.contoh.id" />
              </KolomForm>
              <KolomForm id="sm-port" label="Port" wajib>
                <Masukan id="sm-port" type="number" value={port} onChange={(e) => setPort(Number(e.target.value))} className="text-right font-mono" />
              </KolomForm>
            </div>

            <KolomForm id="sm-enkripsi" label="Enkripsi" wajib>
              <PilihanRingkas id="sm-enkripsi" nilai={enkripsi} onUbah={setEnkripsi} opsi={ENKRIPSI} />
            </KolomForm>

            <div className="grid gap-4 sm:grid-cols-2">
              <KolomForm id="sm-user" label="Nama pengguna" wajib>
                <Masukan id="sm-user" value={pengguna} onChange={(e) => setPengguna(e.target.value)} autoComplete="username" />
              </KolomForm>

              <KolomForm
                id="sm-sandi"
                label="Kata sandi"
                wajib
                petunjuk={penyedia === 'gmail' ? 'Gmail wajib memakai App Password, bukan sandi akun.' : 'Disimpan terenkripsi di server.'}
              >
                <div className="relative">
                  <Masukan
                    id="sm-sandi"
                    type={lihatSandi ? 'text' : 'password'}
                    value={sandi}
                    onChange={(e) => setSandi(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setLihatSandi((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={lihatSandi ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {lihatSandi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </KolomForm>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <KolomForm id="sm-dari-nama" label="Nama pengirim" wajib>
                <Masukan id="sm-dari-nama" value={dariNama} onChange={(e) => setDariNama(e.target.value)} />
              </KolomForm>
              <KolomForm id="sm-dari-surel" label="Surel pengirim" wajib petunjuk="Harus domain yang sudah terverifikasi SPF/DKIM.">
                <Masukan id="sm-dari-surel" type="email" value={dariSurel} onChange={(e) => setDariSurel(e.target.value)} />
              </KolomForm>
            </div>

            <KolomForm id="sm-balas" label="Balas ke" petunjuk="Kosongkan untuk memakai surel pengirim.">
              <Masukan id="sm-balas" type="email" value={balasKe} onChange={(e) => setBalasKe(e.target.value)} placeholder="dukungan@ozora.id" />
            </KolomForm>

            <KakiKartu className="justify-end px-0 pb-0">
              <Tombol type="submit"><Save /> Simpan pengaturan</Tombol>
            </KakiKartu>
          </form>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Uji pengiriman</JudulKartu>
            <DeskripsiKartu>Kirim satu surel percobaan sebelum dipakai produksi</DeskripsiKartu>
          </div>
          <Mail className="size-4 text-muted-foreground" />
        </KepalaKartu>
        <IsiKartu className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Masukan
              type="email"
              value={tujuanUji}
              onChange={(e) => setTujuanUji(e.target.value)}
              placeholder="alamat@tujuan.id"
              aria-label="Alamat surel tujuan pengujian"
            />
            <Tombol onClick={() => void kirimUji()} memuat={uji === 'menguji'}>
              <Send /> Kirim surel uji
            </Tombol>
          </div>

          {uji === 'berhasil' ? (
            <Peringatan varian="sukses" judul="Terkirim">
              Surel uji berhasil dikirim ke {tujuanUji}. Periksa juga folder spam bila
              tidak muncul dalam beberapa menit.
            </Peringatan>
          ) : uji === 'gagal' ? (
            <Peringatan varian="bahaya" judul="Gagal terhubung">
              Periksa host, port, dan kredensial. Untuk Gmail, pastikan verifikasi dua
              langkah aktif dan Anda memakai App Password.
            </Peringatan>
          ) : null}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/pengaturan/surel')({ component: PengaturanSurel })
