import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { PilihanRingkas } from '@/components/ui/kendali'
import { formatAngka } from '@/lib/format'

const OPSI_PER_HALAMAN = ['10', '25', '50', '100']

/** Deret nomor halaman ringkas: 1 … 4 5 6 … 20 */
function nomorHalaman(aktif: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const hasil: Array<number | '…'> = [1]
  const mulai = Math.max(2, aktif - 1)
  const akhir = Math.min(total - 1, aktif + 1)
  if (mulai > 2) hasil.push('…')
  for (let i = mulai; i <= akhir; i++) hasil.push(i)
  if (akhir < total - 1) hasil.push('…')
  hasil.push(total)
  return hasil
}

export function Paginasi({
  halaman,
  totalHalaman,
  total,
  perHalaman,
  onHalaman,
  onPerHalaman,
}: {
  halaman: number
  totalHalaman: number
  total: number
  perHalaman: number
  onHalaman: (h: number) => void
  onPerHalaman?: (n: number) => void
}) {
  const dari = total === 0 ? 0 : (halaman - 1) * perHalaman + 1
  const sampai = Math.min(halaman * perHalaman, total)

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {formatAngka(dari)}–{formatAngka(sampai)} dari {formatAngka(total)}
        </span>
        {onPerHalaman ? (
          <span className="hidden items-center gap-2 sm:flex">
            <span className="text-border">|</span>
            <label htmlFor="per-halaman" className="whitespace-nowrap">
              Baris
            </label>
            <PilihanRingkas
              id="per-halaman"
              className="h-8 w-20"
              nilai={String(perHalaman)}
              onUbah={(n) => onPerHalaman(Number(n))}
              opsi={OPSI_PER_HALAMAN.map((n) => ({ nilai: n, label: n }))}
            />
          </span>
        ) : null}
      </div>

      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        <Tombol
          varian="garis"
          ukuran="ikon-sm"
          onClick={() => onHalaman(1)}
          disabled={halaman <= 1}
          aria-label="Halaman pertama"
        >
          <ChevronsLeft />
        </Tombol>
        <Tombol
          varian="garis"
          ukuran="ikon-sm"
          onClick={() => onHalaman(halaman - 1)}
          disabled={halaman <= 1}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft />
        </Tombol>

        {nomorHalaman(halaman, totalHalaman).map((n, i) =>
          n === '…' ? (
            <span key={`sela-${halaman}-${i}`} className="px-1.5 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Tombol
              key={n}
              varian={n === halaman ? 'utama' : 'garis'}
              ukuran="ikon-sm"
              onClick={() => onHalaman(n)}
              aria-current={n === halaman ? 'page' : undefined}
            >
              {n}
            </Tombol>
          ),
        )}

        <Tombol
          varian="garis"
          ukuran="ikon-sm"
          onClick={() => onHalaman(halaman + 1)}
          disabled={halaman >= totalHalaman}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight />
        </Tombol>
        <Tombol
          varian="garis"
          ukuran="ikon-sm"
          onClick={() => onHalaman(totalHalaman)}
          disabled={halaman >= totalHalaman}
          aria-label="Halaman terakhir"
        >
          <ChevronsRight />
        </Tombol>
      </nav>
    </div>
  )
}
