import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Kartu({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-border bg-card text-card-foreground shadow-soft', className)}
      {...props}
    />
  )
}

export function KepalaKartu({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)} {...props} />
}

export function JudulKartu({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-base font-bold tracking-tight', className)} {...props} />
}

export function DeskripsiKartu({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />
}

export function IsiKartu({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function KakiKartu({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-3 border-t border-border px-5 py-4', className)} {...props} />
  )
}
