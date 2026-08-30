import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Kartu } from '@/components/ui/kartu'
import { Sparkline } from '@/components/bagan/sparkline'
import { formatPersen } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { WarnaLencana } from '@/components/ui/lencana'

const LATAR: Record<WarnaLencana, string> = {
  primary: 'bg-primary-soft text-primary-kuat',
  secondary: 'bg-secondary-soft text-secondary-kuat',
  success: 'bg-success-soft text-success-kuat',
  warning: 'bg-warning-soft text-warning-kuat',
  danger: 'bg-danger-soft text-danger-kuat',
  info: 'bg-info-soft text-info-kuat',
  netral: 'bg-muted text-muted-foreground',
}

const HEKS: Record<WarnaLencana, string> = {
  primary: '#5d87ff',
  secondary: '#49beff',
  success: '#13deb9',
  warning: '#ffae1f',
  danger: '#fa896b',
  info: '#539bff',
  netral: '#5a6a85',
}

/**
 * Kartu statistik ringkas: label, angka besar, tren, dan bagan mini opsional.
 * Ini blok penyusun utama semua dasbor.
 */
export function KartuStatistik({
  label,
  nilai,
  ikon: Ikon,
  warna = 'primary',
  tren,
  keterangan,
  deret,
  className,
}: {
  label: string
  nilai: string | number
  ikon?: LucideIcon
  warna?: WarnaLencana
  /** Rasio perubahan, mis. 0.082 untuk +8,2%. */
  tren?: number
  keterangan?: string
  deret?: number[]
  className?: string
}) {
  const naik = (tren ?? 0) >= 0

  return (
    <Kartu className={cn('overflow-hidden p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight">{nilai}</p>

          {tren !== undefined ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold',
                  naik ? 'bg-success-soft text-success-kuat' : 'bg-danger-soft text-danger-kuat',
                )}
              >
                {naik ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {formatPersen(Math.abs(tren))}
              </span>
              {keterangan ? <span className="text-muted-foreground">{keterangan}</span> : null}
            </p>
          ) : keterangan ? (
            <p className="mt-2 text-xs text-muted-foreground">{keterangan}</p>
          ) : null}
        </div>

        {Ikon ? (
          <span className={cn('grid size-11 shrink-0 place-items-center rounded-card', LATAR[warna])}>
            <Ikon className="size-5" aria-hidden />
          </span>
        ) : null}
      </div>

      {deret ? (
        <div className="-mx-5 -mb-5 mt-3">
          <Sparkline nilai={deret} warna={HEKS[warna]} tinggi={56} />
        </div>
      ) : null}
    </Kartu>
  )
}
