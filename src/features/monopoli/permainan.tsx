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
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { GalatAksi, buatPermainan, langkah, papanDari, pemainAktif } from './mesin'
import { LogPermainan, PanelAksi, PanelTim } from './panel'
import { FormPengaturan } from './pengaturan'
import { PetaDunia } from './peta'
import { bacaPermainan, tulisPermainan } from './simpan'
import type { Aksi, PengaturanPermainan, Permainan as KeadaanPermainan } from './tipe'
import './monopoli.css'

const JEDA_DADU_MS = 700

/** Kendali yang dibutuhkan kepala halaman — tombol di luar papan. */
export type KendaliPermainan = {
  /** Permainan sedang berjalan? Kosong = masih di layar persiapan. */
  berjalan: boolean
  /** Kamera mengikuti pion yang bergerak. */
  ikuti: boolean
  setIkuti: (v: boolean) => void
  permainanBaru: () => void
}

export function Permainan({ kepala }: { kepala?: (kendali: KendaliPermainan) => ReactNode }) {
  const [permainan, setPermainan] = useState<KeadaanPermainan | null>(bacaPermainan)
  const permainanRef = useRef(permainan)
  const [galat, setGalat] = useState<string | null>(null)
  const [posisiTampil, setPosisiTampil] = useState<Record<number, number>>({})
  const [daduBerputar, setDaduBerputar] = useState(false)
  const [petakDipilih, setPetakDipilih] = useState<number | null>(null)
  const [ikuti, setIkuti] = useState(true)
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
      if (aksi.jenis === 'lempar' && baru.fase.jenis === 'bergerak') {
        setDaduBerputar(true)
        setTimeout(() => setDaduBerputar(false), JEDA_DADU_MS)
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
  }

  function permainanBaru() {
    if (permainan && permainan.fase.jenis !== 'selesai' && !window.confirm('Permainan yang sedang berjalan akan dihapus. Lanjutkan?')) return
    setPermainan(null)
    setGalat(null)
    setPosisiTampil({})
  }

  const sibuk = daduBerputar || permainan?.fase.jenis === 'bergerak'
  const petakSorot =
    permainan?.fase.jenis === 'terbang'
      ? papanDari(permainan).indeks.bandara.filter((id) => id !== (permainan.fase as { dari: number }).dari)
      : []

  function pilihPetak(id: number | null) {
    if (id !== null && permainan?.fase.jenis === 'terbang' && petakSorot.includes(id)) {
      jalankan({ jenis: 'terbang', ke: id })
      return
    }
    setPetakDipilih(id)
  }

  return (
    <>
      {kepala?.({ berjalan: permainan !== null, ikuti, setIkuti, permainanBaru })}

      {!permainan ? (
        <FormPengaturan onMulai={mulai} />
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <PetaDunia
              permainan={permainan}
              posisiTampil={posisiTampil}
              petakDipilih={petakDipilih}
              onPilihPetak={pilihPetak}
              petakSorot={petakSorot}
              daduBerputar={daduBerputar}
              fokus={fokus}
              className="h-[62vh] min-h-[460px] xl:h-[calc(100dvh-220px)]"
            />
            <div className="space-y-4 scrollbar-thin xl:max-h-[calc(100dvh-220px)] xl:overflow-y-auto xl:pr-1">
              <PanelAksi
                permainan={permainan}
                onAksi={jalankan}
                sibuk={Boolean(sibuk)}
                galat={galat}
                petakDipilih={petakDipilih}
                onPermainanBaru={permainanBaru}
              />
              <PanelTim permainan={permainan} onAksi={jalankan} />
            </div>
          </div>

          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Catatan permainan</JudulKartu>
                <DeskripsiKartu>Peristiwa terbaru di atas. Warna titik menandai tim.</DeskripsiKartu>
              </div>
            </KepalaKartu>
            <IsiKartu>
              <LogPermainan permainan={permainan} />
            </IsiKartu>
          </Kartu>
        </>
      )}
    </>
  )
}
