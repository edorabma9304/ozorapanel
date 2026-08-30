import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { formatPersen } from '@/lib/format'
import type { WarnaLencana } from './lencana'

const LATAR: Record<WarnaLencana, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  netral: 'bg-muted-foreground',
}

const TEBAL = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' } as const

/** Bilah kemajuan. Nilai 0–100. */
export function Progres({
  nilai,
  warna = 'primary',
  tebal = 'md',
  label,
  tampilkanNilai,
  bergaris,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  nilai: number
  warna?: WarnaLencana
  tebal?: keyof typeof TEBAL
  label?: ReactNode
  tampilkanNilai?: boolean
  /** Garis diagonal berjalan — penanda proses yang masih berlangsung. */
  bergaris?: boolean
}) {
  const aman = Math.min(100, Math.max(0, Number.isFinite(nilai) ? nilai : 0))

  return (
    <div className={cn('w-full', className)} {...props}>
      {label || tampilkanNilai ? (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
          {label ? <span className="font-medium">{label}</span> : <span />}
          {tampilkanNilai ? <span className="font-bold">{formatPersen(aman / 100, 0)}</span> : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={Math.round(aman)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === 'string' ? label : 'Kemajuan'}
        className={cn('w-full overflow-hidden rounded-full bg-muted', TEBAL[tebal])}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out-soft',
            LATAR[warna],
            bergaris && 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.22)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.22)_50%,rgba(255,255,255,.22)_75%,transparent_75%,transparent)]',
          )}
          style={{ width: `${aman}%` }}
        />
      </div>
    </div>
  )
}

const HEKS: Record<WarnaLencana, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  netral: 'var(--color-muted-foreground)',
}

/** Cincin kemajuan — SVG murni, tanpa pustaka bagan. */
export function ProgresCincin({
  nilai,
  ukuran = 96,
  tebal = 8,
  warna = 'primary',
  children,
  className,
}: {
  nilai: number
  ukuran?: number
  tebal?: number
  warna?: WarnaLencana
  children?: ReactNode
  className?: string
}) {
  const aman = Math.min(100, Math.max(0, Number.isFinite(nilai) ? nilai : 0))
  const r = (ukuran - tebal) / 2
  const keliling = 2 * Math.PI * r

  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: ukuran, height: ukuran }}>
      <svg
        width={ukuran}
        height={ukuran}
        className="-rotate-90"
        role="progressbar"
        aria-valuenow={Math.round(aman)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" strokeWidth={tebal} className="stroke-muted" />
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={r}
          fill="none"
          strokeWidth={tebal}
          strokeLinecap="round"
          stroke={HEKS[warna]}
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - aman / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out-soft"
        />
      </svg>
      <span className="absolute grid place-items-center text-center">
        {children ?? <span className="text-sm font-extrabold">{formatPersen(aman / 100, 0)}</span>}
      </span>
    </div>
  )
}
