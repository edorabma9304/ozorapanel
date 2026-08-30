import { createFileRoute } from '@tanstack/react-router'
import { RefreshCw, Wrench } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'

function HalamanPerawatan() {
  return (
    <div className="text-center">
      <span className="mx-auto mb-5 grid size-14 place-items-center rounded-card bg-warning-soft text-warning-kuat">
        <Wrench className="size-7" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Sedang perawatan</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Kami sedang melakukan pemeliharaan terjadwal. Layanan akan kembali normal dalam
        beberapa menit. Terima kasih atas kesabarannya.
      </p>
      <Tombol varian="garis" className="mt-7" onClick={() => window.location.reload()}>
        <RefreshCw /> Muat ulang
      </Tombol>
    </div>
  )
}

export const Route = createFileRoute('/_auth/perawatan')({ component: HalamanPerawatan })
