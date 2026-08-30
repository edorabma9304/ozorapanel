import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { KUNCI_SIMPANAN } from '@/config/app'

export type Tema = 'terang' | 'gelap' | 'sistem'

type NilaiTema = {
  tema: Tema
  /** Tema yang benar-benar dipakai setelah "sistem" diterjemahkan. */
  efektif: 'terang' | 'gelap'
  setTema: (t: Tema) => void
}

const KonteksTema = createContext<NilaiTema | null>(null)

function bacaTema(): Tema {
  try {
    const t = localStorage.getItem(KUNCI_SIMPANAN.tema)
    if (t === 'terang' || t === 'gelap' || t === 'sistem') return t
  } catch {
    // storage diblokir — pakai bawaan
  }
  return 'sistem'
}

function sistemGelap() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function PenyediaTema({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<Tema>(bacaTema)
  const [gelapSistem, setGelapSistem] = useState(sistemGelap)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onUbah = (e: MediaQueryListEvent) => setGelapSistem(e.matches)
    mq.addEventListener('change', onUbah)
    return () => mq.removeEventListener('change', onUbah)
  }, [])

  const efektif: 'terang' | 'gelap' =
    tema === 'sistem' ? (gelapSistem ? 'gelap' : 'terang') : tema

  useEffect(() => {
    document.documentElement.classList.toggle('dark', efektif === 'gelap')
  }, [efektif])

  const setTema = useCallback((t: Tema) => {
    setTemaState(t)
    try {
      localStorage.setItem(KUNCI_SIMPANAN.tema, t)
    } catch {
      // abaikan
    }
  }, [])

  const nilai = useMemo(() => ({ tema, efektif, setTema }), [tema, efektif, setTema])
  return <KonteksTema value={nilai}>{children}</KonteksTema>
}

export function useTema(): NilaiTema {
  const ctx = use(KonteksTema)
  if (!ctx) throw new Error('useTema harus dipakai di dalam <PenyediaTema>')
  return ctx
}
