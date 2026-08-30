import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { MENU, type ItemMenu } from '@/config/menu'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Lencana } from '@/components/ui/lencana'
import { Tooltip } from '@/components/ui/lapisan'
import { Logo } from './logo'

function aktifkan(pathname: string, href?: string) {
  if (!href) return false
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

function ItemTunggal({
  item,
  ringkas,
  onNavigasi,
}: {
  item: ItemMenu
  ringkas: boolean
  onNavigasi?: () => void
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const aktif = aktifkan(pathname, item.href)
  const Ikon = item.icon

  const isi = (
    <Link
      to={item.href!}
      onClick={onNavigasi}
      className={cn(
        'group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors',
        ringkas && 'justify-center px-0',
        aktif
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'text-sidebar-muted hover:bg-primary-soft hover:text-primary-kuat',
      )}
      aria-current={aktif ? 'page' : undefined}
    >
      {Ikon ? <Ikon className="size-5 shrink-0" aria-hidden /> : null}
      {!ringkas ? (
        <>
          <span className="flex-1 truncate">{item.judul}</span>
          {item.lencana ? (
            <Lencana ukuran="sm" warna={item.warnaLencana ?? 'primary'} padat={aktif}>
              {item.lencana}
            </Lencana>
          ) : null}
        </>
      ) : null}
    </Link>
  )

  return ringkas ? (
    <Tooltip isi={item.judul} sisi="right">
      <span>{isi}</span>
    </Tooltip>
  ) : (
    isi
  )
}

function ItemBersarang({ item, onNavigasi }: { item: ItemMenu; onNavigasi?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const adaAnakAktif = item.anak?.some((a) => aktifkan(pathname, a.href)) ?? false
  const [terbuka, setTerbuka] = useState(adaAnakAktif)
  const Ikon = item.icon

  return (
    <div>
      <button
        type="button"
        onClick={() => setTerbuka((t) => !t)}
        aria-expanded={terbuka}
        className={cn(
          'flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold transition-colors',
          adaAnakAktif ? 'text-primary-kuat' : 'text-sidebar-muted hover:bg-primary-soft hover:text-primary-kuat',
        )}
      >
        {Ikon ? <Ikon className="size-5 shrink-0" aria-hidden /> : null}
        <span className="flex-1 truncate text-left">{item.judul}</span>
        <ChevronDown className={cn('size-4 transition-transform', terbuka && 'rotate-180')} />
      </button>

      {terbuka ? (
        <div className="mt-1 ml-4 space-y-0.5 border-l border-sidebar-border pl-3">
          {item.anak!.map((anak) => {
            const aktif = aktifkan(pathname, anak.href)
            return (
              <Link
                key={anak.href}
                to={anak.href!}
                onClick={onNavigasi}
                className={cn(
                  'block rounded-control px-3 py-2 text-sm transition-colors',
                  aktif
                    ? 'font-semibold text-primary-kuat'
                    : 'text-sidebar-muted hover:text-primary-kuat',
                )}
              >
                {anak.judul}
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function Sidebar({
  ringkas = false,
  onNavigasi,
}: {
  ringkas?: boolean
  onNavigasi?: () => void
}) {
  const { boleh } = useAuth()

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('flex h-16 shrink-0 items-center border-b border-sidebar-border px-4', ringkas && 'justify-center px-0')}>
        <Link to="/" onClick={onNavigasi} aria-label="Ke dasbor">
          <Logo ringkas={ringkas} />
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Menu utama">
        {MENU.map((grup) => {
          const item = grup.item.filter((i) => !i.izin || boleh(i.izin))
          if (item.length === 0) return null
          return (
            <div key={grup.judul}>
              {!ringkas ? (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted">
                  {grup.judul}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-8 bg-sidebar-border" />
              )}
              <div className="space-y-0.5">
                {item.map((i) =>
                  i.anak && !ringkas ? (
                    <ItemBersarang key={i.judul} item={i} onNavigasi={onNavigasi} />
                  ) : i.href ? (
                    <ItemTunggal key={i.judul} item={i} ringkas={ringkas} onNavigasi={onNavigasi} />
                  ) : null,
                )}
              </div>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
