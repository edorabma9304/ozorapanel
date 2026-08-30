import { createFileRoute, Link } from '@tanstack/react-router'
import { Eye, MessageSquare, Plus } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { SaringCepat } from '@/components/data/bilah-alat'
import { POS_CONTOH } from '@/lib/adapter/data-contoh'
import { formatAngka, formatTanggal } from '@/lib/format'

const KATEGORI = ['Keuangan', 'Operasional', 'Pemasaran', 'Teknologi']

function HalamanBlog() {
  const [kategori, setKategori] = useState<string | undefined>()
  const pos = kategori ? POS_CONTOH.filter((p) => p.kategori === kategori) : POS_CONTOH
  const [utama, ...sisa] = pos

  return (
    <>
      <KepalaHalaman
        judul="Blog"
        deskripsi="Artikel dan catatan praktik dari tim."
        remah={[{ label: 'Aplikasi' }, { label: 'Blog' }]}
        aksi={<Tombol><Plus /> Tulis artikel</Tombol>}
      />

      <Kartu className="overflow-hidden pt-4">
        <SaringCepat
          nilai={kategori}
          onUbah={setKategori}
          totalSemua={POS_CONTOH.length}
          opsi={KATEGORI.map((k) => ({
            nilai: k,
            label: k,
            jumlah: POS_CONTOH.filter((p) => p.kategori === k).length,
          }))}
          className="border-b-0 pb-4"
        />
      </Kartu>

      {utama ? (
        <Kartu className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="grid aspect-video place-items-center bg-primary-soft md:aspect-auto">
              <img src={utama.sampul} alt="" width={120} height={120} className="size-28 rounded-full" />
            </div>
            <IsiKartu className="flex flex-col justify-center">
              <Lencana warna="primary" className="w-fit">{utama.kategori}</Lencana>
              <h2 className="mt-3 text-xl font-extrabold leading-snug">
                <Link to="/apl/blog/$slug" params={{ slug: utama.slug }} className="hover:text-primary-kuat">
                  {utama.judul}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{utama.ringkasan}</p>
              <div className="mt-5 flex items-center gap-3">
                <Avatar nama={utama.penulis} src={utama.avatar} ukuran="sm" />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-semibold">{utama.penulis}</p>
                  <p className="text-xs text-muted-foreground">{formatTanggal(utama.terbit, 'panjang')}</p>
                </div>
              </div>
            </IsiKartu>
          </div>
        </Kartu>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sisa.map((p) => (
          <Kartu key={p.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-raised">
            <div className="grid aspect-video place-items-center bg-muted">
              <img src={p.sampul} alt="" width={80} height={80} loading="lazy" className="size-20 rounded-full" />
            </div>
            <IsiKartu className="flex flex-1 flex-col">
              <Lencana warna="primary" ukuran="sm" className="w-fit">{p.kategori}</Lencana>
              <h3 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug">
                <Link to="/apl/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary-kuat">
                  {p.judul}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.ringkasan}</p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar nama={p.penulis} src={p.avatar} ukuran="xs" />
                  <span className="truncate text-xs font-medium">{p.penulis}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="size-3.5" /> {formatAngka(p.dibaca)}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {p.komentar}</span>
                </div>
              </div>
            </IsiKartu>
          </Kartu>
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/blog/')({ component: HalamanBlog })
