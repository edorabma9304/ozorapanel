import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatAngka } from '@/lib/format'

/**
 * Peta gelembung Indonesia — SVG murni, tanpa pustaka peta.
 *
 * Bentuk pulaunya SENGAJA disederhanakan (poligon kasar), cukup untuk dikenali
 * sebagai Indonesia dan untuk menempatkan gelembung per provinsi. Ini bukan peta
 * kartografis: jangan dipakai untuk apa pun yang butuh batas wilayah akurat.
 * Kalau butuh presisi, ganti isi <g id="pulau"> dengan path dari berkas GeoJSON.
 */

const PULAU = [
  // Sumatera
  'M74 96 L96 88 L124 116 L150 150 L176 176 L206 214 L236 250 L252 286 L240 300 L214 274 L186 240 L156 206 L128 168 L100 134 L74 110 Z',
  // Kalimantan
  'M286 152 L338 140 L392 152 L428 182 L436 224 L414 258 L370 272 L322 262 L292 234 L278 196 Z',
  // Jawa
  'M272 322 L318 314 L366 320 L408 316 L442 326 L440 344 L398 348 L352 344 L306 348 L274 340 Z',
  // Sulawesi
  'M468 168 L490 160 L500 190 L516 176 L534 186 L524 218 L502 232 L512 262 L494 290 L474 284 L482 250 L462 226 L470 198 Z',
  // Papua
  'M646 218 L692 206 L744 220 L758 252 L740 288 L698 302 L660 292 L640 262 Z',
  // Maluku
  'M586 236 L604 230 L612 250 L598 262 Z',
  'M596 274 L616 268 L622 288 L602 296 Z',
  // Bali & Nusa Tenggara
  'M452 344 L466 342 L468 354 L452 356 Z',
  'M486 346 L516 342 L520 356 L488 358 Z',
  'M534 352 L578 348 L582 366 L536 370 Z',
]

export type TitikPeta = {
  kode: string
  nama: string
  nilai: number
  x: number
  y: number
}

export function PetaIndonesia({
  titik,
  satuan = 'transaksi',
  className,
}: {
  titik: TitikPeta[]
  satuan?: string
  className?: string
}) {
  const [sorot, setSorot] = useState<TitikPeta | null>(null)
  const maks = Math.max(...titik.map((t) => t.nilai), 1)

  // Akar kuadrat supaya LUAS gelembung sebanding dengan nilai, bukan jari-jarinya —
  // memakai jari-jari langsung membuat nilai besar terlihat berlebihan.
  const jari = (n: number) => 5 + Math.sqrt(n / maks) * 20

  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 780 400" className="w-full" role="img" aria-label={`Sebaran ${satuan} per provinsi`}>
        <title>Sebaran {satuan} per provinsi di Indonesia</title>

        <g id="pulau">
          {PULAU.map((d, i) => (
            <path key={i} d={d} className="fill-muted stroke-border" strokeWidth="1.5" />
          ))}
        </g>

        <g id="gelembung">
          {titik.map((t) => {
            const aktif = sorot?.kode === t.kode
            return (
              <g key={t.kode}>
                <circle
                  cx={t.x}
                  cy={t.y}
                  r={jari(t.nilai)}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    aktif ? 'fill-primary/70' : 'fill-primary/35',
                  )}
                  stroke="var(--color-primary)"
                  strokeWidth={aktif ? 2.5 : 1.5}
                  onMouseEnter={() => setSorot(t)}
                  onMouseLeave={() => setSorot(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${t.nama}: ${formatAngka(t.nilai)} ${satuan}`}
                  onFocus={() => setSorot(t)}
                  onBlur={() => setSorot(null)}
                />
              </g>
            )
          })}
        </g>
      </svg>

      {sorot ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-card border border-border bg-popover px-3 py-2 shadow-raised"
          style={{ left: `${(sorot.x / 780) * 100}%`, top: `${(sorot.y / 400) * 100}%` }}
          role="status"
        >
          <p className="whitespace-nowrap text-xs font-bold">{sorot.nama}</p>
          <p className="whitespace-nowrap text-xs text-muted-foreground">
            {formatAngka(sorot.nilai)} {satuan}
          </p>
        </div>
      ) : null}
    </div>
  )
}
