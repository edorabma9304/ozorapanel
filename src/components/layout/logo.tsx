import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { bacaMerek, pantauMerek, type Merek } from '@/config/merek'
import { useTema } from '@/lib/tema'
import { Lambang } from './lambang'

export function Logo({ ringkas = false, className }: { ringkas?: boolean; className?: string }) {
  const [merek, setMerek] = useState<Merek>(bacaMerek)
  const { efektif } = useTema()

  // Ikuti perubahan dari halaman Pengaturan → Merek tanpa perlu muat ulang.
  useEffect(() => pantauMerek(setMerek), [])

  const berkas = efektif === 'gelap' ? merek.logoGelap || merek.logoTerang : merek.logoTerang

  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {berkas ? (
        <img src={berkas} alt={merek.nama} height={32} className="h-8 w-auto shrink-0 object-contain" />
      ) : (
        <Lambang warnaUtama={merek.warnaUtama} warnaAksen={merek.warnaAksen} className="size-8" />
      )}
      {!ringkas ? (
        <span className="truncate text-[17px] font-extrabold tracking-tight">{merek.nama}</span>
      ) : null}
    </span>
  )
}
