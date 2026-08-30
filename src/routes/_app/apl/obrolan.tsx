import { createFileRoute } from '@tanstack/react-router'
import { Paperclip, Search, Send } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { OBROLAN_CONTOH } from '@/lib/adapter/data-contoh'
import { formatWaktuRelatif } from '@/lib/format'
import { cn } from '@/lib/utils'

const WARNA_HADIR = { daring: 'bg-success', sibuk: 'bg-warning', luring: 'bg-muted-foreground' } as const

function HalamanObrolan() {
  const [aktif, setAktif] = useState(OBROLAN_CONTOH[0]!.id)
  const [cari, setCari] = useState('')
  const [draf, setDraf] = useState('')
  const [percakapan, setPercakapan] = useState(OBROLAN_CONTOH)

  const daftar = percakapan.filter((o) => o.nama.toLowerCase().includes(cari.trim().toLowerCase()))
  const terpilih = percakapan.find((o) => o.id === aktif) ?? percakapan[0]!

  function kirim(e: React.FormEvent) {
    e.preventDefault()
    const isi = draf.trim()
    if (!isi) return
    setPercakapan((p) =>
      p.map((o) =>
        o.id === terpilih.id
          ? { ...o, pesan: [...o.pesan, { id: `baru-${Date.now()}`, dari: 'saya' as const, isi, waktu: new Date().toISOString() }] }
          : o,
      ),
    )
    setDraf('')
  }

  return (
    <>
      <KepalaHalaman
        judul="Obrolan"
        deskripsi="Percakapan dengan pelanggan dan rekan tim."
        remah={[{ label: 'Aplikasi' }, { label: 'Obrolan' }]}
      />

      <Kartu className="grid overflow-hidden lg:grid-cols-[320px_1fr]">
        {/* Daftar percakapan */}
        <div className="flex max-h-[70dvh] flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="relative p-3">
            <Search className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Masukan value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari percakapan…" className="pl-9" aria-label="Cari percakapan" />
          </div>

          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {daftar.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setAktif(o.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                  o.id === terpilih.id ? 'bg-primary-soft' : 'hover:bg-muted',
                )}
              >
                <span className="relative shrink-0">
                  <Avatar nama={o.nama} src={o.avatar} ukuran="md" />
                  <span className={cn('absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-card', WARNA_HADIR[o.status])} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{o.nama}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.pesan.at(-1)?.isi}
                  </span>
                </span>
                {o.belum_dibaca > 0 ? (
                  <Lencana warna="primary" padat ukuran="sm">{o.belum_dibaca}</Lencana>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Isi percakapan */}
        <div className="flex max-h-[70dvh] flex-col">
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar nama={terpilih.nama} src={terpilih.avatar} ukuran="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{terpilih.nama}</p>
              <p className="text-xs text-muted-foreground">{terpilih.status}</p>
            </div>
          </header>

          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {terpilih.pesan.map((p) => (
              <div key={p.id} className={cn('flex', p.dari === 'saya' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-card px-3.5 py-2.5 text-sm shadow-soft',
                    p.dari === 'saya' ? 'bg-primary text-primary-foreground' : 'bg-card',
                  )}
                >
                  <p>{p.isi}</p>
                  <p className={cn('mt-1 text-[10px]', p.dari === 'saya' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {formatWaktuRelatif(p.waktu)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={kirim} className="flex items-center gap-2 border-t border-border p-3">
            <Tombol type="button" varian="hantu" ukuran="ikon" aria-label="Lampirkan berkas">
              <Paperclip />
            </Tombol>
            <Masukan value={draf} onChange={(e) => setDraf(e.target.value)} placeholder="Tulis pesan…" aria-label="Tulis pesan" />
            <Tombol type="submit" ukuran="ikon" aria-label="Kirim">
              <Send />
            </Tombol>
          </form>
        </div>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/obrolan')({ component: HalamanObrolan })
