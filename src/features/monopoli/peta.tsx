/**
 * Peta dunia interaktif — papan permainan dalam SVG.
 *
 * - Geser (drag) untuk memindahkan pandangan, gulir untuk memperbesar.
 * - Petak bisa diklik & disorot; keterangan tampil sebagai tooltip HTML.
 * - Pion bergerak dengan transisi CSS; induk mengatur langkah demi langkah
 *   lewat `posisiTampil` sehingga mesin permainan tetap murni.
 * - Bagian tengah papan menampilkan peta dunia kartun dengan pin wilayah
 *   tiap tim, tumpukan kartu, dadu, dan pot Parkir Bebas.
 */
import { Eye, EyeOff, Focus, Minus, Plus, Scan } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as PointerEventReact, type ReactNode } from 'react'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import {
  Aset, BangunanCadangan, IkonBintangCadangan, IkonMulaiCadangan, IkonPajakCadangan,
  IkonParkirCadangan, IkonPenjaraCadangan, IkonPesawatCadangan, IkonPetiCadangan, IkonTanyaCadangan, NAMA_ASET,
  PionCadangan, WARNA_TIM_HEX,
} from './aset'
import { kelompokLengkap, papanDari, sewaPetak } from './mesin'
import { UKURAN_SUDUT, adalahBandara, adalahProperti } from './papan'
import { TINGKAT_BANGUNAN, type Papan, type Permainan, type Petak } from './tipe'

const GARIS = '#1f2a44'
const KERTAS = '#fffaf0'
const WARNA_PETAK: Partial<Record<Petak['jenis'], string>> = {
  kesempatan: '#ffe3ec',
  harta: '#e3f2ff',
  pajak: '#f1ece2',
  bonus: '#fff4c2',
  bandara: '#e6f7ff',
  mulai: '#dff5e1',
  penjara: '#ffe7d1',
  parkir: '#e3f0ff',
  'masuk-penjara': '#ffe0e0',
}

type KotakPandang = { x: number; y: number; w: number; h: number }

export type PropsPeta = {
  permainan: Permainan
  /** Posisi pion yang sedang ditampilkan (bisa berbeda dari mesin saat animasi). */
  posisiTampil: Record<number, number>
  petakDipilih: number | null
  onPilihPetak: (id: number | null) => void
  /** Ubah nilai ini untuk memusatkan pandangan ke petak tertentu. */
  fokus?: { petak: number; kunci: number } | null
  /** Panel keputusan yang ditanam di lubang tengah papan. */
  hud?: ReactNode
  /** Menu & pemberitahuan yang melayang di atas papan (koordinat layar). */
  lapisan?: ReactNode
  /** Kamera mengikuti pion yang sedang berjalan. */
  ikuti?: boolean
  onUbahIkuti?: (v: boolean) => void
  className?: string
}

