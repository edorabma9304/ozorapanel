import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Download, Printer, Send } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Pemisah } from '@/components/ui/lapisan'
import { BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel } from '@/components/ui/tabel'
import { Logo } from '@/components/layout/logo'
import { FAKTUR_CONTOH, type Faktur } from '@/lib/adapter/data-contoh'
import { formatRp, formatTanggal } from '@/lib/format'

const WARNA: Record<Faktur['status'], WarnaLencana> = {
  lunas: 'success',
  tertunda: 'warning',
  jatuh_tempo: 'danger',
  draf: 'netral',
}

function DetailFaktur() {
  const { id } = Route.useParams()
  const f = FAKTUR_CONTOH.find((x) => x.id === id)
  if (!f) throw notFound()

  return (
    <>
      <KepalaHalaman
        data-cetak="sembunyi"
        judul={`Faktur ${f.nomor}`}
        remah={[{ label: 'Aplikasi' }, { label: 'Faktur', href: '/apl/faktur' }, { label: f.nomor }]}
        aksi={
          <>
            <Tombol varian="garis" asChild>
              <Link to="/apl/faktur"><ArrowLeft /> Kembali</Link>
            </Tombol>
            <Tombol varian="garis" onClick={() => window.print()}><Printer /> Cetak</Tombol>
            <Tombol><Send /> Kirim</Tombol>
          </>
        }
      />

      <Kartu>
        <IsiKartu className="sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-muted-foreground">{f.dari_nama}</p>
              <p className="max-w-56 text-sm text-muted-foreground">{f.dari_alamat}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Faktur</p>
              <p className="font-mono text-lg font-extrabold">{f.nomor}</p>
              <Lencana warna={WARNA[f.status]} className="mt-2">{f.status.replace('_', ' ')}</Lencana>
            </div>
          </div>

          <Pemisah className="my-7" />

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ditagihkan kepada</p>
              <p className="mt-1.5 font-semibold">{f.ke_nama}</p>
              <p className="text-sm text-muted-foreground">{f.ke_alamat}</p>
              <p className="text-sm text-muted-foreground">{f.ke_email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tanggal faktur</p>
              <p className="mt-1.5 font-semibold">{formatTanggal(f.tanggal, 'panjang')}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Jatuh tempo</p>
              <p className="mt-1.5 font-semibold">{formatTanggal(f.jatuh_tempo, 'panjang')}</p>
            </div>
          </div>

          <div className="mt-7 overflow-hidden rounded-card border border-border">
            <BingkaiTabel>
              <Tabel>
                <KepalaTabel>
                  <tr className="bg-muted/60">
                    <SelKepala className="w-12">#</SelKepala>
                    <SelKepala>Deskripsi</SelKepala>
                    <SelKepala className="text-right">Jumlah</SelKepala>
                    <SelKepala className="text-right">Harga satuan</SelKepala>
                    <SelKepala className="text-right">Subtotal</SelKepala>
                  </tr>
                </KepalaTabel>
                <BadanTabel>
                  {f.item.map((it) => (
                    <BarisTabel key={it.no}>
                      <Sel className="text-muted-foreground">{it.no}</Sel>
                      <Sel className="font-medium">{it.nama}</Sel>
                      <Sel className="text-right">{it.qty}</Sel>
                      <Sel className="text-right">{formatRp(it.harga)}</Sel>
                      <Sel className="text-right font-semibold">{formatRp(it.subtotal)}</Sel>
                    </BarisTabel>
                  ))}
                </BadanTabel>
              </Tabel>
            </BingkaiTabel>
          </div>

          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-72 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatRp(f.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">PPN 11%</dt>
                <dd className="font-semibold">{formatRp(f.pajak)}</dd>
              </div>
              <div className="flex justify-between text-base border-t border-border pt-2.5">
                <dt className="font-bold">Total</dt>
                <dd className="font-extrabold text-primary-kuat">{formatRp(f.total)}</dd>
              </div>
            </dl>
          </div>

          <Pemisah className="my-7" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Pembayaran ditujukan ke rekening perusahaan paling lambat pada tanggal jatuh tempo.
            Cantumkan nomor faktur pada berita transfer. Faktur ini sah tanpa tanda tangan basah.
          </p>
        </IsiKartu>
      </Kartu>

      <div className="flex justify-end print:hidden">
        <Tombol varian="garis"><Download /> Unduh PDF</Tombol>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/faktur/$id')({ component: DetailFaktur })
