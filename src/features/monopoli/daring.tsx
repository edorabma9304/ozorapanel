/**
 * Mode daring: beberapa orang, satu ruang, satu papan.
 *
 * Tiga layar berurutan — pilih (buat atau gabung), lobi (kursi & pengaturan),
 * lalu arena. Keadaan ruang datang dari `Transport`, jadi berkas ini tidak
 * peduli backend-nya apa. Otorisasi sungguhan ada di sisi yang menjalankan
 * `langkahRuang`, bukan di sini; tombol yang dimatikan di layar hanya bantuan
 * tampilan.
 */
import { Check, Copy, DoorOpen, LogIn, Play, Plus, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Lencana } from '@/components/ui/lencana'
import { Label, Masukan, PetunjukKolom } from '@/components/ui/masukan'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { Arena } from './arena'
import { PionCadangan, WARNA_TIM_HEX } from './aset'
import { KotakObrolan } from './obrolan'
import { TIM_MAKS, TIM_MIN } from './papan'
import { pengaturanBawaan } from './pengaturan'
import { PANJANG_KODE, type Ruang, semuaKursiTerisi } from './ruang'
import { buatKode, idPeserta, transportSiaran, type StatusTransport, type Transport } from './transport'
import type { PengaturanPermainan } from './tipe'

export type FabrikTransport = (opsi: {
  kode: string
  nama: string
  /** Terisi hanya saat membuat ruang baru. */
  pengaturan?: PengaturanPermainan
}) => Transport

type Keadaan = { ruang: Ruang | null; status: StatusTransport; galat: string | null }

const KOSONG: Keadaan = { ruang: null, status: 'menyambung', galat: null }

export function PermainanDaring({
  kepala,
  buatTransport = transportSiaran,
  catatanTransport,
  onGantiMode,
}: {
  kepala?: ReactNode
  /** Kembali ke pemilihan mode main. */
  onGantiMode?: () => void
  /** Ganti ini untuk memakai backend lain. Bawaannya antar tab di satu browser. */
  buatTransport?: FabrikTransport
  /** Keterangan kecil di layar pilih, mis. batasan transport yang dipakai. */
  catatanTransport?: ReactNode
}) {
  const [transport, setTransport] = useState<Transport | null>(null)
  const [keadaan, setKeadaan] = useState<Keadaan>(KOSONG)
  const transportRef = useRef<Transport | null>(null)

  useEffect(() => {
    transportRef.current = transport
    if (!transport) return
    return transport.langgan(setKeadaan)
  }, [transport])

  useEffect(() => () => transportRef.current?.tutup(), [])

  function sambung(opsi: { kode: string; nama: string; pengaturan?: PengaturanPermainan }) {
    transportRef.current?.tutup()
    setKeadaan(KOSONG)
    const baru = buatTransport(opsi)
    setTransport(baru)
    baru.kirim({ jenis: 'gabung', nama: opsi.nama })
  }

  function keluar() {
    transportRef.current?.tutup()
    transportRef.current = null
    setTransport(null)
    setKeadaan(KOSONG)
  }

  const { ruang, status, galat } = keadaan

  if (!transport || (!ruang && status !== 'menyambung')) {
    return (
      <>
        {kepala}
        <LayarPilih
          onSambung={sambung}
          galat={status === 'tidak-ada' ? 'Ruang dengan kode itu tidak ditemukan.' : null}
          catatan={catatanTransport}
          onGantiMode={onGantiMode}
        />
      </>
    )
  }

  if (!ruang) {
    return (
      <>
        {kepala}
        <p className="rounded-card border border-border bg-card p-6 text-sm text-muted-foreground shadow-soft">
          Menyambung ke ruang {transport.kode}…
        </p>
      </>
    )
  }

  if (!ruang.permainan) {
    return (
      <>
        {kepala}
        <Lobi ruang={ruang} saya={transport.id} galat={galat} kirim={transport.kirim} onKeluar={keluar} />
      </>
    )
  }

  const kursiSaya = ruang.kursi.filter((k) => k.peserta === transport.id)
  const kursiAktif = ruang.kursi.find((k) => k.pemain === ruang.permainan!.pemainAktif)
  const giliranSaya = kursiAktif?.peserta === transport.id
  const pemainAktif = ruang.permainan.pemain[ruang.permainan.pemainAktif]

  return (
    <>
      {kepala}
      <Arena
        permainan={ruang.permainan}
        onAksi={(aksi) => transport.kirim({ jenis: 'aksi', aksi })}
        galat={galat}
        bolehAksi={giliranSaya}
        onKeluar={keluar}
        onPermainanBaru={() => {
          if (ruang.tuanRumah !== transport.id) return
          if (window.confirm('Bubarkan permainan dan kembali ke lobi?')) transport.kirim({ jenis: 'bubar' })
        }}
        lapisan={
          <>
            {!giliranSaya && ruang.permainan.fase.jenis !== 'selesai' ? (
              <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-card border border-border bg-card/95 px-3 py-1.5 text-sm font-semibold shadow-soft backdrop-blur">
                Giliran {pemainAktif?.nama ?? '—'}
                {kursiSaya.length === 0 ? ' · Anda menonton' : ''}
              </div>
            ) : null}
            <KotakObrolan
              ruang={ruang}
              saya={transport.id}
              onKirim={(saluran, teks) => transport.kirim({ jenis: 'obrol', saluran, teks })}
            />
          </>
        }
      />
    </>
  )
}

