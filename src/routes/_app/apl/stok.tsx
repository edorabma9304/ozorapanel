import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Boxes, Download, Plus, Settings2, TriangleAlert,
  Warehouse,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { TabelData, type Kolom } from '@/components/data/tabel-data'
import { BilahAlat, SaringCepat } from '@/components/data/bilah-alat'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Dialog, IsiDialog, KakiDialog, PemicuDialog, Tab, DaftarTab, PemicuTab, IsiTab, TutupDialog } from '@/components/ui/lapisan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useDaftarTabel } from '@/lib/use-daftar-tabel'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatRp, formatTanggalWaktu } from '@/lib/format'
import { GUDANG_CONTOH, MUTASI_CONTOH, PRODUK_CONTOH, type Mutasi } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const AMBANG_MENIPIS = 20

const WARNA_JENIS: Record<Mutasi['jenis'], WarnaLencana> = {
  masuk: 'success',
  keluar: 'danger',
  penyesuaian: 'warning',
  transfer: 'info',
}

const IKON_JENIS = {
  masuk: ArrowDownLeft,
  keluar: ArrowUpRight,
  penyesuaian: Settings2,
  transfer: ArrowLeftRight,
} as const

const menipis = PRODUK_CONTOH.filter((p) => p.stok > 0 && p.stok < AMBANG_MENIPIS)
const habis = PRODUK_CONTOH.filter((p) => p.stok === 0)
const nilaiStok = PRODUK_CONTOH.reduce((a, b) => a + b.stok * b.harga_modal, 0)

function FormPenyesuaian() {
  const [terbuka, setTerbuka] = useState(false)
  return (
    <Dialog open={terbuka} onOpenChange={setTerbuka}>
      <PemicuDialog asChild>
        <Tombol><Plus /> Penyesuaian stok</Tombol>
      </PemicuDialog>
      <IsiDialog
        judul="Penyesuaian stok"
        deskripsi="Catat selisih antara stok fisik dan stok sistem. Setiap penyesuaian masuk jejak audit."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            toast.success('Penyesuaian stok tercatat.')
            setTerbuka(false)
          }}
        >
          <KolomForm id="ps-produk" label="Produk" wajib>
            <PilihanRingkas
              id="ps-produk"
              nilai={PRODUK_CONTOH[0]!.id}
              onUbah={() => undefined}
              opsi={PRODUK_CONTOH.slice(0, 12).map((p) => ({ nilai: p.id, label: `${p.nama} · stok ${p.stok}` }))}
            />
          </KolomForm>

          <div className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="ps-gudang" label="Gudang" wajib>
              <PilihanRingkas
                id="ps-gudang"
                nilai={GUDANG_CONTOH[0]!.nama}
                onUbah={() => undefined}
                opsi={GUDANG_CONTOH.map((g) => ({ nilai: g.nama, label: g.nama }))}
              />
            </KolomForm>
            <KolomForm id="ps-qty" label="Selisih" wajib petunjuk="Negatif untuk mengurangi.">
              <Masukan id="ps-qty" type="number" defaultValue={0} className="text-right" />
            </KolomForm>
          </div>

          <KolomForm id="ps-alasan" label="Alasan" wajib>
            <PilihanRingkas
              id="ps-alasan"
              nilai="opname"
              onUbah={() => undefined}
              opsi={[
                { nilai: 'opname', label: 'Stok opname' },
                { nilai: 'rusak', label: 'Barang rusak' },
                { nilai: 'kedaluwarsa', label: 'Kedaluwarsa' },
                { nilai: 'koreksi', label: 'Koreksi pencatatan' },
              ]}
            />
          </KolomForm>

          <KolomForm id="ps-catatan" label="Catatan">
            <AreaTeks id="ps-catatan" placeholder="Jelaskan penyebab selisihnya…" />
          </KolomForm>

          <KakiDialog>
            <TutupDialog asChild><Tombol varian="garis" type="button">Batal</Tombol></TutupDialog>
            <Tombol type="submit">Simpan penyesuaian</Tombol>
          </KakiDialog>
        </form>
      </IsiDialog>
    </Dialog>
  )
}

