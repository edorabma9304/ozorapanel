import { ImagePlus, Loader2, RefreshCw, Sparkles, Trash2, TriangleAlert, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { formatPersen, formatUkuranBerkas } from '@/lib/format'
import {
  kompresGambar, periksaGambar, PRESET, type AturanGambar, type HasilGambar, type OpsiKompresi,
} from '@/lib/gambar'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  keterangan?: string
  nilai: string
  onUbah: (dataUri: string, hasil?: HasilGambar) => void
  /** Preset siap pakai; aturan & kompresi di bawah menimpa nilainya. */
  preset?: keyof typeof PRESET
  aturan?: AturanGambar
  kompresi?: OpsiKompresi
  /** Rasio kotak pratinjau, mis. 'aspect-video' atau 'aspect-square'. */
  rasioPratinjau?: string
  /** Latar gelap untuk menguji logo mode gelap. */
  latarGelap?: boolean
  className?: string
}

export function UnggahGambar({
  label,
  keterangan,
  nilai,
  onUbah,
  preset,
  aturan,
  kompresi,
  rasioPratinjau = 'aspect-video',
  latarGelap,
  className,
}: Props) {
  const id = useId().replace(/:/g, '')
  const input = useRef<HTMLInputElement>(null)
  const [sibuk, setSibuk] = useState(false)
  const [galat, setGalat] = useState<string | null>(null)
  const [hasil, setHasil] = useState<HasilGambar | null>(null)
  const [seret, setSeret] = useState(false)

  const aturanAkhir = { ...(preset ? PRESET[preset].aturan : {}), ...aturan }
  const kompresiAkhir = { ...(preset ? PRESET[preset].kompresi : {}), ...kompresi }
  const tipeDiterima = (aturanAkhir.tipeDiizinkan ?? ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']).join(',')

  async function proses(berkas: File | undefined) {
    if (!berkas) return
    setGalat(null)
    setSibuk(true)
    try {
      const pesan = await periksaGambar(berkas, aturanAkhir)
      if (pesan) {
        setGalat(pesan)
        setHasil(null)
        return
      }
      const keluaran = await kompresGambar(berkas, kompresiAkhir)
      setHasil(keluaran)
      onUbah(keluaran.dataUri, keluaran)
    } catch (e) {
      console.error('Gagal memproses gambar:', e)
      setGalat('Gambar gagal diproses. Coba berkas lain.')
      setHasil(null)
    } finally {
      setSibuk(false)
      if (input.current) input.current.value = ''
    }
  }

  function hapus() {
    onUbah('')
    setHasil(null)
    setGalat(null)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-semibold">{label}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setSeret(true)
        }}
        onDragLeave={() => setSeret(false)}
        onDrop={(e) => {
          e.preventDefault()
          setSeret(false)
          void proses(e.dataTransfer.files[0])
        }}
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-card border-2 border-dashed transition-colors',
          rasioPratinjau,
          seret ? 'border-primary bg-primary-soft/50' : galat ? 'border-danger/50' : 'border-border',
          // Papan catur menandai area transparan pada PNG/SVG.
          !latarGelap && !nilai && 'bg-[repeating-conic-gradient(var(--color-muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px]',
          latarGelap && 'bg-[#1f252f]',
        )}
      >
        {sibuk ? (
          <span className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-xs font-semibold">Memproses gambar…</span>
          </span>
        ) : nilai ? (
          <>
            <img src={nilai} alt={label} className="size-full object-contain p-3" />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <Tombol
                varian="garis"
                ukuran="ikon-sm"
                className="bg-card"
                onClick={() => input.current?.click()}
                aria-label={`Ganti ${label}`}
              >
                <RefreshCw />
              </Tombol>
              <Tombol varian="garis" ukuran="ikon-sm" className="bg-card" onClick={hapus} aria-label={`Hapus ${label}`}>
                <Trash2 className="text-danger-kuat" />
              </Tombol>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 p-6 text-center transition-colors hover:bg-muted/40"
          >
            <ImagePlus className={cn('size-7', latarGelap ? 'text-white/60' : 'text-muted-foreground')} />
            <span className={cn('text-sm font-semibold', latarGelap && 'text-white')}>
              Seret berkas atau klik untuk memilih
            </span>
            {keterangan ? (
              <span className={cn('text-xs', latarGelap ? 'text-white/60' : 'text-muted-foreground')}>
                {keterangan}
              </span>
            ) : null}
          </button>
        )}
      </div>

      {!nilai && !sibuk ? (
        <Tombol varian="garis" ukuran="sm" className="w-full" onClick={() => input.current?.click()}>
          <Upload /> Unggah gambar
        </Tombol>
      ) : null}

      {galat ? (
        <p className="flex items-start gap-1.5 text-xs text-danger-kuat" role="alert">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
          {galat}
        </p>
      ) : null}

      {hasil && !galat ? (
        <div className="flex flex-wrap items-center gap-2 rounded-card bg-success-soft px-3 py-2 text-xs">
          <Sparkles className="size-3.5 shrink-0 text-success-kuat" />
          {hasil.dikompres ? (
            <>
              <span className="text-success-kuat">
                <b>{formatUkuranBerkas(hasil.ukuranAsli)}</b> → <b>{formatUkuranBerkas(hasil.ukuranAkhir)}</b>
              </span>
              {hasil.hemat > 0.02 ? (
                <Lencana warna="success" ukuran="sm">hemat {formatPersen(hasil.hemat, 0)}</Lencana>
              ) : null}
              <span className="text-muted-foreground">
                {hasil.lebar}×{hasil.tinggi}px · {hasil.tipe.replace('image/', '').toUpperCase()}
              </span>
            </>
          ) : (
            <span className="text-success-kuat">
              SVG diteruskan apa adanya ({formatUkuranBerkas(hasil.ukuranAsli)}) — format vektor tidak perlu dikompres.
            </span>
          )}
        </div>
      ) : null}

      <input
        ref={input}
        id={id}
        type="file"
        accept={tipeDiterima}
        aria-label={`Pilih berkas untuk ${label}`}
        className="sr-only"
        onChange={(e) => void proses(e.target.files?.[0])}
      />
    </div>
  )
}