// ------------------------------------------------------------------ Layar pilih
function LayarPilih({
  onSambung, galat, catatan, onGantiMode,
}: {
  onSambung: (o: { kode: string; nama: string; pengaturan?: PengaturanPermainan }) => void
  galat: string | null
  catatan?: ReactNode
  onGantiMode?: () => void
}) {
  const [nama, setNama] = useState('')
  const [kode, setKode] = useState('')
  const namaBersih = nama.trim() || 'Pemain'

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <section className="sm:col-span-2 rounded-card border border-border bg-card p-5 shadow-soft">
        <Label htmlFor="nama-pemain">Nama Anda</Label>
        <Masukan
          id="nama-pemain"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama yang dilihat pemain lain"
          maxLength={24}
          className="mt-1"
        />
        {catatan ? <PetunjukKolom>{catatan}</PetunjukKolom> : null}
      </section>

      <section className="rounded-card border border-border bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <Plus className="size-4" /> Buat ruang
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anda jadi tuan rumah. Bagikan kode yang muncul supaya teman bisa bergabung.
        </p>
        <Tombol
          className="mt-4 w-full"
          onClick={() => onSambung({ kode: buatKode(), nama: namaBersih, pengaturan: pengaturanBawaan(2) })}
        >
          <Plus /> Buat ruang baru
        </Tombol>
      </section>

      <section className="rounded-card border border-border bg-card p-5 shadow-soft">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <LogIn className="size-4" /> Gabung ruang
        </h2>
        <Label htmlFor="kode-ruang" className="mt-3 block">Kode ruang</Label>
        <Masukan
          id="kode-ruang"
          value={kode}
          onChange={(e) => setKode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PANJANG_KODE))}
          placeholder="ABCDE"
          className="mt-1 font-mono text-lg tracking-[0.3em]"
        />
        {galat ? <PetunjukKolom galat>{galat}</PetunjukKolom> : null}
        <Tombol
          varian="garis"
          className="mt-4 w-full"
          disabled={kode.length !== PANJANG_KODE}
          onClick={() => onSambung({ kode, nama: namaBersih })}
        >
          <LogIn /> Gabung
        </Tombol>
      </section>

      {onGantiMode ? (
        <div className="sm:col-span-2 text-center">
          <Tombol varian="hantu" onClick={onGantiMode}>
            Ganti mode main
          </Tombol>
        </div>
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ Lobi
function Lobi({
  ruang, saya, galat, kirim, onKeluar,
}: {
  ruang: Ruang
  saya: string
  galat: string | null
  kirim: Transport['kirim']
  onKeluar: () => void
}) {
  const tuanRumah = ruang.tuanRumah === saya
  const siap = semuaKursiTerisi(ruang)
  const [tersalin, setTersalin] = useState(false)

  const timDaftar = useMemo(() => {
    const per: Array<{ tim: number; kursi: typeof ruang.kursi }> = []
    for (const k of ruang.kursi) {
      ;(per[k.tim] ??= { tim: k.tim, kursi: [] }).kursi.push(k)
    }
    return per
  }, [ruang.kursi])

  function ubahPengaturan(ubah: Partial<PengaturanPermainan>) {
    kirim({ jenis: 'atur', pengaturan: { ...ruang.pengaturan, ...ubah } })
  }

  async function salinKode() {
    try {
      await navigator.clipboard.writeText(ruang.kode)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 1800)
    } catch {
      // Beberapa browser menolak tanpa izin; kode tetap terlihat di layar.
    }
  }

  return (
    <div className="relative grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-card p-5 shadow-soft">
          <div>
            <p className="text-sm text-muted-foreground">Kode ruang</p>
            <p className="font-mono text-3xl font-bold tracking-[0.35em]">{ruang.kode}</p>
          </div>
          <div className="flex gap-2">
            <Tombol varian="garis" onClick={salinKode}>
              {tersalin ? <Check /> : <Copy />} {tersalin ? 'Tersalin' : 'Salin kode'}
            </Tombol>
            <Tombol varian="garis" onClick={onKeluar}>
              <DoorOpen /> Keluar
            </Tombol>
          </div>
        </section>

        {tuanRumah ? (
          <section className="rounded-card border border-border bg-card p-5 shadow-soft">
            <h2 className="text-base font-bold">Jumlah tim</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dua pemain per tim, jadi butuh {ruang.pengaturan.jumlahTim * 2} orang. Papan {8 + 8 * ruang.pengaturan.jumlahTim} petak.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: TIM_MAKS - TIM_MIN + 1 }, (_, i) => i + TIM_MIN).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={n === ruang.pengaturan.jumlahTim}
                  onClick={() => ubahPengaturan(pengaturanBawaan(n))}
                  className={cn(
                    'h-10 w-10 rounded-control border text-sm font-bold transition-colors',
                    n === ruang.pengaturan.jumlahTim
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input bg-card hover:bg-muted',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          {timDaftar.map(({ tim, kursi }) => {
            const warna = WARNA_TIM_HEX[ruang.pengaturan.warnaTim[tim]!]
            return (
              <div
                key={tim}
                className="rounded-card border border-border bg-card p-4 shadow-soft"
                style={{ borderTop: `5px solid ${warna.isi}` }}
              >
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full border border-black/25" style={{ background: warna.isi }} aria-hidden />
                  {tuanRumah ? (
                    <Masukan
                      value={ruang.pengaturan.namaTim[tim] ?? ''}
                      onChange={(e) => {
                        const namaTim = [...ruang.pengaturan.namaTim]
                        namaTim[tim] = e.target.value
                        ubahPengaturan({ namaTim })
                      }}
                      aria-label={`Nama tim ${tim + 1}`}
                      className="h-8 max-w-48"
                    />
                  ) : (
                    <p className="font-bold">{ruang.pengaturan.namaTim[tim]}</p>
                  )}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {kursi.map((k) => {
                    const orang = ruang.peserta.find((p) => p.id === k.peserta)
                    const punyaSaya = k.peserta === saya
                    return (
                      <div
                        key={k.pemain}
                        className={cn(
                          'flex items-center gap-2 rounded-control border p-2',
                          punyaSaya ? 'border-primary bg-primary-soft/40' : 'border-border',
                        )}
                      >
                        <svg width={32} height={32} viewBox="0 0 100 100" aria-hidden>
                          <PionCadangan warna={ruang.pengaturan.warnaTim[tim]!} bentuk={k.nomor === 0 ? 'bulat' : 'permata'} />
                        </svg>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {orang ? orang.nama : <span className="text-muted-foreground">kursi kosong</span>}
                        </span>
                        {punyaSaya ? (
                          <Tombol varian="hantu" ukuran="sm" onClick={() => kirim({ jenis: 'berdiri', kursi: k.pemain })}>
                            Berdiri
                          </Tombol>
                        ) : orang ? null : (
                          <Tombol varian="halus" ukuran="sm" onClick={() => kirim({ jenis: 'duduk', kursi: k.pemain })}>
                            Duduk
                          </Tombol>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        {galat ? (
          <p role="alert" className="rounded-card border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold text-danger-kuat">
            {galat}
          </p>
        ) : null}

        {tuanRumah ? (
          <Tombol ukuran="lg" className="w-full" disabled={!siap} onClick={() => kirim({ jenis: 'mulai' })}>
            <Play /> Mulai permainan
          </Tombol>
        ) : (
          <p className="rounded-card border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            Menunggu tuan rumah memulai permainan.
          </p>
        )}
        {!siap ? (
          <p className="text-center text-sm text-muted-foreground">
            Masih ada kursi kosong. Semua kursi harus terisi sebelum mulai.
          </p>
        ) : null}
      </div>

      <aside className="rounded-card border border-border bg-card p-4 shadow-soft">
        <h2 className="flex items-center gap-2 text-sm font-bold">
          <Users className="size-4" /> Di ruang ini ({ruang.peserta.length})
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {ruang.peserta.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate">{p.nama}</span>
              {p.id === ruang.tuanRumah ? <Lencana warna="primary" ukuran="sm">tuan rumah</Lencana> : null}
              {p.id === saya ? <Lencana ukuran="sm">Anda</Lencana> : null}
            </li>
          ))}
        </ul>
      </aside>

      <div className="relative min-h-0">
        <KotakObrolan ruang={ruang} saya={saya} onKirim={(saluran, teks) => kirim({ jenis: 'obrol', saluran, teks })} />
      </div>
    </div>
  )
}

export { idPeserta }
