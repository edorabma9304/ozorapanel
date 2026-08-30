import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, Rocket, Sparkles, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Masukan } from '@/components/ui/masukan'

function HalamanBanner() {
  const [tampil, setTampil] = useState(true)

  return (
    <>
      <KepalaHalaman
        judul="Banner"
        deskripsi="Sisipan untuk pengumuman, ajakan bertindak, dan promosi fitur."
        remah={[{ label: 'Widget' }, { label: 'Banner' }]}
      />

      {tampil ? (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-primary/25 bg-primary-soft px-4 py-3">
          <Sparkles className="size-5 shrink-0 text-primary-kuat" />
          <p className="flex-1 text-sm">
            <span className="font-bold">Fitur baru:</span> laporan laba rugi kini bisa diekspor ke
            Excel langsung dari halaman Laporan.
          </p>
          <Tombol varian="halus" ukuran="sm">Coba sekarang</Tombol>
          <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => setTampil(false)} aria-label="Tutup pengumuman">
            <X />
          </Tombol>
        </div>
      ) : (
        <Tombol varian="garis" ukuran="sm" onClick={() => setTampil(true)}>Tampilkan lagi banner</Tombol>
      )}

      <Kartu className="overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground">
        <IsiKartu className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-xl">
            <Lencana className="bg-white/20 text-white">Paket Tumbuh</Lencana>
            <h2 className="mt-3 text-2xl font-extrabold leading-tight">
              Kelola lima cabang sekaligus tanpa menambah staf admin
            </h2>
            <p className="mt-2 text-sm opacity-90">
              Stok, produksi, dan laporan tersinkron otomatis antar lokasi. Coba 14 hari,
              tanpa kartu kredit.
            </p>
          </div>
          <Tombol varian="garis" ukuran="lg" className="relative shrink-0 border-white/40 bg-white/15 text-white hover:bg-white/25">
            Mulai uji coba <ArrowRight />
          </Tombol>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-4 md:grid-cols-2">
        <Kartu className="border-warning/30 bg-warning-soft">
          <IsiKartu className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-card bg-warning text-warning-foreground">
              <Zap className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">Kuota penyimpanan hampir penuh</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Anda memakai 4,6 GB dari 5 GB. Hapus lampiran lama atau tingkatkan paket.
              </p>
              <Tombol varian="halus" ukuran="sm" className="mt-3">Kelola penyimpanan</Tombol>
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <IsiKartu className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-card bg-primary-soft text-primary-kuat">
              <Rocket className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold">Selesaikan penyiapan</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tiga langkah lagi sebelum panel siap dipakai tim Anda.
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[62%] rounded-full bg-primary" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">5 dari 8 langkah selesai</p>
            </div>
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu>
        <IsiKartu className="flex flex-col items-center gap-4 py-10 text-center">
          <h2 className="text-xl font-extrabold">Dapatkan ringkasan mingguan</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Rekap penjualan, stok kritis, dan tagihan jatuh tempo — dikirim setiap Senin pagi.
          </p>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
            <Masukan type="email" placeholder="surel@perusahaan.id" aria-label="Alamat surel" />
            <Tombol type="submit">Berlangganan</Tombol>
          </form>
          <p className="text-xs text-muted-foreground">Bisa berhenti kapan saja.</p>
        </IsiKartu>
      </Kartu>

      <div className="grid gap-3 md:grid-cols-2">
        <Peringatan varian="info" judul="Pemeliharaan terjadwal">
          Minggu, 7 September 2026, pukul 01.00–03.00 WIB. Panel tidak dapat diakses selama proses.
        </Peringatan>
        <Peringatan varian="bahaya" judul="Tindakan diperlukan">
          Kunci API produksi Anda akan kedaluwarsa dalam 7 hari. Perbarui sebelum layanan terputus.
        </Peringatan>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/widget/banner')({ component: HalamanBanner })
