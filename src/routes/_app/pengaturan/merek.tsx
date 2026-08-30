import { createFileRoute } from '@tanstack/react-router'
import { Check, RotateCcw, Save, Smile, TriangleAlert, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { UnggahGambar } from '@/components/form/unggah-gambar'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { Tab, DaftarTab, PemicuTab, IsiTab } from '@/components/ui/lapisan'
import { Lambang } from '@/components/layout/lambang'
import { bacaMerek, simpanMerek, MEREK_BAWAAN, type Merek } from '@/config/merek'
import { kontrasTerbaik, teksTerbaca, varianMerek } from '@/lib/warna'
import { cn } from '@/lib/utils'

const WARNA_SIAP = ['#5d87ff', '#13deb9', '#fa896b', '#ffae1f', '#8b5cf6', '#ec4899', '#0ea5e9', '#2a3547']
const EMOJI_SIAP = ['🚀', '📊', '🛒', '🏬', '🧾', '⚡', '🍰', '🚗']

function PengaturanMerek() {
  const [merek, setMerek] = useState<Merek>(bacaMerek)

  function ubah<K extends keyof Merek>(kunci: K, nilai: Merek[K]) {
    setMerek((m) => ({ ...m, [kunci]: nilai }))
  }

  // Favicon bisa berupa gambar (data URI) atau emoji (1–2 karakter).
  const faviconGambar = merek.favicon.startsWith('data:') || merek.favicon.startsWith('http')
  const faviconEmoji = merek.favicon && !faviconGambar ? merek.favicon : ''

  return (
    <>
      <Peringatan varian="info" judul="Gambar otomatis dikecilkan sebelum disimpan">
        Setiap unggahan diperiksa tipe aslinya, divalidasi ukurannya, lalu diciutkan
        dan disandikan ulang di peramban. Foto 4 MB dari ponsel biasanya turun ke
        bawah 300 KB tanpa perbedaan yang terlihat.
      </Peringatan>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Logo</JudulKartu>
            <DeskripsiKartu>
              PNG atau SVG transparan. Tinggi minimal 48px, maksimal 2 MB — otomatis
              diciutkan ke sisi terpanjang 512px.
            </DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="grid gap-6 sm:grid-cols-2">
          <UnggahGambar
            label="Logo mode terang"
            keterangan="PNG, SVG, atau WebP · maks. 2 MB"
            preset="logo"
            rasioPratinjau="aspect-[3/1]"
            nilai={merek.logoTerang}
            onUbah={(v) => ubah('logoTerang', v)}
          />
          <UnggahGambar
            label="Logo mode gelap"
            keterangan="Kosongkan untuk memakai logo terang"
            preset="logo"
            rasioPratinjau="aspect-[3/1]"
            latarGelap
            nilai={merek.logoGelap}
            onUbah={(v) => ubah('logoGelap', v)}
          />
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Favicon</JudulKartu>
            <DeskripsiKartu>Ikon di tab peramban. Unggah gambar, atau pakai emoji.</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu>
          <Tab defaultValue={faviconEmoji ? 'emoji' : 'gambar'}>
            <DaftarTab>
              <PemicuTab value="gambar"><Upload /> Unggah gambar</PemicuTab>
              <PemicuTab value="emoji"><Smile /> Emoji</PemicuTab>
            </DaftarTab>

            <IsiTab value="gambar">
              <div className="grid gap-6 sm:grid-cols-[240px_1fr]">
                <UnggahGambar
                  label="Berkas favicon"
                  keterangan="PNG, SVG, atau WebP · minimal 48×48 · maks. 1 MB"
                  preset="favicon"
                  rasioPratinjau="aspect-square"
                  nilai={faviconGambar ? merek.favicon : ''}
                  onUbah={(v) => ubah('favicon', v)}
                />

                <div className="space-y-3 text-sm">
                  <p className="font-semibold">Yang terjadi setelah diunggah</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Tipe berkas diperiksa dari byte awalnya, bukan dari ekstensi — berkas yang diganti nama akan ditolak.</li>
                    <li>Gambar dipotong ke tengah menjadi persegi, lalu diciutkan ke 128×128.</li>
                    <li>Disandikan ulang sebagai PNG agar transparansinya tetap terjaga.</li>
                    <li>SVG diteruskan apa adanya — vektor tidak perlu dikompres.</li>
                  </ul>
                </div>
              </div>
            </IsiTab>

            <IsiTab value="emoji">
              <div className="flex flex-wrap items-end gap-4">
                <KolomForm id="m-favicon" label="Emoji favicon" className="w-40">
                  <Masukan
                    id="m-favicon"
                    value={faviconEmoji}
                    onChange={(e) => ubah('favicon', [...e.target.value].slice(0, 2).join(''))}
                    placeholder="🚀"
                    className="text-center text-lg"
                  />
                </KolomForm>

                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_SIAP.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => ubah('favicon', e)}
                      aria-label={`Pakai favicon ${e}`}
                      aria-pressed={faviconEmoji === e}
                      className={cn(
                        'grid size-10 place-items-center rounded-card border text-lg transition-colors',
                        faviconEmoji === e ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/40',
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </IsiTab>
          </Tab>

          {/* Pratinjau tab peramban */}
          <div className="mt-5 flex items-center gap-3 rounded-card border border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">Pratinjau tab</span>
            <span className="flex items-center gap-1.5 rounded-t-md bg-muted px-2.5 py-1.5">
              {faviconGambar ? (
                <img src={merek.favicon} alt="" width={16} height={16} className="size-4 rounded-sm object-contain" />
              ) : faviconEmoji ? (
                <span className="text-base leading-none">{faviconEmoji}</span>
              ) : (
                <Lambang ukuran={16} warnaUtama={merek.warnaUtama} warnaAksen={merek.warnaAksen} />
              )}
              <span className="text-xs font-medium">{merek.nama}</span>
            </span>
            {merek.favicon ? (
              <Tombol varian="hantu" ukuran="sm" onClick={() => ubah('favicon', '')}>
                Kembalikan lambang bawaan
              </Tombol>
            ) : null}
          </div>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Nama &amp; warna</JudulKartu>
            <DeskripsiKartu>Warna utama dipakai untuk tombol, tautan, dan keadaan aktif</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <KolomForm id="m-nama" label="Nama yang tampil" wajib>
              <Masukan id="m-nama" value={merek.nama} onChange={(e) => ubah('nama', e.target.value)} />
            </KolomForm>
            <KolomForm id="m-singkat" label="Singkatan" petunjuk="Dipakai saat sidebar diringkas.">
              <Masukan
                id="m-singkat"
                value={merek.singkatan}
                onChange={(e) => ubah('singkatan', e.target.value.slice(0, 3).toUpperCase())}
                className="w-24 text-center font-bold"
              />
            </KolomForm>
          </div>

          {(
            [
              ['warnaUtama', 'Warna utama'],
              ['warnaAksen', 'Warna aksen'],
            ] as const
          ).map(([kunci, label]) => (
            <div key={kunci}>
              <p className="mb-2.5 text-sm font-semibold">{label}</p>
              <div className="flex flex-wrap items-center gap-2">
                {WARNA_SIAP.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => ubah(kunci, w)}
                    aria-label={`${label}: pilih ${w}`}
                    aria-pressed={merek[kunci] === w}
                    className={cn(
                      'size-8 rounded-full transition-transform',
                      merek[kunci] === w && 'scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card',
                    )}
                    style={{ background: w }}
                  />
                ))}
                <input
                  type="color"
                  value={merek[kunci]}
                  onChange={(e) => ubah(kunci, e.target.value)}
                  aria-label={`${label} khusus`}
                  className="size-8 cursor-pointer rounded-full border border-border bg-transparent"
                />
                <code className="ml-1 font-mono text-xs text-muted-foreground">{merek[kunci]}</code>
              </div>
            </div>
          ))}

          {/* Warna merek bebas dipilih, jadi keterbacaannya harus diperiksa
              di tempat — bukan baru ketahuan saat diaudit. */}
          <div className="space-y-3">
            {([['warnaUtama', 'Warna utama'], ['warnaAksen', 'Warna aksen']] as const).map(([kunci, label]) => {
              const rasio = kontrasTerbaik(merek[kunci])
              const aman = rasio >= 4.5
              return (
                <p
                  key={kunci}
                  className={cn(
                    'flex items-start gap-2 rounded-card p-3 text-xs',
                    aman ? 'bg-success-soft text-success-kuat' : 'bg-danger-soft text-danger-kuat',
                  )}
                  role={aman ? undefined : 'alert'}
                >
                  {aman ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />}
                  <span>
                    <b>{label}</b> — kontras terbaik {rasio.toFixed(2)}:1.{' '}
                    {aman
                      ? `Lolos WCAG AA. Teks di atasnya otomatis ${teksTerbaca(merek[kunci]) === '#ffffff' ? 'putih' : 'gelap'}.`
                      : 'Di bawah 4,5:1 — teks di atas warna ini sulit dibaca. Pilih warna yang lebih pekat atau lebih cerah.'}
                  </span>
                </p>
              )
            })}
          </div>

          <div className="rounded-card border border-border p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Pratinjau di kedua tema
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['terang', 'gelap'] as const).map((tema) => {
                const u = varianMerek(merek.warnaUtama)[tema]
                const a = varianMerek(merek.warnaAksen)[tema]
                return (
                  <div
                    key={tema}
                    className="space-y-3 rounded-card border border-border p-3.5"
                    style={{ background: tema === 'gelap' ? '#1f252f' : '#ffffff' }}
                  >
                    <span className="flex items-center gap-2.5">
                      {merek.logoTerang && tema === 'terang' ? (
                        <img src={merek.logoTerang} alt="" className="h-7 w-auto object-contain" />
                      ) : (
                        <Lambang ukuran={28} warnaUtama={u.isi} warnaAksen={a.isi} />
                      )}
                      <span
                        className="text-[15px] font-extrabold tracking-tight"
                        style={{ color: tema === 'gelap' ? '#e6ebf3' : '#2a3547' }}
                      >
                        {merek.nama}
                      </span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-control px-3 py-1.5 text-xs font-semibold" style={{ background: u.isi, color: u.teks }}>
                        Tombol utama
                      </span>
                      <span className="rounded-control px-3 py-1.5 text-xs font-semibold" style={{ background: a.isi, color: a.teks }}>
                        Aksen
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: tema === 'gelap' ? '#9aa7bd' : '#5a6a85' }}>
                      Mode {tema}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </IsiKartu>

        <KakiKartu className="justify-between">
          <Tombol
            varian="hantu"
            onClick={() => {
              setMerek(MEREK_BAWAAN)
              simpanMerek(MEREK_BAWAAN)
              toast.success('Identitas merek dikembalikan ke bawaan.')
            }}
          >
            <RotateCcw /> Kembalikan bawaan
          </Tombol>
          <Tombol
            onClick={() => {
              simpanMerek(merek)
              toast.success('Identitas merek tersimpan.')
            }}
          >
            <Save /> Simpan perubahan
          </Tombol>
        </KakiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/pengaturan/merek')({ component: PengaturanMerek })
