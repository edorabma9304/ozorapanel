import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { GalatAksi, buatPermainan, langkah, papanDari, pemainAktif } from '@/features/monopoli/mesin'
import { LogPermainan, PanelAksi, PanelTim } from '@/features/monopoli/panel'
import { FormPengaturan } from '@/features/monopoli/pengaturan'
import { PetaDunia } from '@/features/monopoli/peta'
import { bacaPermainan, tulisPermainan } from '@/features/monopoli/simpan'
import type { Aksi, PengaturanPermainan, Permainan } from '@/features/monopoli/tipe'
import '@/features/monopoli/monopoli.css'

const JEDA_DADU_MS = 700

function HalamanMonopoli() {
  const [permainan, setPermainan] = useState<Permainan | null>(bacaPermainan)
  const permainanRef = useRef(permainan)
  const [galat, setGalat] = useState<string | null>(null)
  const [posisiTampil, setPosisiTampil] = useState<Record<number, number>>({})
  const [daduBerputar, setDaduBerputar] = useState(false)
  const [petakDipilih, setPetakDipilih] = useState<number | null>(null)
  const [ikuti, setIkuti] = useState(true)
  const [fokus, setFokus] = useState<{ petak: number; kunci: number } | null>(null)

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

  // Animasi pion: fase "bergerak" dijalankan langkah demi langkah, lalu kirim aksi "tiba".
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

  // Awal giliran pemain baru: pusatkan ke pionnya bila mode ikuti aktif.
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
    const p = buatPermainan(pengaturan)
    permainanRef.current = p
    setPermainan(p)
    setGalat(null)
    setPetakDipilih(null)
    setPosisiTampil({})
  }

  function permainanBaru() {
    if (permainan && permainan.fase.jenis !== 'selesai' && !window.confirm('Permainan yang sedang berjalan akan dihapus. Lanjutkan?')) return
    permainanRef.current = null
    setPermainan(null)
    setGalat(null)
    setPosisiTampil({})
  }

  const sibuk = daduBerputar || permainan?.fase.jenis === 'bergerak'
  const petakSorot = permainan?.fase.jenis === 'terbang'
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
      <KepalaHalaman
        judul="Jelajah Dunia"
        deskripsi="Papan properti gaya Monopoly yang dimainkan per tim: 2 pemain, uang pribadi + kas bersama, peta membesar sesuai jumlah tim."
        remah={[{ label: 'Permainan' }, { label: 'Jelajah Dunia' }]}
        aksi={
          permainan ? (
            <div className="flex gap-2">
              <Tombol varian="garis" onClick={() => setIkuti((v) => !v)} aria-pressed={ikuti}>
                {ikuti ? <Eye /> : <EyeOff />} {ikuti ? 'Ikuti pion' : 'Pandangan bebas'}
              </Tombol>
              <Tombol varian="garis" onClick={permainanBaru}>
                <RotateCcw /> Permainan baru
              </Tombol>
            </div>
          ) : null
        }
      />

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
            <div className="space-y-4 xl:max-h-[calc(100dvh-220px)] xl:overflow-y-auto xl:pr-1 scrollbar-thin">
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

export const Route = createFileRoute('/_app/permainan/monopoli')({ component: HalamanMonopoli })
