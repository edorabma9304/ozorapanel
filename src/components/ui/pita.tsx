import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import type { WarnaLencana } from './lencana'

const LATAR: Record<WarnaLencana, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-danger text-danger-foreground',
  info: 'bg-info text-info-foreground',
  netral: 'bg-foreground text-background',
}

/**
 * Pita penanda di sudut kartu — untuk label seperti "Baru", "Diskon", "Terlaris".
 * Kartu induknya wajib `relative overflow-hidden`.
 */
export function Pita({
  warna = 'primary',
  posisi = 'kiri-atas',
  bentuk = 'sudut',
  className,
  children,
  ...props
}: ComponentProps<'span'> & {
  warna?: WarnaLencana
  posisi?: 'kiri-atas' | 'kanan-atas'
  bentuk?: 'sudut' | 'lurus' | 'ekor'
}) {
  if (bentuk === 'sudut') {
    // Pita diagonal 45° di pojok kartu.
    return (
      <span
        className={cn(
          'pointer-events-none absolute top-0 z-10 h-24 w-24 overflow-hidden',
          posisi === 'kiri-atas' ? 'left-0' : 'right-0',
        )}
      >
        <span
          className={cn(
            'absolute top-5 block w-36 py-1 text-center text-[11px] font-bold shadow-soft',
            LATAR[warna],
            posisi === 'kiri-atas' ? '-left-9 -rotate-45' : '-right-9 rotate-45',
            className,
          )}
          {...props}
        >
          {children}
        </span>
      </span>
    )
  }

  if (bentuk === 'ekor') {
    // Pita mendatar dengan takik segitiga di ujungnya.
    return (
      <span
        className={cn(
          'absolute top-4 z-10 flex items-center py-1.5 pl-3 pr-5 text-xs font-bold shadow-soft',
          LATAR[warna],
          posisi === 'kiri-atas'
            ? 'left-0 rounded-r-sm [clip-path:polygon(0_0,100%_0,calc(100%-10px)_50%,100%_100%,0_100%)]'
            : 'right-0 rounded-l-sm [clip-path:polygon(10px_0,100%_0,100%_100%,10px_100%,0_50%)]',
          className,
        )}
        {...props}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'absolute top-4 z-10 px-3 py-1.5 text-xs font-bold shadow-soft',
        LATAR[warna],
        posisi === 'kiri-atas' ? 'left-0 rounded-r-full' : 'right-0 rounded-l-full',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
