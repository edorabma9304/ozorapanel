import { createFileRoute } from '@tanstack/react-router'
import { Check, Copy, ExternalLink, Globe, Save, Search, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KakiKartu, KepalaKartu } from '@/components/ui/kartu'
import { KolomForm } from '@/components/form/kolom'
import { Masukan, AreaTeks } from '@/components/ui/masukan'
import { Sakelar } from '@/components/ui/kendali'
import { Tombol } from '@/components/ui/tombol'
import { Lencana } from '@/components/ui/lencana'
import { Peringatan } from '@/components/ui/keadaan'
import { Tab, DaftarTab, PemicuTab, IsiTab } from '@/components/ui/lapisan'
import { cn } from '@/lib/utils'

const MAKS_JUDUL = 60
const MAKS_DESKRIPSI = 160

/** Layanan analitik yang skripnya disuntikkan lewat backend, bukan dari frontend. */
const LAYANAN = [
  {
    id: 'ga4',
    nama: 'Google Analytics 4',
    ket: 'ID pengukuran, diawali G-',
    contoh: 'G-XXXXXXXXXX',
    pola: /^G-[A-Z0-9]{6,12}$/,
    tautan: 'https://analytics.google.com',
  },
  {
    id: 'gtm',
    nama: 'Google Tag Manager',
    ket: 'ID kontainer, diawali GTM-',
    contoh: 'GTM-XXXXXXX',
    pola: /^GTM-[A-Z0-9]{5,10}$/,
    tautan: 'https://tagmanager.google.com',
  },
  {
    id: 'gsc',
    nama: 'Google Search Console',
    ket: 'Kode verifikasi meta tag',
    contoh: 'abcdef1234567890',
    pola: /^[A-Za-z0-9_-]{20,60}$/,
    tautan: 'https://search.google.com/search-console',
  },
  {
    id: 'bing',
    nama: 'Bing Webmaster Tools',
    ket: 'Kode verifikasi meta tag',
    contoh: '0123456789ABCDEF',
    pola: /^[A-Za-z0-9]{16,40}$/,
    tautan: 'https://www.bing.com/webmasters',
  },
  {
    id: 'pixel',
    nama: 'Meta Pixel',
    ket: 'ID piksel Facebook, 15–16 digit',
    contoh: '123456789012345',
    pola: /^\d{15,16}$/,
    tautan: 'https://business.facebook.com/events_manager',
  },
] as const

const ROBOTS_BAWAAN = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://ozora.id/sitemap.xml`

