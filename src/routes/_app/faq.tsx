import { createFileRoute } from '@tanstack/react-router'
import { LifeBuoy } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Akordeon, ItemAkordeon, PemicuAkordeon, IsiAkordeon } from '@/components/ui/lapisan'
import { Tombol } from '@/components/ui/tombol'

const TANYA_JAWAB = [
  {
    t: 'Kenapa hanya bisa masuk dengan Google?',
    j: 'Supaya tidak ada kata sandi yang perlu kami simpan, dan verifikasi dua langkah cukup diatur sekali di akun Google Anda. Ini menghilangkan seluruh kelas kerentanan yang berkaitan dengan penyimpanan sandi.',
  },
  {
    t: 'Saya sudah masuk, tapi menunya sedikit. Kenapa?',
    j: 'Menu ditampilkan berdasarkan peran akun Anda. Peran Sales, misalnya, hanya melihat pesanan, pelanggan, dan katalog. Minta administrator meninjau peran Anda bila ada menu yang seharusnya terlihat.',
  },
  {
    t: 'Apa bedanya menonaktifkan dan menghapus data?',
    j: 'Panel ini tidak pernah menghapus data secara permanen. "Menonaktifkan" mengisi penanda waktu penghapusan sehingga baris disembunyikan dari daftar, tetapi riwayat dan relasinya tetap utuh dan bisa dipulihkan.',
  },
  {
    t: 'Bagaimana data saya dilindungi?',
    j: 'Otorisasi ditegakkan di sisi server melalui Row Level Security, bukan hanya disembunyikan di antarmuka. Setiap perubahan data penting dicatat di jejak audit lengkap dengan pelaku, waktu, dan alamat IP.',
  },
  {
    t: 'Bisakah saya mengekspor data?',
    j: 'Bisa. Sebagian besar halaman daftar punya tombol ekspor ke CSV. Untuk ekspor massal seluruh basis data, hubungi administrator.',
  },
  {
    t: 'Apakah panel ini bisa dipakai di ponsel?',
    j: 'Bisa. Seluruh halaman dirancang mobile-first; tabel yang lebar bisa digeser ke samping dan kolom yang kurang penting otomatis disembunyikan di layar kecil.',
  },
]

function HalamanFaq() {
  return (
    <>
      <KepalaHalaman
        judul="Tanya jawab"
        deskripsi="Pertanyaan yang paling sering muncul dari pengguna baru."
        remah={[{ label: 'Halaman' }, { label: 'Tanya jawab' }]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu className="lg:col-span-2">
          <IsiKartu>
            <Akordeon type="single" collapsible defaultValue="item-0">
              {TANYA_JAWAB.map((q, i) => (
                <ItemAkordeon key={q.t} value={`item-${i}`}>
                  <PemicuAkordeon>{q.t}</PemicuAkordeon>
                  <IsiAkordeon>{q.j}</IsiAkordeon>
                </ItemAkordeon>
              ))}
            </Akordeon>
          </IsiKartu>
        </Kartu>

        <Kartu className="h-fit">
          <IsiKartu className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-card bg-primary-soft text-primary-kuat">
              <LifeBuoy className="size-6" />
            </span>
            <h3 className="mt-4 text-base font-bold">Masih ada pertanyaan?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tim kami membalas pada hari kerja, pukul 09.00–17.00 WIB.
            </p>
            <Tombol className="mt-5 w-full" asChild>
              <a href="mailto:dukungan@ozora.id">Hubungi dukungan</a>
            </Tombol>
          </IsiKartu>
        </Kartu>
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/faq')({ component: HalamanFaq })
