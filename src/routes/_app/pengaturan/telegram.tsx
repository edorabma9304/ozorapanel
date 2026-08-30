import { createFileRoute } from '@tanstack/react-router'
import { Bot, Check, Copy, ExternalLink, Eye, EyeOff, Save, Send, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Akordeon, ItemAkordeon, PemicuAkordeon, IsiAkordeon } from '@/components/ui/lapisan'
import { tunggu } from '@/lib/utils'

const POLA_TOKEN = /^\d{8,12}:[A-Za-z0-9_-]{30,40}$/
const POLA_CHAT = /^-?\d{5,20}$/

const PERISTIWA = [
  { id: 'pesanan', judul: 'Pesanan baru', aktif: true },
  { id: 'stok', judul: 'Stok menipis', aktif: true },
  { id: 'bayar', judul: 'Pembayaran diterima', aktif: true },
  { id: 'galat', judul: 'Galat sistem', aktif: true },
  { id: 'absensi', judul: 'Karyawan alfa', aktif: false },
  { id: 'harian', judul: 'Ringkasan harian', aktif: false },
]

type Uji = 'diam' | 'menguji' | 'berhasil' | 'gagal'

function PengaturanTelegram() {
  const [aktif, setAktif] = useState(true)
  const [token, setToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [lihatToken, setLihatToken] = useState(false)
  const [templat, setTemplat] = useState(
    '🔔 *{judul}*\n\n{pesan}\n\n_Dikirim otomatis dari {aplikasi} pada {waktu}_',
  )
  const [uji, setUji] = useState<Uji>('diam')

  const tokenValid = token === '' || POLA_TOKEN.test(token)
  const chatValid = chatId === '' || POLA_CHAT.test(chatId)
  const siap = Boolean(token && chatId && tokenValid && chatValid)

  async function kirimUji() {
    if (!siap) {
      toast.error('Isi token bot dan chat ID yang valid terlebih dahulu.')
      return
    }
    setUji('menguji')
    await tunggu(1100)
    setUji('berhasil')
    toast.success('Pesan uji terkirim ke Telegram.')
  }

  async function salin(teks: string, label: string) {
    try {
      await navigator.clipboard.writeText(teks)
      toast.success(`${label} disalin.`)
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  return (
    <>
      <Peringatan varian="bahaya" judul="Token bot setara kata sandi">
        Siapa pun yang memegang token bisa mengirim pesan atas nama bot Anda.
        Simpan di environment variable server, jangan di kode frontend, dan jangan
        pernah dibagikan lewat obrolan.
      </Peringatan>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Bot Telegram</JudulKartu>
            <DeskripsiKartu>Kirim notifikasi operasional ke grup atau kanal tim</DeskripsiKartu>
          </div>
          {siap ? (
            <Lencana warna="success"><Check className="size-3" /> Siap</Lencana>
          ) : (
            <Lencana warna="netral">Belum lengkap</Lencana>
          )}
        </KepalaKartu>

        <IsiKartu>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              toast.success('Pengaturan Telegram tersimpan.')
            }}
          >
            <label htmlFor="tg-aktif" className="flex cursor-pointer items-center justify-between gap-6 rounded-card border border-border p-4">
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Aktifkan notifikasi Telegram</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Matikan sementara tanpa menghapus kredensialnya.
                </span>
              </span>
              <Sakelar id="tg-aktif" checked={aktif} onCheckedChange={setAktif} />
            </label>

            <KolomForm
              id="tg-token"
              label="Token bot"
              wajib
              galat={!tokenValid ? 'Format token tidak sesuai. Contoh: 123456789:AAF-xxxxxxxxxxxxxxxxxxxxxxxxxxxx' : undefined}
              petunjuk="Dapatkan dari @BotFather di Telegram."
            >
              <div className="relative">
                <Masukan
                  id="tg-token"
                  type={lihatToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  placeholder="123456789:AAF-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="pr-10 font-mono"
                  aria-invalid={!tokenValid}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setLihatToken((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={lihatToken ? 'Sembunyikan token' : 'Tampilkan token'}
                >
                  {lihatToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </KolomForm>

            <KolomForm
              id="tg-chat"
              label="Chat ID tujuan"
              wajib
              galat={!chatValid ? 'Chat ID hanya berisi angka. Grup diawali tanda minus.' : undefined}
              petunjuk="Grup diawali tanda minus, mis. -1001234567890."
            >
              <Masukan
                id="tg-chat"
                value={chatId}
                onChange={(e) => setChatId(e.target.value.trim())}
                placeholder="-1001234567890"
                className="font-mono"
                aria-invalid={!chatValid}
                inputMode="numeric"
              />
            </KolomForm>

            <KolomForm id="tg-templat" label="Templat pesan" petunjuk="Penanda tersedia: {judul}, {pesan}, {aplikasi}, {waktu}. Format Markdown didukung.">
              <AreaTeks
                id="tg-templat"
                value={templat}
                onChange={(e) => setTemplat(e.target.value)}
                className="min-h-28 font-mono text-xs"
              />
            </KolomForm>

            <div className="rounded-card border border-border bg-muted/50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Pratinjau pesan</p>
              <p className="whitespace-pre-line text-sm">
                {templat
                  .replace('{judul}', 'Pesanan baru masuk')
                  .replace('{pesan}', 'INV-2026-1042 dari Dewi Kusuma senilai Rp 1.240.000')
                  .replace('{aplikasi}', 'Ozora Panel')
                  .replace('{waktu}', '30 Agustus 2026, 14.05')
                  .replace(/\*(.+?)\*/g, '$1')
                  .replace(/_(.+?)_/g, '$1')}
              </p>
            </div>

            <KakiKartu className="justify-between px-0 pb-0">
              <Tombol type="button" varian="garis" onClick={() => void kirimUji()} memuat={uji === 'menguji'} disabled={!siap}>
                <Send /> Kirim pesan uji
              </Tombol>
              <Tombol type="submit"><Save /> Simpan</Tombol>
            </KakiKartu>
          </form>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Peristiwa yang dikirim</JudulKartu>
            <DeskripsiKartu>Pilih notifikasi mana yang diteruskan ke Telegram</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          {PERISTIWA.map((p) => (
            <label
              key={p.id}
              htmlFor={`tg-${p.id}`}
              className="flex cursor-pointer items-center justify-between gap-6 border-b border-border py-3.5 last:border-0"
            >
              <span className="text-sm font-medium">{p.judul}</span>
              <Sakelar id={`tg-${p.id}`} defaultChecked={p.aktif} disabled={!aktif} />
            </label>
          ))}
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Cara menyiapkan</JudulKartu>
            <DeskripsiKartu>Empat langkah, sekitar lima menit</DeskripsiKartu>
          </div>
          <Bot className="size-4 text-muted-foreground" />
        </KepalaKartu>
        <IsiKartu>
          <Akordeon type="single" collapsible defaultValue="l1">
            <ItemAkordeon value="l1">
              <PemicuAkordeon>1. Buat bot lewat @BotFather</PemicuAkordeon>
              <IsiAkordeon>
                <p>
                  Buka Telegram, cari <b>@BotFather</b>, kirim perintah <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/newbot</code>,
                  lalu ikuti instruksinya. Di akhir Anda akan menerima token — salin ke kolom di atas.
                </p>
                <Tombol varian="garis" ukuran="sm" className="mt-3" asChild>
                  <a href="https://t.me/BotFather" target="_blank" rel="noreferrer noopener">
                    Buka BotFather <ExternalLink />
                  </a>
                </Tombol>
              </IsiAkordeon>
            </ItemAkordeon>

            <ItemAkordeon value="l2">
              <PemicuAkordeon>2. Masukkan bot ke grup tim</PemicuAkordeon>
              <IsiAkordeon>
                Buka grup tujuan → Anggota → Tambah → cari nama bot Anda. Untuk grup,
                jadikan bot sebagai administrator supaya bisa mengirim pesan.
              </IsiAkordeon>
            </ItemAkordeon>

            <ItemAkordeon value="l3">
              <PemicuAkordeon>3. Ambil Chat ID</PemicuAkordeon>
              <IsiAkordeon>
                <p>
                  Kirim satu pesan apa pun ke grup, lalu buka alamat berikut di peramban
                  dan cari nilai <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">chat.id</code>:
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-card bg-muted p-2.5">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs">
                    https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates
                  </code>
                  <Tombol
                    varian="hantu"
                    ukuran="ikon-sm"
                    aria-label="Salin alamat"
                    onClick={() => void salin('https://api.telegram.org/bot<TOKEN>/getUpdates', 'Alamat')}
                  >
                    <Copy />
                  </Tombol>
                </div>
              </IsiAkordeon>
            </ItemAkordeon>

            <ItemAkordeon value="l4">
              <PemicuAkordeon>4. Uji dan simpan</PemicuAkordeon>
              <IsiAkordeon>
                Tekan &ldquo;Kirim pesan uji&rdquo; di atas. Bila pesan muncul di grup,
                tekan Simpan. Bila tidak, periksa apakah bot sudah jadi administrator grup.
              </IsiAkordeon>
            </ItemAkordeon>
          </Akordeon>

          {uji === 'gagal' ? (
            <Peringatan varian="bahaya" judul="Pengiriman gagal" className="mt-4">
              <TriangleAlert className="inline size-3.5" /> Penyebab paling umum: bot belum
              menjadi administrator grup, atau Chat ID salah.
            </Peringatan>
          ) : null}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/pengaturan/telegram')({ component: PengaturanTelegram })
