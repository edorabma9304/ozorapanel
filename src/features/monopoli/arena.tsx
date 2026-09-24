/**
 * Arena: papan yang sedang berjalan — peta, panel keputusan, menu, animasi, dan suara.
 *
 * Komponen ini tidak tahu dari mana keadaan datang. Mode satu layar
 * (`permainan.tsx`) menjalankan mesin di browser, mode daring (`daring.tsx`)
 * menerimanya dari server. Keduanya memberi `permainan` dan `onAksi` yang sama,
 * jadi animasi dan suara cukup ditulis sekali di sini.
 *
 * Semua efek samping permainan terkumpul di berkas ini: guliran dadu, langkah
 * pion, fokus kamera, dan bunyi. Mesin di `mesin.ts` tetap murni.
 *
 * JEBAKAN yang sudah dibayar sekali: di mode daring, keadaan bisa berubah di
 * tengah animasi karena orang lain mengobrol atau bergabung. Karena itu timer
 * dadu dipegang ref (bukan dibersihkan tiap efek berjalan ulang) dan jalur
 * langkah pion dihitung dari kunci gerak, bukan dari objek permainan. Tanpa itu
 * dadu bisa berputar selamanya dan pion mengulang langkahnya dari awal.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DURASI_GULIR_MS, LemparanDadu } from './dadu'
import { HudPapan } from './hud'
import { MenuPapan, TosPeristiwa } from './menu'
import { papanDari } from './mesin'
import { PetaDunia } from './peta'
import { efekDariPerubahan, suara } from './suara'
import type { Aksi, Permainan } from './tipe'
import './monopoli.css'

/** Dadu bergulir, lalu hasilnya sempat terbaca, baru pion berjalan. */
const JEDA_DADU_MS = DURASI_GULIR_MS + 650
const KOSONG: Record<number, number> = {}

