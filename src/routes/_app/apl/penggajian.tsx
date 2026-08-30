import { createFileRoute } from '@tanstack/react-router'
import { Banknote, Download, Eye, Printer, Send, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { DeskripsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Dialog, IsiDialog, KakiDialog, Pemisah, TutupDialog } from '@/components/ui/lapisan'
import { Peringatan } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatRpRingkas, formatTanggal } from '@/lib/format'
import { ABSENSI_CONTOH, DEPARTEMEN, KARYAWAN_CONTOH, type Karyawan } from '@/lib/adapter/data-contoh'
import { ATURAN_GAJI, hitungSlipGaji } from '@/lib/hitung'

/** Ambil masukan gaji dari data absensi, lalu serahkan hitungannya ke lib/hitung. */
function hitungSlip(k: Karyawan) {
  const absen = ABSENSI_CONTOH.filter((a) => a.karyawan_id === k.id)
  const alfa = absen.filter((a) => a.status === 'alfa').length
  const terlambat = absen.filter((a) => a.status === 'terlambat').length
  const hadir = absen.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length

  const slip = hitungSlipGaji({
    gajiPokok: k.gaji_pokok,
    tunjangan: k.tunjangan,
    hariHadir: hadir,
    hariAlfa: alfa,
    jamLembur: Math.max(0, hadir - 22) * 2,
  })

  return { hadir, alfa, terlambat, ...slip }
}

const aktif = KARYAWAN_CONTOH.filter((k) => k.aktif)
const totalNetto = aktif.reduce((a, k) => a + hitungSlip(k).netto, 0)

