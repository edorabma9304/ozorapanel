import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const varianLencana = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      warna: {
        primary: 'bg-primary-soft text-primary-kuat',
        secondary: 'bg-secondary-soft text-secondary-kuat',
        success: 'bg-success-soft text-success-kuat',
        warning: 'bg-warning-soft text-warning-kuat',
        danger: 'bg-danger-soft text-danger-kuat',
        info: 'bg-info-soft text-info-kuat',
        netral: 'bg-muted text-muted-foreground',
      },
      padat: { true: 'text-white', false: '' },
      ukuran: { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-1 text-xs' },
    },
    compoundVariants: [
      { padat: true, warna: 'primary', className: 'bg-primary text-primary-foreground' },
      { padat: true, warna: 'secondary', className: 'bg-secondary text-secondary-foreground' },
      { padat: true, warna: 'success', className: 'bg-success text-success-foreground' },
      { padat: true, warna: 'warning', className: 'bg-warning text-warning-foreground' },
      { padat: true, warna: 'danger', className: 'bg-danger text-danger-foreground' },
      { padat: true, warna: 'info', className: 'bg-info text-info-foreground' },
      { padat: true, warna: 'netral', className: 'bg-foreground text-background' },
    ],
    defaultVariants: { warna: 'netral', ukuran: 'md', padat: false },
  },
)

export type WarnaLencana = NonNullable<VariantProps<typeof varianLencana>['warna']>

export function Lencana({
  className,
  warna,
  ukuran,
  padat,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof varianLencana>) {
  return <span className={cn(varianLencana({ warna, ukuran, padat }), className)} {...props} />
}

/** Titik status kecil — dipakai di tabel & daftar. */
export function TitikStatus({ warna = 'netral', className }: { warna?: WarnaLencana; className?: string }) {
  const peta: Record<WarnaLencana, string> = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    netral: 'bg-muted-foreground',
  }
  return <span className={cn('inline-block size-2 rounded-full', peta[warna], className)} />
}
