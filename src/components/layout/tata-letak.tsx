import { useEffect, useState } from 'react'
import { Dialog, PanelGeser } from '@/components/ui/lapisan'
import { KUNCI_SIMPANAN } from '@/config/app'
import { cn } from '@/lib/utils'
import { PaletPerintah } from './palet-perintah'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

function bacaRingkas() {
  try {
    return localStorage.getItem(KUNCI_SIMPANAN.sidebarKuncup) === '1'
  } catch {
    return false
  }
}

/** Kerangka aplikasi: sidebar tetap, topbar lengket, dan area konten. */
export function TataLetakAplikasi({ children }: { children: React.ReactNode }) {
  const [ringkas, setRingkas] = useState(bacaRingkas)
  const [menuHp, setMenuHp] = useState(false)
  const [palet, setPalet] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_SIMPANAN.sidebarKuncup, ringkas ? '1' : '0')
    } catch {
      // abaikan
    }
  }, [ringkas])

  // Pintasan papan ketik: Ctrl/Cmd + K membuka pencarian halaman.
  useEffect(() => {
    function onTombol(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalet((p) => !p)
      }
    }
    window.addEventListener('keydown', onTombol)
    return () => window.removeEventListener('keydown', onTombol)
  }, [])

  return (
    <div className="min-h-dvh">
      {/* Lewati navigasi — penting untuk pengguna papan ketik & pembaca layar. */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Lewati ke konten
      </a>

      {/* Sidebar layar besar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden border-r border-sidebar-border transition-[width] duration-200 ease-out-soft lg:block',
          ringkas ? 'w-20' : 'w-[264px]',
        )}
      >
        <Sidebar ringkas={ringkas} />
      </aside>

      {/* Sidebar layar kecil */}
      <Dialog open={menuHp} onOpenChange={setMenuHp}>
        <PanelGeser judul="Menu" sisi="kiri" className="max-w-[264px] p-0">
          <div className="h-full pt-2">
            <Sidebar onNavigasi={() => setMenuHp(false)} />
          </div>
        </PanelGeser>
      </Dialog>

      <div className={cn('transition-[padding] duration-200 ease-out-soft', ringkas ? 'lg:pl-20' : 'lg:pl-[264px]')}>
        <Topbar
          onBukaMenuHp={() => setMenuHp(true)}
          onToggleRingkas={() => setRingkas((r) => !r)}
          onBukaPalet={() => setPalet(true)}
        />
        <main id="konten-utama" className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6">
          {children}
        </main>
      </div>

      <PaletPerintah terbuka={palet} onUbah={setPalet} />
    </div>
  )
}
