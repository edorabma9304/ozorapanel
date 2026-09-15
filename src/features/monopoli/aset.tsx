/**
 * Aset visual permainan.
 *
 * Gambar PNG dibaca dari `public/permainan/monopoli/<nama>.png`. Bila berkas
 * belum ada, komponen otomatis menggambar versi SVG bergaya kartun yang
 * sama palet warnanya — jadi papan tetap tampil utuh sebelum aset dipotong
 * dan diunggah. Daftar nama berkas ada di README folder tersebut.
 *
 * Warna di berkas ini adalah DATA permainan (harus sama dengan warna pion
 * PNG), bukan warna antarmuka — karena itu ditulis heksadesimal, bukan token.
 */
import { useSyncExternalStore, type ReactNode } from 'react'
import type { BentukPion, WarnaTim } from './tipe'

export const DASAR_ASET = '/permainan/monopoli/'

export const WARNA_TIM_HEX: Record<WarnaTim, { nama: string; isi: string; gelap: string; terang: string }> = {
  merah: { nama: 'Merah', isi: '#e53935', gelap: '#9f1d1a', terang: '#ff7b6e' },
  biru: { nama: 'Biru', isi: '#1e88e5', gelap: '#0d47a1', terang: '#6ec0ff' },
  hijau: { nama: 'Hijau', isi: '#43a047', gelap: '#1b5e20', terang: '#8ee08f' },
  kuning: { nama: 'Kuning', isi: '#fdd835', gelap: '#c58f00', terang: '#fff59d' },
  ungu: { nama: 'Ungu', isi: '#8e24aa', gelap: '#4a148c', terang: '#ce7ce6' },
  oranye: { nama: 'Oranye', isi: '#fb8c00', gelap: '#c65100', terang: '#ffbd5c' },
  pink: { nama: 'Pink', isi: '#ec407a', gelap: '#ad1457', terang: '#f9a0c1' },
  sian: { nama: 'Sian', isi: '#26c6da', gelap: '#00778a', terang: '#8ff0fb' },
}

export const NAMA_ASET = {
  kartuKesempatan: 'kartu-kesempatan',
  kartuHarta: 'kartu-harta',
  kartuPerjalanan: 'kartu-perjalanan',
  petakPajak: 'petak-pajak',
  petakBonus: 'petak-bonus',
  petakParkir: 'petak-parkir',
  petakMulai: 'petak-mulai',
  petakPenjara: 'petak-penjara',
  ikonDunia: 'ikon-dunia',
  ikonPeti: 'ikon-peti',
  ikonTanya: 'ikon-tanya',
  ikonBintang: 'ikon-bintang',
  dadu: 'dadu',
  bangunan: ['', 'bangunan-rumah', 'bangunan-vila', 'bangunan-menara', 'bangunan-pencakar'],
  uang: (pecahan: number) => `uang-${pecahan}`,
  pion: (warna: WarnaTim, bentuk: BentukPion) => `pion-${warna}-${bentuk}`,
} as const

// ------------------------------------------------------------ Pemeriksa ketersediaan
const cache = new Map<string, boolean>()
const sedang = new Set<string>()
const pendengar = new Set<() => void>()

function periksa(nama: string) {
  if (cache.has(nama) || sedang.has(nama) || typeof Image === 'undefined') return
  sedang.add(nama)
  const img = new Image()
  const selesai = (ada: boolean) => () => {
    cache.set(nama, ada)
    sedang.delete(nama)
    for (const p of pendengar) p()
  }
  img.addEventListener('load', selesai(true), { once: true })
  img.addEventListener('error', selesai(false), { once: true })
  img.src = `${DASAR_ASET}${nama}.png`
}

function langganan(cb: () => void) {
  pendengar.add(cb)
  return () => pendengar.delete(cb)
}

