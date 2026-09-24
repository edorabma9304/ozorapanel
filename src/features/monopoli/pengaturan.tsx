/** Layar persiapan: jumlah tim, nama, warna, dan target permainan. */
import { Play, Shuffle, Undo2 } from 'lucide-react'
import { useState } from 'react'
import { Label, Masukan, PetunjukKolom } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { PionCadangan, WARNA_TIM_HEX } from './aset'
import { PENGATURAN_BAWAAN } from './mesin'
import { TIM_MAKS, TIM_MIN, WILAYAH_DUNIA } from './papan'
import { WARNA_TIM, type PengaturanPermainan, type WarnaTim } from './tipe'

export const NAMA_BAWAAN = ['Elang', 'Hiu', 'Harimau', 'Lebah', 'Naga', 'Rubah', 'Flamingo', 'Lumba-lumba']

export function benihAcak() {
  return Math.floor(Math.random() * 2 ** 31)
}

/** Pengaturan siap pakai untuk sejumlah tim — dipakai lobi daring. */
export function pengaturanBawaan(jumlahTim: number): PengaturanPermainan {
  return {
    ...PENGATURAN_BAWAAN,
    jumlahTim,
    namaTim: NAMA_BAWAAN.slice(0, jumlahTim),
    warnaTim: [...WARNA_TIM].slice(0, jumlahTim),
    namaPemain: Array.from({ length: jumlahTim }, () => ['', '']),
    benih: benihAcak(),
  }
}

