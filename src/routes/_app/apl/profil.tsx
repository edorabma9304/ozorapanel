import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Images, MessageSquare, UserPlus, Users } from 'lucide-react'
import { Kartu } from '@/components/ui/kartu'
import { Avatar } from '@/components/ui/avatar'
import { Tombol } from '@/components/ui/tombol'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { formatAngka } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import { gambarPeraga, FOTO_CONTOH, PENGIKUT_CONTOH } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const TAB = [
  { href: '/apl/profil', label: 'Profil', ikon: MessageSquare },
  { href: '/apl/profil/pengikut', label: 'Pengikut', ikon: Users },
  { href: '/apl/profil/teman', label: 'Teman', ikon: UserPlus },
  { href: '/apl/profil/galeri', label: 'Galeri', ikon: Images },
] as const

const SAMPUL = gambarPeraga('sampul-profil', 1600, 400)

function TataLetakProfil() {
  const { pengguna } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const jumlahTeman = PENGIKUT_CONTOH.filter((p) => p.teman).length

  return (
    <>
      <KepalaHalaman
        judul="Profil pengguna"
        deskripsi="Halaman profil bergaya sosial: sampul, statistik, dan lini masa."
        remah={[{ label: 'Aplikasi' }, { label: 'Profil pengguna' }]}
      />

      <Kartu className="overflow-hidden">
        {/* Sampul */}
        <div className="relative h-40 sm:h-56">
          <img src={SAMPUL} alt="" className="size-full object-cover" width={1600} height={400} />
        </div>

        {/* Identitas + statistik */}
        <div className="grid gap-6 px-5 pb-5 sm:grid-cols-3 sm:items-end sm:px-6">
          <div className="order-2 flex justify-around gap-4 sm:order-1 sm:justify-start sm:gap-8">
            {[
              { label: 'Kiriman', nilai: 938 },
              { label: 'Pengikut', nilai: 3586 },
              { label: 'Mengikuti', nilai: 2659 },
            ].map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="text-lg font-extrabold">{formatAngka(s.nilai)}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="order-1 -mt-14 text-center sm:order-2 sm:-mt-16">
            <Avatar
              nama={pengguna?.nama ?? 'Pengguna'}
              src={pengguna?.avatar_url}
              ukuran="xl"
              className="mx-auto size-24 ring-4 ring-card"
            />
            <h2 className="mt-3 text-lg font-extrabold">{pengguna?.nama}</h2>
            <p className="text-sm text-muted-foreground">{pengguna?.jabatan ?? 'Anggota tim'}</p>
          </div>

          <div className="order-3 flex justify-center gap-2 sm:justify-end">
            <Tombol varian="garis">
              <MessageSquare /> Pesan
            </Tombol>
            <Tombol>
              <UserPlus /> Ikuti
            </Tombol>
          </div>
        </div>

        {/* Tab navigasi — masing-masing rute tersendiri, bisa di-bookmark */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 scrollbar-thin" aria-label="Bagian profil">
          {TAB.map((t) => {
            const aktif = pathname === t.href
            return (
              <Link
                key={t.href}
                to={t.href}
                className={cn(
                  '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                  aktif
                    ? 'border-primary text-primary-kuat'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                aria-current={aktif ? 'page' : undefined}
              >
                <t.ikon className="size-4" />
                {t.label}
                {t.href.endsWith('pengikut') ? (
                  <span className="text-xs text-muted-foreground">{PENGIKUT_CONTOH.length}</span>
                ) : t.href.endsWith('teman') ? (
                  <span className="text-xs text-muted-foreground">{jumlahTeman}</span>
                ) : t.href.endsWith('galeri') ? (
                  <span className="text-xs text-muted-foreground">{FOTO_CONTOH.length}</span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </Kartu>

      <Outlet />
    </>
  )
}

export const Route = createFileRoute('/_app/apl/profil')({ component: TataLetakProfil })
