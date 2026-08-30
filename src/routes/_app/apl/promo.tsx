import { createFileRoute } from '@tanstack/react-router'
import { Copy, MoreVertical, Percent, Plus, Tag, Ticket, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KartuStatistik } from '@/components/data/kartu-statistik'
import { SaringCepat } from '@/components/data/bilah-alat'
import { Progres } from '@/components/ui/progres'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Sakelar } from '@/components/ui/kendali'
import { Pita } from '@/components/ui/pita'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatAngka, formatPersen, formatRp, formatTanggal } from '@/lib/format'
import { PROMO_CONTOH } from '@/lib/adapter/data-contoh'

const LABEL_JENIS = { persen: 'Diskon persen', nominal: 'Potongan nominal', ongkir: 'Gratis ongkir' } as const

function HalamanPromo() {
  const { boleh } = useAuth()
  const [promo, setPromo] = useState(PROMO_CONTOH)
  const [jenis, setJenis] = useState<string | undefined>()

  if (!boleh('katalog.lihat') && !boleh('pesanan.lihat')) return <HalamanTanpaAkses />

  const hasil = jenis ? promo.filter((p) => p.jenis === jenis) : promo
  const aktif = promo.filter((p) => p.aktif).length
  const totalTerpakai = promo.reduce((a, b) => a + b.terpakai, 0)

  async function salin(kode: string) {
    try {
      await navigator.clipboard.writeText(kode)
      toast.success(`Kode "${kode}" disalin.`)
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  return (
    <>
      <KepalaHalaman
        judul="Promo &amp; kupon"
        deskripsi="Kode promo, kuota pemakaian, dan masa berlakunya."
        remah={[{ label: 'Aplikasi' }, { label: 'Promo' }]}
        aksi={<Tombol><Plus /> Buat promo</Tombol>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KartuStatistik label="Total promo" nilai={promo.length} ikon={Ticket} warna="primary" />
        <KartuStatistik label="Sedang aktif" nilai={aktif} ikon={Ticket} warna="success" />
        <KartuStatistik label="Kode terpakai" nilai={formatAngka(totalTerpakai)} ikon={TrendingUp} warna="info" keterangan="sepanjang periode" />
        <KartuStatistik
          label="Rata-rata penyerapan"
          nilai={formatPersen(promo.reduce((a, b) => a + b.terpakai / b.kuota, 0) / promo.length, 0)}
          ikon={Percent}
          warna="warning"
          keterangan="dari kuota"
        />
      </div>

      <Kartu className="overflow-hidden pt-4">
        <SaringCepat
          nilai={jenis}
          onUbah={setJenis}
          totalSemua={promo.length}
          opsi={(['persen', 'nominal', 'ongkir'] as const).map((j) => ({
            nilai: j,
            label: LABEL_JENIS[j],
            jumlah: promo.filter((p) => p.jenis === j).length,
          }))}
          className="border-b-0 pb-4"
        />
      </Kartu>

      {hasil.length === 0 ? (
        <Kartu>
          <KeadaanKosong ikon={Ticket} judul="Belum ada promo" deskripsi="Buat kode promo untuk mendorong pembelian berulang." />
        </Kartu>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hasil.map((p) => {
            const habis = p.terpakai >= p.kuota
            const kedaluwarsa = new Date(p.selesai) < new Date()
            return (
              <Kartu key={p.id} className="relative flex flex-col overflow-hidden">
                {habis ? (
                  <Pita warna="danger" bentuk="ekor" posisi="kanan-atas">Kuota habis</Pita>
                ) : kedaluwarsa ? (
                  <Pita warna="netral" bentuk="ekor" posisi="kanan-atas">Kedaluwarsa</Pita>
                ) : p.aktif ? (
                  <Pita warna="success" bentuk="ekor" posisi="kanan-atas">Aktif</Pita>
                ) : null}

                <IsiKartu className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-card bg-primary-soft text-primary-kuat">
                      <Tag className="size-5" />
                    </span>
                    <Dropdown>
                      <PemicuDropdown asChild>
                        <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${p.nama}`}><MoreVertical /></Tombol>
                      </PemicuDropdown>
                      <IsiDropdown>
                        <ItemDropdown onSelect={() => void salin(p.kode)}><Copy /> Salin kode</ItemDropdown>
                        <ItemDropdown><Plus /> Duplikat promo</ItemDropdown>
                      </IsiDropdown>
                    </Dropdown>
                  </div>

                  <JudulKartu className="mt-3">{p.nama}</JudulKartu>
                  <DeskripsiKartu>
                    {p.jenis === 'persen'
                      ? `Diskon ${p.nilai}%`
                      : p.jenis === 'nominal'
                        ? `Potongan ${formatRp(p.nilai)}`
                        : 'Gratis ongkos kirim'}
                    {p.minimal > 0 ? ` · min. belanja ${formatRp(p.minimal)}` : ''}
                  </DeskripsiKartu>

                  <button
                    type="button"
                    onClick={() => void salin(p.kode)}
                    className="mt-4 flex items-center justify-between gap-2 rounded-card border border-dashed border-primary/40 bg-primary-soft/50 px-3 py-2.5 transition-colors hover:bg-primary-soft"
                  >
                    <code className="font-mono text-sm font-extrabold text-primary-kuat">{p.kode}</code>
                    <Copy className="size-4 text-primary-kuat" />
                  </button>

                  <div className="mt-4 flex-1">
                    <Progres
                      nilai={(p.terpakai / p.kuota) * 100}
                      warna={habis ? 'danger' : 'primary'}
                      tebal="sm"
                      label={
                        <span className="text-xs text-muted-foreground">
                          {formatAngka(p.terpakai)} dari {formatAngka(p.kuota)} kuota
                        </span>
                      }
                    />
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatTanggal(p.mulai)} – {formatTanggal(p.selesai)}
                  </p>
                </IsiKartu>

                <KakiKartu className="justify-between">
                  <label htmlFor={`promo-${p.id}`} className="flex items-center gap-2.5 text-sm font-semibold">
                    <Sakelar
                      id={`promo-${p.id}`}
                      checked={p.aktif}
                      onCheckedChange={() => {
                        setPromo((s) => s.map((x) => (x.id === p.id ? { ...x, aktif: !x.aktif } : x)))
                        toast.success(p.aktif ? `${p.nama} dinonaktifkan.` : `${p.nama} diaktifkan.`)
                      }}
                    />
                    {p.aktif ? 'Aktif' : 'Mati'}
                  </label>
                  <Lencana warna="netral" ukuran="sm">{LABEL_JENIS[p.jenis]}</Lencana>
                </KakiKartu>
              </Kartu>
            )
          })}
        </div>
      )}
    </>
  )
}

export const Route = createFileRoute('/_app/apl/promo')({ component: HalamanPromo })
