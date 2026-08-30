import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check, Download } from 'lucide-react'
import { Tombol } from '@/components/ui/tombol'
import { formatRp, formatTanggal } from '@/lib/format'

function HalamanBerhasil() {
  return (
    <div className="text-center">
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-success-soft text-success-kuat">
        <Check className="size-9" strokeWidth={3} />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Pembayaran berhasil</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Terima kasih. Transaksi Anda sudah kami terima dan bukti pembayaran
        dikirim ke surel terdaftar.
      </p>

      <div className="mt-7 rounded-card border border-border bg-card p-5 text-left">
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Nomor transaksi</dt>
            <dd className="font-mono font-semibold">TRX-70241</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Tanggal</dt>
            <dd className="font-semibold">{formatTanggal(new Date(), 'panjang')}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Metode</dt>
            <dd className="font-semibold">Transfer Bank</dd>
          </div>
          <div className="flex justify-between gap-4 text-base border-t border-border pt-2.5">
            <dt className="font-bold">Total dibayar</dt>
            <dd className="font-extrabold text-success-kuat">{formatRp(399_000)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Tombol varian="garis" className="flex-1"><Download /> Unduh bukti</Tombol>
        <Tombol className="flex-1" asChild>
          <Link to="/">Ke dasbor <ArrowRight /></Link>
        </Tombol>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_auth/berhasil')({ component: HalamanBerhasil })
