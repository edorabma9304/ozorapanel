import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, PartyPopper } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu, KakiKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { GrupRadio, ItemRadio, KotakCentang, PilihanRingkas } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { cn } from '@/lib/utils'

const TAHAP = [
  { judul: 'Data usaha', keterangan: 'Identitas dan kontak' },
  { judul: 'Operasional', keterangan: 'Cara Anda bekerja' },
  { judul: 'Tim', keterangan: 'Siapa yang akan masuk' },
  { judul: 'Selesai', keterangan: 'Tinjau dan kirim' },
]

function HalamanBertahap() {
  const [tahap, setTahap] = useState(0)
  const terakhir = tahap === TAHAP.length - 1

  return (
    <>
      <KepalaHalaman
        judul="Formulir bertahap"
        deskripsi="Memecah isian panjang jadi beberapa langkah — menurunkan tingkat pengabaian formulir."
        remah={[{ label: 'Formulir' }, { label: 'Bertahap' }]}
      />

      <Kartu>
        <IsiKartu>
          {/* Penanda tahap */}
          <ol className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {TAHAP.map((t, i) => {
              const selesai = i < tahap
              const aktif = i === tahap
              return (
                <li key={t.judul} className="flex flex-1 items-start gap-3">
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-colors',
                      selesai
                        ? 'border-success bg-success text-success-foreground'
                        : aktif
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground',
                    )}
                  >
                    {selesai ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-sm font-bold', !aktif && !selesai && 'text-muted-foreground')}>
                      {t.judul}
                    </span>
                    <span className="block text-xs text-muted-foreground">{t.keterangan}</span>
                  </span>
                  {i < TAHAP.length - 1 ? (
                    <span className={cn('mt-4 hidden h-0.5 flex-1 rounded sm:block', selesai ? 'bg-success' : 'bg-border')} />
                  ) : null}
                </li>
              )
            })}
          </ol>

          <div className="mt-8 max-w-2xl">
            {tahap === 0 ? (
              <div className="space-y-4">
                <KolomForm id="w-nama" label="Nama usaha" wajib>
                  <Masukan id="w-nama" placeholder="Toko Berkah Jaya" />
                </KolomForm>
                <div className="grid gap-4 sm:grid-cols-2">
                  <KolomForm id="w-jenis" label="Jenis usaha">
                    <PilihanRingkas
                      id="w-jenis"
                      nilai="ritel"
                      onUbah={() => undefined}
                      opsi={[
                        { nilai: 'ritel', label: 'Ritel' },
                        { nilai: 'jasa', label: 'Jasa' },
                        { nilai: 'produksi', label: 'Produksi' },
                        { nilai: 'kuliner', label: 'Kuliner' },
                      ]}
                    />
                  </KolomForm>
                  <KolomForm id="w-telepon" label="Telepon">
                    <Masukan id="w-telepon" inputMode="tel" placeholder="0812-3456-7890" />
                  </KolomForm>
                </div>
                <KolomForm id="w-alamat" label="Alamat">
                  <AreaTeks id="w-alamat" placeholder="Jl. Merdeka No. 12…" />
                </KolomForm>
              </div>
            ) : tahap === 1 ? (
              <div className="space-y-5">
                <div>
                  <p className="mb-2.5 text-sm font-semibold">Berapa banyak cabang yang Anda kelola?</p>
                  <GrupRadio defaultValue="1" className="grid gap-2.5 sm:grid-cols-3">
                    {['1', '2–5', 'Lebih dari 5'].map((o) => (
                      <label key={o} className="flex cursor-pointer items-center gap-3 rounded-card border border-border p-3 text-sm transition-colors hover:border-primary/40">
                        <ItemRadio value={o} /> {o}
                      </label>
                    ))}
                  </GrupRadio>
                </div>
                <div>
                  <p className="mb-2.5 text-sm font-semibold">Modul apa yang paling Anda butuhkan?</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {['Pesanan & pelanggan', 'Stok bahan baku', 'Keuangan & laporan', 'Produksi'].map((m) => (
                      <label key={m} className="flex cursor-pointer items-center gap-3 rounded-card border border-border p-3 text-sm transition-colors hover:border-primary/40">
                        <KotakCentang defaultChecked={m.startsWith('Pesanan')} /> {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : tahap === 2 ? (
              <div className="space-y-4">
                <Peringatan varian="info">
                  Anggota tim akan menerima undangan lewat surel Google mereka. Peran bisa diubah
                  kapan saja dari halaman Pengguna &amp; peran.
                </Peringatan>
                {[1, 2].map((n) => (
                  <div key={n} className="grid gap-4 sm:grid-cols-2">
                    <KolomForm id={`w-surel-${n}`} label={`Surel anggota ${n}`}>
                      <Masukan id={`w-surel-${n}`} type="email" placeholder="nama@gmail.com" />
                    </KolomForm>
                    <KolomForm id={`w-peran-${n}`} label="Peran">
                      <PilihanRingkas
                        id={`w-peran-${n}`}
                        nilai="sales"
                        onUbah={() => undefined}
                        opsi={[
                          { nilai: 'admin', label: 'Admin' },
                          { nilai: 'finance', label: 'Finance' },
                          { nilai: 'produksi', label: 'Produksi' },
                          { nilai: 'sales', label: 'Sales' },
                        ]}
                      />
                    </KolomForm>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success-kuat">
                  <PartyPopper className="size-8" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold">Semua siap</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Data Anda sudah lengkap. Klik kirim untuk menyelesaikan penyiapan — Anda tetap
                  bisa mengubah semuanya nanti lewat halaman Pengaturan.
                </p>
              </div>
            )}
          </div>
        </IsiKartu>

        <KakiKartu className="justify-between">
          <Tombol varian="garis" onClick={() => setTahap((t) => Math.max(0, t - 1))} disabled={tahap === 0}>
            <ArrowLeft /> Sebelumnya
          </Tombol>
          <span className="text-sm text-muted-foreground">
            Langkah {tahap + 1} dari {TAHAP.length}
          </span>
          {terakhir ? (
            <Tombol varian="sukses"><Check /> Kirim</Tombol>
          ) : (
            <Tombol onClick={() => setTahap((t) => Math.min(TAHAP.length - 1, t + 1))}>
              Berikutnya <ArrowRight />
            </Tombol>
          )}
        </KakiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/formulir/bertahap')({ component: HalamanBertahap })
