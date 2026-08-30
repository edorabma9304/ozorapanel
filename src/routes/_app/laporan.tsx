import { createFileRoute } from '@tanstack/react-router'
import { BarChart3, Boxes, Download, FileText, Printer, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Bagan } from '@/components/bagan/bagan'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Tab, DaftarTab, PemicuTab, IsiTab, Pemisah } from '@/components/ui/lapisan'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatPersen, formatRp, formatRpRingkas } from '@/lib/format'
import {
  ABSENSI_CONTOH, BULAN_SINGKAT, DERET_PENDAPATAN, DERET_PENGELUARAN, KARYAWAN_CONTOH,
  PELANGGAN_CONTOH, PRODUK_CONTOH, TRANSAKSI_KEUANGAN,
} from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const PERIODE = [
  { nilai: 'bulan', label: 'Bulan ini' },
  { nilai: 'kuartal', label: 'Kuartal ini' },
  { nilai: 'tahun', label: 'Tahun berjalan' },
]

const pendapatan = DERET_PENDAPATAN.reduce((a, b) => a + b, 0)
const pengeluaran = DERET_PENGELUARAN.reduce((a, b) => a + b, 0)
const labaKotor = pendapatan - pengeluaran

const POS_BIAYA = ['Pembelian bahan', 'Gaji', 'Sewa', 'Listrik & air', 'Ongkir', 'Pemasaran']

function BarisLabaRugi({ label, nilai, tebal, negatif }: { label: string; nilai: number; tebal?: boolean; negatif?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-4 border-b border-border py-2.5 last:border-0', tebal && 'text-base')}>
      <span className={tebal ? 'font-bold' : 'text-muted-foreground'}>{label}</span>
      <span className={cn(tebal ? 'font-extrabold' : 'font-semibold', negatif && 'text-danger-kuat')}>
        {negatif ? '-' : ''}{formatRp(Math.abs(nilai))}
      </span>
    </div>
  )
}

