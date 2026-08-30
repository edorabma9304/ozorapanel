import { createFileRoute, Link } from '@tanstack/react-router'
import { Home, RefreshCw, TriangleAlert } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'

function HalamanGalatPeraga() {
  return (
    <div className="text-center">
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-danger-soft text-danger-kuat">
        <TriangleAlert className="size-8" />
      </span>
      <p className="bg-gradient-to-br from-danger to-warning bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">
        500
      </p>
      <h1 className="mt-4 text-xl font-bold">Terjadi kesalahan di server</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Permintaan Anda tidak dapat diselesaikan. Tim kami sudah menerima laporannya
        secara otomatis. Coba beberapa saat lagi.
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        Kode kejadian: OZP-5XX-20260830-A19F
      </p>
      <div className="mt-7 flex justify-center gap-2">
        <Tombol varian="garis" onClick={() => window.location.reload()}>
          <RefreshCw /> Muat ulang
        </Tombol>
        <Tombol asChild>
          <Link to="/"><Home /> Ke dasbor</Link>
        </Tombol>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_auth/galat')({ component: HalamanGalatPeraga })
