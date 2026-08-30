import { Link } from '@tanstack/react-router'
import {
  Bell, LogOut, Menu, Monitor, Moon, PanelLeft, Search, Settings, Sun, UserCircle,
} from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { Avatar } from '@/components/ui/avatar'
import { Lencana } from '@/components/ui/lencana'
import {
  Dropdown, IsiDropdown, ItemDropdown, LabelDropdown, PemicuDropdown, PemisahDropdown,
} from '@/components/ui/lapisan'
import { useAuth } from '@/lib/auth'
import { useTema, type Tema } from '@/lib/tema'
import { LABEL_PERAN, WARNA_PERAN } from '@/config/peran'
import { formatWaktuRelatif } from '@/lib/format'
import { cn } from '@/lib/utils'

// Kelas warna ditulis lengkap — Tailwind memindai kode secara statis,
// jadi `bg-${warna}` tidak akan pernah ikut ter-generate.
const WARNA_TITIK = {
  primary: 'bg-primary',
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
} as const

// Waktu dihitung sekali saat modul dimuat. Memanggil Date.now() di dalam
// render membuat hasilnya berubah tiap render ulang tanpa alasan.
const DIMUAT = Date.now()

const NOTIFIKASI = [
  { id: 1, judul: 'Pesanan baru masuk', detail: 'INV-2026-1042 dari Dewi Kusuma', waktu: new Date(DIMUAT - 12 * 60_000).toISOString(), warna: 'primary' as const },
  { id: 2, judul: 'Stok menipis', detail: 'Kursi Ergonomis Pro tersisa 4 unit', waktu: new Date(DIMUAT - 3 * 3_600_000).toISOString(), warna: 'warning' as const },
  { id: 3, judul: 'Pembayaran diterima', detail: 'FKT-20260112 senilai Rp 4.250.000', waktu: new Date(DIMUAT - 26 * 3_600_000).toISOString(), warna: 'success' as const },
]

const OPSI_TEMA: Array<{ nilai: Tema; label: string; ikon: typeof Sun }> = [
  { nilai: 'terang', label: 'Terang', ikon: Sun },
  { nilai: 'gelap', label: 'Gelap', ikon: Moon },
  { nilai: 'sistem', label: 'Ikuti sistem', ikon: Monitor },
]

export function Topbar({
  onBukaMenuHp,
  onToggleRingkas,
  onBukaPalet,
}: {
  onBukaMenuHp: () => void
  onToggleRingkas: () => void
  onBukaPalet: () => void
}) {
  const { pengguna, keluar } = useAuth()
  const { tema, setTema } = useTema()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-card/85 px-4 backdrop-blur-md">
      <Tombol varian="hantu" ukuran="ikon" className="lg:hidden" onClick={onBukaMenuHp} aria-label="Buka menu">
        <Menu />
      </Tombol>
      <Tombol varian="hantu" ukuran="ikon" className="hidden lg:inline-flex" onClick={onToggleRingkas} aria-label="Ringkas menu">
        <PanelLeft />
      </Tombol>

      <button
        type="button"
        onClick={onBukaPalet}
        className="ml-1 flex h-9 items-center gap-2 rounded-control border border-border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Cari halaman…</span>
        <kbd className="ml-4 hidden rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Tema */}
      <Dropdown>
        <PemicuDropdown asChild>
          <Tombol varian="hantu" ukuran="ikon" aria-label="Ganti tema">
            <Sun className="hidden dark:block" />
            <Moon className="block dark:hidden" />
          </Tombol>
        </PemicuDropdown>
        <IsiDropdown>
          <LabelDropdown>Tampilan</LabelDropdown>
          {OPSI_TEMA.map((o) => (
            <ItemDropdown key={o.nilai} onSelect={() => setTema(o.nilai)}>
              <o.ikon />
              <span className="flex-1">{o.label}</span>
              {tema === o.nilai ? <span className="size-1.5 rounded-full bg-primary" /> : null}
            </ItemDropdown>
          ))}
        </IsiDropdown>
      </Dropdown>

      {/* Notifikasi */}
      <Dropdown>
        <PemicuDropdown asChild>
          <Tombol varian="hantu" ukuran="ikon" className="relative" aria-label="Notifikasi">
            <Bell />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-card" />
          </Tombol>
        </PemicuDropdown>
        <IsiDropdown className="w-80 p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-bold">Notifikasi</p>
            <Lencana warna="danger" ukuran="sm">{NOTIFIKASI.length} baru</Lencana>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin p-1.5">
            {NOTIFIKASI.map((n) => (
              <ItemDropdown key={n.id} className="items-start">
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', WARNA_TITIK[n.warna])} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{n.judul}</span>
                  <span className="block truncate text-xs text-muted-foreground">{n.detail}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                    {formatWaktuRelatif(n.waktu)}
                  </span>
                </span>
              </ItemDropdown>
            ))}
          </div>
          <div className="border-t border-border p-2">
            <Tombol varian="hantu" className="w-full" ukuran="sm">Lihat semua</Tombol>
          </div>
        </IsiDropdown>
      </Dropdown>

      {/* Profil */}
      <Dropdown>
        <PemicuDropdown asChild>
          <button type="button" className="ml-1 flex items-center gap-2 rounded-full outline-none" aria-label="Menu akun">
            <Avatar nama={pengguna?.nama ?? 'Pengguna'} src={pengguna?.avatar_url} ukuran="sm" />
          </button>
        </PemicuDropdown>
        <IsiDropdown className="w-64">
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar nama={pengguna?.nama ?? 'Pengguna'} src={pengguna?.avatar_url} ukuran="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{pengguna?.nama}</p>
              <p className="truncate text-xs text-muted-foreground">{pengguna?.email}</p>
              {pengguna ? (
                <Lencana ukuran="sm" warna={WARNA_PERAN[pengguna.peran]} className="mt-1">
                  {LABEL_PERAN[pengguna.peran]}
                </Lencana>
              ) : null}
            </div>
          </div>
          <PemisahDropdown />
          <ItemDropdown asChild>
            <Link to="/profil"><UserCircle /> Profil saya</Link>
          </ItemDropdown>
          <ItemDropdown asChild>
            <Link to="/pengaturan"><Settings /> Pengaturan</Link>
          </ItemDropdown>
          <PemisahDropdown />
          <ItemDropdown bahaya onSelect={() => void keluar()}>
            <LogOut /> Keluar
          </ItemDropdown>
        </IsiDropdown>
      </Dropdown>
    </header>
  )
}