function PengaturanSeo() {
  const [judul, setJudul] = useState('Ozora Panel — Kelola operasional usaha Anda')
  const [deskripsi, setDeskripsi] = useState(
    'Pesanan, stok, keuangan, dan tim dalam satu panel. Hak akses per peran, mode gelap, antarmuka Bahasa Indonesia.',
  )
  const [domain, setDomain] = useState('https://ozora.id')
  const [kode, setKode] = useState<Record<string, string>>({ ga4: 'G-4XZ8QK1D2P' })
  const [indeks, setIndeks] = useState(true)
  const [robots, setRobots] = useState(ROBOTS_BAWAAN)

  const panjangJudul = judul.length
  const panjangDeskripsi = deskripsi.length

  async function salin(teks: string, label: string) {
    try {
      await navigator.clipboard.writeText(teks)
      toast.success(`${label} disalin.`)
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  return (
    <>
      <Peringatan varian="perhatian" judul="Skrip dipasang dari server, bukan dari peramban">
        Panel ini hanya menyimpan ID-nya. Backend Anda yang menyuntikkan tag ke
        dalam HTML. Memasukkan skrip pihak ketiga langsung dari frontend membuka
        celah XSS dan tidak akan lolos Content Security Policy yang ketat.
      </Peringatan>

      <Kartu>
        <IsiKartu>
          <Tab defaultValue="meta">
            <DaftarTab>
              <PemicuTab value="meta"><Search /> Meta &amp; pratinjau</PemicuTab>
              <PemicuTab value="analitik"><Globe /> Analitik &amp; verifikasi</PemicuTab>
              <PemicuTab value="indeks">Robots &amp; sitemap</PemicuTab>
            </DaftarTab>

            {/* ---------------- Meta ---------------- */}
            <IsiTab value="meta">
              <div className="space-y-4">
                <KolomForm
                  id="s-judul"
                  label="Judul halaman"
                  wajib
                  galat={panjangJudul > MAKS_JUDUL ? `Terlalu panjang — Google memotong di sekitar ${MAKS_JUDUL} karakter.` : undefined}
                  petunjuk={`${panjangJudul} / ${MAKS_JUDUL} karakter`}
                >
                  <Masukan id="s-judul" value={judul} onChange={(e) => setJudul(e.target.value)} aria-invalid={panjangJudul > MAKS_JUDUL} />
                </KolomForm>

                <KolomForm
                  id="s-deskripsi"
                  label="Deskripsi meta"
                  galat={panjangDeskripsi > MAKS_DESKRIPSI ? `Terlalu panjang — batas aman ${MAKS_DESKRIPSI} karakter.` : undefined}
                  petunjuk={`${panjangDeskripsi} / ${MAKS_DESKRIPSI} karakter`}
                >
                  <AreaTeks id="s-deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="min-h-24" aria-invalid={panjangDeskripsi > MAKS_DESKRIPSI} />
                </KolomForm>

                <div className="grid gap-4 sm:grid-cols-2">
                  <KolomForm id="s-domain" label="Domain kanonis" wajib>
                    <Masukan id="s-domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
                  </KolomForm>
                  <KolomForm id="s-og" label="Gambar Open Graph" petunjuk="Ukuran ideal 1200×630 piksel.">
                    <Masukan id="s-og" placeholder="https://ozora.id/og.jpg" />
                  </KolomForm>
                </div>

                {/* Pratinjau hasil pencarian */}
                <div className="rounded-card border border-border p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Pratinjau di hasil pencarian
                  </p>
                  <div className="max-w-2xl">
                    <p className="truncate text-xs text-muted-foreground">{domain}</p>
                    <p className="mt-0.5 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">
                      {judul.slice(0, MAKS_JUDUL)}
                      {panjangJudul > MAKS_JUDUL ? '…' : ''}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {deskripsi.slice(0, MAKS_DESKRIPSI)}
                      {panjangDeskripsi > MAKS_DESKRIPSI ? '…' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Tombol onClick={() => toast.success('Pengaturan meta tersimpan.')}>
                    <Save /> Simpan
                  </Tombol>
                </div>
              </div>
            </IsiTab>

            {/* ---------------- Analitik ---------------- */}
            <IsiTab value="analitik">
              <div className="space-y-4">
                {LAYANAN.map((l) => {
                  const nilai = kode[l.id] ?? ''
                  const valid = nilai === '' || l.pola.test(nilai)
                  return (
                    <div key={l.id} className="rounded-card border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 text-sm font-bold">
                            {l.nama}
                            {nilai && valid ? (
                              <Lencana warna="success" ukuran="sm"><Check className="size-3" /> Terhubung</Lencana>
                            ) : (
                              <Lencana warna="netral" ukuran="sm">Belum diisi</Lencana>
                            )}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{l.ket}</p>
                        </div>
                        <Tombol varian="hantu" ukuran="sm" asChild>
                          <a href={l.tautan} target="_blank" rel="noreferrer noopener">
                            Buka konsol <ExternalLink />
                          </a>
                        </Tombol>
                      </div>

                      <div className="mt-3">
                        <Masukan
                          value={nilai}
                          onChange={(e) => setKode((k) => ({ ...k, [l.id]: e.target.value.trim() }))}
                          placeholder={l.contoh}
                          className="font-mono"
                          aria-label={`Kode ${l.nama}`}
                          aria-invalid={!valid}
                        />
                        {!valid ? (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger-kuat" role="alert">
                            <TriangleAlert className="size-3.5" />
                            Format tidak sesuai. Contoh yang benar: {l.contoh}
                          </p>
                        ) : null}
                      </div>

                      {l.id === 'gsc' && nilai && valid ? (
                        <div className="mt-3 flex items-center gap-2 rounded-card bg-muted p-2.5">
                          <code className="min-w-0 flex-1 truncate font-mono text-xs">
                            {`<meta name="google-site-verification" content="${nilai}" />`}
                          </code>
                          <Tombol
                            varian="hantu"
                            ukuran="ikon-sm"
                            aria-label="Salin meta tag"
                            onClick={() => void salin(`<meta name="google-site-verification" content="${nilai}" />`, 'Meta tag')}
                          >
                            <Copy />
                          </Tombol>
                        </div>
                      ) : null}
                    </div>
                  )
                })}

                <div className="flex justify-end">
                  <Tombol onClick={() => toast.success('Kode integrasi tersimpan.')}>
                    <Save /> Simpan
                  </Tombol>
                </div>
              </div>
            </IsiTab>

            {/* ---------------- Robots & sitemap ---------------- */}
            <IsiTab value="indeks">
              <div className="space-y-4">
                <label
                  htmlFor="s-indeks"
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-6 rounded-card border p-4',
                    indeks ? 'border-border' : 'border-danger/40 bg-danger-soft',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Izinkan mesin pencari mengindeks</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {indeks
                        ? 'Situs publik Anda muncul di hasil pencarian.'
                        : 'Seluruh halaman diberi noindex — situs tidak akan muncul di Google.'}
                    </span>
                  </span>
                  <Sakelar id="s-indeks" checked={indeks} onCheckedChange={setIndeks} />
                </label>

                {!indeks ? (
                  <Peringatan varian="bahaya" judul="Pengindeksan dimatikan">
                    Pastikan ini disengaja. Panel admin memang sebaiknya noindex, tetapi
                    situs publik yang ter-noindex akan hilang dari Google dalam hitungan hari.
                  </Peringatan>
                ) : null}

                <KolomForm id="s-robots" label="Isi robots.txt" petunjuk="Disajikan di /robots.txt oleh backend.">
                  <AreaTeks
                    id="s-robots"
                    value={robots}
                    onChange={(e) => setRobots(e.target.value)}
                    className="min-h-44 font-mono text-xs"
                  />
                </KolomForm>

                <div className="rounded-card border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Peta situs (sitemap.xml)</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Dibuat ulang otomatis setiap ada halaman atau artikel baru.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Tombol varian="garis" ukuran="sm" asChild>
                        <a href={`${domain}/sitemap.xml`} target="_blank" rel="noreferrer noopener">
                          Lihat <ExternalLink />
                        </a>
                      </Tombol>
                      <Tombol ukuran="sm" onClick={() => toast.success('Peta situs dibuat ulang.')}>
                        Buat ulang
                      </Tombol>
                    </div>
                  </div>
                </div>

                <KakiKartu className="justify-end px-0 pb-0">
                  <Tombol onClick={() => toast.success('Pengaturan indeks tersimpan.')}>
                    <Save /> Simpan
                  </Tombol>
                </KakiKartu>
              </div>
            </IsiTab>
          </Tab>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Ringkasan kesehatan SEO</JudulKartu>
            <DeskripsiKartu>Pemeriksaan cepat yang paling sering terlewat</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="space-y-2.5">
          {[
            { label: 'Judul di bawah 60 karakter', ok: panjangJudul <= MAKS_JUDUL && panjangJudul > 0 },
            { label: 'Deskripsi meta terisi dan di bawah 160 karakter', ok: panjangDeskripsi > 0 && panjangDeskripsi <= MAKS_DESKRIPSI },
            { label: 'Domain kanonis memakai HTTPS', ok: domain.startsWith('https://') },
            { label: 'Analitik terpasang', ok: Boolean(kode['ga4'] || kode['gtm']) },
            { label: 'Verifikasi Search Console terisi', ok: Boolean(kode['gsc']) },
            { label: 'Pengindeksan diizinkan', ok: indeks },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full',
                  c.ok ? 'bg-success-soft text-success-kuat' : 'bg-warning-soft text-warning-kuat',
                )}
              >
                {c.ok ? <Check className="size-3" strokeWidth={3} /> : <TriangleAlert className="size-3" />}
              </span>
              <span className={c.ok ? '' : 'text-muted-foreground'}>{c.label}</span>
            </div>
          ))}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/pengaturan/seo')({ component: PengaturanSeo })
