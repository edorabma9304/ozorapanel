import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Placeholder abu-abu berdenyut saat data dimuat. */
export function Rangka({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export function RangkaBaris({ jumlah = 5, kolom = 4 }: { jumlah?: number; kolom?: number }) {
  return (
    <>
      {Array.from({ length: jumlah }, (_x, b) => (
        <tr key={b} className="border-b border-border last:border-0">
          {Array.from({ length: kolom }, (_y, k) => (
            <td key={k} className="px-4 py-3.5">
              <Rangka className={cn('h-4', k === 0 ? 'w-40' : 'w-24')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function Pemuat({ className, label = 'Memuat…' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-2 py-10 text-muted-foreground', className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  )
}
