import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Tombol } from './tombol'

/**
 * Korsel geser. Memakai scroll-snap bawaan peramban — tidak ada pustaka
 * korsel, tidak ada perhitungan posisi manual, dan gesekan jari di ponsel
 * langsung bekerja.
 */
export function Korsel({
  children,
  otomatis,
  jeda = 4000,
  className,
  labelSlide = 'Slide',
}: {
  children: ReactNode[]
  /** Geser sendiri setiap `jeda` milidetik. */
  otomatis?: boolean
  jeda?: number
  className?: string
  labelSlide?: string
}) {
  const jalur = useRef<HTMLDivElement>(null)
  const [aktif, setAktif] = useState(0)

  const keSlide = useCallback((i: number) => {
    const el = jalur.current
    if (!el) return
    const target = (i + children.length) % children.length
    el.scrollTo({ left: el.clientWidth * target, behavior: 'smooth' })
  }, [children.length])

  useEffect(() => {
    if (!otomatis) return
    const t = setInterval(() => keSlide(aktif + 1), jeda)
    return () => clearInterval(t)
  }, [otomatis, jeda, aktif, keSlide])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={jalur}
        onScroll={(e) => {
          const el = e.currentTarget
          setAktif(Math.round(el.scrollLeft / el.clientWidth))
        }}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="korsel"
      >
        {children.map((anak, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`${labelSlide} ${i + 1} dari ${children.length}`}
          >
            {anak}
          </div>
        ))}
      </div>

      <Tombol
        varian="garis"
        ukuran="ikon"
        onClick={() => keSlide(aktif - 1)}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 shadow-raised"
      >
        <ChevronLeft />
      </Tombol>
      <Tombol
        varian="garis"
        ukuran="ikon"
        onClick={() => keSlide(aktif + 1)}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 shadow-raised"
      >
        <ChevronRight />
      </Tombol>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {children.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => keSlide(i)}
            aria-label={`Ke ${labelSlide.toLowerCase()} ${i + 1}`}
            aria-current={i === aktif}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === aktif ? 'w-6 bg-primary' : 'w-1.5 bg-foreground/25 hover:bg-foreground/40',
            )}
          />
        ))}
      </div>
    </div>
  )
}
