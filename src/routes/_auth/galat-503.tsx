import { createFileRoute, Link } from '@tanstack/react-router'
import { Home, RefreshCw, ServerCrash } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { Progres } from '@/components/ui/progres'

function Halaman503() {
  return (
    <div className="text-center">
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-warning-soft text-warning-kuat">
        <ServerCrash className="size-8" />
      </span>
      <p className="bg-gradient-to-br from-warning to-danger bg-clip-text text-6xl font-extrabold tracking-tight text-transparent">
        503
      </p>
      <h1 className="mt-4 text-xl font-bold">Layanan sedang tidak tersedia</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Server sedang menerima permintaan melebihi kapasitas, atau sedang dalam
        proses pembaruan. Coba lagi dalam beberapa menit.
      </p>

      <div className="mt-7">
        <Progres nilai={68} warna="warning" bergaris label="Pemulihan layanan" tampilkanNilai />
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <Tombol varian="garis" onClick={() => window.location.reload()}>
          <RefreshCw /> Coba lagi
        </Tombol>
        <Tombol asChild>
          <Link to="/"><Home /> Ke dasbor</Link>
        </Tombol>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Pantau status layanan di{' '}
        <a href="https://status.ozora.id" className="font-semibold text-primary-kuat hover:underline">
          status.ozora.id
        </a>
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_auth/galat-503')({ component: Halaman503 })