export function PetaDunia({
  permainan, posisiTampil, petakDipilih, onPilihPetak, fokus, hud, lapisan, ikuti = false, onUbahIkuti, className,
}: PropsPeta) {
  const papan = papanDari(permainan)
  const svgRef = useRef<SVGSVGElement>(null)
  const bingkaiRef = useRef<HTMLDivElement>(null)
  const penuh = useMemo<KotakPandang>(() => ({ x: -20, y: -20, w: papan.lebar + 40, h: papan.tinggi + 40 }), [papan])
  const [pandang, setPandang] = useState<KotakPandang>(penuh)
  const [tooltip, setTooltip] = useState<{ petak: number; x: number; y: number; lebar: number; tinggi: number } | null>(null)
  const seret = useRef<{ x: number; y: number; awal: KotakPandang; bergerak: boolean } | null>(null)
  const animasi = useRef<number | null>(null)

  // Papan berganti ukuran (jumlah tim berbeda) → pandangan kembali penuh.
  const [penuhTerakhir, setPenuhTerakhir] = useState(penuh)
  if (penuhTerakhir !== penuh) {
    setPenuhTerakhir(penuh)
    setPandang(penuh)
  }

  const keTitikSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const titik = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: titik.x, y: titik.y }
  }, [])

  const tweenKe = useCallback((tujuan: KotakPandang) => {
    if (animasi.current) cancelAnimationFrame(animasi.current)
    const mulai = performance.now()
    const durasi = 260
    setPandang((awal) => {
      const langkah = (kini: number) => {
        const t = Math.min(1, (kini - mulai) / durasi)
        const e = 1 - Math.pow(1 - t, 3)
        setPandang({
          x: awal.x + (tujuan.x - awal.x) * e,
          y: awal.y + (tujuan.y - awal.y) * e,
          w: awal.w + (tujuan.w - awal.w) * e,
          h: awal.h + (tujuan.h - awal.h) * e,
        })
        if (t < 1) animasi.current = requestAnimationFrame(langkah)
      }
      animasi.current = requestAnimationFrame(langkah)
      return awal
    })
  }, [])

  const perbesar = useCallback(
    (faktor: number, pusat?: { x: number; y: number }) => {
      setPandang((v) => {
        const wBaru = Math.min(penuh.w * 1.2, Math.max(260, v.w / faktor))
        const skala = wBaru / v.w
        const px = pusat?.x ?? v.x + v.w / 2
        const py = pusat?.y ?? v.y + v.h / 2
        return { x: px - (px - v.x) * skala, y: py - (py - v.y) * skala, w: wBaru, h: v.h * skala }
      })
    },
    [penuh.w],
  )

  // Fokus ke petak (mis. pion aktif) saat induk meminta.
  useEffect(() => {
    if (!fokus) return
    const p = papan.petak[fokus.petak]
    if (!p) return
    const w = Math.min(penuh.w, 720)
    const h = w * (penuh.h / penuh.w)
    tweenKe({ x: p.x + p.lebar / 2 - w / 2, y: p.y + p.tinggi / 2 - h / 2, w, h })
  }, [fokus, papan, penuh, tweenKe])

  // Gulir = zoom. Dipasang manual (bukan onWheel React) supaya bisa
  // memakai `passive: false` dan mencegah halaman ikut menggulir.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const pusat = keTitikSvg(e.clientX, e.clientY)
      perbesar(e.deltaY < 0 ? 1.15 : 1 / 1.15, pusat)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [keTitikSvg, perbesar])

  function onPointerDown(e: PointerEventReact<SVGSVGElement>) {
    if (e.button !== 0) return
    seret.current = { x: e.clientX, y: e.clientY, awal: pandang, bergerak: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEventReact<SVGSVGElement>) {
    const s = seret.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!s.bergerak && Math.hypot(dx, dy) < 4) return
    s.bergerak = true
    const rect = e.currentTarget.getBoundingClientRect()
    const rasio = pandang.w / rect.width
    setPandang({ ...s.awal, x: s.awal.x - dx * rasio, y: s.awal.y - dy * rasio })
  }

  function onPointerUp(e: PointerEventReact<SVGSVGElement>) {
    const s = seret.current
    seret.current = null
    if (s && !s.bergerak && e.target === e.currentTarget) onPilihPetak(null)
  }

  function onMasukPetak(id: number, e: PointerEventReact<SVGGElement>) {
    const rect = bingkaiRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ petak: id, x: e.clientX - rect.left, y: e.clientY - rect.top, lebar: rect.width, tinggi: rect.height })
  }

  // Kelompokkan pion per petak untuk menghitung posisi agar tidak bertumpuk.
  const pionPerPetak = useMemo(() => {
    const peta = new Map<number, number[]>()
    for (const pm of permainan.pemain) {
      if (permainan.tim[pm.tim]!.gugur) continue
      const pos = posisiTampil[pm.id] ?? pm.posisi
      const daftar = peta.get(pos) ?? []
      daftar.push(pm.id)
      peta.set(pos, daftar)
    }
    return peta
  }, [permainan.pemain, permainan.tim, posisiTampil])

  const pemainAktif = permainan.pemain[permainan.pemainAktif]!

  return (
    <div
      ref={bingkaiRef}
      className={cn('relative overflow-hidden rounded-card border border-border bg-[#0f4c81] shadow-soft', className)}
    >
      <svg
        ref={svgRef}
        viewBox={`${pandang.x} ${pandang.y} ${pandang.w} ${pandang.h}`}
        className="block h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (seret.current = null)}
        role="img"
        aria-label="Papan permainan Jelajah Dunia"
      >
        <defs>
          <radialGradient id="laut" cx="50%" cy="45%" r="70%">
            <stop offset="0" stopColor="#3aa0e8" />
            <stop offset="1" stopColor="#0f4c81" />
          </radialGradient>
          <pattern id="ombak" width="60" height="30" patternUnits="userSpaceOnUse">
            <path d="M0 15 Q15 5 30 15 T60 15" fill="none" stroke="white" strokeWidth="1.5" opacity="0.14" />
          </pattern>
          <filter id="bayang" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Lautan */}
        <rect x={-400} y={-400} width={papan.lebar + 800} height={papan.tinggi + 800} fill="url(#laut)" />
        <rect x={-400} y={-400} width={papan.lebar + 800} height={papan.tinggi + 800} fill="url(#ombak)" />

        {/* Bingkai papan */}
        <rect x={-10} y={-10} width={papan.lebar + 20} height={papan.tinggi + 20} rx={22} fill="#f6e7c8" stroke={GARIS} strokeWidth={5} filter="url(#bayang)" />

        <TengahPapan papan={papan} permainan={permainan} hud={hud} />

        {papan.petak.map((petak) => (
          <GambarPetak
            key={petak.id}
            petak={petak}
            papan={papan}
            permainan={permainan}
            dipilih={petakDipilih === petak.id}
            onKlik={() => onPilihPetak(petak.id)}
            onMasuk={(e) => onMasukPetak(petak.id, e)}
            onKeluar={() => setTooltip(null)}
          />
        ))}

        {/* Pion — digambar terakhir supaya selalu di atas petak. */}
        {permainan.pemain.map((pm) => {
          const tim = permainan.tim[pm.tim]!
          if (tim.gugur) return null
          const pos = posisiTampil[pm.id] ?? pm.posisi
          const petak = papan.petak[pos]!
          const rekan = pionPerPetak.get(pos) ?? [pm.id]
          const urut = rekan.indexOf(pm.id)
          const ukuran = rekan.length <= 2 ? 44 : rekan.length <= 6 ? 34 : 26
          const kolom = Math.ceil(Math.sqrt(rekan.length))
          const baris = Math.ceil(rekan.length / kolom)
          const cx = petak.x + petak.lebar / 2
          const sudut = petak.lebar === UKURAN_SUDUT && petak.tinggi === UKURAN_SUDUT
          const cy = petak.y + petak.tinggi / 2 + (sudut ? 14 : petak.jenis === 'properti' || petak.jenis === 'bandara' ? 8 : 0)
          const ox = (urut % kolom - (kolom - 1) / 2) * (ukuran * 0.8)
          const oy = (Math.floor(urut / kolom) - (baris - 1) / 2) * (ukuran * 0.8)
          const aktif = pm.id === pemainAktif.id
          return (
            <g
              key={pm.id}
              className="monopoli-pion"
              style={{ transform: `translate(${cx + ox - ukuran / 2}px, ${cy + oy - ukuran / 2}px)` }}
              pointerEvents="none"
            >
              {aktif ? (
                <circle cx={ukuran / 2} cy={ukuran * 0.86} r={ukuran * 0.42} fill="none" stroke="#fff176" strokeWidth={4} className="monopoli-denyut" />
              ) : null}
              <Aset
                nama={NAMA_ASET.pion(tim.warna, pm.bentuk)}
                lebar={ukuran}
                tinggi={ukuran}
                cadangan={<PionCadangan warna={tim.warna} bentuk={pm.bentuk} />}
              />
              {pm.diPenjara ? (
                <text x={ukuran / 2} y={-4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#c62828">🔒</text>
              ) : null}
            </g>
          )
        })}
      </svg>

      {/* Kendali pandangan */}
      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-control bg-card/90 p-1 shadow-soft backdrop-blur">
        <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Perbesar" onClick={() => perbesar(1.3)}>
          <Plus />
        </Tombol>
        <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Perkecil" onClick={() => perbesar(1 / 1.3)}>
          <Minus />
        </Tombol>
        <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Tampilkan seluruh papan" onClick={() => tweenKe(penuh)}>
          <Scan />
        </Tombol>
        <Tombol
          varian="hantu"
          ukuran="ikon-sm"
          aria-label="Perbesar ke panel tengah"
          onClick={() => {
            const sisi = papan.lebar - 2 * UKURAN_SUDUT
            tweenKe({ x: UKURAN_SUDUT, y: UKURAN_SUDUT, w: sisi, h: sisi })
          }}
        >
          <Focus />
        </Tombol>
        <Tombol
          varian={ikuti ? 'halus' : 'hantu'}
          ukuran="ikon-sm"
          aria-label="Kamera mengikuti pion"
          aria-pressed={ikuti}
          onClick={() => onUbahIkuti?.(!ikuti)}
        >
          {ikuti ? <Eye /> : <EyeOff />}
        </Tombol>
      </div>

      {lapisan}

      {tooltip ? (
        <TooltipPetak
          papan={papan}
          permainan={permainan}
          id={tooltip.petak}
          x={tooltip.x}
          y={tooltip.y}
          bingkai={{ lebar: tooltip.lebar, tinggi: tooltip.tinggi }}
        />
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ Petak
function GambarPetak({
  petak, papan, permainan, dipilih, onKlik, onMasuk, onKeluar,
}: {
  petak: Petak
  papan: Papan
  permainan: Permainan
  dipilih: boolean
  onKlik: () => void
  onMasuk: (e: PointerEventReact<SVGGElement>) => void
  onKeluar: () => void
}) {
  const { x, y, lebar, tinggi, sisi } = petak
  const milik = permainan.milik[petak.id]
  const pemilik = milik ? permainan.tim[milik.tim]! : null
  const warnaPemilik = pemilik ? WARNA_TIM_HEX[pemilik.warna] : null
  const sudut = lebar === UKURAN_SUDUT && tinggi === UKURAN_SUDUT

  // Pita warna wilayah di tepi DALAM petak; pita pemilik di tepi LUAR.
  const tebalPita = 24
  const pitaDalam =
    sisi === 'bawah' ? { x, y, w: lebar, h: tebalPita }
    : sisi === 'atas' ? { x, y: y + tinggi - tebalPita, w: lebar, h: tebalPita }
    : sisi === 'kiri' ? { x: x + lebar - tebalPita, y, w: tebalPita, h: tinggi }
    : { x, y, w: tebalPita, h: tinggi }
  const pitaLuar =
    sisi === 'bawah' ? { x, y: y + tinggi - 10, w: lebar, h: 10 }
    : sisi === 'atas' ? { x, y, w: lebar, h: 10 }
    : sisi === 'kiri' ? { x, y, w: 10, h: tinggi }
    : { x: x + lebar - 10, y, w: 10, h: tinggi }

  const wilayah = petak.wilayah !== undefined ? papan.wilayah[petak.wilayah] : undefined
  const warnaWilayah = wilayah ? WARNA_TIM_HEX[permainan.tim[wilayah.timAsal]!.warna] : null

  const ikonUkuran = sudut ? 84 : 44
  const pusatX = x + lebar / 2
  // Area isi (di luar pita dalam)
  const isiY = sisi === 'bawah' ? y + tebalPita : y
  const isiH = sisi === 'bawah' || sisi === 'atas' ? tinggi - tebalPita : tinggi
  const isiX = sisi === 'kanan' ? x + tebalPita : x
  const isiW = sisi === 'kiri' || sisi === 'kanan' ? lebar - tebalPita : lebar
  const tengahX = isiX + isiW / 2
  const tengahY = isiY + isiH / 2

  return (
    <g
      className="monopoli-petak cursor-pointer"
      onClick={(e) => {
        e.stopPropagation()
        onKlik()
      }}
      onPointerEnter={onMasuk}
      onPointerMove={onMasuk}
      onPointerLeave={onKeluar}
      onPointerDown={(e) => e.stopPropagation()}
      role="button"
      tabIndex={-1}
      aria-label={`${petak.nama}${pemilik ? `, milik ${pemilik.nama}` : ''}`}
    >
      <rect x={x} y={y} width={lebar} height={tinggi} rx={sudut ? 14 : 6} fill={WARNA_PETAK[petak.jenis] ?? KERTAS} stroke={GARIS} strokeWidth={2.5} />

      {adalahProperti(petak) && warnaWilayah ? (
        <>
          <rect x={pitaDalam.x} y={pitaDalam.y} width={pitaDalam.w} height={pitaDalam.h} fill={warnaWilayah.isi} stroke={GARIS} strokeWidth={2} />
          {milik && milik.tingkat > 0 ? (
            <Aset
              nama={NAMA_ASET.bangunan[milik.tingkat]!}
              x={pitaDalam.x + pitaDalam.w / 2 - 15}
              y={pitaDalam.y + pitaDalam.h / 2 - 15}
              lebar={30}
              tinggi={30}
              cadangan={<BangunanCadangan tingkat={milik.tingkat} />}
            />
          ) : null}
          <text x={tengahX} y={tengahY - 6} textAnchor="middle" fontSize={13} fontWeight={800} fill={GARIS}>
            {petak.nama}
          </text>
          <text x={tengahX} y={tengahY + 14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#4b5563">
            ${petak.harga}
          </text>
        </>
      ) : null}

      {adalahBandara(petak) ? (
        <>
          <Aset nama={NAMA_ASET.ikonDunia} x={tengahX - ikonUkuran / 2} y={isiY + 8} lebar={ikonUkuran} tinggi={ikonUkuran} cadangan={<IkonPesawatCadangan />} />
          <text x={tengahX} y={isiY + ikonUkuran + 24} textAnchor="middle" fontSize={11} fontWeight={800} fill={GARIS}>
            {petak.nama}
          </text>
          <text x={tengahX} y={isiY + ikonUkuran + 40} textAnchor="middle" fontSize={12} fontWeight={700} fill="#4b5563">
            ${petak.harga}
          </text>
        </>
      ) : null}

      {petak.jenis === 'kesempatan' || petak.jenis === 'harta' || petak.jenis === 'pajak' || petak.jenis === 'bonus' ? (
        <>
          <Aset
            nama={
              petak.jenis === 'kesempatan' ? NAMA_ASET.ikonTanya
              : petak.jenis === 'harta' ? NAMA_ASET.ikonPeti
              : petak.jenis === 'pajak' ? NAMA_ASET.petakPajak
              : NAMA_ASET.petakBonus
            }
            x={tengahX - ikonUkuran / 2}
            y={tengahY - ikonUkuran / 2 - 10}
            lebar={ikonUkuran}
            tinggi={ikonUkuran}
            cadangan={
              petak.jenis === 'kesempatan' ? <IkonTanyaCadangan />
              : petak.jenis === 'harta' ? <IkonPetiCadangan />
              : petak.jenis === 'pajak' ? <IkonPajakCadangan />
              : <IkonBintangCadangan />
            }
          />
          <text x={tengahX} y={tengahY + ikonUkuran / 2 + 6} textAnchor="middle" fontSize={11} fontWeight={800} fill={GARIS}>
            {petak.nama}
          </text>
          <text x={tengahX} y={tengahY + ikonUkuran / 2 + 20} textAnchor="middle" fontSize={10} fontWeight={700} fill="#4b5563">
            {petak.jenis === 'pajak' ? 'bayar $100' : petak.jenis === 'bonus' ? 'terima $50' : 'ambil kartu'}
          </text>
        </>
      ) : null}

      {sudut ? (
        <>
          <Aset
            nama={
              petak.jenis === 'mulai' ? NAMA_ASET.petakMulai
              : petak.jenis === 'parkir' ? NAMA_ASET.petakParkir
              : NAMA_ASET.petakPenjara
            }
            x={pusatX - ikonUkuran / 2}
            y={y + 18}
            lebar={ikonUkuran}
            tinggi={ikonUkuran}
            cadangan={
              petak.jenis === 'mulai' ? <IkonMulaiCadangan />
              : petak.jenis === 'parkir' ? <IkonParkirCadangan />
              : <IkonPenjaraCadangan />
            }
          />
          <text x={pusatX} y={y + tinggi - 26} textAnchor="middle" fontSize={15} fontWeight={900} fill={GARIS}>
            {petak.nama.toUpperCase()}
          </text>
          <text x={pusatX} y={y + tinggi - 10} textAnchor="middle" fontSize={10} fontWeight={700} fill="#4b5563">
            {petak.jenis === 'mulai' ? `terima gaji $${permainan.pengaturan.gaji}`
              : petak.jenis === 'parkir' ? `pot $${permainan.pot}`
              : petak.jenis === 'penjara' ? 'hanya berkunjung'
              : 'langsung ke penjara'}
          </text>
        </>
      ) : null}

      {warnaPemilik ? <rect x={pitaLuar.x} y={pitaLuar.y} width={pitaLuar.w} height={pitaLuar.h} fill={warnaPemilik.isi} stroke={GARIS} strokeWidth={1.5} /> : null}

      {dipilih ? (
        <rect x={x - 3} y={y - 3} width={lebar + 6} height={tinggi + 6} rx={8} fill="none" stroke="#fff176" strokeWidth={5} pointerEvents="none" />
      ) : null}
    </g>
  )
}

// ------------------------------------------------------------------ Tengah papan
const PIN_WILAYAH: Array<[number, number]> = [
  [760, 300], [810, 190], [520, 150], [545, 300], [220, 170], [305, 360], [860, 400], [615, 225],
]

const BENUA = [
  'M110 90 Q180 60 260 70 Q330 90 335 130 Q320 190 275 230 Q225 250 190 235 Q160 200 120 175 Q95 130 110 90 Z',
  'M330 40 Q390 30 410 60 Q412 100 370 108 Q335 100 330 40 Z',
  'M265 255 Q320 245 350 275 Q368 320 340 380 Q318 430 292 432 Q270 400 262 340 Q250 290 265 255 Z',
  'M470 105 Q530 85 590 100 Q612 130 590 165 Q545 185 500 175 Q470 150 470 105 Z',
  'M488 190 Q560 178 612 220 Q630 280 605 330 Q575 385 530 380 Q495 340 485 290 Q478 235 488 190 Z',
  'M600 75 Q700 55 800 70 Q890 100 905 170 Q885 225 840 235 Q800 262 740 255 Q690 240 650 225 Q605 195 600 150 Q590 110 600 75 Z',
  'M735 285 Q760 280 775 295 Q770 312 750 315 Q735 305 735 285 Z',
  'M785 300 Q805 296 812 312 Q800 326 785 320 Z',
  'M760 325 Q790 322 800 340 Q780 352 760 345 Z',
  'M800 345 Q860 330 905 365 Q912 405 870 425 Q820 425 795 395 Q785 365 800 345 Z',
]

/**
 * Lubang tengah papan: peta dunia sebagai latar redup, lalu seluruh panel
 * kendali permainan di atasnya. Panel digambar pada kanvas tetap 1000×1000
 * lewat `<foreignObject>` dan diskalakan ke ukuran lubang, jadi tata letaknya
 * sama untuk 2 tim maupun 8 tim.
 */
function TengahPapan({ papan, permainan, hud }: { papan: Papan; permainan: Permainan; hud: ReactNode }) {
  const C = UKURAN_SUDUT
  const margin = 16
  const sisi = papan.lebar - 2 * C - margin * 2
  const skala = sisi / 1000

  return (
    <g transform={`translate(${C + margin} ${C + margin}) scale(${skala})`}>
      {/* Latar: peta dunia dibuat pucat supaya panel di atasnya tetap terbaca. */}
      <g pointerEvents="none">
        <clipPath id="lubang-tengah">
          <rect x={0} y={0} width={1000} height={1000} rx={26} />
        </clipPath>
        <g clipPath="url(#lubang-tengah)">
          <rect x={0} y={0} width={1000} height={1000} fill="#cfe7fa" />
          <rect x={0} y={0} width={1000} height={1000} fill="url(#ombak)" opacity={0.6} />
          {/* Peta diperbesar dan dipusatkan supaya mengisi lubang; bagian yang
              lewat tepi terpotong, seperti peta yang dibentang di atas meja. */}
          <g transform="translate(500 500) scale(1.75) translate(-500 -250)">
            {BENUA.map((d) => (
              <path key={d} d={d} fill="#a9d894" stroke="#7aa86c" strokeWidth={4} strokeLinejoin="round" />
            ))}
            <path d="M250 200 Q500 40 780 200" fill="none" stroke="white" strokeWidth={6} strokeDasharray="16 12" opacity={0.75} />
            <path d="M300 380 Q560 470 860 400" fill="none" stroke="white" strokeWidth={6} strokeDasharray="16 12" opacity={0.75} />
            {papan.wilayah.map((w) => {
              const [px, py] = PIN_WILAYAH[w.id]!
              const tim = permainan.tim[w.timAsal]!
              const warna = WARNA_TIM_HEX[tim.warna]
              return (
                <g key={w.id} opacity={tim.gugur ? 0.3 : 1}>
                  <path
                    d={`M${px} ${py} l-16 -25 a19 19 0 1 1 32 0 z`}
                    fill={warna.isi}
                    stroke={GARIS}
                    strokeWidth={3}
                    strokeLinejoin="round"
                  />
                  <circle cx={px} cy={py - 27} r={7} fill="white" stroke={GARIS} strokeWidth={2} />
                  <text x={px} y={py + 20} textAnchor="middle" fontSize={17} fontWeight={800} fill={GARIS} opacity={0.85}>
                    {tim.nama}
                  </text>
                </g>
              )
            })}
          </g>
        </g>
        <rect x={0} y={0} width={1000} height={1000} rx={26} fill="none" stroke={GARIS} strokeWidth={4} />
      </g>

      <foreignObject x={0} y={0} width={1000} height={1000}>
        {hud}
      </foreignObject>
    </g>
  )
}

// ------------------------------------------------------------------ Tooltip
function TooltipPetak({
  papan, permainan, id, x, y, bingkai,
}: {
  papan: Papan
  permainan: Permainan
  id: number
  x: number
  y: number
  bingkai: { lebar: number; tinggi: number }
}) {
  const petak = papan.petak[id]!
  const milik = permainan.milik[id]
  const pemilik = milik ? permainan.tim[milik.tim] : null
  const wilayah = petak.wilayah !== undefined ? papan.wilayah[petak.wilayah] : null
  const LEBAR = 256
  const TINGGI = 230
  const posisi = {
    left: Math.max(4, Math.min(x + 14, bingkai.lebar - LEBAR - 4)),
    top: y + TINGGI + 20 > bingkai.tinggi ? Math.max(4, y - TINGGI - 8) : y + 14,
  }

  return (
    <div
      className="pointer-events-none absolute z-10 w-64 rounded-card border border-border bg-popover p-3 text-xs text-popover-foreground shadow-raised"
      style={posisi}
      role="tooltip"
    >
      <p className="text-sm font-bold">{petak.nama}</p>
      {wilayah ? (
        <p className="text-muted-foreground">
          {wilayah.nama} · {wilayah.julukan}
        </p>
      ) : null}
      {adalahProperti(petak) ? (
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">Harga</dt>
          <dd className="font-semibold">${petak.harga}</dd>
          <dt className="text-muted-foreground">Sewa dasar</dt>
          <dd className="font-semibold">${petak.sewaDasar}</dd>
          <dt className="text-muted-foreground">Biaya bangun</dt>
          <dd className="font-semibold">${petak.biayaBangun}/tingkat</dd>
          <dt className="text-muted-foreground">Sewa kini</dt>
          <dd className="font-semibold">{milik ? `$${sewaPetak(permainan, id)}` : '—'}</dd>
          <dt className="text-muted-foreground">Bangunan</dt>
          <dd className="font-semibold">{milik ? TINGKAT_BANGUNAN[milik.tingkat] : '—'}</dd>
          <dt className="text-muted-foreground">Kelompok</dt>
          <dd className="font-semibold">{milik && kelompokLengkap(permainan, petak.kelompok, milik.tim) ? 'lengkap ✓' : 'belum lengkap'}</dd>
        </dl>
      ) : null}
      {adalahBandara(petak) ? (
        <p className="mt-2">
          Harga ${petak.harga}. Sewa $25 / $50 / $100 / $200 menurut jumlah bandara pemilik. Mendarat di bandara sendiri = boleh terbang ke bandara lain.
        </p>
      ) : null}
      {petak.jenis === 'kesempatan' ? <p className="mt-2">Ambil kartu Kesempatan: perpindahan dan risiko.</p> : null}
      {petak.jenis === 'harta' ? <p className="mt-2">Ambil kartu Harta Karun: rezeki untuk dompet atau kas tim.</p> : null}
      {petak.jenis === 'pajak' ? <p className="mt-2">Bayar pajak $100 ke pot Parkir Bebas.</p> : null}
      {petak.jenis === 'bonus' ? <p className="mt-2">Terima bonus $50 ke dompet pribadi.</p> : null}
      {petak.jenis === 'parkir' ? <p className="mt-2">Ambil seluruh pot (${permainan.pot}) untuk kas tim.</p> : null}
      {petak.jenis === 'masuk-penjara' ? <p className="mt-2">Langsung ke penjara, tanpa gaji.</p> : null}
      {petak.jenis === 'penjara' ? <p className="mt-2">Bebas dengan dadu kembar, kartu bebas, atau denda $50 (maks 3 giliran).</p> : null}
      {petak.jenis === 'mulai' ? <p className="mt-2">Setiap melewati: gaji ${permainan.pengaturan.gaji} ke dompet pribadi.</p> : null}
      {pemilik ? (
        <p className="mt-2 font-semibold" style={{ color: WARNA_TIM_HEX[pemilik.warna].gelap }}>
          Milik {pemilik.nama}
        </p>
      ) : (petak.jenis === 'properti' || petak.jenis === 'bandara') ? (
        <p className="mt-2 text-success-kuat">Belum ada pemilik</p>
      ) : null}
    </div>
  )
}
