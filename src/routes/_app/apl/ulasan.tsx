import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, MessageSquare, Reply, Star, ThumbsUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { SaringCepat } from '@/components/data/bilah-alat'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { AreaTeks } from '@/components/ui/masukan'
import { Dialog, IsiDialog, KakiDialog, TutupDialog } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { formatAngka, formatWaktuRelatif } from '@/lib/format'
import { ULASAN_CONTOH, type Ulasan } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

function Bintang({ nilai, ukuran = 'size-4' }: { nilai: number; ukuran?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${nilai} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((b) => (
        <Star key={b} className={cn(ukuran, b <= nilai ? 'fill-warning text-warning-kuat' : 'text-muted-foreground/40')} />
      ))}
    </span>
  )
}

function HalamanUlasan() {
  const [ulasan, setUlasan] = useState(ULASAN_CONTOH)
  const [saring, setSaring] = useState<string | undefined>()
  const [membalas, setMembalas] = useState<Ulasan | null>(null)
  const [draf, setDraf] = useState('')

  const hasil = useMemo(
    () => (saring ? ulasan.filter((u) => String(u.bintang) === saring) : ulasan),
    [ulasan, saring],
  )

  const rerata = ulasan.reduce((a, b) => a + b.bintang, 0) / ulasan.length
  const sebaran = [5, 4, 3, 2, 1].map((b) => ({ bintang: b, jumlah: ulasan.filter((u) => u.bintang === b).length }))

  return (
    <>
      <KepalaHalaman
        judul="Ulasan"
        deskripsi="Penilaian pelanggan terhadap produk, beserta balasan tim Anda."
        remah={[{ label: 'Aplikasi' }, { label: 'Ulasan' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Rata-rata penilaian" nilai={rerata.toFixed(2)} ikon={Star} warna="warning" keterangan={`dari ${ulasan.length} ulasan`} />
        <KartuStatistik label="Ulasan positif" nilai={formatAngka(ulasan.filter((u) => u.bintang >= 4).length)} ikon={ThumbsUp} warna="success" />
        <KartuStatistik label="Belum dibalas" nilai={formatAngka(ulasan.filter((u) => !u.dibalas).length)} ikon={Reply} warna="danger" keterangan="perlu ditindaklanjuti" />
        <KartuStatistik label="Disembunyikan" nilai={formatAngka(ulasan.filter((u) => !u.ditampilkan).length)} ikon={EyeOff} warna="netral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Sebaran penilaian</JudulKartu>
              <DeskripsiKartu>Jumlah ulasan per bintang</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-3">
            <div className="text-center">
              <p className="text-4xl font-extrabold">{rerata.toFixed(1)}</p>
              <div className="mt-2 flex justify-center">
                <Bintang nilai={Math.round(rerata)} ukuran="size-5" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{ulasan.length} ulasan</p>
            </div>
            {sebaran.map((s) => (
              <div key={s.bintang} className="flex items-center gap-3">
                <span className="flex w-10 shrink-0 items-center gap-1 text-sm">
                  {s.bintang} <Star className="size-3 fill-warning text-warning-kuat" />
                </span>
                <div className="flex-1">
                  <Progres nilai={(s.jumlah / ulasan.length) * 100} warna="warning" tebal="sm" />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">{s.jumlah}</span>
              </div>
            ))}
          </IsiKartu>
        </Kartu>

        <div className="space-y-4 lg:col-span-2">
          <Kartu className="overflow-hidden pt-4">
            <SaringCepat
              nilai={saring}
              onUbah={setSaring}
              totalSemua={ulasan.length}
              opsi={sebaran.map((s) => ({ nilai: String(s.bintang), label: `${s.bintang} bintang`, jumlah: s.jumlah }))}
              className="border-b-0 pb-4"
            />
          </Kartu>

          {hasil.length === 0 ? (
            <Kartu>
              <KeadaanKosong judul="Belum ada ulasan" deskripsi="Ulasan pelanggan akan muncul di sini." />
            </Kartu>
          ) : (
            hasil.slice(0, 12).map((u) => (
              <Kartu key={u.id}>
                <IsiKartu>
                  <div className="flex items-start gap-3">
                    <Avatar nama={u.pelanggan} src={u.avatar} ukuran="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-bold">{u.pelanggan}</p>
                        <Bintang nilai={u.bintang} ukuran="size-3.5" />
                        <span className="text-xs text-muted-foreground">{formatWaktuRelatif(u.created_at)}</span>
                        {u.dibalas ? <Lencana warna="success" ukuran="sm">Sudah dibalas</Lencana> : null}
                        {!u.ditampilkan ? <Lencana warna="netral" ukuran="sm">Disembunyikan</Lencana> : null}
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <img src={u.produk_gambar} alt="" width={16} height={16} className="size-4 rounded-full" />
                        {u.produk_nama}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed">{u.isi}</p>

                      <div className="mt-3 flex flex-wrap gap-1">
                        <Tombol
                          varian="hantu"
                          ukuran="sm"
                          onClick={() => {
                            setMembalas(u)
                            setDraf('')
                          }}
                        >
                          <Reply /> {u.dibalas ? 'Balas lagi' : 'Balas'}
                        </Tombol>
                        <Tombol
                          varian="hantu"
                          ukuran="sm"
                          onClick={() => {
                            setUlasan((s) => s.map((x) => (x.id === u.id ? { ...x, ditampilkan: !x.ditampilkan } : x)))
                            toast.success(u.ditampilkan ? 'Ulasan disembunyikan.' : 'Ulasan ditampilkan.')
                          }}
                        >
                          {u.ditampilkan ? <EyeOff /> : <Eye />}
                          {u.ditampilkan ? 'Sembunyikan' : 'Tampilkan'}
                        </Tombol>
                      </div>
                    </div>
                  </div>
                </IsiKartu>
              </Kartu>
            ))
          )}
        </div>
      </div>

      <Dialog open={Boolean(membalas)} onOpenChange={(b) => !b && setMembalas(null)}>
        {membalas ? (
          <IsiDialog judul="Balas ulasan" deskripsi={`Untuk ${membalas.pelanggan} · ${membalas.produk_nama}`}>
            <div className="rounded-card bg-muted p-3.5 text-sm">
              <Bintang nilai={membalas.bintang} ukuran="size-3.5" />
              <p className="mt-2 leading-relaxed">{membalas.isi}</p>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                setUlasan((s) => s.map((x) => (x.id === membalas.id ? { ...x, dibalas: true } : x)))
                toast.success('Balasan terkirim.')
                setMembalas(null)
              }}
            >
              <AreaTeks
                value={draf}
                onChange={(e) => setDraf(e.target.value)}
                placeholder="Tulis balasan yang sopan dan menjawab keluhannya…"
                className="min-h-28"
                aria-label="Balasan ulasan"
                required
              />
              <KakiDialog>
                <TutupDialog asChild><Tombol varian="garis" type="button">Batal</Tombol></TutupDialog>
                <Tombol type="submit"><MessageSquare /> Kirim balasan</Tombol>
              </KakiDialog>
            </form>
          </IsiDialog>
        ) : null}
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/ulasan')({ component: HalamanUlasan })
