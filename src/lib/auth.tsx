import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { data } from '@/lib/adapter'
import type { Pengguna } from '@/lib/tipe'
import { punyaIzin, type Izin, type Peran } from '@/config/peran'

type NilaiAuth = {
  pengguna: Pengguna | null
  memuat: boolean
  sudahMasuk: boolean
  peran: Peran | null
  /** Cek satu izin, mis. `boleh('pengguna.hapus')`. */
  boleh: (izin: Izin) => boolean
  masukGoogle: (redirectKe?: string) => Promise<void>
  masukPeraga: ((peran: Peran) => Promise<void>) | null
  keluar: () => Promise<void>
  segarkan: () => Promise<void>
}

const KonteksAuth = createContext<NilaiAuth | null>(null)

export function PenyediaAuth({ children }: { children: ReactNode }) {
  const [pengguna, setPengguna] = useState<Pengguna | null>(null)
  const [memuat, setMemuat] = useState(true)

  const segarkan = useCallback(async () => {
    try {
      setPengguna(await data.auth.sesiSaatIni())
    } catch (e) {
      console.error('Gagal memuat sesi:', e)
      setPengguna(null)
    } finally {
      setMemuat(false)
    }
  }, [])

  useEffect(() => {
    void segarkan()
    return data.auth.pantau((p) => {
      setPengguna(p)
      setMemuat(false)
    })
  }, [segarkan])

  const nilai = useMemo<NilaiAuth>(
    () => ({
      pengguna,
      memuat,
      sudahMasuk: Boolean(pengguna),
      peran: pengguna?.peran ?? null,
      boleh: (izin) => punyaIzin(pengguna?.peran ?? null, izin),
      masukGoogle: (redirectKe) => data.auth.masukGoogle(redirectKe),
      masukPeraga: data.auth.masukPeraga
        ? async (peran: Peran) => {
            const p = await data.auth.masukPeraga!(peran)
            setPengguna(p)
          }
        : null,
      keluar: async () => {
        await data.auth.keluar()
        setPengguna(null)
      },
      segarkan,
    }),
    [pengguna, memuat, segarkan],
  )

  return <KonteksAuth value={nilai}>{children}</KonteksAuth>
}

export function useAuth(): NilaiAuth {
  const ctx = use(KonteksAuth)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <PenyediaAuth>')
  return ctx
}

/** Sembunyikan bagian UI yang tidak boleh diakses peran saat ini. */
export function Izinkan({
  izin,
  children,
  jikaTidak = null,
}: {
  izin: Izin
  children: ReactNode
  jikaTidak?: ReactNode
}) {
  const { boleh } = useAuth()
  return boleh(izin) ? <>{children}</> : <>{jikaTidak}</>
}
