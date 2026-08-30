import { lazy, Suspense, useMemo } from 'react'
import type { ApexOptions } from 'apexcharts'
import { useTema } from '@/lib/tema'
import { Rangka } from '@/components/ui/rangka'

/**
 * ApexCharts berat (~140 KB gz), jadi selalu dimuat malas dan dipecah
 * ke chunk `vendor-charts` (lihat vite.config.ts). Halaman tanpa bagan
 * tidak ikut menanggung ukurannya.
 */
const ApexChart = lazy(() => import('react-apexcharts'))

/** Referensi stabil — objek literal sebagai nilai bawaan memicu render ulang. */
const TANPA_OPSI: ApexOptions = {}

export type JenisBagan =
  | 'line' | 'area' | 'bar' | 'donut' | 'pie' | 'radialBar' | 'radar' | 'scatter' | 'heatmap'
  | 'treemap' | 'candlestick' | 'polarArea'

/**
 * JEBAKAN: jenis `radar` TIDAK menerima nilai array per-deret untuk
 * `fill.opacity`, `markers.size`, atau `stroke.dashArray`. ApexCharts akan
 * menghasilkan NaN dan poligonnya gagal digambar. Pakai nilai skalar.
 */

/** Palet bagan — mengikuti token tema, bukan warna acak. */
export const PALET_BAGAN = ['#5d87ff', '#49beff', '#13deb9', '#ffae1f', '#fa896b', '#539bff']

function opsiDasar(gelap: boolean): ApexOptions {
  const kabur = gelap ? '#9aa7bd' : '#5a6a85'
  const garis = gelap ? '#333c4b' : '#e5eaef'
  return {
    chart: {
      fontFamily: "'Plus Jakarta Sans Variable', sans-serif",
      foreColor: kabur,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 350 },
      background: 'transparent',
    },
    theme: { mode: gelap ? 'dark' : 'light' },
    colors: PALET_BAGAN,
    grid: { borderColor: garis, strokeDashArray: 4, padding: { left: 4, right: 4 } },
    dataLabels: { enabled: false },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontWeight: 600,
      markers: { size: 6 },
      itemMargin: { horizontal: 8 },
    },
    tooltip: { theme: gelap ? 'dark' : 'light' },
    stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontWeight: 500 } } },
  }
}

/** Gabung opsi bawaan dengan opsi khusus halaman (dalam saja, bukan array). */
function gabung(a: ApexOptions, b: ApexOptions): ApexOptions {
  const hasil: Record<string, unknown> = { ...a }
  for (const [kunci, nilai] of Object.entries(b)) {
    const lama = hasil[kunci]
    hasil[kunci] =
      lama && nilai && typeof lama === 'object' && typeof nilai === 'object' &&
      !Array.isArray(lama) && !Array.isArray(nilai)
        ? gabung(lama as ApexOptions, nilai as ApexOptions)
        : nilai
  }
  return hasil as ApexOptions
}

export function Bagan({
  jenis,
  deret,
  opsi = TANPA_OPSI,
  tinggi = 300,
  className,
}: {
  jenis: JenisBagan
  deret: ApexOptions['series']
  opsi?: ApexOptions
  tinggi?: number
  className?: string
}) {
  const { efektif } = useTema()
  const gelap = efektif === 'gelap'

  const opsiAkhir = useMemo(
    () => gabung(opsiDasar(gelap), { ...opsi, chart: { ...opsi.chart, type: jenis } }),
    [gelap, opsi, jenis],
  )

  return (
    <div className={className}>
      <Suspense fallback={<Rangka style={{ height: tinggi }} className="w-full" />}>
        <ApexChart
          // Ganti key saat tema berubah supaya Apex menggambar ulang dengan warna baru.
          key={efektif}
          type={jenis}
          height={tinggi}
          series={deret}
          options={opsiAkhir}
        />
      </Suspense>
    </div>
  )
}

/** Sparkline ringan tanpa ApexCharts — lihat ./sparkline.tsx */
export { Sparkline } from './sparkline'