function HalamanPenggajian() {
  const { boleh } = useAuth()
  const [periode, setPeriode] = useState('2026-08')
  const [slip, setSlip] = useState<Karyawan | null>(null)
  const t = useDaftarTabel<Karyawan>('karyawan', { urutAwal: { kolom: 'nama', arah: 'naik' }, perHalamanAwal: 15 })

  if (!boleh('laporan.lihat') && !boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Karyawan>> = [
    {
      kunci: 'nama',
      judul: 'Karyawan',
      urutkan: true,
      render: (k) => (
        <div className="flex items-center gap-3">
          <Avatar nama={k.nama} src={k.avatar} ukuran="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{k.nama}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{k.nip}</p>
          </div>
        </div>
      ),
    },
    { kunci: 'departemen', judul: 'Departemen', urutkan: true, sembunyiHp: true, render: (k) => <Lencana warna="primary" ukuran="sm">{k.departemen}</Lencana> },
    { kunci: 'gaji_pokok', judul: 'Gaji pokok', urutkan: true, rata: 'kanan', render: (k) => formatRp(k.gaji_pokok) },
    { kunci: 'tunjangan', judul: 'Tunjangan', rata: 'kanan', sembunyiHp: true, render: (k) => formatRp(k.tunjangan) },
    {
      kunci: 'potongan',
      judul: 'Potongan',
      rata: 'kanan',
      sembunyiHp: true,
      render: (k) => {
        const s = hitungSlip(k)
        return <span className="text-danger-kuat">-{formatRp(s.bpjs + s.pph + s.potonganAlfa)}</span>
      },
    },
    {
      kunci: 'netto',
      judul: 'Diterima',
      rata: 'kanan',
      render: (k) => <span className="font-bold text-success-kuat">{formatRp(hitungSlip(k).netto)}</span>,
    },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Penggajian"
        deskripsi="Perhitungan gaji berdasarkan data absensi, lengkap dengan slip per karyawan."
        remah={[{ label: 'Aplikasi' }, { label: 'Penggajian' }]}
        aksi={
          <>
            <PilihanRingkas
              nilai={periode}
              onUbah={setPeriode}
              className="w-44"
              opsi={[
                { nilai: '2026-08', label: 'Agustus 2026' },
                { nilai: '2026-07', label: 'Juli 2026' },
                { nilai: '2026-06', label: 'Juni 2026' },
              ]}
            />
            <Tombol varian="garis"><Download /> Ekspor</Tombol>
            <Tombol onClick={() => toast.success('Slip gaji dikirim ke seluruh karyawan.')}>
              <Send /> Kirim slip
            </Tombol>
          </>
        }
      />

      <Peringatan varian="info" judul="Angka dihitung dari data absensi">
        Potongan alfa memakai rumus gaji pokok ÷ 25 hari kerja. Lembur dihitung dari
        kehadiran di atas 22 hari, {formatRp(ATURAN_GAJI.upahLemburPerJam)} per jam. Sesuaikan rumusnya
        di <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">hitungSlip()</code> mengikuti
        kebijakan perusahaan Anda.
      </Peringatan>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total gaji bersih" nilai={formatRpRingkas(totalNetto)} ikon={Wallet} warna="primary" keterangan="periode berjalan" />
        <KartuStatistik label="Karyawan dibayar" nilai={aktif.length} ikon={Users} warna="success" />
        <KartuStatistik
          label="Total tunjangan"
          nilai={formatRpRingkas(aktif.reduce((a, k) => a + k.tunjangan, 0))}
          ikon={Banknote}
          warna="info"
        />
        <KartuStatistik
          label="Total potongan"
          nilai={formatRpRingkas(aktif.reduce((a, k) => { const s = hitungSlip(k); return a + s.bpjs + s.pph + s.potonganAlfa }, 0))}
          ikon={Banknote}
          warna="danger"
          keterangan="BPJS, PPh, dan alfa"
        />
      </div>

      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Daftar gaji</JudulKartu>
            <DeskripsiKartu>Klik ikon mata untuk melihat slip gaji</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari nama atau NIP…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['departemen']}
          onUbah={(n) => t.ubahFilter('departemen', n)}
          totalSemua={KARYAWAN_CONTOH.length}
          opsi={DEPARTEMEN.map((d) => ({
            nilai: d,
            label: d,
            jumlah: KARYAWAN_CONTOH.filter((k) => k.departemen === d).length,
          }))}
        />
        <TabelData<Karyawan>
          kolom={kolom}
          idBaris={(k) => k.id}
          {...t.propsTabel}
          aksi={(k) => (
            <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => setSlip(k)} aria-label={`Slip gaji ${k.nama}`}>
              <Eye />
            </Tombol>
          )}
        />
      </Kartu>

      <Dialog open={Boolean(slip)} onOpenChange={(b) => !b && setSlip(null)}>
        {slip ? (() => {
          const s = hitungSlip(slip)
          return (
            <IsiDialog judul="Slip gaji" deskripsi={`Periode ${formatTanggal(`${periode}-01`, 'panjang')}`}>
              <div className="rounded-card border border-border p-4">
                <div className="flex items-center gap-3">
                  <Avatar nama={slip.nama} src={slip.avatar} ukuran="md" />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{slip.nama}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {slip.nip} · {slip.jabatan} · {slip.departemen}
                    </p>
                  </div>
                </div>

                <Pemisah className="my-4" />

                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Kehadiran</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { l: 'Hadir', v: s.hadir, w: 'text-success-kuat' },
                    { l: 'Terlambat', v: s.terlambat, w: 'text-warning-kuat' },
                    { l: 'Alfa', v: s.alfa, w: 'text-danger-kuat' },
                  ].map((x) => (
                    <div key={x.l} className="rounded-card bg-muted/60 p-2.5">
                      <p className={`text-lg font-extrabold ${x.w}`}>{formatAngka(x.v)}</p>
                      <p className="text-xs text-muted-foreground">{x.l}</p>
                    </div>
                  ))}
                </div>

                <Pemisah className="my-4" />

                <dl className="space-y-2 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pendapatan</p>
                  {[
                    ['Gaji pokok', slip.gaji_pokok],
                    ['Tunjangan', slip.tunjangan],
                    ['Lembur', s.lembur],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-semibold">{formatRp(Number(v))}</dd>
                    </div>
                  ))}
                  <p className="mt-3 border-t border-border pt-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Potongan</p>
                  {[
                    ['BPJS (3%)', s.bpjs],
                    ['PPh 21 (2%)', s.pph],
                    ['Potongan alfa', s.potonganAlfa],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-semibold text-danger-kuat">-{formatRp(Number(v))}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between text-base border-t border-border pt-2.5">
                    <dt className="font-bold">Diterima bersih</dt>
                    <dd className="font-extrabold text-success-kuat">{formatRp(s.netto)}</dd>
                  </div>
                </dl>
              </div>

              <KakiDialog>
                <TutupDialog asChild><Tombol varian="garis">Tutup</Tombol></TutupDialog>
                <Tombol onClick={() => window.print()}><Printer /> Cetak slip</Tombol>
              </KakiDialog>
            </IsiDialog>
          )
        })() : null}
      </Dialog>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/penggajian')({ component: HalamanPenggajian })
