import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Dialog, IsiDialog } from '@/components/ui/lapisan'
import { Masukan } from '@/components/ui/masukan'
import { MENU_RATA } from '@/config/menu'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

/** Pencarian menu cepat — buka dengan Ctrl/Cmd + K. */
export function PaletPerintah({ terbuka, onUbah }: { terbuka: boolean; onUbah: (b: boolean) => void }) {
  const [kueri, setKueri] = useState('')
  const [sorot, setSorot] = useState(0)
  const navigate = useNavigate()
  const { boleh } = useAuth()

  const hasil = useMemo(() => {
    const q = kueri.trim().toLowerCase()
    return MENU_RATA.filter((m) => (!m.izin || boleh(m.izin)) && (!q || m.judul.toLowerCase().includes(q)))
      .slice(0, 8)
  }, [kueri, boleh])

  function ubahKueri(nilai: string) {
    setKueri(nilai)
    setSorot(0) // hasil berubah — sorotan kembali ke atas
  }

  function ubahTerbuka(buka: boolean) {
    if (!buka) {
      setKueri('')
      setSorot(0)
    }
    onUbah(buka)
  }

  function onTombol(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSorot((s) => (s + 1) % Math.max(1, hasil.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSorot((s) => (s - 1 + hasil.length) % Math.max(1, hasil.length))
    } else if (e.key === 'Enter') {
      const pilihan = hasil[sorot]
      if (pilihan) {
        e.preventDefault()
        onUbah(false)
        void navigate({ to: pilihan.href })
      }
    }
  }

  return (
    <Dialog open={terbuka} onOpenChange={ubahTerbuka}>
      <IsiDialog judul="Cari halaman" deskripsi="Ketik nama halaman lalu tekan Enter." lebar="md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Masukan
            autoFocus
            value={kueri}
            onChange={(e) => ubahKueri(e.target.value)}
            onKeyDown={onTombol}
            placeholder="Ketik untuk mencari…"
            className="pl-9"
            aria-label="Cari halaman"
          />
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
          {hasil.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada halaman yang cocok.</p>
          ) : (
            hasil.map((m, i) => {
              const Ikon = m.icon
              return (
                <button
                  key={m.href}
                  type="button"
                  onMouseEnter={() => setSorot(i)}
                  onClick={() => {
                    onUbah(false)
                    void navigate({ to: m.href })
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm transition-colors',
                    i === sorot ? 'bg-primary-soft text-primary-kuat' : 'hover:bg-muted',
                  )}
                >
                  {Ikon ? <Ikon className="size-4 shrink-0" aria-hidden /> : null}
                  <span className="flex-1 truncate font-medium">{m.judul}</span>
                  <span className="text-xs text-muted-foreground">{m.grup}</span>
                </button>
              )
            })
          )}
        </div>
      </IsiDialog>
    </Dialog>
  )
}