export function FormPengaturan({
  onMulai,
  onLanjut,
  onGantiMode,
}: {
  onMulai: (p: PengaturanPermainan) => void
  /** Ada bila permainan yang ditinggalkan masih tersimpan. */
  onLanjut?: () => void
  /** Kembali ke pemilihan mode main. */
  onGantiMode?: () => void
}) {
  const [jumlahTim, setJumlahTim] = useState(2)
  const [namaTim, setNamaTim] = useState<string[]>(NAMA_BAWAAN)
  const [warnaTim, setWarnaTim] = useState<WarnaTim[]>([...WARNA_TIM])
  const [namaPemain, setNamaPemain] = useState<string[][]>(NAMA_BAWAAN.map(() => ['', '']))
  const [angka, setAngka] = useState({
    kasAwal: PENGATURAN_BAWAAN.kasAwal,
    uangPribadiAwal: PENGATURAN_BAWAAN.uangPribadiAwal,
    gaji: PENGATURAN_BAWAAN.gaji,
    targetKekayaan: PENGATURAN_BAWAAN.targetKekayaan,
    targetKerugian: PENGATURAN_BAWAAN.targetKerugian,
  })
  const [benih, setBenih] = useState(benihAcak)

  function ubahWarna(indeks: number, warna: WarnaTim) {
    setWarnaTim((lama) => {
      const baru = [...lama]
      const tukar = baru.indexOf(warna)
      baru[tukar] = baru[indeks]!
      baru[indeks] = warna
      return baru
    })
  }

  const galatAngka =
    angka.targetKekayaan <= angka.kasAwal + 2 * angka.uangPribadiAwal
      ? 'Target kekayaan harus lebih besar dari modal awal tim (kas + dua dompet).'
      : angka.targetKerugian < 100
        ? 'Target kerugian minimal $100.'
        : null

  function mulai() {
    if (galatAngka) return
    onMulai({
      jumlahTim,
      namaTim: namaTim.slice(0, jumlahTim),
      warnaTim: warnaTim.slice(0, jumlahTim),
      namaPemain: namaPemain.slice(0, jumlahTim),
      ...angka,
      benih,
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {onLanjut ? (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-primary bg-primary-soft p-4 shadow-soft">
            <div>
              <p className="font-bold">Ada permainan yang belum selesai</p>
              <p className="text-sm text-muted-foreground">Lanjutkan dari posisi terakhir, atau atur ulang di bawah untuk memulai yang baru.</p>
            </div>
            <Tombol onClick={onLanjut}>
              <Undo2 /> Lanjutkan permainan
            </Tombol>
          </section>
        ) : null}

        <section className="rounded-card border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold">Jumlah tim</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Setiap tim 2 pemain. Papan membesar mengikuti jumlah tim: {8 + 8 * jumlahTim} petak untuk {jumlahTim} tim.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: TIM_MAKS - TIM_MIN + 1 }, (_, i) => i + TIM_MIN).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setJumlahTim(n)}
                className={cn(
                  'h-11 w-11 rounded-control border text-sm font-bold transition-colors',
                  n === jumlahTim ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card hover:bg-muted',
                )}
                aria-pressed={n === jumlahTim}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: jumlahTim }, (_, i) => {
            const warna = warnaTim[i]!
            const w = WARNA_TIM_HEX[warna]
            return (
              <div key={i} className="rounded-card border border-border bg-card p-4 shadow-soft" style={{ borderTop: `6px solid ${w.isi}` }}>
                <div className="flex items-center gap-3">
                  <svg width={44} height={44} viewBox="0 0 100 100" aria-hidden>
                    <PionCadangan warna={warna} bentuk="bulat" />
                  </svg>
                  <svg width={44} height={44} viewBox="0 0 100 100" aria-hidden>
                    <PionCadangan warna={warna} bentuk="permata" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`tim-${i}`}>Tim {i + 1} · asal {WILAYAH_DUNIA[i]!.nama}</Label>
                    <Masukan
                      id={`tim-${i}`}
                      value={namaTim[i] ?? ''}
                      onChange={(e) => setNamaTim((l) => l.map((x, k) => (k === i ? e.target.value : x)))}
                      placeholder={`Tim ${i + 1}`}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Warna tim ${i + 1}`}>
                  {WARNA_TIM.map((c) => {
                    const dipakai = warnaTim.slice(0, jumlahTim).indexOf(c)
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={c === warna}
                        aria-label={WARNA_TIM_HEX[c].nama}
                        title={dipakai >= 0 && dipakai !== i ? `Tukar dengan Tim ${dipakai + 1}` : WARNA_TIM_HEX[c].nama}
                        onClick={() => ubahWarna(i, c)}
                        className={cn(
                          'size-7 rounded-full border-2 transition-transform hover:scale-110',
                          c === warna ? 'border-foreground scale-110' : 'border-transparent',
                        )}
                        style={{ background: WARNA_TIM_HEX[c].isi }}
                      />
                    )
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[0, 1].map((k) => (
                    <div key={k}>
                      <Label htmlFor={`pemain-${i}-${k}`} className="text-xs">
                        Pemain {k + 1} ({k === 0 ? 'pion bulat' : 'pion permata'})
                      </Label>
                      <Masukan
                        id={`pemain-${i}-${k}`}
                        value={namaPemain[i]?.[k] ?? ''}
                        onChange={(e) =>
                          setNamaPemain((l) => l.map((pasangan, t) => (t === i ? pasangan.map((x, j) => (j === k ? e.target.value : x)) : pasangan)))
                        }
                        placeholder={`${namaTim[i] || `Tim ${i + 1}`} P${k + 1}`}
                        className="mt-1 h-9"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-card border border-border bg-card p-5 shadow-soft">
          <h2 className="text-base font-bold">Aturan uang</h2>
          <div className="mt-3 space-y-3">
            {(
              [
                ['kasAwal', 'Kas tim awal'],
                ['uangPribadiAwal', 'Dompet pribadi awal (per pemain)'],
                ['gaji', 'Gaji lewat Mulai'],
                ['targetKekayaan', 'Target kekayaan (menang)'],
                ['targetKerugian', 'Batas kerugian (gugur)'],
              ] as const
            ).map(([kunci, label]) => (
              <div key={kunci}>
                <Label htmlFor={kunci} className="text-xs">{label}</Label>
                <Masukan
                  id={kunci}
                  type="number"
                  min={0}
                  step={50}
                  value={angka[kunci]}
                  onChange={(e) => setAngka((a) => ({ ...a, [kunci]: Number(e.target.value) }))}
                  className="mt-1 h-9"
                />
              </div>
            ))}
            {galatAngka ? <PetunjukKolom galat>{galatAngka}</PetunjukKolom> : null}
          </div>
        </section>

        <section className="rounded-card border border-border bg-card p-5 shadow-soft">
          <Label htmlFor="benih">Benih acak</Label>
          <div className="mt-1 flex gap-2">
            <Masukan id="benih" type="number" value={benih} onChange={(e) => setBenih(Number(e.target.value) | 0)} className="h-9" />
            <Tombol varian="garis" ukuran="ikon" aria-label="Acak ulang benih" onClick={() => setBenih(benihAcak())}>
              <Shuffle />
            </Tombol>
          </div>
          <PetunjukKolom>Benih yang sama menghasilkan urutan dadu dan kartu yang sama — berguna untuk mengulang permainan.</PetunjukKolom>
        </section>

        <Tombol ukuran="lg" className="w-full" onClick={mulai} disabled={galatAngka !== null}>
          <Play /> Mulai permainan
        </Tombol>
        {onGantiMode ? (
          <Tombol varian="hantu" className="w-full" onClick={onGantiMode}>
            Ganti mode main
          </Tombol>
        ) : null}
      </aside>
    </div>
  )
}
