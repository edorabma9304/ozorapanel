/**
 * Pintu masuk permainan: pilih main satu layar atau main bersama lewat kode
 * ruang. Dipakai halaman panel maupun build statis.
 */
import { MonitorSmartphone, Users } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { APP } from '@/config/app'
import { Tombol } from '@/components/ui/tombol'
import { PermainanDaring, type FabrikTransport } from './daring'
import { Permainan } from './permainan'
import { transportSiaran } from './transport'

/** Lintas perangkat hanya mungkin bila backend permainan sudah dipasang. */
const LINTAS_PERANGKAT = Boolean(APP.supabase.url && APP.supabase.anonKey)

const CATATAN_SIARAN =
  'Backend permainan belum dipasang, jadi mode bersama di sini hanya menyambung antar tab di browser yang sama. Langkah memasangnya ada di docs/MONOPOLI.md.'

type Mode = 'pilih' | 'lokal' | 'daring'

export function JelajahDunia({
  kepala,
  buatTransport,
  catatanTransport,
}: {
  kepala?: ReactNode
  /** Paksa transport tertentu; biasanya dibiarkan agar dipilih otomatis. */
  buatTransport?: FabrikTransport
  catatanTransport?: ReactNode
}) {
  const [mode, setMode] = useState<Mode>('pilih')
  const [fabrik, setFabrik] = useState<FabrikTransport | null>(buatTransport ?? null)
  const [memuat, setMemuat] = useState(false)

  async function bukaDaring() {
    if (fabrik) {
      setMode('daring')
      return
    }
    if (!LINTAS_PERANGKAT) {
      setFabrik(() => transportSiaran)
      setMode('daring')
      return
    }
    // Pustaka Supabase hanya diunduh saat mode bersama benar-benar dipakai.
    setMemuat(true)
    const modul = await import('./transport-supabase')
    setFabrik(() => modul.transportSupabase)
    setMemuat(false)
    setMode('daring')
  }

  if (mode === 'lokal') {
    return <Permainan kepala={kepala} onGantiMode={() => setMode('pilih')} />
  }
  if (mode === 'daring') {
    return (
      <PermainanDaring
        kepala={kepala}
        buatTransport={fabrik ?? transportSiaran}
        catatanTransport={catatanTransport ?? (LINTAS_PERANGKAT ? undefined : CATATAN_SIARAN)}
        onGantiMode={() => setMode('pilih')}
      />
    )
  }

  return (
    <>
      {kepala}
      <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <section className="flex flex-col rounded-card border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <MonitorSmartphone className="size-4" /> Satu layar
          </h2>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">
            Semua pemain memakai perangkat ini dan bergantian. Tidak perlu koneksi.
          </p>
          <Tombol className="mt-4" onClick={() => setMode('lokal')}>
            Main satu layar
          </Tombol>
        </section>

        <section className="flex flex-col rounded-card border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Users className="size-4" /> Main bersama
          </h2>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">
            Tiap orang di perangkatnya sendiri. Buat ruang, bagikan kodenya, lalu
            pilih kursi. Ada obrolan untuk semua dan untuk rekan setim.
            {LINTAS_PERANGKAT ? '' : ' Di build ini baru menyambung antar tab di browser yang sama.'}
          </p>
          <Tombol varian="garis" className="mt-4" memuat={memuat} onClick={() => void bukaDaring()}>
            Buat atau gabung ruang
          </Tombol>
        </section>
      </div>
    </>
  )
}
