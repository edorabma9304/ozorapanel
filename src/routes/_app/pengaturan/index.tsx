import { createFileRoute } from '@tanstack/react-router'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { PilihanRingkas } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { APP } from '@/config/app'

function PengaturanUmum() {
  return (
    <Kartu>
      <KepalaKartu>
        <div>
          <JudulKartu>Identitas &amp; lokalisasi</JudulKartu>
          <DeskripsiKartu>Data dasar perusahaan dan format angka serta tanggal</DeskripsiKartu>
        </div>
      </KepalaKartu>
      <IsiKartu>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            toast.success('Pengaturan umum tersimpan.')
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="u-nama" label="Nama aplikasi" wajib>
              <Masukan id="u-nama" defaultValue={APP.nama} />
            </KolomForm>
            <KolomForm id="u-legal" label="Nama badan usaha">
              <Masukan id="u-legal" defaultValue="PT Ozora Digital Nusantara" />
            </KolomForm>
          </div>

          <KolomForm id="u-alamat" label="Alamat">
            <AreaTeks id="u-alamat" defaultValue="Jl. Merdeka No. 12, Yogyakarta 55223" />
          </KolomForm>

          <div className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="u-telepon" label="Telepon">
              <Masukan id="u-telepon" inputMode="tel" defaultValue="0274-000000" />
            </KolomForm>
            <KolomForm id="u-npwp" label="NPWP">
              <Masukan id="u-npwp" placeholder="00.000.000.0-000.000" />
            </KolomForm>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <KolomForm id="u-mata-uang" label="Mata uang">
              <PilihanRingkas
                id="u-mata-uang"
                nilai="IDR"
                onUbah={() => undefined}
                opsi={[
                  { nilai: 'IDR', label: 'Rupiah (IDR)' },
                  { nilai: 'USD', label: 'Dolar AS (USD)' },
                  { nilai: 'SGD', label: 'Dolar Singapura' },
                ]}
              />
            </KolomForm>
            <KolomForm id="u-zona" label="Zona waktu">
              <PilihanRingkas
                id="u-zona"
                nilai="WIB"
                onUbah={() => undefined}
                opsi={[
                  { nilai: 'WIB', label: 'WIB (UTC+7)' },
                  { nilai: 'WITA', label: 'WITA (UTC+8)' },
                  { nilai: 'WIT', label: 'WIT (UTC+9)' },
                ]}
              />
            </KolomForm>
            <KolomForm id="u-pajak" label="Pajak bawaan (%)">
              <Masukan id="u-pajak" type="number" min={0} max={100} defaultValue={11} className="text-right" />
            </KolomForm>
          </div>

          <KakiKartu className="justify-end px-0 pb-0">
            <Tombol type="submit"><Save /> Simpan</Tombol>
          </KakiKartu>
        </form>
      </IsiKartu>
    </Kartu>
  )
}

export const Route = createFileRoute('/_app/pengaturan/')({ component: PengaturanUmum })
