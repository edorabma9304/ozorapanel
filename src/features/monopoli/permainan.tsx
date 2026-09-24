/**
 * Mode satu layar: mesin permainan berjalan di browser ini, pemain bergantian
 * memakai perangkat yang sama. Papan, animasi, dan suara ditangani `arena.tsx`
 * yang juga dipakai mode daring.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { GalatAksi, buatPermainan, langkah } from './mesin'
import { Arena } from './arena'
import { FormPengaturan } from './pengaturan'
import { bacaPermainan, tulisPermainan } from './simpan'
import type { Aksi, PengaturanPermainan, Permainan as KeadaanPermainan } from './tipe'

export function Permainan({ kepala, onGantiMode }: { kepala?: ReactNode; onGantiMode?: () => void }) {
  const [permainan, setPermainan] = useState<KeadaanPermainan | null>(bacaPermainan)
  const permainanRef = useRef(permainan)
  const [galat, setGalat] = useState<string | null>(null)
  /** Keluar dari papan tanpa menghapus permainan — bisa dilanjutkan lagi. */
  const [diMenu, setDiMenu] = useState(false)

  // Satu-satunya tempat ref disinkronkan: efek ini berjalan sebelum handler
  // mana pun bisa dipicu, jadi `jalankan` selalu membaca keadaan terbaru
  // tanpa perlu ikut berubah setiap render.
  useEffect(() => {
    permainanRef.current = permainan
    tulisPermainan(permainan)
  }, [permainan])

  const jalankan = useCallback((aksi: Aksi) => {
    const kini = permainanRef.current
    if (!kini) return
    try {
      const baru = langkah(kini, aksi)
      permainanRef.current = baru
      setPermainan(baru)
      setGalat(null)
    } catch (e) {
      setGalat(e instanceof GalatAksi ? e.message : 'Terjadi galat tak terduga. Muat ulang halaman bila berlanjut.')
    }
  }, [])

  function mulai(pengaturan: PengaturanPermainan) {
    setPermainan(buatPermainan(pengaturan))
    setGalat(null)
    setDiMenu(false)
  }

  function permainanBaru() {
    if (permainan && permainan.fase.jenis !== 'selesai' && !window.confirm('Permainan yang sedang berjalan akan dihapus. Lanjutkan?')) return
    setPermainan(null)
    setGalat(null)
  }

  const diPapan = permainan !== null && !diMenu

  return (
    <>
      {kepala}
      {!diPapan ? (
        <FormPengaturan onMulai={mulai} onLanjut={permainan ? () => setDiMenu(false) : undefined} onGantiMode={onGantiMode} />
      ) : (
        <Arena
          permainan={permainan!}
          onAksi={jalankan}
          galat={galat}
          onKeluar={() => setDiMenu(true)}
          onPermainanBaru={permainanBaru}
        />
      )}
    </>
  )
}
