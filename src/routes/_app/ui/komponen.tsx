import { createFileRoute } from '@tanstack/react-router'
import { Download, Heart, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { BagianPeraga } from '@/components/data/bagian-peraga'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, TitikStatus } from '@/components/ui/lencana'
import { Avatar, TumpukanAvatar } from '@/components/ui/avatar'
import { Masukan, AreaTeks, Label } from '@/components/ui/masukan'
import { GrupRadio, ItemRadio, KotakCentang, PilihanRingkas, Sakelar } from '@/components/ui/kendali'
import { Peringatan, KeadaanKosong, Konfirmasi, IsiKonfirmasi, PemicuKonfirmasi } from '@/components/ui/keadaan'
import { Rangka } from '@/components/ui/rangka'
import {
  Akordeon, DaftarTab, Dialog, IsiAkordeon, IsiDialog, IsiDropdown, IsiTab, ItemAkordeon,
  ItemDropdown, KakiDialog, PemicuAkordeon, PemicuDropdown, PemicuTab, PemicuDialog, Dropdown,
  Pemisah, Tab, Tooltip, TutupDialog,
} from '@/components/ui/lapisan'
import { PENGGUNA_CONTOH } from '@/lib/adapter/data-contoh'

const VARIAN = ['utama', 'halus', 'garis', 'hantu', 'bahaya', 'sukses', 'tautan'] as const
const WARNA = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'netral'] as const

