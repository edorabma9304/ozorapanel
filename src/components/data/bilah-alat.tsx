import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { formatAngka } from '@/lib/format'

/**
 * Bilah alat standar halaman daftar: pencarian, filter cepat, dan tombol aksi.
 * Dipakai bersama `useDaftarTabel` — lihat docs/RESEP.md.
 */
export function BilahAlat({
  cari,
  onCari,
  placeholder = 'Cari…',
  adaFilterAktif,
  onBersihkan,
  kiri,
  kanan,
  className,
}: {
  cari: string
  onCari: (n: string) => void
  placeholder?: string
  adaFilterAktif?: boolean
  onBersihkan?: () => void
  kiri?: ReactNode
  kanan?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1 sm:max-w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Masukan
            value={cari}
            onChange={(e) => onCari(e.target.value)}
            placeholder={placeholder}
            className="pl-9"
            aria-label={placeholder}
          />
        </div>
        {kiri}
        {adaFilterAktif && onBersihkan ? (
          <Tombol varian="hantu" ukuran="sm" onClick={onBersihkan}>
            <X /> Bersihkan
          </Tombol>
        ) : null}
      </div>
      {kanan ? <div className="flex flex-wrap items-center gap-2">{kanan}</div> : null}
    </div>
  )
}

export type OpsiSaring = { nilai: string; label: string; jumlah?: number }

/** Baris tombol filter status — pola yang sama dipakai di seluruh halaman daftar. */
export function SaringCepat({
  nilai,
  onUbah,
  opsi,
  labelSemua = 'Semua',
  totalSemua,
  className,
}: {
  nilai: string | undefined
  onUbah: (n: string | undefined) => void
  opsi: OpsiSaring[]
  labelSemua?: string
  totalSemua?: number
  className?: string
}) {
  const daftar: OpsiSaring[] = [{ nilai: '', label: labelSemua, jumlah: totalSemua }, ...opsi]

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 border-b border-border px-4 pb-3', className)} role="tablist">
      {daftar.map((o) => {
        const aktif = (nilai ?? '') === o.nilai
        return (
          <button
            key={o.nilai || 'semua'}
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={() => onUbah(o.nilai || undefined)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              aktif ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {o.label}
            {o.jumlah !== undefined ? (
              <span className={cn('text-xs font-bold', aktif ? '' : 'text-muted-foreground')}>
                {formatAngka(o.jumlah)}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
