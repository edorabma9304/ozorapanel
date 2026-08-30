import { createFileRoute } from '@tanstack/react-router'
import {
  Download, FileArchive, FileImage, FileSpreadsheet, FileText, FileVideo, Folder,
  Grid3x3, HardDrive, List, MoreVertical, Search, Share2, Star, Trash2, Upload,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { Progres } from '@/components/ui/progres'
import { Masukan } from '@/components/ui/masukan'
import { Tombol, GrupTombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { SaringCepat } from '@/components/data/bilah-alat'
import {
  BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel,
} from '@/components/ui/tabel'
import { formatAngka, formatTanggal, formatUkuranBerkas } from '@/lib/format'
import { BERKAS_CONTOH, FOLDER_CONTOH, type Berkas } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

const IKON_JENIS = {
  dokumen: FileText,
  lembar: FileSpreadsheet,
  gambar: FileImage,
  video: FileVideo,
  arsip: FileArchive,
} as const

const LATAR = {
  primary: 'bg-primary-soft text-primary-kuat',
  success: 'bg-success-soft text-success-kuat',
  warning: 'bg-warning-soft text-warning-kuat',
  danger: 'bg-danger-soft text-danger-kuat',
  info: 'bg-info-soft text-info-kuat',
  netral: 'bg-muted text-muted-foreground',
} as const

const JENIS = ['dokumen', 'lembar', 'gambar', 'video', 'arsip'] as const

const KUOTA_GB = 15
const dipakaiByte = BERKAS_CONTOH.reduce((a, b) => a + b.ukuran, 0)

function IkonBerkas({ b, besar }: { b: Berkas; besar?: boolean }) {
  const Ikon = IKON_JENIS[b.jenis]
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-card', LATAR[b.warna], besar ? 'size-12' : 'size-9')}>
      <Ikon className={besar ? 'size-6' : 'size-4.5'} />
    </span>
  )
}

function PengelolaBerkas() {
  const [cari, setCari] = useState('')
  const [jenis, setJenis] = useState<string | undefined>()
  const [tampilan, setTampilan] = useState<'kisi' | 'daftar'>('kisi')
  const [berkas, setBerkas] = useState(BERKAS_CONTOH)

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return berkas.filter((b) => (!q || b.nama.toLowerCase().includes(q)) && (!jenis || b.jenis === jenis))
  }, [berkas, cari, jenis])

  function hapus(id: string, nama: string) {
    setBerkas((s) => s.filter((x) => x.id !== id))
    toast.success(`${nama} dipindahkan ke sampah.`)
  }

  return (
    <>
      <KepalaHalaman
        judul="Pengelola berkas"
        deskripsi="Dokumen, gambar, dan arsip tim dalam satu tempat."
        remah={[{ label: 'Aplikasi' }, { label: 'Berkas' }]}
        aksi={<Tombol><Upload /> Unggah berkas</Tombol>}
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Panel penyimpanan + folder */}
        <div className="space-y-4">
          <Kartu>
            <KepalaKartu>
              <div>
                <JudulKartu>Penyimpanan</JudulKartu>
                <DeskripsiKartu>
                  {formatUkuranBerkas(dipakaiByte)} dari {KUOTA_GB} GB
                </DeskripsiKartu>
              </div>
              <HardDrive className="size-4 text-muted-foreground" />
            </KepalaKartu>
            <IsiKartu className="space-y-4">
              <Progres
                nilai={(dipakaiByte / (KUOTA_GB * 1024 ** 3)) * 100}
                warna="primary"
                tebal="lg"
                tampilkanNilai
              />
              <ul className="space-y-2.5 text-sm">
                {JENIS.map((j) => {
                  const daftar = berkas.filter((b) => b.jenis === j)
                  const total = daftar.reduce((a, b) => a + b.ukuran, 0)
                  const Ikon = IKON_JENIS[j]
                  return (
                    <li key={j} className="flex items-center gap-3">
                      <Ikon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 capitalize">{j}</span>
                      <span className="text-xs text-muted-foreground">{formatUkuranBerkas(total)}</span>
                    </li>
                  )
                })}
              </ul>
            </IsiKartu>
          </Kartu>

          <Kartu>
            <KepalaKartu>
              <JudulKartu>Folder</JudulKartu>
            </KepalaKartu>
            <IsiKartu className="space-y-2">
              {FOLDER_CONTOH.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-control p-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span className={cn('grid size-9 shrink-0 place-items-center rounded-card', LATAR[f.warna])}>
                    <Folder className="size-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{f.nama}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatAngka(f.jumlah)} berkas · {formatUkuranBerkas(f.ukuran)}
                    </span>
                  </span>
                </button>
              ))}
            </IsiKartu>
          </Kartu>
        </div>

        {/* Daftar berkas */}
        <Kartu className="overflow-hidden">
          <IsiKartu className="flex flex-wrap items-center gap-3 pb-4">
            <div className="relative min-w-52 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Masukan
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari berkas…"
                className="pl-9"
                aria-label="Cari berkas"
              />
            </div>
            <GrupTombol>
              <Tombol
                varian={tampilan === 'kisi' ? 'halus' : 'garis'}
                ukuran="ikon"
                onClick={() => setTampilan('kisi')}
                aria-label="Tampilan kisi"
                aria-pressed={tampilan === 'kisi'}
              >
                <Grid3x3 />
              </Tombol>
              <Tombol
                varian={tampilan === 'daftar' ? 'halus' : 'garis'}
                ukuran="ikon"
                onClick={() => setTampilan('daftar')}
                aria-label="Tampilan daftar"
                aria-pressed={tampilan === 'daftar'}
              >
                <List />
              </Tombol>
            </GrupTombol>
          </IsiKartu>

          <SaringCepat
            nilai={jenis}
            onUbah={setJenis}
            totalSemua={berkas.length}
            opsi={JENIS.map((j) => ({
              nilai: j,
              label: j,
              jumlah: berkas.filter((b) => b.jenis === j).length,
            }))}
          />

          {hasil.length === 0 ? (
            <KeadaanKosong judul="Berkas tidak ditemukan" deskripsi="Coba kata kunci lain atau pilih jenis berbeda." />
          ) : tampilan === 'kisi' ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {hasil.map((b) => (
                <div key={b.id} className="group relative rounded-card border border-border p-4 transition-shadow hover:shadow-raised">
                  {b.bintang ? (
                    <Star className="absolute right-3 top-3 size-4 fill-warning text-warning-kuat" />
                  ) : null}
                  {b.pratinjau ? (
                    <img src={b.pratinjau} alt="" width={320} height={140} loading="lazy" className="mb-3 h-28 w-full rounded-card object-cover" />
                  ) : (
                    <div className="mb-3 grid h-28 place-items-center rounded-card bg-muted">
                      <IkonBerkas b={b} besar />
                    </div>
                  )}
                  <p className="truncate text-sm font-semibold" title={b.nama}>{b.nama}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatUkuranBerkas(b.ukuran)} · {formatTanggal(b.updated_at)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Avatar nama={b.pemilik} src={b.avatar} ukuran="xs" />
                      {b.dibagikan ? <Lencana warna="info" ukuran="sm">Dibagikan</Lencana> : null}
                    </span>
                    <Dropdown>
                      <PemicuDropdown asChild>
                        <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${b.nama}`}><MoreVertical /></Tombol>
                      </PemicuDropdown>
                      <IsiDropdown>
                        <ItemDropdown><Download /> Unduh</ItemDropdown>
                        <ItemDropdown><Share2 /> Bagikan</ItemDropdown>
                        <ItemDropdown bahaya onSelect={() => hapus(b.id, b.nama)}><Trash2 /> Hapus</ItemDropdown>
                      </IsiDropdown>
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <BingkaiTabel>
              <Tabel>
                <KepalaTabel>
                  <tr>
                    <SelKepala>Nama</SelKepala>
                    <SelKepala className="hidden sm:table-cell">Pemilik</SelKepala>
                    <SelKepala className="text-right">Ukuran</SelKepala>
                    <SelKepala className="hidden md:table-cell">Diubah</SelKepala>
                    <SelKepala className="w-12" />
                  </tr>
                </KepalaTabel>
                <BadanTabel>
                  {hasil.map((b) => (
                    <BarisTabel key={b.id}>
                      <Sel>
                        <div className="flex items-center gap-3">
                          <IkonBerkas b={b} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate font-semibold">
                              {b.nama}
                              {b.bintang ? <Star className="size-3.5 shrink-0 fill-warning text-warning-kuat" /> : null}
                            </p>
                            <p className="text-xs uppercase text-muted-foreground">{b.ext}</p>
                          </div>
                        </div>
                      </Sel>
                      <Sel className="hidden sm:table-cell">
                        <span className="flex items-center gap-2">
                          <Avatar nama={b.pemilik} src={b.avatar} ukuran="xs" />
                          <span className="truncate text-sm">{b.pemilik}</span>
                        </span>
                      </Sel>
                      <Sel className="text-right whitespace-nowrap">{formatUkuranBerkas(b.ukuran)}</Sel>
                      <Sel className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                        {formatTanggal(b.updated_at)}
                      </Sel>
                      <Sel className="text-right">
                        <Dropdown>
                          <PemicuDropdown asChild>
                            <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Aksi ${b.nama}`}><MoreVertical /></Tombol>
                          </PemicuDropdown>
                          <IsiDropdown>
                            <ItemDropdown><Download /> Unduh</ItemDropdown>
                            <ItemDropdown><Share2 /> Bagikan</ItemDropdown>
                            <ItemDropdown bahaya onSelect={() => hapus(b.id, b.nama)}><Trash2 /> Hapus</ItemDropdown>
                          </IsiDropdown>
                        </Dropdown>
                      </Sel>
                    </BarisTabel>
                  ))}
                </BadanTabel>
              </Tabel>
            </BingkaiTabel>
          )}
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/berkas')({ component: PengelolaBerkas })
