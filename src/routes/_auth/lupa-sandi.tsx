import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'

function HalamanLupaSandi() {
  return (
    <div>
      <span className="mb-5 inline-grid size-12 place-items-center rounded-card bg-primary-soft text-primary-kuat">
        <KeyRound className="size-6" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Lupa sandi?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Panel ini tidak menyimpan kata sandi sama sekali.
      </p>

      <Peringatan varian="info" className="mt-6">
        Seluruh autentikasi berjalan lewat akun Google Anda. Kalau tidak bisa masuk,
        pulihkan akun Google terlebih dahulu, lalu coba masuk kembali. Bila akses tetap
        ditolak, hubungi administrator untuk memeriksa peran akun Anda.
      </Peringatan>

      <Tombol varian="garis" className="mt-6 w-full" asChild>
        <Link to="/masuk">
          <ArrowLeft /> Kembali ke halaman masuk
        </Link>
      </Tombol>
    </div>
  )
}

export const Route = createFileRoute('/_auth/lupa-sandi')({ component: HalamanLupaSandi })