function HalamanStok() {
  const { boleh } = useAuth()
  const t = useDaftarTabel<Mutasi>('mutasi', { urutAwal: { kolom: 'waktu', arah: 'turun' }, perHalamanAwal: 25 })

  if (!boleh('stok.lihat') && !boleh('katalog.lihat')) return <HalamanTanpaAkses />

  const kolom: Array<Kolom<Mutasi>> = [
    {
      kunci: 'produk_nama',
      judul: 'Produk',
      urutkan: true,
      render: (m) => {
        const Ikon = IKON_JENIS[m.jenis]
        return (
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'grid size-9 shrink-0 place-items-center rounded-full',
                m.jenis === 'masuk' && 'bg-success-soft text-success-kuat',
                m.jenis === 'keluar' && 'bg-danger-soft text-danger-kuat',
                m.jenis === 'penyesuaian' && 'bg-warning-soft text-warning-kuat',
                m.jenis === 'transfer' && 'bg-info-soft text-info-kuat',
              )}
            >
              <Ikon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{m.produk_nama}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{m.sku}</p>
            </div>
          </div>
        )
      },
    },
    { kunci: 'jenis', judul: 'Jenis', urutkan: true, render: (m) => <Lencana warna={WARNA_JENIS[m.jenis]}>{m.jenis}</Lencana> },
    {
      kunci: 'qty',
      judul: 'Jumlah',
      urutkan: true,
      rata: 'kanan',
      render: (m) => (
        <span className={cn('font-bold', m.qty < 0 ? 'text-danger-kuat' : 'text-success-kuat')}>
          {m.qty > 0 ? '+' : ''}{formatAngka(m.qty)}
        </span>
      ),
    },
    { kunci: 'alasan', judul: 'Alasan', sembunyiHp: true, render: (m) => <span className="text-muted-foreground">{m.alasan}</span> },
    { kunci: 'gudang', judul: 'Gudang', urutkan: true, sembunyiHp: true, render: (m) => m.gudang },
    { kunci: 'petugas', judul: 'Petugas', sembunyiHp: true, render: (m) => <span className="text-muted-foreground">{m.petugas}</span> },
    { kunci: 'waktu', judul: 'Waktu', urutkan: true, rata: 'kanan', sembunyiHp: true, render: (m) => <span className="whitespace-nowrap text-muted-foreground">{formatTanggalWaktu(m.waktu)}</span> },
  ]

  return (
    <>
      <KepalaHalaman
        judul="Stok"
        deskripsi="Posisi stok per gudang, peringatan stok menipis, dan riwayat setiap mutasi."
        remah={[{ label: 'Aplikasi' }, { label: 'Stok' }]}
        aksi={
          <>
            <Tombol varian="garis"><Download /> Ekspor</Tombol>
            <FormPenyesuaian />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Nilai stok" nilai={formatRp(nilaiStok)} ikon={Boxes} warna="primary" keterangan="dihitung dari harga modal" />
        <KartuStatistik label="Jenis produk" nilai={formatAngka(PRODUK_CONTOH.length)} ikon={Boxes} warna="info" />
        <KartuStatistik label="Stok menipis" nilai={formatAngka(menipis.length)} ikon={TriangleAlert} warna="warning" keterangan={`di bawah ${AMBANG_MENIPIS} unit`} />
        <KartuStatistik label="Stok habis" nilai={formatAngka(habis.length)} ikon={TriangleAlert} warna="danger" keterangan="perlu segera dipesan" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Kapasitas gudang</JudulKartu>
              <DeskripsiKartu>Ruang terpakai di tiap lokasi</DeskripsiKartu>
            </div>
            <Warehouse className="size-4 text-muted-foreground" />
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            {GUDANG_CONTOH.map((g) => (
              <Progres
                key={g.id}
                nilai={g.kapasitas * 100}
                warna={g.kapasitas > 0.8 ? 'danger' : g.kapasitas > 0.6 ? 'warning' : 'success'}
                label={
                  <span className="flex items-baseline gap-2">
                    {g.nama}
                    <span className="text-xs font-normal text-muted-foreground">
                      {g.kota} · {formatAngka(g.item)} item
                    </span>
                  </span>
                }
                tampilkanNilai
              />
            ))}
          </IsiKartu>
        </Kartu>

        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Perlu dipesan ulang</JudulKartu>
              <DeskripsiKartu>Produk yang stoknya menipis atau habis</DeskripsiKartu>
            </div>
            <Lencana warna="warning">{menipis.length + habis.length} produk</Lencana>
          </KepalaKartu>
          <IsiKartu>
            <Tab defaultValue="menipis">
              <DaftarTab>
                <PemicuTab value="menipis">Menipis ({menipis.length})</PemicuTab>
                <PemicuTab value="habis">Habis ({habis.length})</PemicuTab>
              </DaftarTab>

              {(['menipis', 'habis'] as const).map((tab) => (
                <IsiTab key={tab} value={tab}>
                  <ul className="space-y-3">
                    {(tab === 'menipis' ? menipis : habis).slice(0, 6).map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <Avatar nama={p.nama} src={p.gambar} ukuran="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.nama}</p>
                          <div className="mt-1.5">
                            <Progres
                              nilai={(p.stok / (AMBANG_MENIPIS * 2)) * 100}
                              warna={p.stok === 0 ? 'danger' : p.stok < 8 ? 'danger' : 'warning'}
                              tebal="sm"
                            />
                          </div>
                        </div>
                        <span className="w-12 shrink-0 text-right text-sm font-bold">{p.stok}</span>
                        <Tombol varian="halus" ukuran="sm">Pesan</Tombol>
                      </li>
                    ))}
                    {(tab === 'menipis' ? menipis : habis).length === 0 ? (
                      <li className="py-6 text-center text-sm text-muted-foreground">Tidak ada produk di kategori ini.</li>
                    ) : null}
                  </ul>
                </IsiTab>
              ))}
            </Tab>
          </IsiKartu>
        </Kartu>
      </div>

      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Riwayat mutasi</JudulKartu>
            <DeskripsiKartu>Setiap perubahan stok tercatat lengkap dengan petugasnya</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <BilahAlat
          cari={t.cari}
          onCari={t.setCari}
          placeholder="Cari produk, SKU, atau alasan…"
          adaFilterAktif={t.adaFilterAktif}
          onBersihkan={t.bersihkanFilter}
        />
        <SaringCepat
          nilai={t.filter['jenis']}
          onUbah={(n) => t.ubahFilter('jenis', n)}
          totalSemua={MUTASI_CONTOH.length}
          opsi={(['masuk', 'keluar', 'penyesuaian', 'transfer'] as const).map((j) => ({
            nilai: j,
            label: j,
            jumlah: MUTASI_CONTOH.filter((m) => m.jenis === j).length,
          }))}
        />
        <TabelData<Mutasi> kolom={kolom} idBaris={(m) => m.id} {...t.propsTabel} />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/stok')({ component: HalamanStok })
