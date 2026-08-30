import { createFileRoute } from '@tanstack/react-router'
import { Heart, MessageSquare, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Dialog, IsiDialog } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { formatAngka } from '@/lib/format'
import { FOTO_CONTOH } from '@/lib/adapter/data-contoh'

function Galeri() {
  const [cari, setCari] = useState('')
  const [dibuka, setDibuka] = useState<(typeof FOTO_CONTOH)[number] | null>(null)

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return FOTO_CONTOH.filter((f) => !q || f.judul.toLowerCase().includes(q))
  }, [cari])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Masukan
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari foto…"
            className="pl-9"
            aria-label="Cari foto"
          />
        </div>
        <Tombol><Upload /> Unggah foto</Tombol>
      </div>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong judul="Foto tidak ditemukan" deskripsi="Coba kata kunci lain." />
        </Kartu>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hasil.map((f) => (
            <Kartu key={f.id} className="overflow-hidden transition-shadow hover:shadow-raised">
              <button
                type="button"
                onClick={() => setDibuka(f)}
                className="block w-full"
                aria-label={`Buka foto ${f.judul}`}
              >
                <img
                  src={f.gambar}
                  alt={f.judul}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="aspect-4/3 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
              <IsiKartu className="flex items-center justify-between gap-2 py-3">
                <p className="truncate text-sm font-semibold">{f.judul}</p>
                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="size-3.5" /> {formatAngka(f.suka)}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {f.komentar}</span>
                </span>
              </IsiKartu>
            </Kartu>
          ))}
        </div>
      )}

      <Dialog open={Boolean(dibuka)} onOpenChange={(b) => !b && setDibuka(null)}>
        {dibuka ? (
          <IsiDialog judul={dibuka.judul} lebar="xl">
            <img src={dibuka.gambar} alt={dibuka.judul} className="w-full rounded-card" />
            <p className="text-sm text-muted-foreground">
              {formatAngka(dibuka.suka)} suka · {dibuka.komentar} komentar
            </p>
          </IsiDialog>
        ) : null}
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/profil/galeri')({ component: Galeri })
