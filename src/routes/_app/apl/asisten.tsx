import { createFileRoute } from '@tanstack/react-router'
import {
  Bot, Copy, Paperclip, Plus, RefreshCw, Send, Sparkles, ThumbsDown, ThumbsUp, Trash2, User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { AreaTeks } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Peringatan } from '@/components/ui/keadaan'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Pemisah } from '@/components/ui/lapisan'
import { useAuth } from '@/lib/auth'
import { formatWaktuRelatif } from '@/lib/format'
import { idAcak, cn, tunggu } from '@/lib/utils'

type Pesan = { id: string; peran: 'saya' | 'asisten'; isi: string; waktu: string }

const SARAN = [
  'Ringkas penjualan minggu ini dan sebutkan tiga hal yang perlu diperhatikan.',
  'Produk mana yang marginnya paling tipis?',
  'Buatkan draf pesan WhatsApp untuk menagih faktur yang jatuh tempo.',
  'Bandingkan biaya kurir bulan ini dengan bulan lalu.',
]

const DIMUAT = Date.now()

const RIWAYAT = [
  { id: 'p1', judul: 'Analisis stok menipis', waktu: new Date(DIMUAT - 2 * 3_600_000).toISOString() },
  { id: 'p2', judul: 'Draf balasan keluhan pelanggan', waktu: new Date(DIMUAT - 26 * 3_600_000).toISOString() },
  { id: 'p3', judul: 'Ringkasan laporan Juli', waktu: new Date(DIMUAT - 74 * 3_600_000).toISOString() },
]

/**
 * Antarmuka asisten AI.
 *
 * Balasannya SENGAJA dibuat statis — template ini tidak memanggil model apa pun.
 * Untuk menyambungkannya ke model sungguhan, ganti isi fungsi `jawab()` dengan
 * panggilan ke backend Anda. JANGAN pernah menaruh kunci API model di frontend:
 * proksikan lewat server, sama seperti driver `rest` pada adapter data.
 */
async function jawab(pertanyaan: string): Promise<string> {
  await tunggu(700)
  if (pertanyaan.toLowerCase().includes('margin')) {
    return 'Tiga produk dengan margin paling tipis: Botol Minum Lite (12%), Payung Lipat V2 (15%), dan Sarung Bantal Classic (17%). Ketiganya masih di bawah ambang sehat 20% — pertimbangkan menaikkan harga jual atau menegosiasi ulang harga modal ke supplier.'
  }
  if (pertanyaan.toLowerCase().includes('whatsapp') || pertanyaan.toLowerCase().includes('tagih')) {
    return 'Draf pesan:\n\n"Selamat pagi Bapak/Ibu, kami dari Ozora. Menginformasikan bahwa faktur FKT-20260118 senilai Rp 4.250.000 telah jatuh tempo pada 25 Agustus 2026. Mohon konfirmasi pembayarannya. Terima kasih atas kerja samanya."\n\nNadanya sengaja sopan dan tidak menuduh, supaya hubungan tetap baik.'
  }
  return 'Penjualan minggu ini Rp 48,2 juta, naik 8,2% dibanding minggu lalu.\n\nTiga hal yang perlu diperhatikan:\n1. Stok Kursi Ergonomis Pro tinggal 4 unit padahal termasuk produk terlaris.\n2. Empat pengiriman tersendat lebih dari dua hari, terbanyak ke Surabaya.\n3. Piutang di atas 60 hari mencapai Rp 6,1 juta dan perlu segera ditagih.'
}

