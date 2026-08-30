import * as AvatarPrimitive from '@radix-ui/react-avatar'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { inisial } from '@/lib/utils'

const ukuranKelas = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
} as const

export function Avatar({
  src,
  nama,
  ukuran = 'md',
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root> & {
  src?: string | null
  nama: string
  ukuran?: keyof typeof ukuranKelas
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
        ukuranKelas[ukuran],
        className,
      )}
      {...props}
    >
      {src ? (
        <AvatarPrimitive.Image src={src} alt={nama} className="size-full object-cover" />
      ) : null}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center font-bold text-muted-foreground">
        {inisial(nama)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

/** Tumpukan avatar untuk daftar anggota. */
export function TumpukanAvatar({
  orang,
  maks = 4,
  ukuran = 'sm',
}: {
  orang: Array<{ nama: string; avatar?: string | null }>
  maks?: number
  ukuran?: keyof typeof ukuranKelas
}) {
  const tampil = orang.slice(0, maks)
  const sisa = orang.length - tampil.length
  return (
    <div className="flex -space-x-2">
      {tampil.map((o) => (
        <Avatar
          key={o.nama}
          nama={o.nama}
          src={o.avatar}
          ukuran={ukuran}
          className="ring-2 ring-card"
        />
      ))}
      {sisa > 0 ? (
        <span
          className={cn(
            'flex items-center justify-center rounded-full bg-muted font-bold text-muted-foreground ring-2 ring-card',
            ukuranKelas[ukuran],
          )}
        >
          +{sisa}
        </span>
      ) : null}
    </div>
  )
}
