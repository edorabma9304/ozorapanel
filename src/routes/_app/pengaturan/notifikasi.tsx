import { createFileRoute } from '@tanstack/react-router'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Sakelar } from '@/components/ui/kendali'

const PERISTIWA = [
  { id: 'pesanan', judul: 'Pesanan baru', ket: 'Kirim notifikasi setiap ada pesanan masuk.', aktif: true },
  { id: 'stok', judul: 'Stok menipis', ket: 'Peringatkan saat stok produk di bawah ambang batas.', aktif: true },
  { id: 'harian', judul: 'Ringkasan harian', ket: 'Rekap penjualan setiap pukul 21.00 WIB.', aktif: false },
  { id: 'tempo', judul: 'Faktur jatuh tempo', ket: 'Ingatkan tiga hari sebelum jatuh tempo.', aktif: true },
  { id: 'absensi', judul: 'Absensi bermasalah', ket: 'Kabari saat ada karyawan alfa tanpa keterangan.', aktif: false },
  { id: 'cuti', judul: 'Pengajuan cuti', ket: 'Beri tahu atasan saat ada pengajuan baru.', aktif: true },
]

function PengaturanNotifikasi() {
  return (
    <Kartu>
      <KepalaKartu>
        <div>
          <JudulKartu>Peristiwa yang dikabarkan</JudulKartu>
          <DeskripsiKartu>
            Saluran pengiriman diatur di halaman Surel dan Telegram.
          </DeskripsiKartu>
        </div>
      </KepalaKartu>
      <IsiKartu>
        {PERISTIWA.map((p) => (
          <label
            key={p.id}
            htmlFor={`notif-${p.id}`}
            className="flex cursor-pointer items-center justify-between gap-6 border-b border-border py-4 last:border-0"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{p.judul}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">{p.ket}</span>
            </span>
            <Sakelar id={`notif-${p.id}`} defaultChecked={p.aktif} />
          </label>
        ))}
      </IsiKartu>
    </Kartu>
  )
}

export const Route = createFileRoute('/_app/pengaturan/notifikasi')({ component: PengaturanNotifikasi })
