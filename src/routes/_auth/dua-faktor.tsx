import { createFileRoute, Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Tombol } from '@/components/ui/tombol'
import { Masukan } from '@/components/ui/masukan'

const PANJANG = 6

function HalamanDuaFaktor() {
  const [kode, setKode] = useState<string[]>(Array(PANJANG).fill(''))
  const ref = useRef<Array<HTMLInputElement | null>>([])

  function isi(i: number, nilai: string) {
    const angka = nilai.replace(/\D/g, '').slice(-1)
    setKode((k) => {
      const baru = [...k]
      baru[i] = angka
      return baru
    })
    if (angka && i < PANJANG - 1) ref.current[i + 1]?.focus()
  }

  function onTombol(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !kode[i] && i > 0) ref.current[i - 1]?.focus()
  }

  const lengkap = kode.every(Boolean)

  return (
    <div>
      <span className="mb-5 inline-grid size-12 place-items-center rounded-card bg-success-soft text-success-kuat">
        <ShieldCheck className="size-6" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Verifikasi dua langkah</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masukkan enam digit kode dari aplikasi autentikator Anda.
      </p>

      <div className="mt-7 flex justify-between gap-2">
        {kode.map((k, i) => (
          <Masukan
            key={`digit-${i}`}
            ref={(el) => {
              ref.current[i] = el
            }}
            value={k}
            onChange={(e) => isi(i, e.target.value)}
            onKeyDown={(e) => onTombol(i, e)}
            inputMode="numeric"
            maxLength={1}
            className="size-12 p-0 text-center text-lg font-bold"
            aria-label={`Digit ke-${i + 1}`}
          />
        ))}
      </div>

      <Tombol
        className="mt-6 w-full"
        ukuran="lg"
        disabled={!lengkap}
        onClick={() => toast.success('Kode terverifikasi.')}
      >
        Verifikasi
      </Tombol>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Tidak menerima kode?{' '}
        <button type="button" className="font-semibold text-primary-kuat hover:underline" onClick={() => toast.info('Kode baru dikirim.')}>
          Kirim ulang
        </button>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link to="/masuk" className="text-muted-foreground hover:text-primary-kuat">
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  )
}

export const Route = createFileRoute('/_auth/dua-faktor')({ component: HalamanDuaFaktor })
