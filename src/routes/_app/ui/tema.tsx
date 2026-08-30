import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { BagianPeraga } from '@/components/data/bagian-peraga'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Peringatan } from '@/components/ui/keadaan'

const WARNA = [
  { nama: 'primary', kelas: 'bg-primary', lembut: 'bg-primary-soft', pakai: 'Aksi utama, tautan, keadaan aktif' },
  { nama: 'secondary', kelas: 'bg-secondary', lembut: 'bg-secondary-soft', pakai: 'Aksen pendukung, kategori' },
  { nama: 'success', kelas: 'bg-success', lembut: 'bg-success-soft', pakai: 'Berhasil, lunas, aktif' },
  { nama: 'warning', kelas: 'bg-warning', lembut: 'bg-warning-soft', pakai: 'Perlu perhatian, stok menipis' },
  { nama: 'danger', kelas: 'bg-danger', lembut: 'bg-danger-soft', pakai: 'Galat, hapus, jatuh tempo' },
  { nama: 'info', kelas: 'bg-info', lembut: 'bg-info-soft', pakai: 'Informasi netral' },
]

const NETRAL = [
  { nama: 'background', kelas: 'bg-background' },
  { nama: 'card', kelas: 'bg-card' },
  { nama: 'muted', kelas: 'bg-muted' },
  { nama: 'border', kelas: 'bg-border' },
  { nama: 'foreground', kelas: 'bg-foreground' },
]

const TIPOGRAFI = [
  { kelas: 'text-2xl font-extrabold tracking-tight', label: 'Judul halaman · text-2xl font-extrabold' },
  { kelas: 'text-xl font-bold', label: 'Judul bagian · text-xl font-bold' },
  { kelas: 'text-base font-bold', label: 'Judul kartu · text-base font-bold' },
  { kelas: 'text-sm', label: 'Teks isi · text-sm' },
  { kelas: 'text-sm text-muted-foreground', label: 'Teks sekunder · text-sm text-muted-foreground' },
  { kelas: 'text-xs text-muted-foreground', label: 'Keterangan · text-xs text-muted-foreground' },
]

function HalamanTema() {
  return (
    <>
      <KepalaHalaman
        judul="Warna & tipografi"
        deskripsi="Token desain yang menjadi dasar seluruh komponen."
        remah={[{ label: 'Elemen UI' }, { label: 'Warna & tipografi' }]}
      />

      <Peringatan varian="perhatian" judul="Selalu pakai token, jangan warna mentah">
        Tulis <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">bg-primary</code>,
        bukan <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">bg-blue-500</code>.
        Token otomatis menyesuaikan mode gelap; warna mentah tidak. Semua token didefinisikan
        di <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">src/styles/globals.css</code>.
      </Peringatan>

      <Kartu>
        <IsiKartu>
          <h2 className="text-base font-bold">Warna semantik</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WARNA.map((w) => (
              <div key={w.nama} className="overflow-hidden rounded-card border border-border">
                <div className={`h-16 ${w.kelas}`} />
                <div className={`h-8 ${w.lembut}`} />
                <div className="p-3">
                  <p className="font-mono text-sm font-bold">{w.nama}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{w.pakai}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                    bg-{w.nama} · bg-{w.nama}-soft · text-{w.nama}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </IsiKartu>
      </Kartu>

      <BagianPeraga judul="Warna netral" deskripsi="Latar, permukaan, dan garis pembatas.">
        {NETRAL.map((n) => (
          <div key={n.nama} className="text-center">
            <div className={`size-20 rounded-card border border-border ${n.kelas}`} />
            <p className="mt-2 font-mono text-xs">{n.nama}</p>
          </div>
        ))}
      </BagianPeraga>

      <Kartu>
        <IsiKartu>
          <h2 className="text-base font-bold">Tipografi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plus Jakarta Sans Variable, di-host sendiri — tanpa permintaan ke Google Fonts.
          </p>
          <div className="mt-5 space-y-4">
            {TIPOGRAFI.map((t) => (
              <div key={t.label} className="border-b border-border pb-4 last:border-0">
                <p className={t.kelas}>Panel admin untuk usaha Indonesia</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        </IsiKartu>
      </Kartu>

      <BagianPeraga judul="Radius & bayangan">
        <div className="text-center">
          <div className="size-24 rounded-card border border-border bg-card shadow-soft" />
          <p className="mt-2 font-mono text-xs">rounded-card · shadow-soft</p>
        </div>
        <div className="text-center">
          <div className="size-24 rounded-card border border-border bg-card shadow-raised" />
          <p className="mt-2 font-mono text-xs">rounded-card · shadow-raised</p>
        </div>
        <div className="text-center">
          <div className="size-24 rounded-control border border-border bg-card" />
          <p className="mt-2 font-mono text-xs">rounded-control</p>
        </div>
        <div className="text-center">
          <div className="size-24 rounded-full border border-border bg-card" />
          <p className="mt-2 font-mono text-xs">rounded-full</p>
        </div>
      </BagianPeraga>
    </>
  )
}

export const Route = createFileRoute('/_app/ui/tema')({ component: HalamanTema })
