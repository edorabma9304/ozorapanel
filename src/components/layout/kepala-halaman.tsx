import { Link } from '@tanstack/react-router'
import { ChevronRight, Home } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Remah = { label: string; href?: string }

/**
 * Kepala halaman: remah roti + judul + tombol aksi.
 * Dipakai di SEMUA halaman supaya jarak dan hierarki konsisten.
 */
export function KepalaHalaman({
  judul,
  deskripsi,
  remah = [],
  aksi,
  className,
  ...props
}: {
  judul: string
  deskripsi?: string
  remah?: Remah[]
  aksi?: ReactNode
  className?: string
} & Omit<ComponentProps<'div'>, 'title'>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-border bg-card px-5 py-5 shadow-soft sm:px-6',
        className,
      )}
      {...props}
    >
      {/* Ornamen lembut khas Modernize — murni CSS, tanpa berkas gambar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary-soft/70 blur-2xl"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Remah roti">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link to="/" className="inline-flex items-center gap-1 hover:text-primary-kuat" aria-label="Beranda">
                  <Home className="size-3.5" />
                </Link>
              </li>
              {remah.map((r) => (
                <li key={r.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3 opacity-60" aria-hidden />
                  {r.href ? (
                    <Link to={r.href} className="hover:text-primary-kuat">
                      {r.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-foreground">{r.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="mt-2 truncate text-xl font-extrabold tracking-tight sm:text-2xl">{judul}</h1>
          {deskripsi ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{deskripsi}</p>
          ) : null}
        </div>

        {aksi ? <div className="flex shrink-0 flex-wrap items-center gap-2">{aksi}</div> : null}
      </div>
    </div>
  )
}
