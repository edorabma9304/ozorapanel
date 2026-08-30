import { createFileRoute } from '@tanstack/react-router'
import {
  AtSign, Bold, Check, ChevronDown, Italic, Link2, List, Percent, Star, Upload, X,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { formatRp, formatUkuranBerkas } from '@/lib/format'
import { PRODUK_CONTOH } from '@/lib/adapter/data-contoh'
import { cn } from '@/lib/utils'

/** Sisipkan pemisah ribuan sambil pengguna mengetik. */
function topengRupiah(nilai: string) {
  const angka = nilai.replace(/\D/g, '')
  return angka ? new Intl.NumberFormat('id-ID').format(Number(angka)) : ''
}

/** 0812345678 -> 0812-3456-78 */
function topengTelepon(nilai: string) {
  const a = nilai.replace(/\D/g, '').slice(0, 13)
  return [a.slice(0, 4), a.slice(4, 8), a.slice(8)].filter(Boolean).join('-')
}

/** 001234567890000 -> 00.123.456.7-890.000 */
function topengNpwp(nilai: string) {
  const a = nilai.replace(/\D/g, '').slice(0, 15)
  const b = [a.slice(0, 2), a.slice(2, 5), a.slice(5, 8), a.slice(8, 9), a.slice(9, 12), a.slice(12, 15)]
  let hasil = b[0] ?? ''
  if (b[1]) hasil += `.${b[1]}`
  if (b[2]) hasil += `.${b[2]}`
  if (b[3]) hasil += `.${b[3]}`
  if (b[4]) hasil += `-${b[4]}`
  if (b[5]) hasil += `.${b[5]}`
  return hasil
}

const WARNA_PILIHAN = ['#5d87ff', '#49beff', '#13deb9', '#ffae1f', '#fa896b', '#8b5cf6', '#ec4899', '#2a3547']

function HalamanTambahan() {
  const [rupiah, setRupiah] = useState('150000')
  const [telepon, setTelepon] = useState('')
  const [npwp, setNpwp] = useState('')
  const [tag, setTag] = useState<string[]>(['elektronik', 'promo'])
  const [drafTag, setDrafTag] = useState('')
  const [warna, setWarna] = useState(WARNA_PILIHAN[0]!)
  const [bintang, setBintang] = useState(4)
  const [berkas, setBerkas] = useState<Array<{ nama: string; ukuran: number }>>([])
  const [seret, setSeret] = useState(false)
  const [kueriCari, setKueriCari] = useState('')
  const [terpilih, setTerpilih] = useState<string | null>(null)
  const [bukaSaran, setBukaSaran] = useState(false)
  const inputBerkas = useRef<HTMLInputElement>(null)

  const saran = useMemo(() => {
    const q = kueriCari.trim().toLowerCase()
    if (!q) return []
    return PRODUK_CONTOH.filter((p) => p.nama.toLowerCase().includes(q)).slice(0, 6)
  }, [kueriCari])

  function tambahBerkas(daftar: FileList | null) {
    if (!daftar) return
    const baru = Array.from(daftar).map((f) => ({ nama: f.name, ukuran: f.size }))
    setBerkas((b) => [...b, ...baru])
    toast.success(`${baru.length} berkas ditambahkan.`)
  }

  return (
    <>
      <KepalaHalaman
        judul="Tambahan formulir"
        deskripsi="Masukan berimbuhan, topeng format, unggah berkas, dan pelengkap otomatis — semuanya tanpa pustaka tambahan."
        remah={[{ label: 'Formulir' }, { label: 'Tambahan' }]}
      />

      <Peringatan varian="info" judul="Nol dependensi">
        Semua kendali di halaman ini ditulis dengan React dan Tailwind saja — tidak ada
        pustaka topeng masukan, pemilih warna, atau penyunting teks. Salin fungsinya
        langsung dari berkas halaman ini.
      </Peringatan>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Masukan berimbuhan */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Masukan berimbuhan</JudulKartu>
              <DeskripsiKartu>Awalan dan akhiran menempel di dalam kolom</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <KolomForm id="t-domain" label="Alamat situs">
              <div className="flex">
                <span className="grid place-items-center rounded-l-control border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  https://
                </span>
                <Masukan id="t-domain" className="rounded-l-none" defaultValue="ozora.id" />
              </div>
            </KolomForm>

            <KolomForm id="t-user" label="Nama pengguna">
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Masukan id="t-user" className="pl-9" placeholder="namapengguna" />
              </div>
            </KolomForm>

            <KolomForm id="t-diskon" label="Diskon">
              <div className="flex">
                <Masukan id="t-diskon" type="number" className="rounded-r-none text-right" defaultValue={10} />
                <span className="grid place-items-center rounded-r-control border border-l-0 border-input bg-muted px-3 text-muted-foreground">
                  <Percent className="size-4" />
                </span>
              </div>
            </KolomForm>

            <KolomForm id="t-berat" label="Berat produk">
              <div className="flex">
                <Masukan id="t-berat" type="number" className="rounded-r-none text-right" defaultValue={1200} />
                <span className="grid place-items-center rounded-r-control border border-l-0 border-input bg-muted px-3 text-sm font-semibold text-muted-foreground">
                  gram
                </span>
              </div>
            </KolomForm>
          </IsiKartu>
        </Kartu>

        {/* Topeng format */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Topeng format</JudulKartu>
              <DeskripsiKartu>Format tersusun otomatis sambil mengetik</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <KolomForm id="t-rupiah" label="Harga" petunjuk={`Nilai tersimpan: ${formatRp(Number(rupiah.replace(/\D/g, '')))}`}>
              <div className="flex">
                <span className="grid place-items-center rounded-l-control border border-r-0 border-input bg-muted px-3 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Masukan
                  id="t-rupiah"
                  className="rounded-l-none text-right"
                  inputMode="numeric"
                  value={topengRupiah(rupiah)}
                  onChange={(e) => setRupiah(e.target.value)}
                />
              </div>
            </KolomForm>

            <KolomForm id="t-telepon" label="Nomor HP" petunjuk="Otomatis dikelompokkan per empat digit.">
              <Masukan
                id="t-telepon"
                inputMode="tel"
                placeholder="0812-3456-7890"
                value={telepon}
                onChange={(e) => setTelepon(topengTelepon(e.target.value))}
              />
            </KolomForm>

            <KolomForm id="t-npwp" label="NPWP" petunjuk="Pola 00.000.000.0-000.000">
              <Masukan
                id="t-npwp"
                inputMode="numeric"
                placeholder="00.000.000.0-000.000"
                value={npwp}
                onChange={(e) => setNpwp(topengNpwp(e.target.value))}
              />
            </KolomForm>
          </IsiKartu>
        </Kartu>

        {/* Label & pelengkap otomatis */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Label &amp; pelengkap otomatis</JudulKartu>
              <DeskripsiKartu>Enter menambah label, Backspace menghapus yang terakhir</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <KolomForm id="t-tag" label="Label produk">
              <div className="flex flex-wrap items-center gap-1.5 rounded-control border border-input bg-card p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25">
                {tag.map((t) => (
                  <Lencana key={t} warna="primary" className="gap-1">
                    {t}
                    <button type="button" onClick={() => setTag((s) => s.filter((x) => x !== t))} aria-label={`Hapus label ${t}`}>
                      <X className="size-3" />
                    </button>
                  </Lencana>
                ))}
                <input
                  id="t-tag"
                  value={drafTag}
                  onChange={(e) => setDrafTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && drafTag.trim()) {
                      e.preventDefault()
                      if (!tag.includes(drafTag.trim())) setTag((s) => [...s, drafTag.trim()])
                      setDrafTag('')
                    } else if (e.key === 'Backspace' && !drafTag) {
                      setTag((s) => s.slice(0, -1))
                    }
                  }}
                  placeholder={tag.length === 0 ? 'Ketik lalu tekan Enter…' : ''}
                  className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
                />
              </div>
            </KolomForm>

            <KolomForm id="t-cari" label="Cari produk" petunjuk="Saran muncul setelah dua huruf.">
              <div className="relative">
                <Masukan
                  id="t-cari"
                  value={terpilih ?? kueriCari}
                  onChange={(e) => {
                    setTerpilih(null)
                    setKueriCari(e.target.value)
                    setBukaSaran(true)
                  }}
                  onFocus={() => setBukaSaran(true)}
                  onBlur={() => setTimeout(() => setBukaSaran(false), 150)}
                  placeholder="Ketik nama produk…"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={bukaSaran && saran.length > 0}
                  aria-controls="daftar-saran"
                />
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                {bukaSaran && saran.length > 0 ? (
                  <ul
                    id="daftar-saran"
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-card border border-border bg-popover p-1.5 shadow-raised scrollbar-thin"
                  >
                    {saran.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={terpilih === s.nama}
                          onMouseDown={() => {
                            setTerpilih(s.nama)
                            setBukaSaran(false)
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                        >
                          <span className="truncate">{s.nama}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatRp(s.harga)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </KolomForm>
          </IsiKartu>
        </Kartu>

        {/* Warna & peringkat */}
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Pemilih warna &amp; peringkat</JudulKartu>
              <DeskripsiKartu>Kendali visual sederhana</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-5">
            <div>
              <p className="mb-2.5 text-sm font-semibold">Warna label</p>
              <div className="flex flex-wrap items-center gap-2">
                {WARNA_PILIHAN.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWarna(w)}
                    aria-label={`Pilih warna ${w}`}
                    aria-pressed={warna === w}
                    className={cn(
                      'grid size-8 place-items-center rounded-full transition-transform',
                      warna === w && 'scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card',
                    )}
                    style={{ background: w }}
                  >
                    {warna === w ? <Check className="size-4 text-white" strokeWidth={3} /> : null}
                  </button>
                ))}
                <input
                  type="color"
                  value={warna}
                  onChange={(e) => setWarna(e.target.value)}
                  aria-label="Warna khusus"
                  className="size-8 cursor-pointer rounded-full border border-border bg-transparent"
                />
                <code className="ml-1 font-mono text-xs text-muted-foreground">{warna}</code>
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-sm font-semibold">Peringkat</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBintang(b)}
                    aria-label={`Beri ${b} bintang`}
                    aria-pressed={bintang === b}
                  >
                    <Star className={cn('size-7 transition-colors', b <= bintang ? 'fill-warning text-warning-kuat' : 'text-muted-foreground/40')} />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold">{bintang} dari 5</span>
              </div>
            </div>
          </IsiKartu>
        </Kartu>

        {/* Unggah berkas */}
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Unggah berkas</JudulKartu>
              <DeskripsiKartu>Klik atau seret berkas ke area di bawah</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setSeret(true)
              }}
              onDragLeave={() => setSeret(false)}
              onDrop={(e) => {
                e.preventDefault()
                setSeret(false)
                tambahBerkas(e.dataTransfer.files)
              }}
              className={cn(
                'rounded-card border-2 border-dashed p-10 text-center transition-colors',
                seret ? 'border-primary bg-primary-soft/50' : 'border-border',
              )}
            >
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">Seret berkas ke sini</p>
              <p className="mt-1 text-xs text-muted-foreground">
                atau <button type="button" className="font-semibold text-primary-kuat hover:underline" onClick={() => inputBerkas.current?.click()}>pilih dari perangkat</button>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Maksimal 5 MB per berkas · JPG, PNG, PDF</p>
              <input
                ref={inputBerkas}
                type="file"
                multiple
                className="sr-only"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => tambahBerkas(e.target.files)}
              />
            </div>

            {berkas.length > 0 ? (
              <ul className="space-y-2">
                {berkas.map((f, i) => (
                  <li key={`${f.nama}-${i}`} className="flex items-center gap-3 rounded-card border border-border p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-card bg-primary-soft text-xs font-bold text-primary-kuat">
                      {f.nama.split('.').pop()?.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{f.nama}</span>
                      <span className="block text-xs text-muted-foreground">{formatUkuranBerkas(f.ukuran)}</span>
                    </span>
                    <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => setBerkas((b) => b.filter((_, k) => k !== i))} aria-label={`Hapus ${f.nama}`}>
                      <X />
                    </Tombol>
                  </li>
                ))}
              </ul>
            ) : null}
          </IsiKartu>
        </Kartu>

        {/* Penyunting teks sederhana */}
        <Kartu className="lg:col-span-2">
          <KepalaKartu>
            <div>
              <JudulKartu>Penyunting teks sederhana</JudulKartu>
              <DeskripsiKartu>
                Cukup untuk deskripsi produk. Untuk kebutuhan berat, pasang TipTap terpisah.
              </DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu>
            <div className="overflow-hidden rounded-card border border-input">
              <div className="flex items-center gap-1 border-b border-border bg-muted/60 p-1.5">
                {[
                  { ikon: Bold, perintah: 'bold', label: 'Tebal' },
                  { ikon: Italic, perintah: 'italic', label: 'Miring' },
                  { ikon: List, perintah: 'insertUnorderedList', label: 'Daftar' },
                  { ikon: Link2, perintah: 'createLink', label: 'Tautan' },
                ].map((b) => (
                  <Tombol
                    key={b.perintah}
                    varian="hantu"
                    ukuran="ikon-sm"
                    aria-label={b.label}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      if (b.perintah === 'createLink') {
                        const url = prompt('Alamat tautan:')
                        if (url) document.execCommand(b.perintah, false, url)
                      } else {
                        document.execCommand(b.perintah)
                      }
                    }}
                  >
                    <b.ikon />
                  </Tombol>
                ))}
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label="Isi deskripsi"
                className="min-h-32 p-3 text-sm outline-none [&_a]:text-primary-kuat [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5"
              >
                Tulis deskripsi produk di sini. Pilih teks lalu tekan tombol di atas untuk memformatnya.
              </div>
            </div>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/formulir/tambahan')({ component: HalamanTambahan })
