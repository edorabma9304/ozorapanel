import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Lambang Ozora — huruf "O" berupa cincin terputus dengan satu titik orbit.
 *
 * Dibuat sebagai SVG inline dengan gradien, bukan berkas gambar, supaya:
 *  - tajam di semua kepadatan layar,
 *  - warnanya ikut token merek yang bisa diganti administrator,
 *  - tetap terbaca sampai ukuran 16px (favicon).
 */
export function Lambang({
  ukuran = 32,
  warnaUtama = '#5d87ff',
  warnaAksen = '#49beff',
  className,
}: {
  ukuran?: number
  warnaUtama?: string
  warnaAksen?: string
  className?: string
}) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 32 32"
      width={ukuran}
      height={ukuran}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={warnaUtama} />
          <stop offset="100%" stopColor={warnaAksen} />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="9" fill={`url(#g-${id})`} />

      {/* Cincin terputus di kanan atas — ruang untuk titik orbit */}
      <path
        d="M16 7.5a8.5 8.5 0 1 0 8.24 6.4"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="24.4" cy="8.6" r="2.9" fill="#fff" />
    </svg>
  )
}

/** Versi statis untuk berkas favicon.svg — tanpa React, warna tetap. */
export const LAMBANG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5d87ff"/><stop offset="100%" stop-color="#49beff"/>
  </linearGradient></defs>
  <rect width="32" height="32" rx="9" fill="url(#g)"/>
  <path d="M16 7.5a8.5 8.5 0 1 0 8.24 6.4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="24.4" cy="8.6" r="2.9" fill="#fff"/>
</svg>`
