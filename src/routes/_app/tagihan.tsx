import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarDays, CreditCard, Download, Landmark, Plus, Sparkles, TrendingUp, Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Pemisah } from '@/components/ui/lapisan'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatTanggal } from '@/lib/format'

const PEMAKAIAN = [
  { label: 'Pengguna', dipakai: 11, kuota: 15, satuan: 'akun' },
  { label: 'Penyimpanan', dipakai: 8.4, kuota: 15, satuan: 'GB' },
  { label: 'Panggilan API', dipakai: 62_400, kuota: 100_000, satuan: 'panggilan' },
  { label: 'Pesan WhatsApp', dipakai: 1_820, kuota: 3_000, satuan: 'pesan' },
]

const RIWAYAT = [
  { id: 'r1', nomor: 'TGH-202608', periode: 'Agustus 2026', tanggal: '2026-08-01', nominal: 399_000, status: 'lunas' as const },
  { id: 'r2', nomor: 'TGH-202607', periode: 'Juli 2026', tanggal: '2026-07-01', nominal: 399_000, status: 'lunas' as const },
  { id: 'r3', nomor: 'TGH-202606', periode: 'Juni 2026', tanggal: '2026-06-01', nominal: 399_000, status: 'lunas' as const },
  { id: 'r4', nomor: 'TGH-202605', periode: 'Mei 2026', tanggal: '2026-05-01', nominal: 149_000, status: 'lunas' as const },
  { id: 'r5', nomor: 'TGH-202604', periode: 'April 2026', tanggal: '2026-04-01', nominal: 149_000, status: 'gagal' as const },
]

const WARNA_STATUS: Record<string, WarnaLencana> = { lunas: 'success', gagal: 'danger', tertunda: 'warning' }

