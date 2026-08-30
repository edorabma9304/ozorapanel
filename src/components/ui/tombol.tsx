import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const varianTombol = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors duration-150 outline-none disabled:pointer-events-none disabled:opacity-55 [&_svg]:shrink-0 [&_svg]:size-4',
  {
    variants: {
      varian: {
        utama: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft',
        halus: 'bg-primary-soft text-primary-kuat hover:bg-primary hover:text-primary-foreground',
        garis: 'border border-input bg-card text-foreground hover:bg-muted',
        hantu: 'text-muted-foreground hover:bg-muted hover:text-foreground',
        bahaya: 'bg-danger text-danger-foreground hover:bg-danger/90',
        sukses: 'bg-success text-success-foreground hover:bg-success/90',
        tautan: 'text-primary-kuat underline-offset-4 hover:underline',
      },
      ukuran: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-sm',
        ikon: 'size-9',
        'ikon-sm': 'size-8',
      },
    },
    defaultVariants: { varian: 'utama', ukuran: 'md' },
  },
)

type PropsTombol = ComponentProps<'button'> &
  VariantProps<typeof varianTombol> & {
    asChild?: boolean
    memuat?: boolean
  }

export function Tombol({
  className,
  varian,
  ukuran,
  asChild,
  memuat,
  disabled,
  children,
  ...props
}: PropsTombol) {
  const kelas = cn(varianTombol({ varian, ukuran }), className)

  // Radix Slot hanya menerima SATU anak. Saat asChild dipakai (mis. membungkus
  // <Link>), jangan sisipkan spinner — cukup teruskan anaknya apa adanya.
  if (asChild) {
    return (
      <Slot className={kelas} aria-busy={memuat || undefined} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={kelas}
      disabled={disabled ?? memuat}
      aria-busy={memuat || undefined}
      {...props}
    >
      {memuat ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  )
}

export { varianTombol }

/**
 * Grup tombol tersegmentasi — sudut membulat hanya di kedua ujung,
 * pembatas tunggal di antaranya.
 *
 * ```tsx
 * <GrupTombol>
 *   <Tombol varian="garis">Kiri</Tombol>
 *   <Tombol varian="garis">Tengah</Tombol>
 *   <Tombol varian="garis">Kanan</Tombol>
 * </GrupTombol>
 * ```
 */
export function GrupTombol({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex isolate [&>*]:rounded-none [&>*:first-child]:rounded-l-control [&>*:last-child]:rounded-r-control [&>*:not(:first-child)]:-ml-px [&>*:hover]:z-10 [&>*:focus-visible]:z-10',
        className,
      )}
      {...props}
    />
  )
}