/** `true` bila PNG ada, `false` bila tidak, `undefined` selagi diperiksa. */
export function useAsetTersedia(nama: string): boolean | undefined {
  periksa(nama)
  return useSyncExternalStore(
    langganan,
    () => cache.get(nama),
    () => false,
  )
}

/**
 * Gambar aset di dalam SVG. `cadangan` digambar dalam kotak 100×100 dan
 * diskalakan ke `lebar`×`tinggi`.
 */
export function Aset({
  nama,
  x = 0,
  y = 0,
  lebar,
  tinggi,
  cadangan,
  className,
}: {
  nama: string
  x?: number
  y?: number
  lebar: number
  tinggi: number
  cadangan: ReactNode
  className?: string
}) {
  const ada = useAsetTersedia(nama)
  if (ada) {
    return (
      <image
        href={`${DASAR_ASET}${nama}.png`}
        x={x}
        y={y}
        width={lebar}
        height={tinggi}
        preserveAspectRatio="xMidYMid meet"
        className={className}
      />
    )
  }
  return (
    <svg x={x} y={y} width={lebar} height={tinggi} viewBox="0 0 100 100" className={className} overflow="visible">
      {cadangan}
    </svg>
  )
}

// ------------------------------------------------------------ Gambar cadangan (kartun)
const GARIS = '#1f2a44'

export function PionCadangan({ warna, bentuk }: { warna: WarnaTim; bentuk: BentukPion }) {
  const w = WARNA_TIM_HEX[warna]
  const id = `pion-${warna}-${bentuk}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={w.terang} />
          <stop offset="0.55" stopColor={w.isi} />
          <stop offset="1" stopColor={w.gelap} />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="30" ry="6" fill="rgba(0,0,0,0.22)" />
      <path d="M22 88 Q22 72 34 68 L66 68 Q78 72 78 88 Z" fill={`url(#${id})`} stroke={GARIS} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M38 68 L36 48 Q50 44 64 48 L62 68 Z" fill={`url(#${id})`} stroke={GARIS} strokeWidth="3.5" strokeLinejoin="round" />
      {bentuk === 'bulat' ? (
        <>
          <circle cx="50" cy="30" r="21" fill={`url(#${id})`} stroke={GARIS} strokeWidth="3.5" />
          <ellipse cx="41" cy="22" rx="6" ry="4" fill="white" opacity="0.8" />
        </>
      ) : (
        <>
          <path d="M50 4 L74 34 L50 52 L26 34 Z" fill={`url(#${id})`} stroke={GARIS} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M50 4 L50 52 M26 34 L74 34" stroke={w.gelap} strokeWidth="2" opacity="0.6" />
          <path d="M42 18 L50 9 L58 18 Z" fill="white" opacity="0.7" />
        </>
      )}
    </g>
  )
}

