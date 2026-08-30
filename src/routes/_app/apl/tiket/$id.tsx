import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Clock, Paperclip, Send, Tag, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { AreaTeks } from '@/components/ui/masukan'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Pemisah } from '@/components/ui/lapisan'
import { formatTanggalWaktu, formatWaktuRelatif } from '@/lib/format'
import { BALASAN_TIKET, TIKET_CONTOH, type Tiket } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const WARNA_PRIORITAS: Record<Tiket['prioritas'], WarnaLencana> = {
  rendah: 'netral', sedang: 'info', tinggi: 'warning', mendesak: 'danger',
}
const WARNA_STATUS: Record<Tiket['status'], WarnaLencana> = {
  terbuka: 'info', diproses: 'warning', menunggu: 'secondary', selesai: 'success',
}

function BalasTiket() {
  const { id } = Route.useParams()
  const tiket = TIKET_CONTOH.find((x) => x.id === id)
  if (!tiket) throw notFound()

  const [balasan, setBalasan] = useState(() => BALASAN_TIKET(tiket.nomor))
  const [draf, setDraf] = useState('')
  const [status, setStatus] = useState<Tiket['status']>(tiket.status)
  const [prioritas, setPrioritas] = useState<Tiket['prioritas']>(tiket.prioritas)

  function kirim(e: React.FormEvent) {
    e.preventDefault()
    const isi = draf.trim()
    if (!isi) return
    setBalasan((b) => [
      ...b,
      { id: `baru-${Date.now()}`, dari: 'Saya', avatar: '', agen: true, waktu: new Date().toISOString(), isi },
    ])
    setDraf('')
    toast.success('Balasan terkirim.')
  }

  return (
    <>
      <KepalaHalaman
        judul={tiket.judul}
        deskripsi={`Tiket ${tiket.nomor} · dilaporkan ${formatWaktuRelatif(tiket.created_at)}`}
        remah={[{ label: 'Aplikasi' }, { label: 'Tiket', href: '/apl/tiket' }, { label: tiket.nomor }]}
        aksi={
          <>
            <Tombol varian="garis" asChild>
              <Link to="/apl/tiket"><ArrowLeft /> Semua tiket</Link>
            </Tombol>
            <Tombol
              varian="sukses"
              onClick={() => {
                setStatus('selesai')
                toast.success('Tiket ditandai selesai.')
              }}
              disabled={status === 'selesai'}
            >
              <CheckCircle2 /> Tandai selesai
            </Tombol>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Percakapan */}
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Percakapan</JudulKartu>
              <DeskripsiKartu>{balasan.length} pesan</DeskripsiKartu>
            </div>
            <Lencana warna={WARNA_STATUS[status]}>{status}</Lencana>
          </KepalaKartu>

          <IsiKartu className="space-y-4">
            {balasan.map((b) => (
              <div key={b.id} className={cn('flex gap-3', b.agen && 'flex-row-reverse')}>
                <Avatar nama={b.dari} src={b.avatar} ukuran="sm" className="mt-1 shrink-0" />
                <div className={cn('max-w-[80%]', b.agen && 'text-right')}>
                  <div className={cn('flex items-baseline gap-2', b.agen && 'flex-row-reverse')}>
                    <p className="text-sm font-bold">{b.dari}</p>
                    <span className="text-xs text-muted-foreground">{formatWaktuRelatif(b.waktu)}</span>
                    {b.agen ? <Lencana warna="primary" ukuran="sm">Agen</Lencana> : null}
                  </div>
                  <p
                    className={cn(
                      'mt-1.5 rounded-card px-4 py-3 text-left text-sm leading-relaxed',
                      b.agen ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    )}
                  >
                    {b.isi}
                  </p>
                </div>
              </div>
            ))}

            <Pemisah className="my-5" />

            <form onSubmit={kirim} className="space-y-3">
              <AreaTeks
                value={draf}
                onChange={(e) => setDraf(e.target.value)}
                placeholder="Tulis balasan untuk pelapor…"
                className="min-h-28"
                aria-label="Tulis balasan"
              />
              <div className="flex items-center justify-between">
                <Tombol type="button" varian="hantu" ukuran="sm"><Paperclip /> Lampirkan</Tombol>
                <Tombol type="submit" disabled={!draf.trim()}><Send /> Kirim balasan</Tombol>
              </div>
            </form>
          </IsiKartu>
        </Kartu>

        {/* Rincian tiket */}
        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <JudulKartu>Rincian tiket</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar nama={tiket.pelapor} src={tiket.avatar} ukuran="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{tiket.pelapor}</p>
                  <p className="text-xs text-muted-foreground">Pelapor</p>
                </div>
              </div>

              <Pemisah />

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Tag className="size-4" /> Kategori</dt>
                  <dd className="font-semibold">{tiket.kategori}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground"><Clock className="size-4" /> Dibuat</dt>
                  <dd className="font-semibold">{formatTanggalWaktu(tiket.created_at)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground"><User className="size-4" /> Ditangani</dt>
                  <dd className="font-semibold">Tim Dukungan</dd>
                </div>
              </dl>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <JudulKartu>Ubah status</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="tk-status" className="text-sm font-semibold">Status</label>
                <PilihanRingkas
                  id="tk-status"
                  nilai={status}
                  onUbah={(n) => {
                    setStatus(n as Tiket['status'])
                    toast.success(`Status diubah menjadi "${n}".`)
                  }}
                  opsi={(['terbuka', 'diproses', 'menunggu', 'selesai'] as const).map((s) => ({ nilai: s, label: s }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tk-prioritas" className="text-sm font-semibold">Prioritas</label>
                <PilihanRingkas
                  id="tk-prioritas"
                  nilai={prioritas}
                  onUbah={(n) => setPrioritas(n as Tiket['prioritas'])}
                  opsi={(['rendah', 'sedang', 'tinggi', 'mendesak'] as const).map((s) => ({ nilai: s, label: s }))}
                />
              </div>

              <div className="flex gap-2">
                <Lencana warna={WARNA_STATUS[status]}>{status}</Lencana>
                <Lencana warna={WARNA_PRIORITAS[prioritas]}>{prioritas}</Lencana>
              </div>
            </IsiKartu>
          </Kartu>
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/tiket/$id')({ component: BalasTiket })
