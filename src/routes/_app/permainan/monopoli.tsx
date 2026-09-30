import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { JelajahDunia } from '@/features/monopoli/jelajah-dunia'

function HalamanMonopoli() {
  return (
    <JelajahDunia
      kepala={
        <KepalaHalaman
          judul="Jelajah Dunia"
          deskripsi="Papan properti per tim. Main satu layar, atau bersama lewat kode ruang."
          remah={[{ label: 'Permainan' }, { label: 'Jelajah Dunia' }]}
        />
      }
    />
  )
}

export const Route = createFileRoute('/_app/permainan/monopoli')({ component: HalamanMonopoli })
