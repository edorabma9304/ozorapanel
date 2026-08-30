import { createFileRoute } from '@tanstack/react-router'
import { Save } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks, Label } from '@/components/ui/masukan'
import { PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Pemisah } from '@/components/ui/lapisan'

function HalamanTataLetak() {
  return (
    <>
      <KepalaHalaman
        judul="Tata letak formulir"
        deskripsi="Tiga pola susunan yang menutup hampir semua kebutuhan panel admin."
        remah={[{ label: 'Formulir' }, { label: 'Tata letak' }]}
      />

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Satu kolom</JudulKartu>
            <DeskripsiKartu>Paling mudah dipindai. Pakai ini kecuali ada alasan kuat untuk tidak.</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="max-w-lg space-y-4">
          <KolomForm id="t1-nama" label="Nama toko" wajib>
            <Masukan id="t1-nama" placeholder="Toko Berkah Jaya" />
          </KolomForm>
          <KolomForm id="t1-alamat" label="Alamat">
            <AreaTeks id="t1-alamat" placeholder="Jl. Merdeka No. 12…" />
          </KolomForm>
          <KolomForm id="t1-kota" label="Kota">
            <PilihanRingkas
              id="t1-kota"
              nilai="yogyakarta"
              onUbah={() => undefined}
              opsi={[
                { nilai: 'yogyakarta', label: 'Yogyakarta' },
                { nilai: 'jakarta', label: 'Jakarta' },
                { nilai: 'surabaya', label: 'Surabaya' },
              ]}
            />
          </KolomForm>
        </IsiKartu>
        <KakiKartu className="justify-end">
          <Tombol varian="garis">Batal</Tombol>
          <Tombol><Save /> Simpan</Tombol>
        </KakiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Label di samping</JudulKartu>
            <DeskripsiKartu>Hemat ruang vertikal untuk formulir pengaturan yang panjang.</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-5">
          {[
            { id: 't2-nama', label: 'Nama perusahaan', isi: <Masukan id="t2-nama" defaultValue="PT Ozora Digital" /> },
            { id: 't2-npwp', label: 'NPWP', isi: <Masukan id="t2-npwp" placeholder="00.000.000.0-000.000" /> },
            { id: 't2-telepon', label: 'Telepon', isi: <Masukan id="t2-telepon" inputMode="tel" placeholder="0274-000000" /> },
          ].map((b) => (
            <div key={b.id} className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-6">
              <Label htmlFor={b.id} className="sm:text-right">{b.label}</Label>
              <div className="max-w-md">{b.isi}</div>
            </div>
          ))}

          <Pemisah />

          <div className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center sm:gap-6">
            <Label className="sm:text-right">Faktur otomatis</Label>
            <Sakelar defaultChecked />
          </div>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Dua kolom dengan bagian</JudulKartu>
            <DeskripsiKartu>Untuk formulir panjang yang perlu dikelompokkan.</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-7">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Data produk</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <KolomForm id="t3-nama" label="Nama produk" wajib>
                <Masukan id="t3-nama" />
              </KolomForm>
              <KolomForm id="t3-sku" label="SKU" wajib>
                <Masukan id="t3-sku" className="font-mono" />
              </KolomForm>
              <KolomForm id="t3-deskripsi" label="Deskripsi" className="sm:col-span-2">
                <AreaTeks id="t3-deskripsi" />
              </KolomForm>
            </div>
          </section>

          <Pemisah />

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Harga &amp; stok</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <KolomForm id="t3-modal" label="Harga modal">
                <Masukan id="t3-modal" type="number" className="text-right" />
              </KolomForm>
              <KolomForm id="t3-jual" label="Harga jual" wajib>
                <Masukan id="t3-jual" type="number" className="text-right" />
              </KolomForm>
              <KolomForm id="t3-stok" label="Stok awal">
                <Masukan id="t3-stok" type="number" className="text-right" />
              </KolomForm>
            </div>
          </section>
        </IsiKartu>
        <KakiKartu className="justify-end">
          <Tombol varian="garis">Simpan sebagai draf</Tombol>
          <Tombol><Save /> Terbitkan</Tombol>
        </KakiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/formulir/tata-letak')({ component: HalamanTataLetak })
