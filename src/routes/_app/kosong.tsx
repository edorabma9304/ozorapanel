import { createFileRoute } from '@tanstack/react-router'
import { FilePlus2 } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { KeadaanKosong } from '@/components/ui/keadaan'

/**
 * Halaman kosong — titik awal saat membuat halaman baru.
 * Salin berkas ini, ganti judulnya, lalu isi kartunya.
 */
function HalamanKosong() {
  return (
    <>
      <KepalaHalaman
        judul="Halaman kosong"
        deskripsi="Kerangka paling minimal: kepala halaman + satu kartu. Salin berkas ini saat memulai halaman baru."
        remah={[{ label: 'Halaman' }, { label: 'Kosong' }]}
      />

      <Kartu>
        <IsiKartu>
          <KeadaanKosong
            ikon={FilePlus2}
            judul="Mulai dari sini"
            deskripsi="Ganti isi kartu ini dengan konten halaman Anda. Resep lengkapnya ada di docs/RESEP.md."
          />
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/kosong')({ component: HalamanKosong })
