import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, Check, Clock, Copy, Download, Printer, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Pemisah } from '@/components/ui/lapisan'
import { formatRp, formatTanggal, formatTanggalWaktu } from '@/lib/format'
import { TRANSAKSI_KEUANGAN, type TransaksiKeuangan } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const WARNA_STATUS: Record<TransaksiKeuangan['status'], WarnaLencana> = {
  berhasil: 'success',
  tertunda: 'warning',
  gagal: 'danger',
}

const IKON_STATUS = { berhasil: Check, tertunda: Clock, gagal: X }

function DetailTransaksi() {
  const { id } = Route.useParams()
  const t = TRANSAKSI_KEUANGAN.find((x) => x.id === id)
  if (!t) throw notFound()

  const IkonStatus = IKON_STATUS[t.status]
  const masuk = t.jenis === 'masuk'
  const biaya = Math.round(t.nominal * 0.007)

  const jejak = [
    { label: 'Transaksi dibuat', waktu: t.created_at, selesai: true },
    { label: 'Diteruskan ke bank', waktu: t.created_at, selesai: true },
    { label: 'Dana diverifikasi', waktu: t.updated_at, selesai: t.status !== 'tertunda' },
    { label: t.status === 'gagal' ? 'Transaksi gagal' : 'Selesai', waktu: t.updated_at, selesai: t.status === 'berhasil' },
  ]

  async function salin() {
    try {
      await navigator.clipboard.writeText(t!.kode)
      toast.success('Kode transaksi disalin.')
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  return (
    <>
      <KepalaHalaman
        data-cetak="sembunyi"
        judul={`Transaksi ${t.kode}`}
        remah={[{ label: 'Aplikasi' }, { label: 'Transaksi', href: '/apl/transaksi' }, { label: t.kode }]}
        aksi={
          <>
            <Tombol varian="garis" asChild>
              <Link to="/apl/transaksi"><ArrowLeft /> Kembali</Link>
            </Tombol>
            <Tombol varian="garis" onClick={() => window.print()}><Printer /> Cetak</Tombol>
            <Tombol><Download /> Unduh bukti</Tombol>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <IsiKartu className="sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'grid size-14 shrink-0 place-items-center rounded-card',
                    masuk ? 'bg-success-soft text-success-kuat' : 'bg-danger-soft text-danger-kuat',
                  )}
                >
                  {masuk ? <ArrowDownLeft className="size-7" /> : <ArrowUpRight className="size-7" />}
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{t.kategori}</p>
                  <p className={cn('text-3xl font-extrabold', masuk ? 'text-success-kuat' : 'text-danger-kuat')}>
                    {masuk ? '+' : '−'}{formatRp(t.nominal)}
                  </p>
                </div>
              </div>
              <Lencana warna={WARNA_STATUS[t.status]} padat className="gap-1.5">
                <IkonStatus className="size-3.5" /> {t.status}
              </Lencana>
            </div>

            <Pemisah className="my-7" />

            <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              {[
                ['Kode transaksi', <span key="k" className="flex items-center gap-2 font-mono">{t.kode}<button type="button" onClick={() => void salin()} aria-label="Salin kode"><Copy className="size-3.5 text-muted-foreground hover:text-primary-kuat" /></button></span>],
                ['Jenis', masuk ? 'Kas masuk' : 'Kas keluar'],
                ['Pihak terkait', t.pihak],
                ['Metode pembayaran', t.metode],
                ['Tanggal transaksi', formatTanggal(t.tanggal, 'panjang')],
                ['Terakhir diperbarui', formatTanggalWaktu(t.updated_at)],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 rounded-card bg-muted/60 p-4">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nominal</dt>
                  <dd className="font-semibold">{formatRp(t.nominal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Biaya layanan (0,7%)</dt>
                  <dd className="font-semibold">{formatRp(biaya)}</dd>
                </div>
                <Pemisah />
                <div className="flex justify-between text-base">
                  <dt className="font-bold">Diterima bersih</dt>
                  <dd className="font-extrabold text-primary-kuat">{formatRp(t.nominal - biaya)}</dd>
                </div>
              </dl>
            </div>

            {t.catatan ? (
              <p className="mt-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Catatan: </span>{t.catatan}
              </p>
            ) : null}
          </IsiKartu>
        </Kartu>

        <Kartu className="h-fit">
          <KepalaKartu>
            <div>
              <JudulKartu>Riwayat status</JudulKartu>
              <DeskripsiKartu>Perjalanan transaksi ini</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <ol className="relative space-y-6 border-l border-border pl-6">
              {jejak.map((j) => (
                <li key={j.label} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[31px] grid size-5 place-items-center rounded-full border-2 border-card',
                      j.selesai ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {j.selesai ? <Check className="size-3" strokeWidth={3} /> : <Clock className="size-3" />}
                  </span>
                  <p className={cn('text-sm font-semibold', !j.selesai && 'text-muted-foreground')}>{j.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatTanggalWaktu(j.waktu)}</p>
                </li>
              ))}
            </ol>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/transaksi/$id')({ component: DetailTransaksi })
