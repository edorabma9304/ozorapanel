import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Logo } from '@/components/layout/logo'

/** Tata letak halaman autentikasi: panel kiri bergambar, formulir di kanan. */
function TataLetakAuth() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary-soft lg:block">
        <div aria-hidden className="absolute -left-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -right-16 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground">
              Satu panel untuk seluruh operasional Anda.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Pesanan, stok, keuangan, dan tim — semuanya di satu tempat, dengan hak akses
              yang rapi per peran.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ozora. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_auth')({
  component: TataLetakAuth,
})
