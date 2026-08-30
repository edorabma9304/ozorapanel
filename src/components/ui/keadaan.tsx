/** Keadaan halaman: kosong, galat, dan konfirmasi tindakan berbahaya. */
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { CircleAlert, Inbox, RefreshCw, TriangleAlert } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Tombol } from './tombol'
import { pesanRamah } from '@/lib/tipe'

export function KeadaanKosong({
  judul = 'Belum ada data',
  deskripsi = 'Data akan muncul di sini setelah ditambahkan.',
  ikon: Ikon = Inbox,
  aksi,
  className,
}: {
  judul?: string
  deskripsi?: string
  ikon?: typeof Inbox
  aksi?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <Ikon className="size-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-foreground">{judul}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{deskripsi}</p>
      {aksi ? <div className="mt-5">{aksi}</div> : null}
    </div>
  )
}

export function KeadaanGalat({
  galat,
  onCobaLagi,
  className,
}: {
  galat: unknown
  onCobaLagi?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-danger-soft text-danger-kuat">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-foreground">Gagal memuat data</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{pesanRamah(galat)}</p>
      {onCobaLagi ? (
        <Tombol varian="garis" className="mt-5" onClick={onCobaLagi}>
          <RefreshCw /> Coba lagi
        </Tombol>
      ) : null}
    </div>
  )
}

const varianPeringatan = {
  info: 'border-info/30 bg-info-soft text-info-kuat',
  sukses: 'border-success/30 bg-success-soft text-success-kuat',
  perhatian: 'border-warning/30 bg-warning-soft text-warning-kuat',
  bahaya: 'border-danger/30 bg-danger-soft text-danger-kuat',
} as const

export function Peringatan({
  varian = 'info',
  judul,
  children,
  className,
  ...props
}: ComponentProps<'div'> & { varian?: keyof typeof varianPeringatan; judul?: string }) {
  return (
    <div
      role="alert"
      className={cn('flex gap-3 rounded-card border p-4 text-sm', varianPeringatan[varian], className)}
      {...props}
    >
      <CircleAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden />
      <div className="space-y-1">
        {judul ? <p className="font-bold">{judul}</p> : null}
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------- Konfirmasi
export const Konfirmasi = AlertDialogPrimitive.Root
export const PemicuKonfirmasi = AlertDialogPrimitive.Trigger

export function IsiKonfirmasi({
  judul,
  deskripsi,
  labelBatal = 'Batal',
  labelLanjut = 'Ya, lanjutkan',
  bahaya = true,
  onLanjut,
  memuat,
}: {
  judul: string
  deskripsi: string
  labelBatal?: string
  labelLanjut?: string
  bahaya?: boolean
  onLanjut: () => void
  memuat?: boolean
}) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <AlertDialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-6 shadow-raised data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
        <div className="flex gap-4">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-full',
              bahaya ? 'bg-danger-soft text-danger-kuat' : 'bg-primary-soft text-primary-kuat',
            )}
          >
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <div className="space-y-1.5">
            <AlertDialogPrimitive.Title className="text-base font-bold">{judul}</AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
              {deskripsi}
            </AlertDialogPrimitive.Description>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <AlertDialogPrimitive.Cancel asChild>
            <Tombol varian="garis">{labelBatal}</Tombol>
          </AlertDialogPrimitive.Cancel>
          <AlertDialogPrimitive.Action asChild>
            <Tombol varian={bahaya ? 'bahaya' : 'utama'} onClick={onLanjut} memuat={memuat}>
              {labelLanjut}
            </Tombol>
          </AlertDialogPrimitive.Action>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}
