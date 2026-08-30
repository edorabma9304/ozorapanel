import { createFileRoute } from '@tanstack/react-router'
import { MessageSquare, Search, UserMinus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Avatar } from '@/components/ui/avatar'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { Konfirmasi, IsiKonfirmasi, PemicuKonfirmasi } from '@/components/ui/keadaan'
import { toast } from 'sonner'
import { PENGIKUT_CONTOH } from '@/lib/adapter/data-contoh'

function DaftarTeman() {
  const [cari, setCari] = useState('')
  const [teman, setTeman] = useState(PENGIKUT_CONTOH.filter((p) => p.teman))

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return teman.filter((p) => !q || p.nama.toLowerCase().includes(q))
  }, [cari, teman])

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Masukan
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari teman…"
          className="pl-9"
          aria-label="Cari teman"
        />
      </div>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong judul="Belum ada teman" deskripsi="Tambahkan rekan kerja agar mudah dihubungi." />
        </Kartu>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hasil.map((p) => (
            <Kartu key={p.id} className="text-center transition-shadow hover:shadow-raised">
              <IsiKartu>
                <Avatar nama={p.nama} src={p.avatar} ukuran="xl" className="mx-auto" />
                <p className="mt-3 truncate font-bold">{p.nama}</p>
                <p className="truncate text-sm text-muted-foreground">{p.jabatan}</p>
                <p className="truncate text-xs text-muted-foreground">{p.kota}</p>

                <div className="mt-4 flex gap-2">
                  <Tombol varian="halus" ukuran="sm" className="flex-1">
                    <MessageSquare /> Pesan
                  </Tombol>
                  <Konfirmasi>
                    <PemicuKonfirmasi asChild>
                      <Tombol varian="garis" ukuran="ikon-sm" aria-label={`Hapus ${p.nama} dari teman`}>
                        <UserMinus className="text-danger-kuat" />
                      </Tombol>
                    </PemicuKonfirmasi>
                    <IsiKonfirmasi
                      judul={`Hapus ${p.nama} dari daftar teman?`}
                      deskripsi="Anda masih bisa menambahkannya kembali kapan saja."
                      labelLanjut="Ya, hapus"
                      onLanjut={() => {
                        setTeman((t) => t.filter((x) => x.id !== p.id))
                        toast.success(`${p.nama} dihapus dari daftar teman.`)
                      }}
                    />
                  </Konfirmasi>
                </div>
              </IsiKartu>
            </Kartu>
          ))}
        </div>
      )}
    </>
  )
}

export const Route = createFileRoute('/_app/apl/profil/teman')({ component: DaftarTeman })