function PusatLaporan() {
  const { boleh } = useAuth()
  const [periode, setPeriode] = useState('tahun')

  if (!boleh('laporan.lihat')) return <HalamanTanpaAkses />

  const terlaris = [...PRODUK_CONTOH].sort((a, b) => b.terjual - a.terjual).slice(0, 8)
  const nilaiStok = PRODUK_CONTOH.reduce((a, b) => a + b.stok * b.harga_modal, 0)
  const hariKerja = ABSENSI_CONTOH.filter((a) => a.status !== 'libur')
  const rasioHadir = hariKerja.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length / hariKerja.length

  return (
    <>
      <KepalaHalaman
        data-cetak="sembunyi"
        judul="Pusat laporan"
        deskripsi="Ringkasan penjualan, stok, keuangan, dan kepegawaian dalam satu tempat."
        remah={[{ label: 'Halaman' }, { label: 'Laporan' }]}
        aksi={
          <>
            <PilihanRingkas nilai={periode} onUbah={setPeriode} opsi={PERIODE} className="w-44" />
            <Tombol varian="garis" onClick={() => window.print()}><Printer /> Cetak</Tombol>
            <Tombol onClick={() => toast.success('Laporan diekspor ke Excel.')}>
              <Download /> Ekspor
            </Tombol>
          </>
        }
      />

      <Kartu>
        <IsiKartu>
          <Tab defaultValue="penjualan">
            <DaftarTab>
              <PemicuTab value="penjualan"><BarChart3 /> Penjualan</PemicuTab>
              <PemicuTab value="stok"><Boxes /> Stok</PemicuTab>
              <PemicuTab value="keuangan"><Wallet /> Laba rugi</PemicuTab>
              <PemicuTab value="karyawan"><Users /> Kepegawaian</PemicuTab>
            </DaftarTab>

            {/* ---------------- Penjualan ---------------- */}
            <IsiTab value="penjualan">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KartuStatistik label="Total penjualan" nilai={formatRpRingkas(pendapatan)} warna="primary" tren={0.094} />
                  <KartuStatistik label="Unit terjual" nilai={formatAngka(PRODUK_CONTOH.reduce((a, b) => a + b.terjual, 0))} warna="success" />
                  <KartuStatistik label="Pelanggan aktif" nilai={formatAngka(PELANGGAN_CONTOH.filter((p) => p.status === 'aktif').length)} warna="info" />
                  <KartuStatistik
                    label="Nilai rata-rata"
                    nilai={formatRp(Math.round(pendapatan / PELANGGAN_CONTOH.reduce((a, b) => a + b.jumlah_pesanan, 0)))}
                    warna="warning"
                  />
                </div>

                <Kartu>
                  <KepalaKartu>
                    <div>
                      <JudulKartu>Tren penjualan</JudulKartu>
                      <DeskripsiKartu>Dua belas bulan terakhir</DeskripsiKartu>
                    </div>
                  </KepalaKartu>
                  <IsiKartu>
                    <Bagan
                      jenis="bar"
                      tinggi={300}
                      deret={[{ name: 'Penjualan', data: DERET_PENDAPATAN }]}
                      opsi={{
                        xaxis: { categories: BULAN_SINGKAT },
                        yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                        plotOptions: { bar: { columnWidth: '55%', borderRadius: 5, borderRadiusApplication: 'end' } },
                        tooltip: { y: { formatter: (v) => formatRp(v) } },
                      }}
                    />
                  </IsiKartu>
                </Kartu>

                <Kartu className="overflow-hidden">
                  <KepalaKartu className="pb-4">
                    <div>
                      <JudulKartu>Produk terlaris</JudulKartu>
                      <DeskripsiKartu>Delapan besar menurut unit terjual</DeskripsiKartu>
                    </div>
                  </KepalaKartu>
                  <BingkaiTabel>
                    <Tabel>
                      <KepalaTabel>
                        <tr>
                          <SelKepala>Produk</SelKepala>
                          <SelKepala className="hidden sm:table-cell">Kategori</SelKepala>
                          <SelKepala className="text-right">Terjual</SelKepala>
                          <SelKepala className="text-right">Omzet</SelKepala>
                          <SelKepala className="text-right">Laba kotor</SelKepala>
                        </tr>
                      </KepalaTabel>
                      <BadanTabel>
                        {terlaris.map((p) => (
                          <BarisTabel key={p.id}>
                            <Sel className="font-semibold">{p.nama}</Sel>
                            <Sel className="hidden sm:table-cell">
                              <Lencana warna="primary" ukuran="sm">{p.kategori}</Lencana>
                            </Sel>
                            <Sel className="text-right">{formatAngka(p.terjual)}</Sel>
                            <Sel className="text-right font-semibold">{formatRpRingkas(p.harga * p.terjual)}</Sel>
                            <Sel className="text-right font-bold text-success-kuat">
                              {formatRpRingkas((p.harga - p.harga_modal) * p.terjual)}
                            </Sel>
                          </BarisTabel>
                        ))}
                      </BadanTabel>
                    </Tabel>
                  </BingkaiTabel>
                </Kartu>
              </div>
            </IsiTab>

            {/* ---------------- Stok ---------------- */}
            <IsiTab value="stok">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KartuStatistik label="Nilai stok" nilai={formatRpRingkas(nilaiStok)} warna="primary" keterangan="harga modal" />
                  <KartuStatistik label="Jenis produk" nilai={PRODUK_CONTOH.length} warna="info" />
                  <KartuStatistik label="Stok menipis" nilai={PRODUK_CONTOH.filter((p) => p.stok > 0 && p.stok < 20).length} warna="warning" />
                  <KartuStatistik label="Stok habis" nilai={PRODUK_CONTOH.filter((p) => p.stok === 0).length} warna="danger" />
                </div>

                <Kartu>
                  <KepalaKartu>
                    <div>
                      <JudulKartu>Nilai stok per kategori</JudulKartu>
                      <DeskripsiKartu>Modal yang tertahan di gudang</DeskripsiKartu>
                    </div>
                  </KepalaKartu>
                  <IsiKartu>
                    <Bagan
                      jenis="bar"
                      tinggi={300}
                      deret={[
                        {
                          name: 'Nilai stok',
                          data: [...new Set(PRODUK_CONTOH.map((p) => p.kategori))].map((k) => ({
                            x: k,
                            y: PRODUK_CONTOH.filter((p) => p.kategori === k).reduce((a, b) => a + b.stok * b.harga_modal, 0),
                          })),
                        },
                      ]}
                      opsi={{
                        plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: '58%', distributed: true } },
                        legend: { show: false },
                        xaxis: { labels: { formatter: (v) => formatRpRingkas(Number(v)) } },
                        tooltip: { y: { formatter: (v) => formatRp(v) } },
                      }}
                    />
                  </IsiKartu>
                </Kartu>
              </div>
            </IsiTab>

            {/* ---------------- Laba rugi ---------------- */}
            <IsiTab value="keuangan">
              <div className="grid gap-4 lg:grid-cols-2">
                <Kartu>
                  <KepalaKartu>
                    <div>
                      <JudulKartu>Laporan laba rugi</JudulKartu>
                      <DeskripsiKartu>Ringkas, {PERIODE.find((p) => p.nilai === periode)?.label.toLowerCase()}</DeskripsiKartu>
                    </div>
                    <FileText className="size-4 text-muted-foreground" />
                  </KepalaKartu>
                  <IsiKartu>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Pendapatan</p>
                    <BarisLabaRugi label="Penjualan bersih" nilai={pendapatan} />

                    <p className="mb-1 mt-5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Beban</p>
                    {POS_BIAYA.map((k) => (
                      <BarisLabaRugi
                        key={k}
                        label={k}
                        nilai={TRANSAKSI_KEUANGAN.filter((t) => t.kategori === k).reduce((a, b) => a + b.nominal, 0)}
                        negatif
                      />
                    ))}

                    <Pemisah className="my-4" />
                    <BarisLabaRugi label="Laba kotor" nilai={labaKotor} tebal />
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Margin laba</span>
                      <Lencana warna={labaKotor / pendapatan > 0.3 ? 'success' : 'warning'}>
                        {formatPersen(labaKotor / pendapatan, 1)}
                      </Lencana>
                    </div>
                  </IsiKartu>
                </Kartu>

                <Kartu>
                  <KepalaKartu>
                    <div>
                      <JudulKartu>Pendapatan vs beban</JudulKartu>
                      <DeskripsiKartu>Perbandingan bulanan</DeskripsiKartu>
                    </div>
                  </KepalaKartu>
                  <IsiKartu>
                    <Bagan
                      jenis="area"
                      tinggi={340}
                      deret={[
                        { name: 'Pendapatan', data: DERET_PENDAPATAN },
                        { name: 'Beban', data: DERET_PENGELUARAN },
                      ]}
                      opsi={{
                        colors: ['#13deb9', '#fa896b'],
                        xaxis: { categories: BULAN_SINGKAT },
                        yaxis: { labels: { formatter: (v) => formatRpRingkas(v) } },
                        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
                        tooltip: { y: { formatter: (v) => formatRp(v) } },
                      }}
                    />
                  </IsiKartu>
                </Kartu>
              </div>
            </IsiTab>

            {/* ---------------- Kepegawaian ---------------- */}
            <IsiTab value="karyawan">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KartuStatistik label="Total karyawan" nilai={KARYAWAN_CONTOH.length} warna="primary" />
                  <KartuStatistik label="Tingkat kehadiran" nilai={formatPersen(rasioHadir, 1)} warna="success" keterangan="30 hari terakhir" />
                  <KartuStatistik
                    label="Beban gaji"
                    nilai={formatRpRingkas(KARYAWAN_CONTOH.filter((k) => k.aktif).reduce((a, b) => a + b.gaji_pokok + b.tunjangan, 0))}
                    warna="warning"
                    keterangan="per bulan"
                  />
                  <KartuStatistik
                    label="Rasio beban gaji"
                    nilai={formatPersen(
                      (KARYAWAN_CONTOH.filter((k) => k.aktif).reduce((a, b) => a + b.gaji_pokok + b.tunjangan, 0) * 12) / pendapatan,
                      1,
                    )}
                    warna="info"
                    keterangan="terhadap pendapatan"
                  />
                </div>

                <Kartu>
                  <KepalaKartu>
                    <div>
                      <JudulKartu>Kehadiran per departemen</JudulKartu>
                      <DeskripsiKartu>Persentase hadir 30 hari terakhir</DeskripsiKartu>
                    </div>
                  </KepalaKartu>
                  <IsiKartu>
                    <Bagan
                      jenis="bar"
                      tinggi={280}
                      deret={[
                        {
                          name: 'Kehadiran',
                          data: [...new Set(KARYAWAN_CONTOH.map((k) => k.departemen))].map((d) => {
                            const dep = ABSENSI_CONTOH.filter((a) => a.departemen === d && a.status !== 'libur')
                            const hadir = dep.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length
                            return { x: d, y: dep.length ? Math.round((hadir / dep.length) * 100) : 0 }
                          }),
                        },
                      ]}
                      opsi={{
                        plotOptions: { bar: { columnWidth: '50%', borderRadius: 5, borderRadiusApplication: 'end', distributed: true } },
                        legend: { show: false },
                        yaxis: { max: 100, labels: { formatter: (v) => `${v}%` } },
                      }}
                    />
                  </IsiKartu>
                </Kartu>
              </div>
            </IsiTab>
          </Tab>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/laporan')({ component: PusatLaporan })
