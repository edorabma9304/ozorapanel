import { createFileRoute } from '@tanstack/react-router'
import { Archive, Inbox, Paperclip, PenSquare, Reply, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Pemisah } from '@/components/ui/lapisan'
import { SUREL_CONTOH, type Surel } from '@/lib/adapter/data-contoh'
import { formatTanggalWaktu, formatWaktuRelatif } from '@/lib/format'
import { cn } from '@/lib/utils'

const KOTAK = [
  { nilai: 'kotak_masuk', label: 'Kotak masuk', ikon: Inbox },
  { nilai: 'penting', label: 'Penting', ikon: Star },
  { nilai: 'draf', label: 'Draf', ikon: PenSquare },
  { nilai: 'terkirim', label: 'Terkirim', ikon: Reply },
] as const

function HalamanSurel() {
  const [kotak, setKotak] = useState<Surel['label']>('kotak_masuk')
  const [dibuka, setDibuka] = useState<string | null>(SUREL_CONTOH[0]!.id)

  const daftar = SUREL_CONTOH.filter((s) => s.label === kotak)
  const terpilih = daftar.find((s) => s.id === dibuka) ?? daftar[0]

  return (
    <>
      <KepalaHalaman
        judul="Surel"
        deskripsi="Kotak masuk terpadu untuk korespondensi bisnis."
        remah={[{ label: 'Aplikasi' }, { label: 'Surel' }]}
        aksi={<Tombol><PenSquare /> Tulis surel</Tombol>}
      />

      <Kartu className="grid overflow-hidden lg:grid-cols-[200px_320px_1fr]">
        {/* Kotak */}
        <nav className="border-b border-border p-3 lg:border-b-0 lg:border-r" aria-label="Kotak surel">
          {KOTAK.map((k) => {
            const jumlah = SUREL_CONTOH.filter((s) => s.label === k.nilai).length
            return (
              <button
                key={k.nilai}
                type="button"
                onClick={() => setKotak(k.nilai)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors',
                  kotak === k.nilai ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <k.ikon className="size-4" />
                <span className="flex-1 text-left">{k.label}</span>
                <span className={cn('text-xs', kotak === k.nilai ? 'opacity-80' : 'text-muted-foreground')}>{jumlah}</span>
              </button>
            )
          })}
        </nav>

        {/* Daftar */}
        <div className="scrollbar-thin max-h-[70dvh] overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          {daftar.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setDibuka(s.id)}
              className={cn(
                'flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0',
                s.id === terpilih?.id ? 'bg-primary-soft' : 'hover:bg-muted',
              )}
            >
              <Avatar nama={s.dari} src={s.avatar} ukuran="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={cn('truncate text-sm', s.dibaca ? 'font-medium' : 'font-bold')}>{s.dari}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatWaktuRelatif(s.created_at)}</span>
                </span>
                <span className={cn('mt-0.5 block truncate text-sm', s.dibaca ? 'text-muted-foreground' : 'font-semibold')}>
                  {s.subjek}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  {s.berbintang ? <Star className="size-3 fill-warning text-warning-kuat" /> : null}
                  {s.lampiran > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Paperclip className="size-3" />
                      {s.lampiran}
                    </span>
                  ) : null}
                  {!s.dibaca ? <Lencana warna="primary" ukuran="sm">Baru</Lencana> : null}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Isi */}
        <div className="scrollbar-thin max-h-[70dvh] overflow-y-auto p-5">
          {terpilih ? (
            <article>
              <h2 className="text-lg font-bold">{terpilih.subjek}</h2>
              <div className="mt-4 flex items-center gap-3">
                <Avatar nama={terpilih.dari} src={terpilih.avatar} ukuran="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{terpilih.dari}</p>
                  <p className="truncate text-xs text-muted-foreground">{terpilih.dari_email}</p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{formatTanggalWaktu(terpilih.created_at)}</p>
              </div>

              <Pemisah className="my-5" />

              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <p>{terpilih.cuplikan}</p>
                <p>
                  Berikut rincian yang kami siapkan. Kalau ada yang perlu disesuaikan, mohon kabari
                  sebelum akhir pekan supaya kami sempat memprosesnya.
                </p>
                <p>Terima kasih atas kerja samanya.</p>
                <p className="text-muted-foreground">
                  Salam,
                  <br />
                  {terpilih.dari}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                <Tombol><Reply /> Balas</Tombol>
                <Tombol varian="garis"><Archive /> Arsipkan</Tombol>
                <Tombol varian="hantu"><Trash2 className="text-danger-kuat" /> Hapus</Tombol>
              </div>
            </article>
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Tidak ada surel di kotak ini.</p>
          )}
        </div>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/surel')({ component: HalamanSurel })
