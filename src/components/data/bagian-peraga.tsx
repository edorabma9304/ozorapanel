import type { ReactNode } from 'react'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'

/** Satu blok galeri komponen: judul, keterangan, lalu contohnya. */
export function BagianPeraga({
  judul,
  deskripsi,
  children,
  aksi,
}: {
  judul: string
  deskripsi?: string
  children: ReactNode
  aksi?: ReactNode
}) {
  return (
    <Kartu>
      <KepalaKartu>
        <div>
          <JudulKartu>{judul}</JudulKartu>
          {deskripsi ? <DeskripsiKartu>{deskripsi}</DeskripsiKartu> : null}
        </div>
        {aksi}
      </KepalaKartu>
      <IsiKartu className="flex flex-wrap items-center gap-3">{children}</IsiKartu>
    </Kartu>
  )
}