function HalamanTagihan() {
  const { boleh } = useAuth()
  if (!boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  return (
    <>
      <KepalaHalaman
        judul="Tagihan & langganan"
        deskripsi="Paket aktif, pemakaian kuota, metode pembayaran, dan riwayat tagihan."
        remah={[{ label: 'Halaman' }, { label: 'Tagihan' }]}
        aksi={<Tombol varian="garis"><Download /> Unduh semua faktur</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Paket aktif" nilai="Tumbuh" ikon={Sparkles} warna="primary" keterangan="ditagih bulanan" />
        <KartuStatistik label="Tagihan berikutnya" nilai={formatRp(399_000)} ikon={CalendarDays} warna="info" keterangan="1 September 2026" />
        <KartuStatistik label="Pengguna terpakai" nilai="11 / 15" ikon={Users} warna="warning" />
        <KartuStatistik label="Total dibayar" nilai={formatRp(1_496_000)} ikon={TrendingUp} warna="success" keterangan="sepanjang 2026" />
      </div>

      <Peringatan varian="perhatian" judul="Kuota pengguna hampir penuh">
        Anda memakai 11 dari 15 akun. Naikkan ke paket Skala untuk pengguna tanpa batas,
        atau nonaktifkan akun yang sudah tidak dipakai dari halaman Pengguna &amp; peran.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Paket */}
        <Kartu className="border-primary">
          <KepalaKartu>
            <div>
              <JudulKartu className="flex items-center gap-2">
                Paket Tumbuh <Lencana warna="primary" padat ukuran="sm">Aktif</Lencana>
              </JudulKartu>
              <DeskripsiKartu>Diperpanjang otomatis setiap tanggal 1</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <p>
              <span className="text-3xl font-extrabold tracking-tight">{formatRp(399_000)}</span>
              <span className="text-sm text-muted-foreground"> /bulan</span>
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li>5 cabang · 15 pengguna</li>
              <li>Stok, produksi, dan laporan lanjutan</li>
              <li>Notifikasi WhatsApp &amp; jejak audit</li>
            </ul>
          </IsiKartu>
          <KakiKartu className="justify-between">
            <Tombol varian="hantu" ukuran="sm" onClick={() => toast.info('Hubungi admin untuk membatalkan langganan.')}>
              Batalkan
            </Tombol>
            <Tombol ukuran="sm">Naikkan paket</Tombol>
          </KakiKartu>
        </Kartu>

        {/* Pemakaian */}
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Pemakaian bulan ini</JudulKartu>
              <DeskripsiKartu>Dihitung ulang setiap awal periode tagihan</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-5">
            {PEMAKAIAN.map((p) => {
              const persen = (p.dipakai / p.kuota) * 100
              return (
                <Progres
                  key={p.label}
                  nilai={persen}
                  warna={persen > 85 ? 'danger' : persen > 65 ? 'warning' : 'success'}
                  label={
                    <span className="flex items-baseline gap-2">
                      {p.label}
                      <span className="text-xs font-normal text-muted-foreground">
                        {formatAngka(p.dipakai)} / {formatAngka(p.kuota)} {p.satuan}
                      </span>
                    </span>
                  }
                  tampilkanNilai
                />
              )
            })}
          </IsiKartu>
        </Kartu>
      </div>

      {/* Metode pembayaran */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Metode pembayaran</JudulKartu>
            <DeskripsiKartu>Kartu utama akan ditagih otomatis</DeskripsiKartu>
          </div>
          <Tombol varian="garis" ukuran="sm"><Plus /> Tambah metode</Tombol>
        </KepalaKartu>
        <IsiKartu className="grid gap-4 sm:grid-cols-2">
          {[
            { ikon: CreditCard, nama: 'Visa •••• 4821', ket: 'Berlaku sampai 09/28', utama: true },
            { ikon: Landmark, nama: 'BCA •••• 7734', ket: 'Rekening perusahaan', utama: false },
          ].map((m) => (
            <div
              key={m.nama}
              className={`flex items-center gap-4 rounded-card border p-4 ${m.utama ? 'border-primary bg-primary-soft/40' : 'border-border'}`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-card bg-card text-primary-kuat shadow-soft">
                <m.ikon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{m.nama}</p>
                <p className="truncate text-xs text-muted-foreground">{m.ket}</p>
              </div>
              {m.utama ? <Lencana warna="primary" ukuran="sm">Utama</Lencana> : (
                <Tombol varian="hantu" ukuran="sm" onClick={() => toast.success('Metode utama diperbarui.')}>
                  Jadikan utama
                </Tombol>
              )}
            </div>
          ))}
        </IsiKartu>
      </Kartu>

      {/* Riwayat tagihan */}
      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Riwayat tagihan</JudulKartu>
            <DeskripsiKartu>Lima periode terakhir</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <BingkaiTabel>
          <Tabel>
            <KepalaTabel>
              <tr>
                <SelKepala>Nomor</SelKepala>
                <SelKepala>Periode</SelKepala>
                <SelKepala className="hidden sm:table-cell">Tanggal</SelKepala>
                <SelKepala className="text-right">Nominal</SelKepala>
                <SelKepala>Status</SelKepala>
                <SelKepala className="text-right">Faktur</SelKepala>
              </tr>
            </KepalaTabel>
            <BadanTabel>
              {RIWAYAT.map((r) => (
                <BarisTabel key={r.id}>
                  <Sel className="font-mono text-sm font-semibold">{r.nomor}</Sel>
                  <Sel>{r.periode}</Sel>
                  <Sel className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">{formatTanggal(r.tanggal)}</Sel>
                  <Sel className="text-right font-bold">{formatRp(r.nominal)}</Sel>
                  <Sel><Lencana warna={WARNA_STATUS[r.status] ?? 'netral'}>{r.status}</Lencana></Sel>
                  <Sel className="text-right">
                    <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Unduh faktur ${r.nomor}`}><Download /></Tombol>
                  </Sel>
                </BarisTabel>
              ))}
            </BadanTabel>
          </Tabel>
        </BingkaiTabel>
        <Pemisah />
        <div className="p-4 text-center text-xs text-muted-foreground">
          Faktur pajak tersedia setelah pembayaran terverifikasi.
        </div>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/tagihan')({ component: HalamanTagihan })
