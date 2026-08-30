import { createFileRoute, Link } from '@tanstack/react-router'
import { TombolGoogle } from '@/components/layout/tombol-google'
import { Peringatan } from '@/components/ui/keadaan'
import { useAuth } from '@/lib/auth'

function HalamanDaftar() {
  const { masukGoogle } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Buat akun</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Akun dibuat otomatis saat pertama kali masuk dengan Google.
      </p>

      <Peringatan varian="info" judul="Akses ditentukan administrator" className="mt-6">
        Sistem ini tidak memakai pendaftaran mandiri. Setelah masuk, administrator perlu
        memberi peran sebelum Anda bisa mengakses menu.
      </Peringatan>

      <div className="mt-6">
        <TombolGoogle onKlik={() => void masukGoogle('/')} label="Lanjutkan dengan Google" />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akses?{' '}
        <Link to="/masuk" className="font-semibold text-primary-kuat hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_auth/daftar')({ component: HalamanDaftar })
