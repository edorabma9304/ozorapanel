import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Tombol } from '@/components/ui/tombol'
import { Permainan } from '@/features/monopoli/permainan'

function HalamanMonopoli() {
  return (
    <Permainan
      kepala={({ berjalan, ikuti, setIkuti, permainanBaru }) => (
        <KepalaHalaman
          judul="Jelajah Dunia"
          deskripsi="Papan properti gaya Monopoly yang dimainkan per tim: 2 pemain, uang pribadi + kas bersama, peta membesar sesuai jumlah tim."
          remah={[{ label: 'Permainan' }, { label: 'Jelajah Dunia' }]}
          aksi={
            berjalan ? (
              <div className="flex gap-2">
                <Tombol varian="garis" onClick={() => setIkuti(!ikuti)} aria-pressed={ikuti}>
                  {ikuti ? <Eye /> : <EyeOff />} {ikuti ? 'Ikuti pion' : 'Pandangan bebas'}
                </Tombol>
                <Tombol varian="garis" onClick={permainanBaru}>
                  <RotateCcw /> Permainan baru
                </Tombol>
              </div>
            ) : null
          }
        />
      )}
    />
  )
}

export const Route = createFileRoute('/_app/permainan/monopoli')({ component: HalamanMonopoli })
