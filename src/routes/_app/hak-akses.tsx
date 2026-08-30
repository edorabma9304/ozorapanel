import { createFileRoute } from '@tanstack/react-router'
import { Check, Eye, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel } from '@/components/ui/tabel'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Izinkan, useAuth } from '@/lib/auth'
import { LABEL_PERAN, MATRIKS_IZIN, PERAN, WARNA_PERAN, punyaIzin, type Peran } from '@/config/peran'
import { PRODUK_CONTOH } from '@/lib/adapter/data-contoh'
import { formatRp } from '@/lib/format'
import { cn } from '@/lib/utils'

const MODUL = ['dasbor', 'pesanan', 'pelanggan', 'katalog', 'stok', 'produksi', 'laporan', 'pengguna', 'pengaturan', 'audit']
const AKSI = ['lihat', 'buat', 'ubah', 'hapus'] as const

function HalamanHakAkses() {
  const { peran: peranSaya } = useAuth()
  const [peranUji, setPeranUji] = useState<Peran>(peranSaya ?? 'sales')

  return (
    <>
      <KepalaHalaman
        judul="Hak akses"
        deskripsi="Matriks izin lengkap, ditambah alat untuk mencoba tampilan dari sudut pandang tiap peran."
        remah={[{ label: 'Halaman' }, { label: 'Hak akses' }]}
      />

      <Peringatan varian="perhatian" judul="Ini hanya lapisan tampilan">
        Menyembunyikan tombol tidak mengamankan apa pun. Setiap izin di halaman ini
        WAJIB ditegakkan ulang di backend — lewat Row Level Security Supabase atau
        middleware API. Klien selalu bisa dimanipulasi.
      </Peringatan>

      {/* Alat coba peran */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Coba sudut pandang peran</JudulKartu>
            <DeskripsiKartu>
              Ubah peran di bawah untuk melihat perbedaan tombol yang muncul — tanpa perlu keluar dan masuk lagi.
            </DeskripsiKartu>
          </div>
          <Lencana warna={WARNA_PERAN[peranUji]} padat>{LABEL_PERAN[peranUji]}</Lencana>
        </KepalaKartu>
        <IsiKartu>
          <div className="flex flex-wrap gap-2">
            {PERAN.map((p) => (
              <Tombol
                key={p}
                varian={p === peranUji ? 'utama' : 'garis'}
                ukuran="sm"
                onClick={() => setPeranUji(p)}
                aria-pressed={p === peranUji}
              >
                {LABEL_PERAN[p]}
              </Tombol>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-card border border-border">
            <BingkaiTabel>
              <Tabel>
                <KepalaTabel>
                  <tr>
                    <SelKepala>Produk</SelKepala>
                    <SelKepala className="text-right">Harga</SelKepala>
                    <SelKepala className="text-right">Tindakan yang terlihat</SelKepala>
                  </tr>
                </KepalaTabel>
                <BadanTabel>
                  {PRODUK_CONTOH.slice(0, 5).map((p) => (
                    <BarisTabel key={p.id}>
                      <Sel className="font-semibold">{p.nama}</Sel>
                      <Sel className="text-right">{formatRp(p.harga)}</Sel>
                      <Sel>
                        <div className="flex justify-end gap-1.5">
                          {punyaIzin(peranUji, 'katalog.lihat') ? (
                            <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Lihat"><Eye /></Tombol>
                          ) : null}
                          {punyaIzin(peranUji, 'katalog.ubah') ? (
                            <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Ubah"><Pencil /></Tombol>
                          ) : null}
                          {punyaIzin(peranUji, 'katalog.hapus') ? (
                            <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Hapus"><Trash2 className="text-danger-kuat" /></Tombol>
                          ) : null}
                          {!punyaIzin(peranUji, 'katalog.lihat') ? (
                            <span className="text-xs text-muted-foreground">Tidak ada akses</span>
                          ) : null}
                        </div>
                      </Sel>
                    </BarisTabel>
                  ))}
                </BadanTabel>
              </Tabel>
            </BingkaiTabel>
          </div>
        </IsiKartu>
      </Kartu>

      {/* Matriks izin */}
      <Kartu className="overflow-hidden">
        <KepalaKartu className="pb-4">
          <div>
            <JudulKartu>Matriks izin</JudulKartu>
            <DeskripsiKartu>
              Sumbernya satu berkas: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">src/config/peran.ts</code>
            </DeskripsiKartu>
          </div>
        </KepalaKartu>
        <BingkaiTabel>
          <Tabel>
            <KepalaTabel>
              <tr>
                <SelKepala className="sticky left-0 z-10 bg-card">Modul</SelKepala>
                {PERAN.map((p) => (
                  <SelKepala key={p} className="text-center" colSpan={AKSI.length}>
                    {LABEL_PERAN[p]}
                  </SelKepala>
                ))}
              </tr>
              <tr>
                <SelKepala className="sticky left-0 z-10 bg-card" />
                {PERAN.flatMap((p) =>
                  AKSI.map((a) => (
                    <SelKepala key={`${p}-${a}`} className="px-1.5 text-center text-[10px] font-semibold normal-case">
                      {a}
                    </SelKepala>
                  )),
                )}
              </tr>
            </KepalaTabel>
            <BadanTabel>
              {MODUL.map((m) => (
                <BarisTabel key={m}>
                  <Sel className="sticky left-0 z-10 bg-card font-semibold capitalize">{m}</Sel>
                  {PERAN.flatMap((p) =>
                    AKSI.map((a) => {
                      const boleh = punyaIzin(p, `${m}.${a}`)
                      return (
                        <Sel key={`${m}-${p}-${a}`} className="px-1.5 text-center">
                          <span
                            className={cn(
                              'inline-grid size-5 place-items-center rounded-full',
                              boleh ? 'bg-success-soft text-success-kuat' : 'bg-muted text-muted-foreground/50',
                            )}
                            title={`${LABEL_PERAN[p]} · ${m}.${a}: ${boleh ? 'boleh' : 'tidak boleh'}`}
                          >
                            {boleh ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                          </span>
                        </Sel>
                      )
                    }),
                  )}
                </BarisTabel>
              ))}
            </BadanTabel>
          </Tabel>
        </BingkaiTabel>
      </Kartu>

      {/* Aturan mentah per peran */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PERAN.map((p) => (
          <Kartu key={p}>
            <KepalaKartu>
              <JudulKartu className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary-kuat" /> {LABEL_PERAN[p]}
              </JudulKartu>
            </KepalaKartu>
            <IsiKartu>
              <ul className="space-y-1.5 font-mono text-xs">
                {MATRIKS_IZIN[p].map((izin) => (
                  <li key={izin} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-block size-1.5 rounded-full',
                        izin.startsWith('!') ? 'bg-danger' : 'bg-success',
                      )}
                    />
                    {izin}
                  </li>
                ))}
              </ul>
            </IsiKartu>
          </Kartu>
        ))}
      </div>

      {/* Contoh pemakaian komponen */}
      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Cara memakainya di kode</JudulKartu>
            <DeskripsiKartu>Dua pola — pagar seluruh halaman, atau sembunyikan satu tombol</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-5">
          <pre className="overflow-x-auto rounded-card bg-muted p-4 font-mono text-xs leading-relaxed scrollbar-thin">
{`// 1. Pagari seluruh halaman
const { boleh } = useAuth()
if (!boleh('pengguna.lihat')) return <HalamanTanpaAkses />

// 2. Sembunyikan satu bagian saja
<Izinkan izin="pengguna.hapus">
  <Tombol varian="bahaya">Hapus</Tombol>
</Izinkan>`}
          </pre>

          <div className="flex flex-wrap items-center gap-3 rounded-card border border-border p-4">
            <span className="text-sm text-muted-foreground">
              Peran Anda sekarang: <b className="text-foreground">{peranSaya ? LABEL_PERAN[peranSaya] : '—'}</b>
            </span>
            <Izinkan izin="pengguna.buat" jikaTidak={<Lencana warna="netral">Tombol "Tambah" disembunyikan</Lencana>}>
              <Tombol ukuran="sm"><Plus /> Tambah pengguna</Tombol>
            </Izinkan>
            <Izinkan izin="pengguna.hapus" jikaTidak={<Lencana warna="netral">Tombol "Hapus" disembunyikan</Lencana>}>
              <Tombol varian="bahaya" ukuran="sm"><Trash2 /> Hapus pengguna</Tombol>
            </Izinkan>
          </div>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/hak-akses')({ component: HalamanHakAkses })
