/**
 * Perekat permainan: menyatukan mesin (murni) dengan peta dan panel.
 *
 * Di sinilah satu-satunya efek samping permainan berada — animasi dadu,
 * langkah pion, fokus kamera, dan simpan ke localStorage. Mesin di `mesin.ts`
 * tetap murni; komponen ini yang mengubah fase `bergerak` menjadi gerakan
 * bertahap lalu mengirim aksi `tiba`.
 *
 * Dipakai dua kali dengan kepala halaman berbeda:
 * - `src/routes/_app/permainan/monopoli.tsx` (di dalam panel admin)
 * - `artifact/main.tsx` (build statis untuk dibagikan)
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { DURASI_GULIR_MS, LemparanDadu } from './dadu'
import { HudPapan } from './hud'
import { MenuPapan, TosPeristiwa } from './menu'
import { GalatAksi, buatPermainan, langkah, papanDari, pemainAktif } from './mesin'
import { FormPengaturan } from './pengaturan'
import { PetaDunia } from './peta'
import { bacaPermainan, tulisPermainan } from './simpan'
import { efekDariPerubahan, suara } from './suara'
import type { Aksi, PengaturanPermainan, Permainan as KeadaanPermainan } from './tipe'
import './monopoli.css'

/** Dadu bergulir, lalu hasilnya sempat terbaca, baru pion berjalan. */
const JEDA_DADU_MS = DURASI_GULIR_MS + 650

/**
 * `kepala` hanya judul halaman. Seluruh kendali permainan berada di dalam
 * papan supaya mata pemain tidak berpindah-pindah antara papan dan panel.
 */
export function Permainan({ kepala }: { kepala?: ReactNode }) {
  const [permainan, setPermainan] = useState<KeadaanPermainan | null>(bacaPermainan)
  const permainanRef = useRef(permainan)
  const [galat, setGalat] = useState<string | null>(null)
  const [posisiTampil, setPosisiTampil] = useState<Record<number, number>>({})
  const [daduBerputar, setDaduBerputar] = useState(false)
  const [petakDipilih, setPetakDipilih] = useState<number | null>(null)
  const [lemparan, setLemparan] = useState<[number, number] | null>(null)
  /** Keluar dari papan tanpa menghapus permainan — bisa dilanjutkan lagi. */
  const [diMenu, setDiMenu] = useState(false)
  // Bawaan: papan tampil utuh, karena panel kendali ada di tengahnya.
  const [ikuti, setIkuti] = useState(false)
  const [fokus, setFokus] = useState<{ petak: number; kunci: number } | null>(null)

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
      if (baru.fase.jenis !== 'bergerak') setPosisiTampil({})

      const efek = efekDariPerubahan(kini, baru)
      if (aksi.jenis === 'lempar' && baru.dadu) {
        // Dadu bergulir dulu; bunyi lain menyusul supaya tidak bertabrakan.
        suara.efek('dadu')
        setLemparan(baru.dadu)
        setDaduBerputar(true)
        setTimeout(() => {
          setDaduBerputar(false)
          setLemparan(null)
          for (const e of efek) suara.efek(e)
        }, JEDA_DADU_MS)
      } else {
        for (const e of efek) suara.efek(e)
      }
    } catch (e) {
      setGalat(e instanceof GalatAksi ? e.message : 'Terjadi galat tak terduga. Muat ulang halaman bila berlanjut.')
    }
  }, [])

  // Fase "bergerak" dijalankan petak demi petak, lalu kirim aksi "tiba".
  useEffect(() => {
    if (!permainan || permainan.fase.jenis !== 'bergerak' || daduBerputar) return
    const f = permainan.fase
    const id = pemainAktif(permainan).id
    const N = papanDari(permainan).petak.length
    const jalur: number[] = []
    if (f.langkah === 0) jalur.push(f.ke)
    else {
      const arah = f.langkah > 0 ? 1 : -1
      let pos = f.dari
      while (pos !== f.ke) {
        pos = (pos + arah + N) % N
        jalur.push(pos)
      }
    }
    const jeda = jalur.length > 12 ? 80 : 190
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const tik = () => {
      if (i < jalur.length) {
        const ke = jalur[i]!
        setPosisiTampil((m) => ({ ...m, [id]: ke }))
        suara.efek('langkah')
        if (ikuti) setFokus({ petak: ke, kunci: Date.now() })
        i++
        timer = setTimeout(tik, jeda)
      } else {
        timer = setTimeout(() => jalankan({ jenis: 'tiba' }), 240)
      }
    }
    timer = setTimeout(tik, 60)
    return () => clearTimeout(timer)
  }, [permainan, daduBerputar, ikuti, jalankan])

  // Awal giliran pemain baru: pusatkan kamera ke pionnya.
  const pemainAktifId = permainan ? permainan.pemainAktif : -1
  const renderPertama = useRef(true)
  useEffect(() => {
    if (renderPertama.current) {
      renderPertama.current = false
      return
    }
    const kini = permainanRef.current
    if (!ikuti || !kini || pemainAktifId < 0) return
    setFokus({ petak: kini.pemain[pemainAktifId]!.posisi, kunci: Date.now() })
  }, [pemainAktifId, ikuti])

  function mulai(pengaturan: PengaturanPermainan) {
    setPermainan(buatPermainan(pengaturan))
    setGalat(null)
    setPetakDipilih(null)
    setPosisiTampil({})
    setDiMenu(false)
  }

  function pilihPetak(id: number | null) {
    if (id !== null) suara.efek('klik')
    setPetakDipilih(id)
  }

  function permainanBaru() {
    if (permainan && permainan.fase.jenis !== 'selesai' && !window.confirm('Permainan yang sedang berjalan akan dihapus. Lanjutkan?')) return
    setPermainan(null)
    setGalat(null)
    setPosisiTampil({})
  }

  const sibuk = daduBerputar || permainan?.fase.jenis === 'bergerak'
  const diPapan = permainan !== null && !diMenu

  // Musik hanya berjalan selama papan terbuka.
  useEffect(() => {
    if (!diPapan) return
    suara.masukPermainan()
    return () => suara.keluarPermainan()
  }, [diPapan])

  return (
    <>
      {kepala}

      {!diPapan ? (
        <FormPengaturan onMulai={mulai} onLanjut={permainan ? () => setDiMenu(false) : undefined} />
      ) : (
        <PetaDunia
          permainan={permainan!}
          posisiTampil={posisiTampil}
          petakDipilih={petakDipilih}
          onPilihPetak={pilihPetak}
          fokus={fokus}
          ikuti={ikuti}
          onUbahIkuti={setIkuti}
          className="h-[min(88vw,calc(100dvh-160px))] min-h-[420px]"
          hud={
            <HudPapan
              permainan={permainan}
              onAksi={jalankan}
              sibuk={Boolean(sibuk)}
              galat={galat}
              petakDipilih={petakDipilih}
              menggulir={daduBerputar}
              onPermainanBaru={permainanBaru}
            />
          }
          lapisan={
            <>
              <MenuPapan
                permainan={permainan}
                onAksi={jalankan}
                onPermainanBaru={permainanBaru}
                onKeluar={() => setDiMenu(true)}
              />
              <TosPeristiwa permainan={permainan} tahan={daduBerputar} />
              {lemparan ? <LemparanDadu nilai={lemparan} /> : null}
            </>
          }
        />
      )}
    </>
  )
}
