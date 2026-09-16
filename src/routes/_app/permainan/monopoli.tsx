import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Permainan } from '@/features/monopoli/permainan'

function HalamanMonopoli() {
  return (
    <Permainan
      kepala={
        <KepalaHalaman
          judul="Jelajah Dunia"
          deskripsi="Papan properti gaya Monopoly yang dimainkan per tim. Seluruh kendali dan penjelasan ada di dalam papan."
          remah={[{ label: 'Permainan' }, { label: 'Jelajah Dunia' }]}
        />
      }
    />
  )
}

export const Route = createFileRoute('/_app/permainan/monopoli')({ component: HalamanMonopoli })
