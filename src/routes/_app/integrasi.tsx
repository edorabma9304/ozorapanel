import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Plug, Plus, Search, Settings } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu } from '@/components/ui/kartu'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Sakelar } from '@/components/ui/kendali'
import { SaringCepat } from '@/components/data/bilah-alat'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { INTEGRASI_CONTOH } from '@/lib/adapter/data-contoh'

const KATEGORI = [...new Set(INTEGRASI_CONTOH.map((i) => i.kategori))]

function HalamanIntegrasi() {
  const { boleh } = useAuth()
  const [cari, setCari] = useState('')
  const [kategori, setKategori] = useState<string | undefined>()
  const [tersambung, setTersambung] = useState<string[]>(
    INTEGRASI_CONTOH.filter((i) => i.tersambung).map((i) => i.id),
  )

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return INTEGRASI_CONTOH.filter(
      (i) =>
        (!q || i.nama.toLowerCase().includes(q) || i.deskripsi.toLowerCase().includes(q)) &&
        (!kategori || i.kategori === kategori),
    )
  }, [cari, kategori])

  if (!boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  function alihkan(id: string, nama: string) {
    const sudah = tersambung.includes(id)
    setTersambung((t) => (sudah ? t.filter((x) => x !== id) : [...t, id]))
    toast.success(sudah ? `${nama} diputus.` : `${nama} tersambung.`)
  }

  return (
    <>
      <KepalaHalaman
        judul="Integrasi"
        deskripsi="Sambungkan panel ini ke layanan lain yang sudah Anda pakai."
        remah={[{ label: 'Halaman' }, { label: 'Integrasi' }]}
        aksi={<Tombol><Plus /> Tambah integrasi</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Tersedia" nilai={INTEGRASI_CONTOH.length} ikon={Plug} warna="primary" />
        <KartuStatistik label="Tersambung" nilai={tersambung.length} ikon={Plug} warna="success" />
        <KartuStatistik label="Kategori" nilai={KATEGORI.length} ikon={Plug} warna="info" />
        <KartuStatistik
          label="Belum tersambung"
          nilai={INTEGRASI_CONTOH.length - tersambung.length}
          ikon={Plug}
          warna="warning"
        />
      </div>

      <Kartu className="overflow-hidden">
        <IsiKartu className="pb-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Masukan
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari integrasi…"
              className="pl-9"
              aria-label="Cari integrasi"
            />
          </div>
        </IsiKartu>
        <SaringCepat
          nilai={kategori}
          onUbah={setKategori}
          totalSemua={INTEGRASI_CONTOH.length}
          opsi={KATEGORI.map((k) => ({
            nilai: k,
            label: k,
            jumlah: INTEGRASI_CONTOH.filter((i) => i.kategori === k).length,
          }))}
          className="border-b-0"
        />
      </Kartu>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong
            ikon={Plug}
            judul="Integrasi tidak ditemukan"
            deskripsi="Coba kata kunci lain atau pilih kategori berbeda."
          />
        </Kartu>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hasil.map((i) => {
            const aktif = tersambung.includes(i.id)
            return (
              <Kartu key={i.id} className="flex flex-col transition-shadow hover:shadow-raised">
                <IsiKartu className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-card text-base font-extrabold text-white"
                      style={{ background: i.warna }}
                      aria-hidden
                    >
                      {i.huruf}
                    </span>
                    <Lencana warna={aktif ? 'success' : 'netral'} ukuran="sm">
                      {aktif ? 'Tersambung' : 'Nonaktif'}
                    </Lencana>
                  </div>

                  <JudulKartu className="mt-3">{i.nama}</JudulKartu>
                  <Lencana warna="primary" ukuran="sm" className="mt-1.5 w-fit">{i.kategori}</Lencana>
                  <DeskripsiKartu className="mt-2 flex-1">{i.deskripsi}</DeskripsiKartu>
                </IsiKartu>

                <KakiKartu className="justify-between">
                  <label htmlFor={`sambung-${i.id}`} className="flex items-center gap-2.5 text-sm font-semibold">
                    <Sakelar
                      id={`sambung-${i.id}`}
                      checked={aktif}
                      onCheckedChange={() => alihkan(i.id, i.nama)}
                    />
                    {aktif ? 'Aktif' : 'Mati'}
                  </label>
                  <Tombol varian="hantu" ukuran="sm" disabled={!aktif}>
                    <Settings /> Atur
                  </Tombol>
                </KakiKartu>
              </Kartu>
            )
          })}
        </div>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ExternalLink className="size-3.5" />
        Kredensial integrasi disimpan di server, bukan di peramban. Kelola kuncinya lewat halaman Kunci API.
      </p>
    </>
  )
}

export const Route = createFileRoute('/_app/integrasi')({ component: HalamanIntegrasi })
