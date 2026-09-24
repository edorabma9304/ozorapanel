/**
 * Kotak obrolan ruang: satu saluran untuk semua orang, satu untuk rekan setim.
 *
 * Melayang di pojok kanan bawah papan, tertutup secara bawaan supaya tidak
 * menutupi keputusan yang sedang berjalan. Lencana merah menandai pesan baru
 * selagi kotaknya tertutup.
 */
import { MessageCircle, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Masukan } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { WARNA_TIM_HEX } from './aset'
import { MAKS_HURUF_PESAN, type PesanObrolan, type Ruang, type SaluranObrolan } from './ruang'
import { timPeserta } from './ruang'

export function KotakObrolan({
  ruang,
  saya,
  onKirim,
}: {
  ruang: Ruang
  saya: string
  onKirim: (saluran: SaluranObrolan, teks: string) => void
}) {
  const [buka, setBuka] = useState(false)
  const [saluran, setSaluran] = useState<SaluranObrolan>('semua')
  const [teks, setTeks] = useState('')
  const [dibaca, setDibaca] = useState(ruang.obrolan.length)
  const daftarRef = useRef<HTMLOListElement>(null)

  const timSaya = timPeserta(ruang, saya)
  const pesan = ruang.obrolan.filter((m) => (saluran === 'semua' ? m.saluran === 'semua' : m.saluran === 'tim'))
  // Saat kotak terbuka semua pesan dianggap terbaca; penandanya diperbarui
  // di penanganan klik, bukan lewat efek.
  const belumDibaca = buka ? 0 : Math.max(0, ruang.obrolan.length - dibaca)

  // Gulir ke pesan terbaru saat isinya bertambah, saluran berganti, atau
  // kotaknya dibuka. Ketiganya diringkas jadi satu kunci supaya efek ini punya
  // satu dependensi yang benar-benar dibaca.
  const kunciGulir = `${saluran}:${buka}:${pesan.length}`
  const digulirKe = useRef('')
  useEffect(() => {
    const el = daftarRef.current
    if (!el || digulirKe.current === kunciGulir) return
    digulirKe.current = kunciGulir
    el.scrollTop = el.scrollHeight
  }, [kunciGulir])

  function kirim() {
    const bersih = teks.trim()
    if (!bersih) return
    onKirim(saluran, bersih)
    setTeks('')
  }

  if (!buka) {
    return (
      <div className="absolute bottom-3 right-3 z-10">
        <Tombol
          varian="garis"
          className="relative shadow-soft"
          onClick={() => {
            setDibaca(ruang.obrolan.length)
            setBuka(true)
          }}
        >
          <MessageCircle /> Obrolan
          {belumDibaca > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-danger-foreground">
              {belumDibaca > 9 ? '9+' : belumDibaca}
            </span>
          ) : null}
        </Tombol>
      </div>
    )
  }

  return (
    <div className="absolute bottom-3 right-3 z-10 flex h-[min(58vh,420px)] w-[min(92vw,22rem)] flex-col rounded-card border border-border bg-card shadow-raised">
      <div className="flex items-center gap-1 border-b border-border p-2">
        <SaluranTab aktif={saluran === 'semua'} onClick={() => setSaluran('semua')}>
          Semua
        </SaluranTab>
        <SaluranTab aktif={saluran === 'tim'} onClick={() => setSaluran('tim')} mati={timSaya === null}>
          Tim
        </SaluranTab>
        <span className="flex-1" />
        <Tombol
          varian="hantu"
          ukuran="ikon-sm"
          aria-label="Tutup obrolan"
          onClick={() => {
            setDibaca(ruang.obrolan.length)
            setBuka(false)
          }}
        >
          <X />
        </Tombol>
      </div>

      <ol ref={daftarRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scrollbar-thin" aria-live="polite">
        {pesan.length === 0 ? (
          <li className="text-xs text-muted-foreground">
            {saluran === 'tim'
              ? timSaya === null
                ? 'Duduk di kursi dulu untuk memakai obrolan tim.'
                : 'Belum ada pesan. Hanya rekan setim yang bisa membacanya.'
              : 'Belum ada pesan.'}
          </li>
        ) : (
          pesan.map((m) => <Baris key={m.id} pesan={m} ruang={ruang} saya={saya} />)
        )}
      </ol>

      <div className="flex gap-2 border-t border-border p-2">
        <Masukan
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') kirim()
          }}
          maxLength={MAKS_HURUF_PESAN}
          placeholder={saluran === 'tim' ? 'Pesan untuk rekan setim…' : 'Pesan untuk semua…'}
          aria-label={saluran === 'tim' ? 'Pesan tim' : 'Pesan semua'}
          disabled={saluran === 'tim' && timSaya === null}
          className="h-9"
        />
        <Tombol ukuran="ikon" aria-label="Kirim" onClick={kirim} disabled={!teks.trim()}>
          <Send />
        </Tombol>
      </div>
    </div>
  )
}

function SaluranTab({
  aktif, mati, onClick, children,
}: {
  aktif: boolean
  mati?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tombol varian={aktif ? 'halus' : 'hantu'} ukuran="sm" aria-pressed={aktif} disabled={mati} onClick={onClick}>
      {children}
    </Tombol>
  )
}

function Baris({ pesan, ruang, saya }: { pesan: PesanObrolan; ruang: Ruang; saya: string }) {
  const kursi = ruang.kursi.find((k) => k.peserta === pesan.peserta)
  const tim = kursi ? ruang.permainan?.tim[kursi.tim] : undefined
  const warna = tim ? WARNA_TIM_HEX[tim.warna] : null
  const sendiri = pesan.peserta === saya

  return (
    <li className={cn('text-sm', sendiri && 'text-right')}>
      <p className="text-xs text-muted-foreground">
        {warna ? (
          <span
            className="mr-1 inline-block size-2 rounded-full align-middle"
            style={{ background: warna.isi }}
            aria-hidden
          />
        ) : null}
        {pesan.nama}
        {pesan.saluran === 'tim' ? ' · tim' : ''}
      </p>
      <p
        className={cn(
          'mt-0.5 inline-block max-w-full whitespace-pre-wrap break-words rounded-control px-2.5 py-1.5 text-left',
          sendiri ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {pesan.teks}
      </p>
    </li>
  )
}
