import { createFileRoute } from '@tanstack/react-router'
import { MapPin, Search, UserCheck, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Avatar } from '@/components/ui/avatar'
import { Lencana } from '@/components/ui/lencana'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { PENGIKUT_CONTOH } from '@/lib/adapter/data-contoh'

function DaftarPengikut() {
  const [cari, setCari] = useState('')
  const [diikuti, setDiikuti] = useState<string[]>(
    PENGIKUT_CONTOH.filter((p) => p.saling_ikut).map((p) => p.id),
  )

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return PENGIKUT_CONTOH.filter(
      (p) => !q || p.nama.toLowerCase().includes(q) || p.kota.toLowerCase().includes(q),
    )
  }, [cari])

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Masukan
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari pengikut…"
          className="pl-9"
          aria-label="Cari pengikut"
        />
      </div>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong judul="Pengikut tidak ditemukan" deskripsi="Coba kata kunci lain." />
        </Kartu>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hasil.map((p) => {
            const ikut = diikuti.includes(p.id)
            return (
              <Kartu key={p.id} className="transition-shadow hover:shadow-raised">
                <IsiKartu className="flex items-center gap-4">
                  <Avatar nama={p.nama} src={p.avatar} ukuran="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.nama}</p>
                    <p className="truncate text-sm text-muted-foreground">{p.jabatan}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {p.kota}
                    </p>
                  </div>
                  <Tombol
                    varian={ikut ? 'halus' : 'garis'}
                    ukuran="ikon"
                    aria-label={ikut ? `Berhenti mengikuti ${p.nama}` : `Ikuti ${p.nama}`}
                    aria-pressed={ikut}
                    onClick={() =>
                      setDiikuti((d) => (ikut ? d.filter((x) => x !== p.id) : [...d, p.id]))
                    }
                  >
                    {ikut ? <UserCheck /> : <UserPlus />}
                  </Tombol>
                </IsiKartu>
                {p.saling_ikut ? (
                  <div className="border-t border-border px-5 py-2.5">
                    <Lencana warna="success" ukuran="sm">Saling mengikuti</Lencana>
                  </div>
                ) : null}
              </Kartu>
            )
          })}
        </div>
      )}
    </>
  )
}

export const Route = createFileRoute('/_app/apl/profil/pengikut')({ component: DaftarPengikut })
