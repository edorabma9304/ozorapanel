import { createFileRoute } from '@tanstack/react-router'
import { Check, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu, IsiKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Sakelar } from '@/components/ui/kendali'
import { formatRp } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAKET = [
  {
    nama: 'Mulai',
    deskripsi: 'Untuk usaha yang baru merapikan operasional.',
    bulanan: 149_000,
    tahunan: 1_490_000,
    fitur: ['1 cabang', '3 pengguna', 'Katalog & pesanan', 'Laporan dasar', 'Dukungan surel'],
  },
  {
    nama: 'Tumbuh',
    deskripsi: 'Untuk tim yang sudah berjalan dan butuh kendali lebih.',
    bulanan: 399_000,
    tahunan: 3_990_000,
    unggulan: true,
    fitur: ['5 cabang', '15 pengguna', 'Stok & produksi', 'Laporan lanjutan + ekspor', 'Notifikasi WhatsApp', 'Jejak audit'],
  },
  {
    nama: 'Skala',
    deskripsi: 'Untuk bisnis dengan banyak lokasi dan proses khusus.',
    bulanan: 899_000,
    tahunan: 8_990_000,
    fitur: ['Cabang tanpa batas', 'Pengguna tanpa batas', 'Kunci API & integrasi', 'Peran khusus', 'SLA 99,9%', 'Pendampingan khusus'],
  },
]

function HalamanHarga() {
  const [tahunan, setTahunan] = useState(true)

  return (
    <>
      <KepalaHalaman
        judul="Paket harga"
        deskripsi="Pilih paket yang sesuai dengan ukuran tim Anda. Bisa naik atau turun kapan saja."
        remah={[{ label: 'Halaman' }, { label: 'Paket harga' }]}
      />

      <div className="flex items-center justify-center gap-3">
        <span className={cn('text-sm font-semibold', !tahunan && 'text-primary-kuat')}>Bulanan</span>
        <Sakelar checked={tahunan} onCheckedChange={setTahunan} aria-label="Tagihan tahunan" />
        <span className={cn('text-sm font-semibold', tahunan && 'text-primary-kuat')}>Tahunan</span>
        <Lencana warna="success" ukuran="sm">
          Hemat 2 bulan
        </Lencana>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PAKET.map((p) => (
          <Kartu
            key={p.nama}
            className={cn(
              'relative flex flex-col',
              p.unggulan && 'border-primary shadow-raised lg:-my-2',
            )}
          >
            {p.unggulan ? (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Lencana warna="primary" padat>
                  <Sparkles className="size-3" /> Paling populer
                </Lencana>
              </span>
            ) : null}

            <IsiKartu className="flex flex-1 flex-col">
              <h3 className="text-lg font-bold">{p.nama}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.deskripsi}</p>

              <p className="mt-5">
                <span className="text-3xl font-extrabold tracking-tight">
                  {formatRp(tahunan ? Math.round(p.tahunan / 12) : p.bulanan)}
                </span>
                <span className="text-sm text-muted-foreground"> /bulan</span>
              </p>
              {tahunan ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ditagih {formatRp(p.tahunan)} per tahun
                </p>
              ) : null}

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.fitur.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-success-kuat" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Tombol
                className="mt-7 w-full"
                varian={p.unggulan ? 'utama' : 'garis'}
                ukuran="lg"
                onClick={() => toast.success(`Paket ${p.nama} dipilih.`)}
              >
                Pilih {p.nama}
              </Tombol>
            </IsiKartu>
          </Kartu>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Harga belum termasuk PPN. Butuh kebutuhan khusus?{' '}
        <a href="mailto:halo@ozora.id" className="font-semibold text-primary-kuat hover:underline">
          Bicara dengan kami
        </a>
        .
      </p>
    </>
  )
}

export const Route = createFileRoute('/_app/harga')({ component: HalamanHarga })
