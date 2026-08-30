import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Eye, MessageSquare } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Pemisah } from '@/components/ui/lapisan'
import { POS_CONTOH } from '@/lib/adapter/data-contoh'
import { formatAngka, formatTanggal } from '@/lib/format'

function DetailPos() {
  const { slug } = Route.useParams()
  const pos = POS_CONTOH.find((p) => p.slug === slug)
  if (!pos) throw notFound()

  const terkait = POS_CONTOH.filter((p) => p.kategori === pos.kategori && p.id !== pos.id).slice(0, 3)

  return (
    <>
      <KepalaHalaman
        judul={pos.judul}
        remah={[{ label: 'Aplikasi' }, { label: 'Blog', href: '/apl/blog' }, { label: pos.kategori }]}
        aksi={
          <Tombol varian="garis" asChild>
            <Link to="/apl/blog"><ArrowLeft /> Semua artikel</Link>
          </Tombol>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <div className="grid aspect-21/9 place-items-center rounded-t-card bg-primary-soft">
            <img src={pos.sampul} alt="" width={112} height={112} className="size-28 rounded-full" />
          </div>

          <IsiKartu>
            <div className="flex flex-wrap items-center gap-3">
              <Lencana warna="primary">{pos.kategori}</Lencana>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" /> {formatAngka(pos.dibaca)} dibaca
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="size-3.5" /> {pos.komentar} komentar
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">{pos.judul}</h1>

            <div className="mt-5 flex items-center gap-3">
              <Avatar nama={pos.penulis} src={pos.avatar} ukuran="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{pos.penulis}</p>
                <p className="text-xs text-muted-foreground">{formatTanggal(pos.terbit, 'panjang')}</p>
              </div>
            </div>

            <Pemisah className="my-6" />

            <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
              <p className="text-base font-medium">{pos.ringkasan}</p>
              <p>
                Sebagian besar tim kecil kehilangan waktu bukan karena kekurangan alat, melainkan
                karena informasi yang sama dicatat di tiga tempat berbeda. Sebelum menambah aplikasi
                baru, ada baiknya memetakan dulu ke mana data mengalir hari ini.
              </p>
              <h2 className="pt-2 text-lg font-bold">Mulai dari yang paling sering diulang</h2>
              <p>
                Ambil satu pekerjaan yang dilakukan setiap hari — mencatat pesanan masuk, misalnya —
                lalu hitung berapa langkah yang dibutuhkan dari pesan masuk sampai tercatat. Setiap
                langkah yang bisa dihilangkan bernilai jauh lebih besar daripada fitur baru.
              </p>
              <h2 className="pt-2 text-lg font-bold">Ukur sebelum dan sesudah</h2>
              <p>
                Catat angkanya sebelum berubah. Tanpa itu, perbaikan hanya terasa, tidak terbukti,
                dan tim sulit menilai apakah usaha yang dikeluarkan sepadan.
              </p>
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu className="h-fit">
          <IsiKartu>
            <h2 className="text-base font-bold">Artikel terkait</h2>
            <div className="mt-4 space-y-4">
              {terkait.map((p) => (
                <Link
                  key={p.id}
                  to="/apl/blog/$slug"
                  params={{ slug: p.slug }}
                  className="flex gap-3 rounded-control p-2 transition-colors hover:bg-muted"
                >
                  <img src={p.sampul} alt="" width={48} height={48} loading="lazy" className="size-12 shrink-0 rounded-card" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-semibold">{p.judul}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{formatTanggal(p.terbit)}</span>
                  </span>
                </Link>
              ))}
              {terkait.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada artikel lain di kategori ini.</p>
              ) : null}
            </div>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/blog/$slug')({ component: DetailPos })