function AsistenAI() {
  const { pengguna } = useAuth()
  const [pesan, setPesan] = useState<Pesan[]>([])
  const [draf, setDraf] = useState('')
  const [menunggu, setMenunggu] = useState(false)
  const [model, setModel] = useState('cepat')
  const bawah = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bawah.current?.scrollIntoView({ behavior: 'smooth' })
  }, [pesan, menunggu])

  async function kirim(teks: string) {
    const isi = teks.trim()
    if (!isi || menunggu) return

    setPesan((p) => [...p, { id: idAcak(8), peran: 'saya', isi, waktu: new Date().toISOString() }])
    setDraf('')
    setMenunggu(true)
    try {
      const balasan = await jawab(isi)
      setPesan((p) => [...p, { id: idAcak(8), peran: 'asisten', isi: balasan, waktu: new Date().toISOString() }])
    } finally {
      setMenunggu(false)
    }
  }

  return (
    <>
      <KepalaHalaman
        judul="Asisten AI"
        deskripsi="Tanyakan apa pun tentang data bisnis Anda dalam bahasa sehari-hari."
        remah={[{ label: 'Aplikasi' }, { label: 'Asisten AI' }]}
        aksi={
          <Tombol varian="garis" onClick={() => setPesan([])} disabled={pesan.length === 0}>
            <Plus /> Percakapan baru
          </Tombol>
        }
      />

      <Peringatan varian="perhatian" judul="Balasan di template ini statis">
        Halaman ini hanya antarmukanya. Untuk menyambungkan ke model sungguhan, ganti
        fungsi <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">jawab()</code> dengan
        panggilan ke backend Anda. <b>Jangan pernah menaruh kunci API model di frontend</b> —
        proksikan lewat server.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Riwayat & pengaturan */}
        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <JudulKartu>Model</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-3">
              <PilihanRingkas
                nilai={model}
                onUbah={setModel}
                opsi={[
                  { nilai: 'cepat', label: 'Cepat — jawaban singkat' },
                  { nilai: 'seimbang', label: 'Seimbang' },
                  { nilai: 'teliti', label: 'Teliti — analisis dalam' },
                ]}
              />
              <p className="text-xs text-muted-foreground">
                Model teliti memakai lebih banyak kuota dan butuh waktu lebih lama.
              </p>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Riwayat</JudulKartu>
                <DeskripsiKartu>Percakapan sebelumnya</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu className="space-y-1">
              {RIWAYAT.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="group flex w-full items-center gap-2 rounded-control p-2.5 text-left transition-colors hover:bg-muted"
                >
                  <Sparkles className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.judul}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatWaktuRelatif(r.waktu)}
                    </span>
                  </span>
                  <Trash2 className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </IsiKartu>
          </Kartu>
        </div>

        {/* Percakapan */}
        <Kartu className="flex max-h-[72dvh] flex-col lg:col-span-3">
          <div className="scrollbar-thin flex-1 overflow-y-auto p-5">
            {pesan.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary-kuat">
                  <Bot className="size-7" />
                </span>
                <h2 className="mt-4 text-lg font-bold">Ada yang bisa dibantu?</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Pilih salah satu contoh di bawah, atau ketik pertanyaan Anda sendiri.
                </p>
                <div className="mt-6 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {SARAN.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void kirim(s)}
                      className="rounded-card border border-border p-3.5 text-left text-sm transition-colors hover:border-primary hover:bg-primary-soft/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {pesan.map((p) => (
                  <div key={p.id} className={cn('flex gap-3', p.peran === 'saya' && 'flex-row-reverse')}>
                    {p.peran === 'asisten' ? (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-kuat">
                        <Bot className="size-4.5" />
                      </span>
                    ) : (
                      <Avatar nama={pengguna?.nama ?? 'Saya'} src={pengguna?.avatar_url} ukuran="sm" className="shrink-0" />
                    )}

                    <div className={cn('max-w-[80%]', p.peran === 'saya' && 'text-right')}>
                      <div className={cn('flex items-baseline gap-2', p.peran === 'saya' && 'flex-row-reverse')}>
                        <p className="text-sm font-bold">{p.peran === 'saya' ? 'Anda' : 'Asisten'}</p>
                        <span className="text-xs text-muted-foreground">{formatWaktuRelatif(p.waktu)}</span>
                      </div>
                      <div
                        className={cn(
                          'mt-1.5 whitespace-pre-line rounded-card px-4 py-3 text-left text-sm leading-relaxed',
                          p.peran === 'saya' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                        )}
                      >
                        {p.isi}
                      </div>

                      {p.peran === 'asisten' ? (
                        <div className="mt-1.5 flex gap-0.5">
                          <Tombol
                            varian="hantu"
                            ukuran="ikon-sm"
                            aria-label="Salin jawaban"
                            onClick={() => {
                              void navigator.clipboard.writeText(p.isi).then(
                                () => toast.success('Jawaban disalin.'),
                                () => toast.error('Peramban menolak akses papan klip.'),
                              )
                            }}
                          >
                            <Copy />
                          </Tombol>
                          <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Jawaban membantu" onClick={() => toast.success('Terima kasih atas masukannya.')}>
                            <ThumbsUp />
                          </Tombol>
                          <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Jawaban kurang tepat" onClick={() => toast.info('Masukan tercatat.')}>
                            <ThumbsDown />
                          </Tombol>
                          <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Buat ulang jawaban" onClick={() => toast.info('Membuat ulang jawaban…')}>
                            <RefreshCw />
                          </Tombol>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {menunggu ? (
                  <div className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-kuat">
                      <Bot className="size-4.5" />
                    </span>
                    <div className="flex items-center gap-1.5 rounded-card bg-muted px-4 py-3.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                <div ref={bawah} />
              </div>
            )}
          </div>

          <Pemisah />

          <form
            className="p-4"
            onSubmit={(e) => {
              e.preventDefault()
              void kirim(draf)
            }}
          >
            <div className="flex items-end gap-2">
              <Tombol type="button" varian="hantu" ukuran="ikon" aria-label="Lampirkan berkas">
                <Paperclip />
              </Tombol>
              <AreaTeks
                value={draf}
                onChange={(e) => setDraf(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void kirim(draf)
                  }
                }}
                placeholder="Tanyakan sesuatu… (Enter untuk kirim, Shift+Enter untuk baris baru)"
                className="min-h-11 resize-none"
                rows={1}
                aria-label="Tulis pertanyaan"
              />
              <Tombol type="submit" ukuran="ikon" disabled={!draf.trim() || menunggu} aria-label="Kirim">
                <Send />
              </Tombol>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3" />
              Jawaban AI bisa keliru. Periksa ulang angka penting sebelum dipakai mengambil keputusan.
              <Lencana warna="netral" ukuran="sm" className="ml-auto">Model: {model}</Lencana>
            </p>
          </form>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/asisten')({ component: AsistenAI })