export function Arena({
  permainan,
  onAksi,
  galat,
  bolehAksi = true,
  onKeluar,
  onPermainanBaru,
  lapisan,
}: {
  permainan: Permainan
  onAksi: (a: Aksi) => void
  galat: string | null
  /** Mode daring: matikan tombol saat bukan giliran pengguna ini. */
  bolehAksi?: boolean
  onKeluar: () => void
  onPermainanBaru: () => void
  /** Lapisan tambahan di atas papan, mis. kotak obrolan. */
  lapisan?: ReactNode
}) {
  const [posisiTampil, setPosisiTampil] = useState<Record<number, number>>({})
  const [daduBerputar, setDaduBerputar] = useState(false)
  const [lemparan, setLemparan] = useState<[number, number] | null>(null)
  const [petakDipilih, setPetakDipilih] = useState<number | null>(null)
  // Bawaan: papan tampil utuh, karena panel kendali ada di tengahnya.
  const [ikuti, setIkuti] = useState(false)
  const [fokus, setFokus] = useState<{ petak: number; kunci: number } | null>(null)

  // Nilai yang dibaca dari dalam timer disimpan di ref supaya efeknya tidak
  // ikut berjalan ulang setiap kali nilainya berubah.
  const ikutiRef = useRef(ikuti)
  const onAksiRef = useRef(onAksi)
  useEffect(() => {
    ikutiRef.current = ikuti
    onAksiRef.current = onAksi
  }, [ikuti, onAksi])

  // ---------------------------------------------------------------- Dadu & bunyi
  // Disimpulkan dari perubahan keadaan, bukan dari aksi yang kita kirim sendiri.
  // Dengan begitu pemain lain di mode daring melihat dan mendengar hal yang sama.
  const sebelumnya = useRef<Permainan | null>(null)
  const timerDadu = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timerDadu.current) clearTimeout(timerDadu.current)
  }, [])

  useEffect(() => {
    const lalu = sebelumnya.current
    sebelumnya.current = permainan
    if (!lalu) return

    if (ikutiRef.current && lalu.pemainAktif !== permainan.pemainAktif) {
      setFokus({ petak: permainan.pemain[permainan.pemainAktif]!.posisi, kunci: Date.now() })
    }

    const efek = efekDariPerubahan(lalu, permainan)
    if (permainan.lemparanKe > lalu.lemparanKe && permainan.dadu) {
      suara.efek('dadu')
      setLemparan(permainan.dadu)
      setDaduBerputar(true)
      if (timerDadu.current) clearTimeout(timerDadu.current)
      timerDadu.current = setTimeout(() => {
        timerDadu.current = null
        setDaduBerputar(false)
        setLemparan(null)
        for (const e of efek) suara.efek(e)
      }, JEDA_DADU_MS)
      return
    }
    for (const e of efek) suara.efek(e)
  }, [permainan])

  // ---------------------------------------------------------------- Langkah pion
  // Jalur dihitung dari kunci gerak, jadi pesan obrolan atau peserta baru yang
  // datang di tengah langkah tidak membuat pion mengulang dari awal.
  const gerak = permainan.fase.jenis === 'bergerak' ? permainan.fase : null
  const kunciGerak = gerak ? `${permainan.lemparanKe}:${permainan.pemainAktif}:${gerak.dari}:${gerak.ke}` : ''
  const jumlahPetak = papanDari(permainan).petak.length
  const idBerjalan = permainan.pemain[permainan.pemainAktif]?.id ?? 0

  const jalur = useMemo(() => {
    if (!gerak) return null
    const langkahan: number[] = []
    if (gerak.langkah === 0) langkahan.push(gerak.ke)
    else {
      const arah = gerak.langkah > 0 ? 1 : -1
      let pos = gerak.dari
      while (pos !== gerak.ke) {
        pos = (pos + arah + jumlahPetak) % jumlahPetak
        langkahan.push(pos)
      }
    }
    return { id: idBerjalan, langkahan }
    // Kunci gerak sudah memuat semua yang menentukan jalur.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [kunciGerak])

  useEffect(() => {
    if (!jalur || daduBerputar) return
    const { id, langkahan } = jalur
    const jeda = langkahan.length > 12 ? 80 : 190
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const tik = () => {
      if (i < langkahan.length) {
        const ke = langkahan[i]!
        setPosisiTampil((m) => ({ ...m, [id]: ke }))
        suara.efek('langkah')
        if (ikutiRef.current) setFokus({ petak: ke, kunci: Date.now() })
        i++
        timer = setTimeout(tik, jeda)
      } else {
        // "tiba" tidak butuh keputusan siapa pun, jadi klien mana pun boleh
        // mengirimnya. Di mode daring itu mencegah papan menggantung kalau
        // pemain yang sedang giliran menutup tabnya di tengah langkah.
        timer = setTimeout(() => onAksiRef.current({ jenis: 'tiba' }), 240)
      }
    }
    timer = setTimeout(tik, 60)
    return () => clearTimeout(timer)
  }, [jalur, daduBerputar])

  // Musik berjalan selama papan terbuka.
  useEffect(() => {
    suara.masukPermainan()
    return () => suara.keluarPermainan()
  }, [])

  function pilihPetak(id: number | null) {
    if (id !== null) suara.efek('klik')
    setPetakDipilih(id)
  }

  const sibuk = daduBerputar || permainan.fase.jenis === 'bergerak'
  // Posisi tampilan hanya berlaku selagi pion berjalan; di luar itu papan
  // memakai posisi dari mesin apa adanya.
  const posisiDipakai = gerak ? posisiTampil : KOSONG

  return (
    <PetaDunia
      permainan={permainan}
      posisiTampil={posisiDipakai}
      petakDipilih={petakDipilih}
      onPilihPetak={pilihPetak}
      fokus={fokus}
      ikuti={ikuti}
      onUbahIkuti={setIkuti}
      className="h-[min(88vw,calc(100dvh-160px))] min-h-[420px]"
      hud={
        <HudPapan
          permainan={permainan}
          onAksi={onAksi}
          sibuk={sibuk || !bolehAksi}
          galat={galat}
          petakDipilih={petakDipilih}
          menggulir={daduBerputar}
          onPermainanBaru={onPermainanBaru}
        />
      }
      lapisan={
        <>
          <MenuPapan
            permainan={permainan}
            onAksi={onAksi}
            onPermainanBaru={onPermainanBaru}
            onKeluar={onKeluar}
          />
          <TosPeristiwa permainan={permainan} tahan={daduBerputar} />
          {lemparan ? <LemparanDadu nilai={lemparan} /> : null}
          {lapisan}
        </>
      }
    />
  )
}