export function BangunanCadangan({ tingkat }: { tingkat: number }) {
  switch (tingkat) {
    case 1:
      return (
        <g>
          <path d="M20 50 L50 22 L80 50 Z" fill="#e53935" stroke={GARIS} strokeWidth="4" strokeLinejoin="round" />
          <rect x="28" y="50" width="44" height="34" fill="#ef5350" stroke={GARIS} strokeWidth="4" />
          <rect x="44" y="62" width="12" height="22" fill="#ffcdd2" stroke={GARIS} strokeWidth="3" />
          <rect x="60" y="30" width="8" height="14" fill="#b71c1c" stroke={GARIS} strokeWidth="3" />
        </g>
      )
    case 2:
      return (
        <g>
          <path d="M14 48 L50 18 L86 48 Z" fill="#2e7d32" stroke={GARIS} strokeWidth="4" strokeLinejoin="round" />
          <rect x="22" y="48" width="56" height="36" fill="#dcedc8" stroke={GARIS} strokeWidth="4" />
          <rect x="30" y="56" width="12" height="12" fill="#a5d6a7" stroke={GARIS} strokeWidth="3" />
          <rect x="58" y="56" width="12" height="12" fill="#a5d6a7" stroke={GARIS} strokeWidth="3" />
          <rect x="44" y="66" width="12" height="18" fill="#43a047" stroke={GARIS} strokeWidth="3" />
          <circle cx="16" cy="84" r="8" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
          <circle cx="84" cy="84" r="8" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
        </g>
      )
    case 3:
      return (
        <g>
          <rect x="30" y="20" width="40" height="66" fill="#1e88e5" stroke={GARIS} strokeWidth="4" />
          <rect x="40" y="8" width="20" height="14" fill="#1565c0" stroke={GARIS} strokeWidth="3" />
          {[28, 42, 56, 70].map((y) => (
            <g key={y}>
              <rect x="36" y={y} width="10" height="8" fill="#bbdefb" />
              <rect x="54" y={y} width="10" height="8" fill="#bbdefb" />
            </g>
          ))}
          <circle cx="22" cy="86" r="7" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
          <circle cx="78" cy="86" r="7" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
        </g>
      )
    default:
      return (
        <g>
          <rect x="34" y="14" width="32" height="74" fill="#ffb300" stroke={GARIS} strokeWidth="4" />
          <rect x="26" y="44" width="10" height="44" fill="#fb8c00" stroke={GARIS} strokeWidth="3" />
          <rect x="64" y="44" width="10" height="44" fill="#fb8c00" stroke={GARIS} strokeWidth="3" />
          <rect x="44" y="4" width="12" height="12" fill="#ffd54f" stroke={GARIS} strokeWidth="3" />
          <line x1="50" y1="4" x2="50" y2="-6" stroke={GARIS} strokeWidth="3" />
          {[22, 34, 46, 58, 70].map((y) => (
            <rect key={y} x="40" y={y} width="20" height="6" fill="#4fc3f7" />
          ))}
          <circle cx="20" cy="88" r="7" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
          <circle cx="80" cy="88" r="7" fill="#66bb6a" stroke={GARIS} strokeWidth="3" />
        </g>
      )
  }
}

export function IkonTanyaCadangan() {
  return (
    <g>
      <circle cx="50" cy="50" r="42" fill="#e91e63" stroke={GARIS} strokeWidth="4" />
      <ellipse cx="38" cy="32" rx="10" ry="6" fill="white" opacity="0.5" />
      <text x="50" y="68" textAnchor="middle" fontSize="56" fontWeight="900" fill="white" fontFamily="inherit">?</text>
    </g>
  )
}

export function IkonPetiCadangan() {
  return (
    <g>
      <path d="M14 42 Q14 20 50 20 Q86 20 86 42 L86 48 L14 48 Z" fill="#8d5524" stroke={GARIS} strokeWidth="4" />
      <rect x="14" y="48" width="72" height="34" rx="4" fill="#a0672d" stroke={GARIS} strokeWidth="4" />
      <rect x="10" y="44" width="80" height="10" fill="#fbc02d" stroke={GARIS} strokeWidth="3" />
      <rect x="42" y="46" width="16" height="18" rx="3" fill="#fbc02d" stroke={GARIS} strokeWidth="3" />
      <circle cx="50" cy="54" r="3" fill={GARIS} />
      <path d="M32 16 L36 6 M50 14 L50 2 M68 16 L64 6" stroke="#fdd835" strokeWidth="4" strokeLinecap="round" />
    </g>
  )
}

