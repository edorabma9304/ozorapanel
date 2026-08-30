import { Link } from '@tanstack/react-router'
import { Home, RefreshCw } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { pesanRamah } from '@/lib/tipe'

function Bingkai({
  kode,
  judul,
  deskripsi,
  children,
}: {
  kode: string
  judul: string
  deskripsi: string
  children?: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <p className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-7xl font-extrabold tracking-tight text-transparent">
          {kode}
        </p>
        <h1 className="mt-4 text-xl font-bold">{judul}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{deskripsi}</p>
        <div className="mt-7 flex justify-center gap-2">{children}</div>
      </div>
    </div>
  )
}

export function HalamanTakDitemukan() {
  return (
    <Bingkai
      kode="404"
      judul="Halaman tidak ditemukan"
      deskripsi="Alamat yang Anda buka sudah dipindahkan atau tidak pernah ada."
    >
      <Tombol asChild>
        <Link to="/">
          <Home /> Kembali ke dasbor
        </Link>
      </Tombol>
    </Bingkai>
  )
}

export function HalamanGalat({ error, reset }: { error: unknown; reset?: () => void }) {
  return (
    <Bingkai
      kode="500"
      judul="Terjadi kesalahan"
      deskripsi={pesanRamah(error)}
    >
      {reset ? (
        <Tombol varian="garis" onClick={reset}>
          <RefreshCw /> Coba lagi
        </Tombol>
      ) : null}
      <Tombol asChild>
        <Link to="/">
          <Home /> Ke dasbor
        </Link>
      </Tombol>
    </Bingkai>
  )
}

export function HalamanTanpaAkses() {
  return (
    <Bingkai
      kode="403"
      judul="Akses ditolak"
      deskripsi="Peran akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi administrator bila ini keliru."
    >
      <Tombol asChild>
        <Link to="/">
          <Home /> Ke dasbor
        </Link>
      </Tombol>
    </Bingkai>
  )
}
