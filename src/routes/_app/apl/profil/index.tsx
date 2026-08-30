import { createFileRoute } from '@tanstack/react-router'
import { Globe, GraduationCap, Heart, Image as IkonGambar, Mail, MapPin, MessageSquare, Send, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { IsiKartu, Kartu, KepalaKartu, JudulKartu } from '@/components/ui/kartu'
import { Avatar } from '@/components/ui/avatar'
import { Tombol } from '@/components/ui/tombol'
import { AreaTeks } from '@/components/ui/masukan'
import { Pemisah } from '@/components/ui/lapisan'
import { formatAngka, formatWaktuRelatif } from '@/lib/format'
import { useAuth } from '@/lib/auth'
import { FOTO_CONTOH, KIRIMAN_CONTOH, PENGIKUT_CONTOH } from '@/lib/adapter/data-contoh'

function LiniMasaProfil() {
  const { pengguna } = useAuth()
  const [draf, setDraf] = useState('')
  const [kiriman, setKiriman] = useState(KIRIMAN_CONTOH)
  const [disukai, setDisukai] = useState<string[]>([])

  function kirim(e: React.FormEvent) {
    e.preventDefault()
    const isi = draf.trim()
    if (!isi) return
    setKiriman((k) => [
      {
        id: `baru-${Date.now()}`,
        penulis: pengguna?.nama ?? 'Saya',
        avatar: pengguna?.avatar_url ?? null,
        waktu: new Date().toISOString(),
        isi,
        gambar: null,
        suka: 0,
        komentar: 0,
      },
      ...k,
    ])
    setDraf('')
    toast.success('Kiriman diterbitkan.')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Kolom kiri: perkenalan + foto */}
      <div className="space-y-4">
        <Kartu>
          <KepalaKartu>
            <JudulKartu>Perkenalan</JudulKartu>
          </KepalaKartu>
          <IsiKartu className="space-y-4 text-sm">
            <p className="leading-relaxed text-muted-foreground">
              Halo, saya {pengguna?.nama}. Sehari-hari mengurus operasional dan memastikan
              pesanan sampai tepat waktu.
            </p>
            <Pemisah />
            <dl className="space-y-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
                <dd>Universitas Gadjah Mada</dd>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <dd className="truncate">{pengguna?.email}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="size-4 shrink-0 text-muted-foreground" />
                <dd>www.ozora.id</dd>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <dd>Yogyakarta, Indonesia</dd>
              </div>
            </dl>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <JudulKartu>Foto</JudulKartu>
            <span className="text-xs text-muted-foreground">{FOTO_CONTOH.length} berkas</span>
          </KepalaKartu>
          <IsiKartu>
            <div className="grid grid-cols-3 gap-2">
              {FOTO_CONTOH.slice(0, 9).map((f) => (
                <img
                  key={f.id}
                  src={f.gambar}
                  alt={f.judul}
                  width={120}
                  height={120}
                  loading="lazy"
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          </IsiKartu>
        </Kartu>

        <Kartu>
          <KepalaKartu>
            <JudulKartu>Saran mengikuti</JudulKartu>
          </KepalaKartu>
          <IsiKartu className="space-y-3">
            {PENGIKUT_CONTOH.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar nama={p.nama} src={p.avatar} ukuran="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.nama}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.jabatan}</p>
                </div>
                <Tombol varian="halus" ukuran="sm">Ikuti</Tombol>
              </div>
            ))}
          </IsiKartu>
        </Kartu>
      </div>

      {/* Kolom kanan: penyusun kiriman + lini masa */}
      <div className="space-y-4 lg:col-span-2">
        <Kartu>
          <IsiKartu>
            <form onSubmit={kirim} className="flex gap-3">
              <Avatar nama={pengguna?.nama ?? 'Saya'} src={pengguna?.avatar_url} ukuran="md" />
              <div className="flex-1">
                <AreaTeks
                  value={draf}
                  onChange={(e) => setDraf(e.target.value)}
                  placeholder="Bagikan sesuatu ke tim…"
                  className="min-h-20"
                  aria-label="Tulis kiriman"
                />
                <div className="mt-3 flex items-center justify-between">
                  <Tombol type="button" varian="hantu" ukuran="sm">
                    <IkonGambar /> Foto
                  </Tombol>
                  <Tombol type="submit" ukuran="sm" disabled={!draf.trim()}>
                    <Send /> Kirim
                  </Tombol>
                </div>
              </div>
            </form>
          </IsiKartu>
        </Kartu>

        {kiriman.map((k) => {
          const suka = disukai.includes(k.id)
          return (
            <Kartu key={k.id}>
              <IsiKartu>
                <div className="flex items-center gap-3">
                  <Avatar nama={k.penulis} src={k.avatar} ukuran="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{k.penulis}</p>
                    <p className="text-xs text-muted-foreground">{formatWaktuRelatif(k.waktu)}</p>
                  </div>
                  <Tombol varian="hantu" ukuran="ikon-sm" aria-label="Bagikan">
                    <Share2 />
                  </Tombol>
                </div>

                <p className="mt-4 text-sm leading-relaxed">{k.isi}</p>

                {k.gambar ? (
                  <img
                    src={k.gambar}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    className="mt-4 aspect-video w-full rounded-card object-cover"
                  />
                ) : null}

                <Pemisah className="my-4" />

                <div className="flex items-center gap-1">
                  <Tombol
                    varian="hantu"
                    ukuran="sm"
                    onClick={() => setDisukai((d) => (suka ? d.filter((x) => x !== k.id) : [...d, k.id]))}
                    aria-pressed={suka}
                  >
                    <Heart className={suka ? 'fill-danger text-danger-kuat' : ''} />
                    {formatAngka(k.suka + (suka ? 1 : 0))}
                  </Tombol>
                  <Tombol varian="hantu" ukuran="sm">
                    <MessageSquare /> {formatAngka(k.komentar)}
                  </Tombol>
                </div>
              </IsiKartu>
            </Kartu>
          )
        })}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/apl/profil/')({ component: LiniMasaProfil })
