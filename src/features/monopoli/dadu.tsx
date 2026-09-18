/**
 * Dadu 3D yang bergulir di tengah papan.
 *
 * Kubus CSS biasa: enam sisi diputar ke posisinya, lalu seluruh kubus diputar
 * beberapa kali sebelum berhenti tepat di mata yang sudah ditentukan mesin.
 * Mesin menentukan hasilnya lebih dulu; animasi hanya memperagakan. Pion baru
 * berjalan setelah dadu berhenti — pengaturannya ada di `permainan.tsx`.
 *
 * Dipasang sebagai lapisan layar di atas papan, bukan di dalam SVG, karena
 * `transform-style: preserve-3d` tidak bisa diandalkan di dalam foreignObject.
 */
import { useEffect, useState, type CSSProperties } from 'react'

/** Putaran akhir supaya mata yang diminta menghadap ke depan. */
const ARAH_AKHIR: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
}

const TITIK: Record<number, Array<[number, number]>> = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [3, 1], [1, 3], [3, 3]],
  5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]],
  6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]],
}

export const DURASI_GULIR_MS = 1150

function kurangiGerak() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function Sisi({ nilai, kelas }: { nilai: number; kelas: string }) {
  return (
    <div className={`monopoli-sisi ${kelas}`}>
      {TITIK[nilai]!.map(([kolom, baris]) => (
        <span key={`${kolom}-${baris}`} style={{ gridColumn: kolom, gridRow: baris }} />
      ))}
    </div>
  )
}

function Kubus({ nilai, putaran }: { nilai: number; putaran: number }) {
  const akhir = ARAH_AKHIR[nilai] ?? ARAH_AKHIR[1]!
  const [gaya, setGaya] = useState<CSSProperties>(() =>
    kurangiGerak()
      ? { transform: `rotateX(${(ARAH_AKHIR[nilai] ?? ARAH_AKHIR[1]!).x}deg) rotateY(${(ARAH_AKHIR[nilai] ?? ARAH_AKHIR[1]!).y}deg)` }
      : { transform: 'rotateX(-24deg) rotateY(16deg)' },
  )

  useEffect(() => {
    if (kurangiGerak()) return
    // Transisi baru berjalan bila nilai awal sempat terpasang satu bingkai.
    const id = requestAnimationFrame(() => {
      setGaya({
        transform: `rotateX(${putaran * 360 + akhir.x}deg) rotateY(${(putaran + 1) * 360 + akhir.y}deg)`,
        transition: `transform ${DURASI_GULIR_MS}ms cubic-bezier(0.17, 0.86, 0.28, 1)`,
      })
    })
    return () => cancelAnimationFrame(id)
  }, [akhir.x, akhir.y, putaran])

  return (
    <div className="monopoli-dadu3d-bingkai">
      <div className="monopoli-dadu3d" style={gaya}>
        <Sisi nilai={1} kelas="monopoli-sisi-depan" />
        <Sisi nilai={6} kelas="monopoli-sisi-belakang" />
        <Sisi nilai={2} kelas="monopoli-sisi-kanan" />
        <Sisi nilai={5} kelas="monopoli-sisi-kiri" />
        <Sisi nilai={3} kelas="monopoli-sisi-atas" />
        <Sisi nilai={4} kelas="monopoli-sisi-bawah" />
      </div>
      <div className="monopoli-dadu3d-bayang" />
    </div>
  )
}

/**
 * `kunci` berubah tiap lemparan supaya komponen dipasang ulang dan animasinya
 * mengulang dari awal.
 */
export function LemparanDadu({ nilai }: { nilai: [number, number] }) {
  const [selesai, setSelesai] = useState(kurangiGerak())

  useEffect(() => {
    if (selesai) return
    const timer = setTimeout(() => setSelesai(true), DURASI_GULIR_MS)
    return () => clearTimeout(timer)
  }, [selesai])

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center" aria-live="polite">
      <div className="monopoli-nampan">
        <div className="flex items-end gap-7">
          <Kubus nilai={nilai[0]} putaran={3} />
          <Kubus nilai={nilai[1]} putaran={4} />
        </div>
        <p className={`monopoli-dadu3d-total ${selesai ? 'terlihat' : ''}`}>
          {nilai[0]} + {nilai[1]} = {nilai[0] + nilai[1]}
        </p>
      </div>
    </div>
  )
}
