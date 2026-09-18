/**
 * Menu pojok kiri papan dan pemberitahuan peristiwa.
 *
 * Daftar tim, catatan peristiwa, dan aturan TIDAK ikut ke papan utama — semua
 * di balik tombol di sini, dibuka hanya saat pemain butuh. Papan tengah cukup
 * memuat keputusan yang sedang berjalan.
 *
 * Berbeda dengan `hud.tsx` yang tercetak di atas ilustrasi papan, berkas ini
 * melayang di atas papan sebagai antarmuka biasa, jadi memakai token tema
 * seperti komponen lain.
 */
import { BookOpen, LogOut, Music, ScrollText, Users, Volume2, X } from 'lucide-react'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Lencana } from '@/components/ui/lencana'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { WARNA_TIM_HEX } from './aset'
import { anggotaTim, kekayaanTim, papanDari, pemainAktif } from './mesin'
import { DENDA_PENJARA } from './papan'
import { suara } from './suara'
import type { Aksi, Permainan } from './tipe'

const uang = (n: number) => `$${n.toLocaleString('id-ID')}`

/** Bilah kerugian baru muncul saat tim mulai mendekati batas. */
const AMBANG_PERINGATAN = 0.6

type Laci = 'tim' | 'catatan' | 'aturan'

export function MenuPapan({
  permainan, onAksi, onPermainanBaru, onKeluar,
}: {
  permainan: Permainan
  onAksi: (a: Aksi) => void
  onPermainanBaru: () => void
  /** Tinggalkan papan tanpa menghapus permainan. */
  onKeluar: () => void
}) {
  const [buka, setBuka] = useState<Laci | null>(null)
  const bunyi = useSyncExternalStore(suara.langganan, suara.cuplikan, suara.cuplikan)

  const tombol: Array<{ id: Laci; label: string; ikon: typeof Users }> = [
    { id: 'tim', label: 'Tim', ikon: Users },
    { id: 'catatan', label: 'Catatan', ikon: ScrollText },
    { id: 'aturan', label: 'Aturan', ikon: BookOpen },
  ]

  return (
    <div className="absolute left-3 top-3 z-10 flex items-start gap-2">
      <div className="flex flex-col gap-1 rounded-card bg-card/95 p-1 shadow-soft backdrop-blur">
        {tombol.map(({ id, label, ikon: Ikon }) => (
          <Tombol
            key={id}
            varian={buka === id ? 'halus' : 'hantu'}
            ukuran="sm"
            aria-expanded={buka === id}
            onClick={() => setBuka((l) => (l === id ? null : id))}
            className="justify-start"
          >
            <Ikon /> {label}
          </Tombol>
        ))}
        <div className="my-0.5 flex gap-1 border-y border-border py-1">
          <Tombol
            varian={bunyi.musik ? 'halus' : 'hantu'}
            ukuran="ikon-sm"
            aria-pressed={bunyi.musik}
            aria-label={bunyi.musik ? 'Matikan musik' : 'Nyalakan musik'}
            title="Musik latar"
            onClick={() => suara.aturMusik(!bunyi.musik)}
          >
            <Music />
          </Tombol>
          <Tombol
            varian={bunyi.efek ? 'halus' : 'hantu'}
            ukuran="ikon-sm"
            aria-pressed={bunyi.efek}
            aria-label={bunyi.efek ? 'Matikan efek suara' : 'Nyalakan efek suara'}
            title="Efek suara"
            onClick={() => suara.aturEfek(!bunyi.efek)}
          >
            <Volume2 />
          </Tombol>
        </div>

        <Tombol varian="hantu" ukuran="sm" onClick={onKeluar} className="justify-start">
          <LogOut /> Keluar
        </Tombol>
        <Tombol varian="hantu" ukuran="sm" onClick={onPermainanBaru} className="justify-start text-danger-kuat">
          Permainan baru
        </Tombol>
      </div>

      {buka ? (
        <div className="flex max-h-[min(70vh,560px)] w-80 flex-col rounded-card border border-border bg-card shadow-raised">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
            <h2 className="text-sm font-bold">
              {buka === 'tim' ? 'Tim' : buka === 'catatan' ? 'Catatan peristiwa' : 'Aturan singkat'}
            </h2>
            <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Tutup" onClick={() => setBuka(null)}>
              <X />
            </Tombol>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin">
            {buka === 'tim' ? <DaftarTim permainan={permainan} onAksi={onAksi} /> : null}
            {buka === 'catatan' ? <Catatan permainan={permainan} /> : null}
            {buka === 'aturan' ? <Aturan permainan={permainan} /> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function DaftarTim({ permainan, onAksi }: { permainan: Permainan; onAksi: (a: Aksi) => void }) {
  const papan = papanDari(permainan)
  const aktif = pemainAktif(permainan)

  return (
    <ul className="space-y-2.5">
      {permainan.tim.map((tim) => {
        const warna = WARNA_TIM_HEX[tim.warna]
        const kekayaan = kekayaanTim(permainan, tim.id)
        const properti = Object.values(permainan.milik).filter((m) => m.tim === tim.id)
        const bangunan = properti.reduce((a, m) => a + m.tingkat, 0)
        const giliran = aktif.tim === tim.id && permainan.fase.jenis !== 'selesai'
        const rasioKekayaan = kekayaan / permainan.pengaturan.targetKekayaan
        const rasioRugi = tim.kerugian / permainan.pengaturan.targetKerugian

        return (
          <li
            key={tim.id}
            className={cn('rounded-control border p-2.5', giliran ? 'border-primary bg-primary-soft/40' : 'border-border', tim.gugur && 'opacity-55')}
          >
            <div className="flex items-center gap-2">
              <span className="size-3 shrink-0 rounded-full border border-black/25" style={{ background: warna.isi }} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{tim.nama}</span>
              {giliran ? <Lencana warna="primary" ukuran="sm">giliran</Lencana> : null}
              <span className="text-sm font-bold tabular-nums">{uang(kekayaan)}</span>
            </div>

            {tim.gugur ? (
              <p className="mt-1 text-xs font-semibold text-danger-kuat">Gugur — {tim.alasanGugur}</p>
            ) : (
              <>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={Math.round(Math.min(100, rasioKekayaan * 100))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Kekayaan ${tim.nama} menuju target`}
                >
                  <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, rasioKekayaan * 100)}%` }} />
                </div>

                {rasioRugi >= AMBANG_PERINGATAN ? (
                  <p className="mt-1.5 text-xs font-bold text-danger-kuat">
                    Kerugian {uang(tim.kerugian)} dari batas {uang(permainan.pengaturan.targetKerugian)}
                  </p>
                ) : null}

                <p className="mt-1.5 text-xs text-muted-foreground">
                  {anggotaTim(permainan, tim.id).map((x) => `${x.nama} ${uang(x.uang)}`).join(' · ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Kas {uang(tim.kas)} · {properti.length} properti · {bangunan} bangunan · asal {papan.wilayah[tim.id]!.nama}
                </p>

                {giliran ? (
                  <button
                    type="button"
                    className="mt-1.5 text-xs font-semibold text-danger-kuat hover:underline"
                    onClick={() => {
                      if (window.confirm(`${tim.nama} menyerah? Semua properti kembali ke bank.`)) onAksi({ jenis: 'menyerah', tim: tim.id })
                    }}
                  >
                    menyerah
                  </button>
                ) : null}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function Catatan({ permainan }: { permainan: Permainan }) {
  const terbaru = permainan.log.slice(-80).toReversed()
  if (terbaru.length === 0) return <p className="text-xs text-muted-foreground">Belum ada peristiwa.</p>
  return (
    <ol className="space-y-1 text-xs">
      {terbaru.map((e) => {
        const tim = e.tim !== undefined ? permainan.tim[e.tim] : undefined
        return (
          <li
            key={e.urut}
            className={cn(
              'flex gap-2 rounded-control px-2 py-1.5',
              e.nada === 'baik' && 'bg-success-soft text-success-kuat',
              e.nada === 'buruk' && 'bg-danger-soft text-danger-kuat',
              e.nada === 'penting' && 'bg-warning-soft font-semibold text-warning-kuat',
              e.nada === 'biasa' && 'text-muted-foreground',
            )}
          >
            {tim ? (
              <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: WARNA_TIM_HEX[tim.warna].isi }} aria-hidden />
            ) : (
              <span className="size-2 shrink-0" aria-hidden />
            )}
            <span>{e.teks}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Aturan({ permainan }: { permainan: Permainan }) {
  const p = permainan.pengaturan
  const baris: Array<[string, string]> = [
    ['Tim dan pion', 'Satu tim dua pemain: pion bulat dan pion permata. Giliran berputar Tim 1 P1, Tim 1 P2, Tim 2 P1, dan seterusnya.'],
    ['Dua dompet', 'Gaji dan hadiah kartu masuk dompet pribadi. Sewa yang diterima masuk kas tim. Pembelian dibayar kas tim lebih dulu. Semua otomatis, tidak perlu dipilih.'],
    ['Properti milik tim', 'Siapa pun yang membeli, propertinya milik seluruh tim. Rekan setim tidak saling membayar sewa.'],
    ['Kelompok warna', 'Kuasai tiga kota sewarna: sewa tanah kosong jadi dua kali lipat dan tim boleh membangun. Bangunan harus merata.'],
    ['Tingkat bangunan', 'Rumah, Vila, Menara, Pencakar langit. Makin tinggi gedungnya, makin besar sewanya.'],
    ['Bandara', 'Sewa naik menurut jumlah bandara yang dikuasai, dari $25 sampai $200.'],
    ['Penjara', `Bebas dengan dadu kembar, kartu bebas, atau denda ${uang(DENDA_PENJARA)}. Setelah tiga giliran denda dipotong otomatis.`],
    ['Menang', `Kekayaan tim mencapai ${uang(p.targetKekayaan)} saat giliran berakhir. Kekayaan dihitung dari kas, dompet, nilai properti, dan bangunan.`],
    ['Gugur', `Kerugian terkumpul menembus ${uang(p.targetKerugian)}, atau tim bangkrut. Propertinya kembali ke bank.`],
  ]
  return (
    <div className="space-y-2.5">
      {baris.map(([judul, isi]) => (
        <div key={judul}>
          <p className="text-xs font-bold">{judul}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{isi}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Pemberitahuan singkat peristiwa terbaru. Menggantikan kolom catatan yang
 * dulu selalu terbuka: pemain cukup melirik, riwayat penuh ada di menu.
 */
export function TosPeristiwa({ permainan, tahan }: { permainan: Permainan; tahan?: boolean }) {
  const terbaru = permainan.log.at(-1)
  const urut = terbaru?.urut ?? 0

  // Peristiwa baru langsung memunculkan pesan lagi; penyembunyian dikerjakan
  // timer, bukan render, supaya tidak memicu render berantai.
  const [terakhir, setTerakhir] = useState(urut)
  const [sembunyi, setSembunyi] = useState(false)
  if (urut !== terakhir) {
    setTerakhir(urut)
    setSembunyi(false)
  }

  // Selama dadu bergulir pesan ditahan supaya hasil lemparan tidak bocor
  // sebelum dadunya berhenti.
  useEffect(() => {
    if (!urut || tahan) return
    const timer = setTimeout(() => setSembunyi(true), 4500)
    return () => clearTimeout(timer)
  }, [urut, tahan])

  if (!terbaru || sembunyi || tahan) return null
  const tampil = terbaru
  const tim = tampil.tim !== undefined ? permainan.tim[tampil.tim] : undefined

  return (
    <div
      aria-live="polite"
      className={cn(
        'monopoli-kartu-muncul pointer-events-none absolute bottom-3 left-1/2 z-10 flex max-w-[min(92%,30rem)] -translate-x-1/2 items-center gap-2 rounded-card border px-3.5 py-2 text-sm font-semibold shadow-raised backdrop-blur',
        tampil.nada === 'baik' && 'border-success/40 bg-success-soft/95 text-success-kuat',
        tampil.nada === 'buruk' && 'border-danger/40 bg-danger-soft/95 text-danger-kuat',
        tampil.nada === 'penting' && 'border-warning/40 bg-warning-soft/95 text-warning-kuat',
        tampil.nada === 'biasa' && 'border-border bg-card/95 text-foreground',
      )}
    >
      {tim ? (
        <span className="size-2.5 shrink-0 rounded-full border border-black/25" style={{ background: WARNA_TIM_HEX[tim.warna].isi }} aria-hidden />
      ) : null}
      <span>{tampil.teks}</span>
    </div>
  )
}
