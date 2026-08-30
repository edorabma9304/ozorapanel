import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Bell, Building2, Globe, Mail, Palette, Send, Sparkles,
} from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu } from '@/components/ui/kartu'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

const MENU = [
  { href: '/pengaturan', label: 'Umum', ket: 'Identitas & lokalisasi', ikon: Building2 },
  { href: '/pengaturan/merek', label: 'Merek', ket: 'Logo, favicon, warna', ikon: Sparkles },
  { href: '/pengaturan/seo', label: 'SEO & analitik', ket: 'Meta, GA4, Search Console', ikon: Globe },
  { href: '/pengaturan/surel', label: 'Surel (SMTP)', ket: 'Server pengiriman surel', ikon: Mail },
  { href: '/pengaturan/telegram', label: 'Telegram', ket: 'Bot notifikasi', ikon: Send },
  { href: '/pengaturan/tampilan', label: 'Tampilan', ket: 'Tema terang & gelap', ikon: Palette },
  { href: '/pengaturan/notifikasi', label: 'Notifikasi', ket: 'Peristiwa yang dikabarkan', ikon: Bell },
] as const

function TataLetakPengaturan() {
  const { boleh } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (!boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  const aktifSekarang = MENU.find((m) => m.href === pathname)

  return (
    <>
      <KepalaHalaman
        judul="Pengaturan"
        deskripsi={aktifSekarang?.ket ?? 'Konfigurasi aplikasi dan integrasi pihak ketiga.'}
        remah={[{ label: 'Halaman' }, { label: 'Pengaturan' }, ...(aktifSekarang && aktifSekarang.href !== '/pengaturan' ? [{ label: aktifSekarang.label }] : [])]}
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Kartu className="h-fit p-2">
          <nav className="space-y-0.5" aria-label="Bagian pengaturan">
            {MENU.map((m) => {
              const aktif = pathname === m.href
              return (
                <Link
                  key={m.href}
                  to={m.href}
                  className={cn(
                    'flex items-start gap-3 rounded-control px-3 py-2.5 transition-colors',
                    aktif ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                  )}
                  aria-current={aktif ? 'page' : undefined}
                >
                  <m.ikon className="mt-0.5 size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{m.label}</span>
                    <span className={cn('block truncate text-xs', aktif ? '' : 'text-muted-foreground')}>
                      {m.ket}
                    </span>
                  </span>
                </Link>
              )
            })}
          </nav>
        </Kartu>

        <div className="space-y-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/pengaturan')({ component: TataLetakPengaturan })
