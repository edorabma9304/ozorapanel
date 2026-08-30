import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { klienKueri } from '@/lib/kueri'
import { PenyediaAuth } from '@/lib/auth'
import { PenyediaTema } from '@/lib/tema'
import { PenyediaTooltip } from '@/components/ui/lapisan'
import { HalamanTakDitemukan } from '@/components/layout/halaman-galat'
import { Pemuat } from '@/components/ui/rangka'
import { bacaMerek, terapkanFavicon, terapkanWarna } from '@/config/merek'
import '@/styles/globals.css'

// Terapkan identitas merek tersimpan sebelum render pertama, supaya tidak ada
// kedipan warna bawaan lalu berubah.
const merek = bacaMerek()
terapkanWarna(merek)
terapkanFavicon(merek)

const router = createRouter({
  routeTree,
  defaultPreload: 'intent', // pra-muat saat kursor menyentuh tautan
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: HalamanTakDitemukan,
  // Rute dipecah per halaman, jadi pindah halaman = satu unduhan kecil.
  // Di jaringan lambat itu terasa; tampilkan indikator setelah 300 ms.
  defaultPendingMs: 300,
  defaultPendingMinMs: 400,
  defaultPendingComponent: () => <Pemuat label="Memuat halaman…" className="py-24" />,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const wadah = document.getElementById('root')
if (!wadah) throw new Error('Elemen #root tidak ditemukan di index.html')

createRoot(wadah).render(
  <StrictMode>
    <QueryClientProvider client={klienKueri}>
      <PenyediaTema>
        <PenyediaAuth>
          <PenyediaTooltip delayDuration={300}>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{ className: 'font-sans' }}
            />
          </PenyediaTooltip>
        </PenyediaAuth>
      </PenyediaTema>
    </QueryClientProvider>
  </StrictMode>,
)