function GaleriKomponen() {
  const [sakelar, setSakelar] = useState(true)
  const [centang, setCentang] = useState<boolean | 'indeterminate'>('indeterminate')
  const [pilihan, setPilihan] = useState('sedang')

  return (
    <>
      <KepalaHalaman
        judul="Galeri komponen"
        deskripsi="Seluruh komponen siap pakai beserta variannya. Salin dari sini saat membangun halaman baru."
        remah={[{ label: 'Elemen UI' }, { label: 'Galeri komponen' }]}
      />

      <BagianPeraga judul="Tombol" deskripsi="Tujuh varian, empat ukuran, plus keadaan memuat dan nonaktif.">
        {VARIAN.map((v) => (
          <Tombol key={v} varian={v}>{v}</Tombol>
        ))}
      </BagianPeraga>

      <BagianPeraga judul="Ukuran & keadaan tombol">
        <Tombol ukuran="sm">Kecil</Tombol>
        <Tombol ukuran="md">Sedang</Tombol>
        <Tombol ukuran="lg">Besar</Tombol>
        <Tombol ukuran="ikon" aria-label="Tambah"><Plus /></Tombol>
        <Tombol memuat>Memuat</Tombol>
        <Tombol disabled>Nonaktif</Tombol>
        <Tombol varian="garis"><Download /> Dengan ikon</Tombol>
      </BagianPeraga>

      <BagianPeraga judul="Lencana" deskripsi="Versi lembut dan padat untuk setiap warna semantik.">
        {WARNA.map((w) => (
          <Lencana key={w} warna={w}>{w}</Lencana>
        ))}
        <Pemisah orientation="vertical" className="h-6" />
        {WARNA.map((w) => (
          <Lencana key={`${w}-padat`} warna={w} padat>{w}</Lencana>
        ))}
        <Pemisah orientation="vertical" className="h-6" />
        <span className="inline-flex items-center gap-1.5 text-sm"><TitikStatus warna="success" /> Daring</span>
        <span className="inline-flex items-center gap-1.5 text-sm"><TitikStatus warna="danger" /> Luring</span>
      </BagianPeraga>

      <BagianPeraga judul="Avatar" deskripsi="Lima ukuran, dengan cadangan inisial bila gambar gagal dimuat.">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((u) => (
          <Avatar key={u} nama="Dewi Kusuma" src={PENGGUNA_CONTOH[1]?.avatar_url} ukuran={u} />
        ))}
        <Avatar nama="Tanpa Gambar" ukuran="md" />
        <Pemisah orientation="vertical" className="h-8" />
        <TumpukanAvatar orang={PENGGUNA_CONTOH.slice(0, 6).map((p) => ({ nama: p.nama, avatar: p.avatar_url }))} />
      </BagianPeraga>

      <BagianPeraga judul="Kendali formulir">
        <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-teks">Teks</Label>
            <Masukan id="c-teks" placeholder="Ketik di sini…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-pilih">Pilihan</Label>
            <PilihanRingkas
              id="c-pilih"
              nilai={pilihan}
              onUbah={setPilihan}
              opsi={[
                { nilai: 'rendah', label: 'Rendah' },
                { nilai: 'sedang', label: 'Sedang' },
                { nilai: 'tinggi', label: 'Tinggi' },
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-galat">Dengan galat</Label>
            <Masukan id="c-galat" aria-invalid defaultValue="nilai tidak sah" />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="c-area">Area teks</Label>
            <AreaTeks id="c-area" placeholder="Tulis beberapa baris…" />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2.5 text-sm">
            <Sakelar checked={sakelar} onCheckedChange={setSakelar} /> Sakelar
          </label>
          <label className="flex items-center gap-2.5 text-sm">
            <KotakCentang checked={centang} onCheckedChange={setCentang} /> Kotak centang
          </label>
          <GrupRadio defaultValue="a" className="flex items-center gap-4">
            {['a', 'b'].map((v) => (
              <label key={v} className="flex items-center gap-2 text-sm">
                <ItemRadio value={v} /> Pilihan {v.toUpperCase()}
              </label>
            ))}
          </GrupRadio>
        </div>
      </BagianPeraga>

      <BagianPeraga judul="Peringatan">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Peringatan varian="info" judul="Informasi">Perubahan tersimpan otomatis setiap 30 detik.</Peringatan>
          <Peringatan varian="sukses" judul="Berhasil">Faktur berhasil dikirim ke pelanggan.</Peringatan>
          <Peringatan varian="perhatian" judul="Perhatian">Stok produk ini tinggal 4 unit.</Peringatan>
          <Peringatan varian="bahaya" judul="Gagal">Koneksi ke server pembayaran terputus.</Peringatan>
        </div>
      </BagianPeraga>

      <BagianPeraga judul="Lapisan" deskripsi="Dialog, panel geser, dropdown, tooltip, tab, dan akordeon.">
        <Dialog>
          <PemicuDialog asChild><Tombol varian="garis">Buka dialog</Tombol></PemicuDialog>
          <IsiDialog judul="Contoh dialog" deskripsi="Dialog menutup lewat tombol X, tombol Esc, atau klik di luar.">
            <p className="text-sm text-muted-foreground">
              Fokus papan ketik terkunci di dalam dialog selama terbuka — perilaku bawaan dari Radix.
            </p>
            <KakiDialog>
              <TutupDialog asChild><Tombol varian="garis">Tutup</Tombol></TutupDialog>
              <Tombol onClick={() => toast.success('Tersimpan.')}>Simpan</Tombol>
            </KakiDialog>
          </IsiDialog>
        </Dialog>

        <Dropdown>
          <PemicuDropdown asChild><Tombol varian="garis">Dropdown</Tombol></PemicuDropdown>
          <IsiDropdown>
            <ItemDropdown><Heart /> Sukai</ItemDropdown>
            <ItemDropdown><Download /> Unduh</ItemDropdown>
            <ItemDropdown bahaya><Trash2 /> Hapus</ItemDropdown>
          </IsiDropdown>
        </Dropdown>

        <Tooltip isi="Ini keterangan singkat">
          <Tombol varian="garis">Arahkan kursor</Tombol>
        </Tooltip>

        <Konfirmasi>
          <PemicuKonfirmasi asChild><Tombol varian="bahaya">Hapus data</Tombol></PemicuKonfirmasi>
          <IsiKonfirmasi
            judul="Hapus data ini?"
            deskripsi="Data akan disembunyikan dari daftar tetapi tetap tersimpan dan bisa dipulihkan."
            onLanjut={() => toast.success('Data dihapus.')}
          />
        </Konfirmasi>
      </BagianPeraga>

      <BagianPeraga judul="Tab & akordeon">
        <div className="grid w-full gap-6 lg:grid-cols-2">
          <Tab defaultValue="satu">
            <DaftarTab>
              <PemicuTab value="satu">Ringkasan</PemicuTab>
              <PemicuTab value="dua">Rincian</PemicuTab>
              <PemicuTab value="tiga">Riwayat</PemicuTab>
            </DaftarTab>
            <IsiTab value="satu"><p className="text-sm text-muted-foreground">Isi tab pertama.</p></IsiTab>
            <IsiTab value="dua"><p className="text-sm text-muted-foreground">Isi tab kedua.</p></IsiTab>
            <IsiTab value="tiga"><p className="text-sm text-muted-foreground">Isi tab ketiga.</p></IsiTab>
          </Tab>

          <Akordeon type="single" collapsible defaultValue="a1">
            <ItemAkordeon value="a1">
              <PemicuAkordeon>Apa itu akordeon?</PemicuAkordeon>
              <IsiAkordeon>Komponen untuk menyembunyikan isi panjang sampai dibutuhkan.</IsiAkordeon>
            </ItemAkordeon>
            <ItemAkordeon value="a2">
              <PemicuAkordeon>Kapan sebaiknya dipakai?</PemicuAkordeon>
              <IsiAkordeon>Saat isi bersifat opsional, seperti tanya jawab atau pengaturan lanjutan.</IsiAkordeon>
            </ItemAkordeon>
          </Akordeon>
        </div>
      </BagianPeraga>

      <BagianPeraga judul="Keadaan memuat & kosong">
        <div className="grid w-full gap-4 lg:grid-cols-2">
          <div className="space-y-2 rounded-card border border-border p-4">
            <Rangka className="h-4 w-32" />
            <Rangka className="h-4 w-full" />
            <Rangka className="h-4 w-3/4" />
            <Rangka className="mt-3 h-24 w-full" />
          </div>
          <div className="rounded-card border border-border">
            <KeadaanKosong
              judul="Belum ada pesanan"
              deskripsi="Pesanan yang masuk akan tampil di sini."
              aksi={<Tombol ukuran="sm"><Plus /> Buat pesanan</Tombol>}
            />
          </div>
        </div>
      </BagianPeraga>
    </>
  )
}

export const Route = createFileRoute('/_app/ui/komponen')({ component: GaleriKomponen })
