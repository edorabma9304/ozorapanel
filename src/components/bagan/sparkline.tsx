import { useId } from 'react'

/**
 * Sparkline SVG murni — TANPA pustaka bagan.
 *
 * Kartu statistik dipakai hampir di semua halaman; kalau grafik miniaturnya
 * memakai ApexCharts, setiap halaman ikut menarik ~256 KB (gzip). Komponen ini
 * menggambar sendiri dengan sekitar 30 baris kode dan nol dependensi.
 */
export function Sparkline({
  nilai,
  warna = 'currentColor',
  tinggi = 56,
  lebar = 240,
  jenis = 'area',
  className,
}: {
  nilai: number[]
  warna?: string
  tinggi?: number
  lebar?: number
  jenis?: 'area' | 'garis' | 'batang'
  className?: string
}) {
  const id = useId()
  if (nilai.length < 2) return <div style={{ height: tinggi }} className={className} />

  const min = Math.min(...nilai)
  const maks = Math.max(...nilai)
  const rentang = maks - min || 1
  const pad = 3
  const h = tinggi - pad * 2

  const x = (i: number) => (i / (nilai.length - 1)) * lebar
  const y = (v: number) => pad + h - ((v - min) / rentang) * h

  if (jenis === 'batang') {
    const lebarBatang = (lebar / nilai.length) * 0.62
    return (
      <svg
        viewBox={`0 0 ${lebar} ${tinggi}`}
        preserveAspectRatio="none"
        className={className}
        style={{ height: tinggi, width: '100%' }}
        aria-hidden
      >
        {nilai.map((v, i) => {
          const atas = y(v)
          return (
            <rect
              key={`${i}-${v}`}
              x={x(i) - lebarBatang / 2}
              y={atas}
              width={lebarBatang}
              height={Math.max(1, tinggi - pad - atas)}
              rx={Math.min(2, lebarBatang / 2)}
              fill={warna}
              opacity={0.85}
            />
          )
        })}
      </svg>
    )
  }

  const titik = nilai.map((v, i) => `${x(i)},${y(v)}`).join(' L ')
  const garis = `M ${titik}`
  const area = `${garis} L ${lebar},${tinggi} L 0,${tinggi} Z`

  return (
    <svg
      viewBox={`0 0 ${lebar} ${tinggi}`}
      preserveAspectRatio="none"
      className={className}
      style={{ height: tinggi, width: '100%' }}
      aria-hidden
    >
      {jenis === 'area' ? (
        <>
          <defs>
            <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={warna} stopOpacity="0.32" />
              <stop offset="100%" stopColor={warna} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#grad-${id})`} />
        </>
      ) : null}
      <path
        d={garis}
        fill="none"
        stroke={warna}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
