/**
 * Titik masuk build statis permainan — hanya papan Jelajah Dunia, tanpa
 * sidebar panel, tanpa router, tanpa login. Dipakai untuk membagikan
 * permainan sebagai satu folder statis (lihat `pnpm game:build`).
 */
import { Moon, Sun } from 'lucide-react'
import { StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Tombol } from '@/components/ui/tombol'
import { JelajahDunia } from '@/features/monopoli/jelajah-dunia'
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
    <main className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-5">
      <JelajahDunia
        kepala={
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Jelajah Dunia</h1>
              <p className="text-sm text-muted-foreground">
                Papan properti per tim. Main satu layar, atau bersama lewat kode ruang.
              </p>
            </div>
            <Tombol
              varian="garis"
              ukuran="ikon"
              onClick={ubahTema}
              aria-label={gelap ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            >
              {gelap ? <Sun /> : <Moon />}
            </Tombol>
          </div>
        }
      />
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Aplikasi />
  </StrictMode>,
)
