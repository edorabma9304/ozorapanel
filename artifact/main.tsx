/**
 * Titik masuk build statis permainan — hanya papan Jelajah Dunia, tanpa
 * sidebar panel, tanpa router, tanpa login. Dipakai untuk membagikan
 * permainan sebagai satu folder statis (lihat `pnpm game:build`).
 */
import { Eye, EyeOff, Moon, RotateCcw, Sun } from 'lucide-react'
import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Tombol } from '@/components/ui/tombol'
import { Permainan } from '@/features/monopoli/permainan'
import './game.css'

const KUNCI_TEMA = 'ozora_panel_tema'

/**
 * Urutan penentuan tema: pilihan pengguna → tema yang dipaksa oleh halaman
 * induk (atribut `data-theme`, dipakai saat build ini ditanam di tempat lain)
 * → preferensi sistem.
 */
function bacaGelap() {
  try {
    const t = localStorage.getItem(KUNCI_TEMA)
    if (t === 'gelap') return true
    if (t === 'terang') return false
  } catch {
    // storage diblokir — lanjut ke penentu berikutnya
  }
  const dipaksa = document.documentElement.dataset['theme']
  if (dipaksa === 'dark') return true
  if (dipaksa === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function Aplikasi() {
  const [gelap, setGelap] = useState(bacaGelap)

  // Selaraskan kelas .dark dengan keadaan — skrip pra-paint bisa menebak
  // berbeda bila halaman induk memaksa tema lewat `data-theme`.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', gelap)
  }, [gelap])

  const ubahTema = useCallback(() => {
    setGelap((lama) => {
      const baru = !lama
      document.documentElement.classList.toggle('dark', baru)
      try {
        localStorage.setItem(KUNCI_TEMA, baru ? 'gelap' : 'terang')
      } catch {
        // abaikan
      }
      return baru
    })
  }, [])

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
      <Permainan
        kepala={({ berjalan, ikuti, setIkuti, permainanBaru }) => (
          <div className="relative overflow-hidden rounded-card border border-border bg-card px-5 py-5 shadow-soft sm:px-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-primary-soft/70 blur-2xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Jelajah Dunia</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Papan properti dimainkan per tim: dua pemain satu tim, uang pribadi dan kas bersama,
                  papan membesar mengikuti jumlah tim.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {berjalan ? (
                  <>
                    <Tombol varian="garis" onClick={() => setIkuti(!ikuti)} aria-pressed={ikuti}>
                      {ikuti ? <Eye /> : <EyeOff />} {ikuti ? 'Ikuti pion' : 'Pandangan bebas'}
                    </Tombol>
                    <Tombol varian="garis" onClick={permainanBaru}>
                      <RotateCcw /> Permainan baru
                    </Tombol>
                  </>
                ) : null}
                <Tombol
                  varian="garis"
                  ukuran="ikon"
                  onClick={ubahTema}
                  aria-label={gelap ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
                >
                  {gelap ? <Sun /> : <Moon />}
                </Tombol>
              </div>
            </div>
          </div>
        )}
      />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Aplikasi />
  </StrictMode>,
)
