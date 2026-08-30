import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const dasar =
  'w-full rounded-control border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25'

export function Masukan({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(dasar, 'h-10 px-3', className)} {...props} />
}

export function AreaTeks({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(dasar, 'min-h-24 px-3 py-2 resize-y', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn('block text-sm font-semibold text-foreground select-none', className)}
      {...props}
    />
  )
}

/** Teks bantuan / pesan galat di bawah input. */
export function PetunjukKolom({
  galat,
  className,
  ...props
}: ComponentProps<'p'> & { galat?: boolean }) {
  return (
    <p
      className={cn('mt-1.5 text-xs', galat ? 'text-danger-kuat' : 'text-muted-foreground', className)}
      role={galat ? 'alert' : undefined}
      {...props}
    />
  )
}
