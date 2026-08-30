import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Bell, Rocket } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Tombol } from '@/components/ui/tombol'
import { Masukan } from '@/components/ui/masukan'

const TARGET = new Date('2026-12-01T00:00:00+07:00').getTime()

function sisaWaktu() {
  const selisih = Math.max(0, TARGET - Date.now())
  return {
    hari: Math.floor(selisih / 86_400_000),
    jam: Math.floor((selisih / 3_600_000) % 24),
    menit: Math.floor((selisih / 60_000) % 60),
    detik: Math.floor((selisih / 1000) % 60),
  }
}

function HalamanSegera() {
  const [sisa, setSisa] = useState(sisaWaktu)

  useEffect(() => {
    const t = setInterval(() => setSisa(sisaWaktu()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="text-center">
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-primary-soft text-primary-kuat">
        <Rocket className="size-8" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Segera hadir</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Kami sedang menyiapkan modul ini. Tinggalkan surel Anda dan kami kabari
        begitu siap dipakai.
      </p>

      <div className="mt-8 grid grid-cols-4 gap-2" aria-live="off">
        {[
          { label: 'Hari', nilai: sisa.hari },
          { label: 'Jam', nilai: sisa.jam },
          { label: 'Menit', nilai: sisa.menit },
          { label: 'Detik', nilai: sisa.detik },
        ].map((b) => (
          <div key={b.label} className="rounded-card border border-border bg-card p-3">
            <p className="text-2xl font-extrabold tabular-nums">{String(b.nilai).padStart(2, '0')}</p>
            <p className="text-[11px] text-muted-foreground">{b.label}</p>
          </div>
        ))}
      </div>

      <form
        className="mt-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          toast.success('Terima kasih! Kami akan mengabari Anda.')
        }}
      >
        <Masukan type="email" placeholder="surel@perusahaan.id" required aria-label="Alamat surel" />
        <Tombol type="submit"><Bell /> Kabari saya</Tombol>
      </form>

      <Tombol varian="hantu" className="mt-6" asChild>
        <Link to="/"><ArrowLeft /> Kembali ke dasbor</Link>
      </Tombol>
    </div>
  )
}

export const Route = createFileRoute('/_auth/segera')({ component: HalamanSegera })
