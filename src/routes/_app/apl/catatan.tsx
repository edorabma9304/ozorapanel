import { createFileRoute } from '@tanstack/react-router'
import { Pin, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu, IsiKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { CATATAN_CONTOH, type Catatan } from '@/lib/adapter/data-contoh'
import { formatWaktuRelatif } from '@/lib/format'
import { idAcak, cn } from '@/lib/utils'

const LATAR: Record<Catatan['warna'], string> = {
  primary: 'bg-primary-soft border-primary/25',
  success: 'bg-success-soft border-success/25',
  warning: 'bg-warning-soft border-warning/25',
  danger: 'bg-danger-soft border-danger/25',
  info: 'bg-info-soft border-info/25',
}

const WARNA: Array<Catatan['warna']> = ['primary', 'success', 'warning', 'danger', 'info']

function HalamanCatatan() {
  const [catatan, setCatatan] = useState(CATATAN_CONTOH)
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [warna, setWarna] = useState<Catatan['warna']>('primary')

  const urut = [...catatan].sort((a, b) => Number(b.disematkan) - Number(a.disematkan))

  function tambah(e: React.FormEvent) {
    e.preventDefault()
    if (!isi.trim()) return
    const waktu = new Date().toISOString()
    setCatatan((c) => [
      {
        id: idAcak(8),
        created_at: waktu,
        updated_at: waktu,
        deleted_at: null,
        judul: judul.trim() || 'Catatan',
        isi: isi.trim(),
        warna,
        disematkan: false,
      },
      ...c,
    ])
    setJudul('')
    setIsi('')
    toast.success('Catatan ditambahkan.')
  }

  return (
    <>
      <KepalaHalaman
        judul="Catatan"
        deskripsi="Pengingat cepat yang tidak perlu masuk sistem tiket."
        remah={[{ label: 'Aplikasi' }, { label: 'Catatan' }]}
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Kartu className="h-fit">
          <IsiKartu>
            <form onSubmit={tambah} className="space-y-3">
              <Masukan value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul catatan" aria-label="Judul catatan" />
              <AreaTeks value={isi} onChange={(e) => setIsi(e.target.value)} placeholder="Tulis di sini…" aria-label="Isi catatan" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Warna</span>
                {WARNA.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWarna(w)}
                    aria-label={`Warna ${w}`}
                    aria-pressed={warna === w}
                    className={cn(
                      'size-6 rounded-full border-2 transition-transform',
                      LATAR[w],
                      warna === w ? 'scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card' : '',
                    )}
                  />
                ))}
              </div>

              <Tombol type="submit" className="w-full">
                <Plus /> Tambah catatan
              </Tombol>
            </form>
          </IsiKartu>
        </Kartu>

        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {urut.map((c) => (
            <article key={c.id} className={cn('rounded-card border p-4', LATAR[c.warna])}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold">{c.judul}</h3>
                <div className="flex shrink-0 gap-0.5">
                  <Tombol
                    varian="hantu"
                    ukuran="ikon-sm"
                    aria-label={c.disematkan ? 'Lepas sematan' : 'Sematkan'}
                    onClick={() =>
                      setCatatan((s) => s.map((x) => (x.id === c.id ? { ...x, disematkan: !x.disematkan } : x)))
                    }
                  >
                    <Pin className={cn('size-4', c.disematkan && 'fill-current')} />
                  </Tombol>
                  <Tombol
                    varian="hantu"
                    ukuran="ikon-sm"
                    aria-label="Hapus catatan"
                    onClick={() => {
                      setCatatan((s) => s.filter((x) => x.id !== c.id))
                      toast.success('Catatan dihapus.')
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Tombol>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{c.isi}</p>
              <p className="mt-3 text-[11px] text-muted-foreground">{formatWaktuRelatif(c.updated_at)}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/catatan')({ component: HalamanCatatan })