export function IkonDuniaCadangan() {
  return (
    <g>
      <circle cx="50" cy="52" r="36" fill="#42a5f5" stroke={GARIS} strokeWidth="4" />
      <path d="M30 34 Q40 24 52 30 Q58 40 48 46 Q36 48 30 34 Z" fill="#66bb6a" stroke={GARIS} strokeWidth="2.5" />
      <path d="M56 54 Q70 50 76 62 Q70 76 58 72 Q52 62 56 54 Z" fill="#66bb6a" stroke={GARIS} strokeWidth="2.5" />
      <path d="M30 60 Q38 58 40 68 Q34 76 28 70 Z" fill="#66bb6a" stroke={GARIS} strokeWidth="2.5" />
      <path d="M8 60 Q50 96 94 46" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      <path d="M78 34 L94 26 L86 42 L80 40 Z" fill="white" stroke={GARIS} strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
}

export function IkonBintangCadangan() {
  return (
    <path
      d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z"
      fill="#fdd835"
      stroke={GARIS}
      strokeWidth="4"
      strokeLinejoin="round"
    />
  )
}

export function IkonPajakCadangan() {
  return (
    <g>
      <path d="M36 26 Q50 14 64 26 L58 34 L42 34 Z" fill="#37474f" stroke={GARIS} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M42 34 L58 34 Q84 48 78 76 Q70 92 50 92 Q30 92 22 76 Q16 48 42 34 Z" fill="#455a64" stroke={GARIS} strokeWidth="4" strokeLinejoin="round" />
      <text x="50" y="76" textAnchor="middle" fontSize="34" fontWeight="900" fill="#fdd835" fontFamily="inherit">$</text>
    </g>
  )
}

export function IkonParkirCadangan() {
  return (
    <g>
      <rect x="18" y="14" width="64" height="72" rx="12" fill="#1e88e5" stroke={GARIS} strokeWidth="4" />
      <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="900" fill="white" fontFamily="inherit">P</text>
    </g>
  )
}

export function IkonPenjaraCadangan() {
  return (
    <g>
      <rect x="14" y="14" width="72" height="72" rx="8" fill="#ffe0b2" stroke={GARIS} strokeWidth="4" />
      <circle cx="50" cy="42" r="10" fill="#ffccbc" stroke={GARIS} strokeWidth="3" />
      <rect x="36" y="54" width="28" height="26" rx="4" fill="#eeeeee" stroke={GARIS} strokeWidth="3" />
      <path d="M36 62 H64 M36 70 H64" stroke={GARIS} strokeWidth="3" />
      {[26, 42, 58, 74].map((x) => (
        <rect key={x} x={x} y="14" width="6" height="72" fill="#546e7a" stroke={GARIS} strokeWidth="2" />
      ))}
    </g>
  )
}

export function IkonMulaiCadangan() {
  return (
    <g>
      <text x="50" y="46" textAnchor="middle" fontSize="40" fontWeight="900" fill="white" stroke={GARIS} strokeWidth="2.5" fontFamily="inherit">GO</text>
      <path d="M14 66 H70 L62 56 L88 70 L62 84 L70 74 H14 Z" fill="#43a047" stroke={GARIS} strokeWidth="3.5" strokeLinejoin="round" />
    </g>
  )
}

export function IkonPesawatCadangan() {
  return (
    <g>
      <circle cx="50" cy="50" r="40" fill="#64b5f6" stroke={GARIS} strokeWidth="4" />
      <path d="M22 62 L50 44 L38 22 L46 20 L64 40 L82 34 L84 40 L70 52 L74 76 L68 78 L56 60 L36 68 L28 78 L24 76 L26 66 Z" fill="white" stroke={GARIS} strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
}

/** Satu mata dadu, digambar SVG supaya bisa dianimasikan per nilai. */
export function Dadu({
  nilai,
  x = 0,
  y = 0,
  ukuran = 44,
  berputar = false,
}: {
  nilai: number
  x?: number
  y?: number
  ukuran?: number
  berputar?: boolean
}) {
  const titik: Record<number, Array<[number, number]>> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
  }
  return (
    <svg
      x={x}
      y={y}
      width={ukuran}
      height={ukuran}
      viewBox="0 0 100 100"
      className={berputar ? 'monopoli-dadu-putar' : undefined}
      style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
    >
      <rect x="6" y="6" width="88" height="88" rx="20" fill="#fafafa" stroke={GARIS} strokeWidth="6" />
      {(titik[nilai] ?? []).map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill={GARIS} />
      ))}
    </svg>
  )
}
