import { createFileRoute } from '@tanstack/react-router'
import { Monitor, Moon, Sun } from 'lucide-react'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { useTema, type Tema } from '@/lib/tema'
import { cn } from '@/lib/utils'

const PILIHAN: Array<{ nilai: Tema; label: string; ikon: typeof Sun }> = [
  { nilai: 'terang', label: 'Terang', ikon: Sun },
  { nilai: 'gelap', label: 'Gelap', ikon: Moon },
  { nilai: 'sistem', label: 'Ikuti sistem', ikon: Monitor },
]

function PengaturanTampilan() {
  const { tema, setTema } = useTema()

  return (
    <Kartu>
      <KepalaKartu>
        <div>
          <JudulKartu>Tema</JudulKartu>
          <DeskripsiKartu>Pilihan ini tersimpan di peramban Anda saja, tidak memengaruhi pengguna lain.</DeskripsiKartu>
        </div>
      </KepalaKartu>
      <IsiKartu>
        <div className="grid gap-3 sm:grid-cols-3">
          {PILIHAN.map((p) => (
            <button
              key={p.nilai}
              type="button"
              onClick={() => setTema(p.nilai)}
              aria-pressed={tema === p.nilai}
              className={cn(
                'flex flex-col items-center gap-2 rounded-card border-2 p-5 transition-colors',
                tema === p.nilai ? 'border-primary bg-primary-soft text-primary-kuat' : 'border-border hover:border-primary/40',
              )}
            >
              <p.ikon className="size-6" />
              <span className="text-sm font-semibold">{p.label}</span>
            </button>
          ))}
        </div>
      </IsiKartu>
    </Kartu>
  )
}

export const Route = createFileRoute('/_app/pengaturan/tampilan')({ component: PengaturanTampilan })
