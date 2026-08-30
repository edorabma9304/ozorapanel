import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { BagianPeraga } from '@/components/data/bagian-peraga'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { cn } from '@/lib/utils'

const MASUK = [
  { kelas: 'animate-in fade-in duration-500', label: 'fade-in' },
  { kelas: 'animate-in slide-in-from-bottom-4 duration-500', label: 'slide-in-from-bottom' },
  { kelas: 'animate-in zoom-in-95 duration-500', label: 'zoom-in' },
  { kelas: 'animate-in spin-in-90 duration-500', label: 'spin-in' },
]

const BERULANG = [
  { kelas: 'animate-pulse', label: 'animate-pulse' },
  { kelas: 'animate-bounce', label: 'animate-bounce' },
  { kelas: 'animate-spin', label: 'animate-spin' },
  { kelas: 'animate-ping', label: 'animate-ping' },
]

function HalamanAnimasi() {
  const [kunci, setKunci] = useState(0)

  return (
    <>
      <KepalaHalaman
        judul="Animasi"
        deskripsi="Utilitas transisi bawaan. Semuanya berbasis CSS — tidak ada pustaka animasi tambahan."
        remah={[{ label: 'Elemen UI' }, { label: 'Animasi' }]}
        aksi={<Tombol varian="garis" onClick={() => setKunci((k) => k + 1)}>Putar ulang</Tombol>}
      />

      <Peringatan varian="info" judul="Menghormati preferensi pengguna">
        Semua animasi otomatis dimatikan bila sistem pengguna mengaktifkan
        “kurangi gerakan”. Aturannya ada di <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">globals.css</code>{' '}
        pada blok <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">prefers-reduced-motion</code>.
      </Peringatan>

      <BagianPeraga judul="Animasi masuk" deskripsi="Dipakai saat elemen pertama kali muncul — dialog, dropdown, kartu.">
        {MASUK.map((a) => (
          <div key={a.label} className="text-center">
            <div key={`${a.label}-${kunci}`} className={cn('grid size-24 place-items-center rounded-card bg-primary-soft text-primary-kuat', a.kelas)}>
              <span className="text-xs font-bold">Halo</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{a.label}</p>
          </div>
        ))}
      </BagianPeraga>

      <BagianPeraga judul="Animasi berulang" deskripsi="Untuk keadaan menunggu dan penanda perhatian.">
        {BERULANG.map((a) => (
          <div key={a.label} className="text-center">
            <div className={cn('mx-auto size-16 rounded-card bg-primary', a.kelas)} />
            <p className="mt-2 font-mono text-xs text-muted-foreground">{a.label}</p>
          </div>
        ))}
      </BagianPeraga>

      <Kartu>
        <IsiKartu>
          <h2 className="text-base font-bold">Transisi saat kursor menyentuh</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Lebih murah dari animasi JavaScript dan tidak memblokir utas utama.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="grid size-28 cursor-pointer place-items-center rounded-card bg-muted text-sm font-semibold transition-transform duration-300 ease-out-soft hover:scale-105">
              scale
            </div>
            <div className="grid size-28 cursor-pointer place-items-center rounded-card bg-muted text-sm font-semibold shadow-soft transition-shadow duration-300 hover:shadow-raised">
              shadow
            </div>
            <div className="grid size-28 cursor-pointer place-items-center rounded-card bg-muted text-sm font-semibold transition-colors duration-300 hover:bg-primary hover:text-primary-foreground">
              colors
            </div>
            <div className="grid size-28 cursor-pointer place-items-center rounded-card bg-muted text-sm font-semibold transition-all duration-300 ease-out-soft hover:-translate-y-1.5 hover:shadow-raised">
              translate
            </div>
          </div>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/ui/animasi')({ component: HalamanAnimasi })
