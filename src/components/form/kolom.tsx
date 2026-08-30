import type { ReactNode } from 'react'
import { Label, PetunjukKolom } from '@/components/ui/masukan'
import { cn } from '@/lib/utils'

/**
 * Pembungkus satu kolom formulir: label, kendali, petunjuk, dan pesan galat.
 * Memakai ini memastikan `aria-invalid`, `aria-describedby`, dan `htmlFor`
 * selalu terpasang — syarat aksesibilitas yang mudah terlupa saat menulis manual.
 */
export function KolomForm({
  id,
  label,
  wajib,
  petunjuk,
  galat,
  children,
  className,
}: {
  id: string
  label: string
  wajib?: boolean
  petunjuk?: string
  galat?: string
  children: ReactNode
  className?: string
}) {
  const idPetunjuk = petunjuk ? `${id}-petunjuk` : undefined
  const idGalat = galat ? `${id}-galat` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {wajib ? <span className="ml-0.5 text-danger-kuat">*</span> : null}
      </Label>

      {children}

      {galat ? (
        <PetunjukKolom galat id={idGalat}>
          {galat}
        </PetunjukKolom>
      ) : petunjuk ? (
        <PetunjukKolom id={idPetunjuk}>{petunjuk}</PetunjukKolom>
      ) : null}
    </div>
  )
}

/** Atribut aksesibilitas untuk kendali di dalam KolomForm. */
export function propsKolom(id: string, galat?: string, petunjuk?: string) {
  return {
    id,
    'aria-invalid': galat ? true : undefined,
    'aria-describedby': galat ? `${id}-galat` : petunjuk ? `${id}-petunjuk` : undefined,
  } as const
}
