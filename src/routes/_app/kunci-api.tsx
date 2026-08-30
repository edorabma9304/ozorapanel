import { createFileRoute } from '@tanstack/react-router'
import { Copy, Eye, EyeOff, KeyRound, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel } from '@/components/ui/tabel'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan, Konfirmasi, IsiKonfirmasi, PemicuKonfirmasi } from '@/components/ui/keadaan'
import { HalamanTanpaAkses } from '@/components/layout/halaman-galat'
import { useAuth } from '@/lib/auth'
import { formatTanggal, formatWaktuRelatif } from '@/lib/format'
import { idAcak } from '@/lib/utils'

type Kunci = {
  id: string
  nama: string
  prefiks: string
  rahasia: string
  lingkungan: 'produksi' | 'uji'
  dibuat: string
  dipakai: string | null
}

const AWAL: Kunci[] = [
  { id: '1', nama: 'Integrasi kasir', prefiks: 'ozp_live_8f2a', rahasia: 'ozp_live_8f2a4c19d7be5310', lingkungan: 'produksi', dibuat: '2026-05-14', dipakai: '2026-08-29T10:12:00Z' },
  { id: '2', nama: 'Aplikasi kurir', prefiks: 'ozp_live_31cd', rahasia: 'ozp_live_31cd90ab77f21456', lingkungan: 'produksi', dibuat: '2026-06-30', dipakai: '2026-08-27T04:40:00Z' },
  { id: '3', nama: 'Sandbox pengembangan', prefiks: 'ozp_test_a09f', rahasia: 'ozp_test_a09f22b1cc830d47', lingkungan: 'uji', dibuat: '2026-08-02', dipakai: null },
]

function HalamanKunciApi() {
  const { boleh } = useAuth()
  const [kunci, setKunci] = useState(AWAL)
  const [terlihat, setTerlihat] = useState<string | null>(null)

  if (!boleh('pengaturan.lihat')) return <HalamanTanpaAkses />

  async function salin(nilai: string) {
    try {
      await navigator.clipboard.writeText(nilai)
      toast.success('Kunci disalin ke papan klip.')
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  function buatBaru() {
    const rahasia = `ozp_test_${idAcak(16)}`
    setKunci((k) => [
      {
        id: idAcak(6),
        nama: 'Kunci baru',
        prefiks: rahasia.slice(0, 13),
        rahasia,
        lingkungan: 'uji',
        dibuat: new Date().toISOString(),
        dipakai: null,
      },
      ...k,
    ])
    toast.success('Kunci dibuat. Salin sekarang — nilai penuh hanya tampil sekali.')
  }

  return (
    <>
      <KepalaHalaman
        judul="Kunci API"
        deskripsi="Kredensial untuk menghubungkan sistem lain ke panel ini."
        remah={[{ label: 'Halaman' }, { label: 'Kunci API' }]}
        aksi={
          <Tombol onClick={buatBaru}>
            <Plus /> Buat kunci
          </Tombol>
        }
      />

      <Peringatan varian="bahaya" judul="Perlakukan kunci seperti kata sandi">
        Jangan pernah menaruh kunci produksi di kode frontend, repositori Git, atau pesan
        obrolan. Kunci yang bocor harus segera dicabut dan dibuat ulang.
      </Peringatan>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Kunci aktif</JudulKartu>
            <DeskripsiKartu>{kunci.length} kunci terdaftar</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="px-0 pt-3">
          <BingkaiTabel>
            <Tabel>
              <KepalaTabel>
                <tr>
                  <SelKepala>Nama</SelKepala>
                  <SelKepala>Kunci</SelKepala>
                  <SelKepala>Lingkungan</SelKepala>
                  <SelKepala className="hidden md:table-cell">Dibuat</SelKepala>
                  <SelKepala className="hidden md:table-cell">Terakhir dipakai</SelKepala>
                  <SelKepala className="text-right">Aksi</SelKepala>
                </tr>
              </KepalaTabel>
              <BadanTabel>
                {kunci.map((k) => (
                  <BarisTabel key={k.id}>
                    <Sel className="font-semibold">{k.nama}</Sel>
                    <Sel>
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {terlihat === k.id ? k.rahasia : `${k.prefiks}${'•'.repeat(12)}`}
                        </code>
                        <Tombol
                          varian="hantu"
                          ukuran="ikon-sm"
                          onClick={() => setTerlihat((t) => (t === k.id ? null : k.id))}
                          aria-label={terlihat === k.id ? 'Sembunyikan kunci' : 'Tampilkan kunci'}
                        >
                          {terlihat === k.id ? <EyeOff /> : <Eye />}
                        </Tombol>
                        <Tombol varian="hantu" ukuran="ikon-sm" onClick={() => void salin(k.rahasia)} aria-label="Salin kunci">
                          <Copy />
                        </Tombol>
                      </div>
                    </Sel>
                    <Sel>
                      <Lencana warna={k.lingkungan === 'produksi' ? 'danger' : 'info'}>
                        {k.lingkungan}
                      </Lencana>
                    </Sel>
                    <Sel className="hidden text-muted-foreground md:table-cell">{formatTanggal(k.dibuat)}</Sel>
                    <Sel className="hidden text-muted-foreground md:table-cell">
                      {k.dipakai ? formatWaktuRelatif(k.dipakai) : 'Belum pernah'}
                    </Sel>
                    <Sel className="text-right">
                      <Konfirmasi>
                        <PemicuKonfirmasi asChild>
                          <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Cabut ${k.nama}`}>
                            <Trash2 className="text-danger-kuat" />
                          </Tombol>
                        </PemicuKonfirmasi>
                        <IsiKonfirmasi
                          judul={`Cabut kunci "${k.nama}"?`}
                          deskripsi="Sistem yang masih memakai kunci ini akan langsung kehilangan akses. Tindakan ini tidak bisa dibatalkan."
                          labelLanjut="Ya, cabut kunci"
                          onLanjut={() => {
                            setKunci((s) => s.filter((x) => x.id !== k.id))
                            toast.success('Kunci dicabut.')
                          }}
                        />
                      </Konfirmasi>
                    </Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
            </Tabel>
          </BingkaiTabel>
        </IsiKartu>
      </Kartu>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <KeyRound className="size-3.5" />
        Kunci uji hanya berlaku di lingkungan sandbox dan tidak menyentuh data produksi.
      </p>
    </>
  )
}

export const Route = createFileRoute('/_app/kunci-api')({ component: HalamanKunciApi })
