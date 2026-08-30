import { createFileRoute } from '@tanstack/react-router'
import { Mail, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, JudulKartu, KepalaKartu, DeskripsiKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks, Label } from '@/components/ui/masukan'
import { GrupRadio, ItemRadio, KotakCentang, PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { formatRp } from '@/lib/format'

function HalamanElemenFormulir() {
  const [rentang, setRentang] = useState(50)

  return (
    <>
      <KepalaHalaman
        judul="Elemen formulir"
        deskripsi="Semua jenis masukan beserta label, petunjuk, dan keadaan galatnya."
        remah={[{ label: 'Formulir' }, { label: 'Elemen' }]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Masukan teks</JudulKartu>
              <DeskripsiKartu>Varian dasar dan dengan ikon</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <KolomForm id="f-nama" label="Nama lengkap" wajib>
              <Masukan id="f-nama" placeholder="mis. Dewi Kusuma" />
            </KolomForm>

            <KolomForm id="f-email" label="Surel" petunjuk="Kami tidak akan membagikan alamat ini.">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Masukan id="f-email" type="email" placeholder="nama@perusahaan.id" className="pl-9" />
              </div>
            </KolomForm>

            <KolomForm id="f-cari" label="Pencarian">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Masukan id="f-cari" placeholder="Cari…" className="pl-9" />
              </div>
            </KolomForm>

            <KolomForm id="f-harga" label="Harga">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                <Masukan id="f-harga" type="number" defaultValue={150000} className="pl-9 text-right" />
              </div>
            </KolomForm>

            <KolomForm id="f-galat" label="Dengan galat" galat="Nomor faktur ini sudah dipakai.">
              <Masukan id="f-galat" aria-invalid defaultValue="FKT-20260001" />
            </KolomForm>

            <KolomForm id="f-mati" label="Nonaktif" petunjuk="Nilai ditentukan sistem.">
              <Masukan id="f-mati" defaultValue="Otomatis" disabled />
            </KolomForm>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Pilihan &amp; sakelar</JudulKartu>
              <DeskripsiKartu>Kendali untuk nilai terbatas</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-5">
            <KolomForm id="f-kategori" label="Kategori" wajib>
              <PilihanRingkas
                id="f-kategori"
                nilai="elektronik"
                onUbah={() => undefined}
                opsi={[
                  { nilai: 'elektronik', label: 'Elektronik' },
                  { nilai: 'fashion', label: 'Fashion' },
                  { nilai: 'makanan', label: 'Makanan' },
                ]}
              />
            </KolomForm>

            <div>
              <Label className="mb-2.5">Metode pengiriman</Label>
              <GrupRadio defaultValue="reguler" className="space-y-2.5">
                {[
                  { v: 'reguler', l: 'Reguler', k: '3–5 hari kerja' },
                  { v: 'kilat', l: 'Kilat', k: '1–2 hari kerja' },
                  { v: 'sameday', l: 'Hari yang sama', k: 'khusus dalam kota' },
                ].map((o) => (
                  <label key={o.v} htmlFor={`kirim-${o.v}`} className="flex cursor-pointer items-start gap-3 rounded-card border border-border p-3 transition-colors hover:border-primary/40">
                    <ItemRadio id={`kirim-${o.v}`} value={o.v} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-semibold">{o.l}</span>
                      <span className="block text-xs text-muted-foreground">{o.k}</span>
                    </span>
                  </label>
                ))}
              </GrupRadio>
            </div>

            <div>
              <Label className="mb-2.5">Notifikasi</Label>
              <div className="space-y-2.5">
                {['Pesanan baru', 'Stok menipis', 'Laporan mingguan'].map((n) => (
                  <label key={n} htmlFor={`notif-${n}`} className="flex items-center gap-2.5 text-sm">
                    <KotakCentang id={`notif-${n}`} defaultChecked={n !== 'Laporan mingguan'} /> {n}
                  </label>
                ))}
              </div>
            </div>

            <label htmlFor="katalog-publik" className="flex items-center justify-between rounded-card border border-border p-4">
              <span className="text-sm font-semibold">Tampilkan di katalog publik</span>
              <Sakelar id="katalog-publik" defaultChecked />
            </label>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Tanggal, berkas, dan rentang</JudulKartu>
              <DeskripsiKartu>Memakai kendali bawaan peramban — ringan dan mudah diakses</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <KolomForm id="f-tanggal" label="Tanggal">
                <Masukan id="f-tanggal" type="date" defaultValue="2026-08-30" />
              </KolomForm>
              <KolomForm id="f-waktu" label="Waktu">
                <Masukan id="f-waktu" type="time" defaultValue="09:00" />
              </KolomForm>
            </div>

            <KolomForm id="f-berkas" label="Unggah berkas" petunjuk="Maksimal 5 MB. Format: JPG, PNG, atau PDF.">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border p-7 text-center transition-colors hover:border-primary hover:bg-primary-soft/40">
                <Upload className="size-6 text-muted-foreground" />
                <span className="text-sm font-semibold">Klik untuk memilih berkas</span>
                <span className="text-xs text-muted-foreground">atau seret ke sini</span>
                <input id="f-berkas" type="file" className="sr-only" accept="image/jpeg,image/png,application/pdf" />
              </label>
            </KolomForm>

            <KolomForm id="f-rentang" label={`Batas diskon: ${rentang}%`}>
              <input
                id="f-rentang"
                type="range"
                min={0}
                max={100}
                value={rentang}
                onChange={(e) => setRentang(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              />
            </KolomForm>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <div>
              <JudulKartu>Area teks &amp; ringkasan</JudulKartu>
              <DeskripsiKartu>Isian panjang dan tampilan nilai terhitung</DeskripsiKartu>
            </div>
          </KepalaKartu>
          <IsiKartu className="space-y-4">
            <KolomForm id="f-deskripsi" label="Deskripsi produk" petunjuk="Maksimal 500 karakter.">
              <AreaTeks id="f-deskripsi" className="min-h-32" placeholder="Jelaskan produk secara singkat…" />
            </KolomForm>

            <div className="rounded-card bg-muted/60 p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Harga dasar</dt>
                  <dd className="font-semibold">{formatRp(150_000)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Diskon {rentang}%</dt>
                  <dd className="font-semibold text-danger-kuat">-{formatRp((150_000 * rentang) / 100)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-bold">Harga akhir</dt>
                  <dd className="font-extrabold text-primary-kuat">{formatRp(150_000 - (150_000 * rentang) / 100)}</dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2">
              <Tombol>Simpan</Tombol>
              <Tombol varian="garis">Batal</Tombol>
            </div>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/formulir/elemen')({ component: HalamanElemenFormulir })
