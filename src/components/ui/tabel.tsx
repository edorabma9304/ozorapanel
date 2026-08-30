import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Bungkus tabel supaya melebar ke samping di layar sempit, bukan merusak layout. */
export function BingkaiTabel({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('w-full overflow-x-auto scrollbar-thin', className)} {...props} />
}

export function Tabel({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
}

export function KepalaTabel({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('border-b border-border', className)} {...props} />
}

export function BadanTabel({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

export function BarisTabel({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn('border-b border-border transition-colors hover:bg-muted/60 data-[terpilih=true]:bg-primary-soft/60', className)}
      {...props}
    />
  )
}

export function SelKepala({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground whitespace-nowrap',
        className,
      )}
      {...props}
    />
  )
}

export function Sel({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3.5 align-middle', className)} {...props} />
}
