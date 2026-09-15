/**
 * Panel samping permainan: kartu tim, aksi giliran, dan catatan peristiwa.
 * Semua tombol hanya mengirim `Aksi` ke induk; tidak ada logika permainan di sini.
 */
import { ArrowDownToLine, ArrowUpFromLine, Building2, Dice5, Flag, Hammer, Plane, ShoppingCart, SkipForward, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Lencana } from '@/components/ui/lencana'
import { Masukan } from '@/components/ui/masukan'
import { Progres } from '@/components/ui/progres'
import { Tombol } from '@/components/ui/tombol'
import { cn } from '@/lib/utils'
import { Aset, IkonPetiCadangan, IkonTanyaCadangan, NAMA_ASET, PionCadangan, WARNA_TIM_HEX } from './aset'
import { alasanTakBolehBangun, anggotaTim, kekayaanTim, papanDari, pemainAktif, sewaPetak } from './mesin'
import { DENDA_PENJARA, adalahProperti } from './papan'
import { TINGKAT_BANGUNAN, type Aksi, type Permainan, type PetakBandara, type PetakProperti } from './tipe'

export const uang = (n: number) => `$${n.toLocaleString('id-ID')}`

function PionKecil({ permainan, pemainId, ukuran = 28 }: { permainan: Permainan; pemainId: number; ukuran?: number }) {
  const pm = permainan.pemain[pemainId]!
  const tim = permainan.tim[pm.tim]!
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 100 100" aria-hidden>
      <Aset nama={NAMA_ASET.pion(tim.warna, pm.bentuk)} lebar={100} tinggi={100} cadangan={<PionCadangan warna={tim.warna} bentuk={pm.bentuk} />} />
    </svg>
  )
}

// ------------------------------------------------------------------ Panel tim
export function PanelTim({ permainan, onAksi }: { permainan: Permainan; onAksi: (a: Aksi) => void }) {
  const papan = papanDari(permainan)
  const aktif = pemainAktif(permainan)
  return (
    <div className="space-y-3">
      {permainan.tim.map((tim) => {
        const warna = WARNA_TIM_HEX[tim.warna]
        const kekayaan = kekayaanTim(permainan, tim.id)
        const properti = Object.entries(permainan.milik).filter(([, m]) => m.tim === tim.id)
        const bangunan = properti.reduce((a, [, m]) => a + m.tingkat, 0)
        const giliranTim = aktif.tim === tim.id && permainan.fase.jenis !== 'selesai'
        return (
          <div
            key={tim.id}
            className={cn(
              'rounded-card border bg-card p-3 shadow-soft transition-shadow',
              giliranTim ? 'border-primary ring-2 ring-primary/25' : 'border-border',
              tim.gugur && 'opacity-60',
            )}
            style={{ borderLeftWidth: 6, borderLeftColor: warna.isi }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full border border-black/20" style={{ background: warna.isi }} aria-hidden />
                <p className="font-bold">{tim.nama}</p>
                {giliranTim ? <Lencana warna="primary" ukuran="sm">giliran</Lencana> : null}
                {tim.gugur ? <Lencana warna="danger" ukuran="sm">gugur</Lencana> : null}
              </div>
              <p className="text-sm font-bold">{uang(kekayaan)}</p>
            </div>

            {tim.gugur ? (
              <p className="mt-1 text-xs text-muted-foreground">{tim.alasanGugur}</p>
            ) : (
              <>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-control bg-muted px-2 py-1.5">
                    <p className="text-muted-foreground">Kas tim</p>
                    <p className="font-bold">{uang(tim.kas)}</p>
                  </div>
                  {anggotaTim(permainan, tim.id).map((pm) => (
                    <div key={pm.id} className={cn('rounded-control bg-muted px-2 py-1.5', pm.id === aktif.id && 'ring-1 ring-primary')}>
                      <p className="flex items-center gap-1 truncate text-muted-foreground">
                        <PionKecil permainan={permainan} pemainId={pm.id} ukuran={16} />
                        <span className="truncate">{pm.nama}</span>
                      </p>
                      <p className="font-bold">
                        {uang(pm.uang)}
                        {pm.diPenjara ? ' 🔒' : ''}
                        {pm.kartuBebas > 0 ? ` 🎟️${pm.kartuBebas}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1.5">
                  <Progres
                    tebal="sm"
                    warna="success"
                    nilai={(kekayaan / permainan.pengaturan.targetKekayaan) * 100}
                    label={<span className="text-xs">Kekayaan → {uang(permainan.pengaturan.targetKekayaan)}</span>}
                  />
                  <Progres
                    tebal="sm"
                    warna="danger"
                    nilai={(tim.kerugian / permainan.pengaturan.targetKerugian) * 100}
                    label={
                      <span className="text-xs">
                        Kerugian {uang(tim.kerugian)} / {uang(permainan.pengaturan.targetKerugian)}
                      </span>
                    }
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {properti.length} properti · {bangunan} bangunan · asal {papan.wilayah[tim.id]!.nama}
                  </span>
                  {permainan.fase.jenis !== 'selesai' ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-danger-kuat hover:underline"
                      onClick={() => {
                        if (window.confirm(`${tim.nama} menyerah? Semua properti kembali ke bank.`)) onAksi({ jenis: 'menyerah', tim: tim.id })
                      }}
                    >
                      <Flag className="size-3" /> menyerah
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ------------------------------------------------------------------ Panel aksi
export function PanelAksi({
  permainan, onAksi, sibuk, galat, petakDipilih, onPermainanBaru,
}: {
  permainan: Permainan
  onAksi: (a: Aksi) => void
  /** true selama animasi dadu/pion — semua tombol dimatikan. */
  sibuk: boolean
  galat: string | null
  petakDipilih: number | null
  onPermainanBaru: () => void
}) {
  const papan = papanDari(permainan)
  const pm = pemainAktif(permainan)
  const tim = permainan.tim[pm.tim]!
  const warna = WARNA_TIM_HEX[tim.warna]
  const fase = permainan.fase

  return (
    <div className="rounded-card border border-border bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b border-border p-4" style={{ borderTop: `5px solid ${warna.isi}` }}>
        <PionKecil permainan={permainan} pemainId={pm.id} ukuran={40} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Giliran {permainan.giliran} · {tim.nama}</p>
          <p className="truncate text-base font-bold">{pm.nama}</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-muted-foreground">Dompet</p>
          <p className="font-bold">{uang(pm.uang)}</p>
        </div>
        <div className="text-right text-xs">
          <p className="text-muted-foreground">Kas tim</p>
          <p className="font-bold">{uang(tim.kas)}</p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {galat ? (
          <p role="alert" className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger-kuat">
            {galat}
          </p>
        ) : null}

        {fase.jenis === 'lempar' ? (
          <Bagian judul={pm.diPenjara ? 'Di penjara' : 'Lempar dadu'}>
            {pm.diPenjara ? (
              <p className="text-sm text-muted-foreground">
                Bebas bila dadu kembar. Giliran ke-{pm.giliranPenjara + 1} dari 3; setelah itu denda {uang(DENDA_PENJARA)} otomatis.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Tombol ukuran="lg" disabled={sibuk} onClick={() => onAksi({ jenis: 'lempar' })} className="monopoli-tombol-utama">
                <Dice5 /> {pm.diPenjara ? 'Coba dadu kembar' : 'Lempar dadu'}
              </Tombol>
              {pm.diPenjara ? (
                <>
                  <Tombol varian="garis" disabled={sibuk} onClick={() => onAksi({ jenis: 'bayar-keluar-penjara' })}>
                    Bayar {uang(DENDA_PENJARA)}
                  </Tombol>
                  {pm.kartuBebas > 0 ? (
                    <Tombol varian="halus" disabled={sibuk} onClick={() => onAksi({ jenis: 'pakai-kartu-bebas' })}>
                      Pakai kartu bebas
                    </Tombol>
                  ) : null}
                </>
              ) : null}
            </div>
          </Bagian>
        ) : null}

        {fase.jenis === 'bergerak' ? (
          <Bagian judul="Pion bergerak">
            <p className="text-sm text-muted-foreground">
              {fase.langkah === 0 ? 'Terbang ke bandara tujuan…' : `${Math.abs(fase.langkah)} langkah ${fase.langkah < 0 ? 'mundur' : 'maju'}…`}
            </p>
          </Bagian>
        ) : null}

        {fase.jenis === 'tawaran' ? (
          <TawaranProperti permainan={permainan} petak={papan.petak[fase.petak] as PetakProperti | PetakBandara} sibuk={sibuk} onAksi={onAksi} />
        ) : null}

        {fase.jenis === 'kartu' ? (
          <Bagian judul={fase.kartu.jenis === 'kesempatan' ? 'Kartu Kesempatan' : 'Kartu Harta Karun'}>
            <div className="monopoli-kartu-muncul flex items-center gap-4">
              <svg width={84} height={116} viewBox="0 0 100 138" className="shrink-0 drop-shadow" aria-hidden>
                <rect x="2" y="2" width="96" height="134" rx="12" fill={fase.kartu.jenis === 'kesempatan' ? '#e91e63' : '#1e88e5'} stroke="#1f2a44" strokeWidth="4" />
                <Aset
                  nama={fase.kartu.jenis === 'kesempatan' ? NAMA_ASET.kartuKesempatan : NAMA_ASET.kartuHarta}
                  x={0}
                  y={0}
                  lebar={100}
                  tinggi={138}
                  cadangan={
                    <svg x="20" y="24" width="60" height="60" viewBox="0 0 100 100">
                      {fase.kartu.jenis === 'kesempatan' ? <IkonTanyaCadangan /> : <IkonPetiCadangan />}
                    </svg>
                  }
                />
              </svg>
              <p className="text-sm font-semibold leading-relaxed">{fase.kartu.teks}</p>
            </div>
            <Tombol disabled={sibuk} onClick={() => onAksi({ jenis: 'terapkan-kartu' })}>
              Jalankan kartu
            </Tombol>
          </Bagian>
        ) : null}

        {fase.jenis === 'terbang' ? (
          <Bagian judul="Terbang?">
            <p className="text-sm text-muted-foreground">Klik bandara yang berkedip di peta, atau pilih di bawah.</p>
            <div className="flex flex-wrap gap-2">
              {papan.indeks.bandara
                .filter((id) => id !== fase.dari)
                .map((id) => (
                  <Tombol key={id} varian="halus" ukuran="sm" disabled={sibuk} onClick={() => onAksi({ jenis: 'terbang', ke: id })}>
                    <Plane /> {papan.petak[id]!.nama}
                  </Tombol>
                ))}
              <Tombol varian="garis" ukuran="sm" disabled={sibuk} onClick={() => onAksi({ jenis: 'terbang', ke: null })}>
                Tetap di sini
              </Tombol>
            </div>
          </Bagian>
        ) : null}

        {fase.jenis === 'aksi' ? (
          <>
            <Pembangunan permainan={permainan} sibuk={sibuk} onAksi={onAksi} petakDipilih={petakDipilih} />
            <Transfer permainan={permainan} sibuk={sibuk} onAksi={onAksi} />
            <Tombol ukuran="lg" className="w-full monopoli-tombol-utama" disabled={sibuk} onClick={() => onAksi({ jenis: 'akhiri-giliran' })}>
              <SkipForward />
              {permainan.dadu && permainan.dadu[0] === permainan.dadu[1] && permainan.kembarBeruntun > 0 && !pm.diPenjara
                ? 'Selesai — lempar lagi (kembar)'
                : 'Akhiri giliran'}
            </Tombol>
          </>
        ) : null}

        {fase.jenis === 'selesai' ? (
          <Bagian judul="Permainan selesai">
            {fase.pemenang !== null ? (
              <p className="text-lg font-bold" style={{ color: WARNA_TIM_HEX[permainan.tim[fase.pemenang]!.warna].gelap }}>
                🏆 {permainan.tim[fase.pemenang]!.nama} menang!
              </p>
            ) : (
              <p className="text-lg font-bold">Tidak ada pemenang.</p>
            )}
            <p className="text-sm text-muted-foreground">{fase.alasan}.</p>
            <Tombol onClick={onPermainanBaru}>Permainan baru</Tombol>
          </Bagian>
        ) : null}
      </div>
    </div>
  )
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{judul}</h3>
      {children}
    </section>
  )
}

function TawaranProperti({
  permainan, petak, sibuk, onAksi,
}: {
  permainan: Permainan
  petak: PetakProperti | PetakBandara
  sibuk: boolean
  onAksi: (a: Aksi) => void
}) {
  const pm = pemainAktif(permainan)
  const tim = permainan.tim[pm.tim]!
  const mampu = tim.kas + pm.uang >= petak.harga
  const papan = papanDari(permainan)
  const wilayah = adalahProperti(petak) ? papan.wilayah[petak.wilayah] : null
  return (
    <Bagian judul="Properti tersedia">
      <div className="rounded-card border border-border bg-muted p-3">
        <p className="text-base font-bold">{petak.nama}</p>
        {wilayah ? <p className="text-xs text-muted-foreground">{wilayah.nama} · {wilayah.julukan}</p> : null}
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Harga</dt>
          <dd className="font-bold">{uang(petak.harga)}</dd>
          {adalahProperti(petak) ? (
            <>
              <dt className="text-muted-foreground">Sewa dasar</dt>
              <dd className="font-bold">{uang(petak.sewaDasar)}</dd>
              <dt className="text-muted-foreground">Sewa pencakar langit</dt>
              <dd className="font-bold">{uang(petak.sewaDasar * 45)}</dd>
              <dt className="text-muted-foreground">Biaya bangun</dt>
              <dd className="font-bold">{uang(petak.biayaBangun)} / tingkat</dd>
            </>
          ) : (
            <>
              <dt className="text-muted-foreground">Sewa</dt>
              <dd className="font-bold">$25 → $200</dd>
            </>
          )}
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          Dibayar dari kas tim ({uang(tim.kas)}); kekurangan diambil dari dompet {pm.nama} ({uang(pm.uang)}).
        </p>
      </div>
      <div className="flex gap-2">
        <Tombol varian="sukses" disabled={sibuk || !mampu} onClick={() => onAksi({ jenis: 'beli' })} className="flex-1">
          <ShoppingCart /> Beli {uang(petak.harga)}
        </Tombol>
        <Tombol varian="garis" disabled={sibuk} onClick={() => onAksi({ jenis: 'lewati' })}>
          Lewati
        </Tombol>
      </div>
      {!mampu ? <p className="text-xs text-danger-kuat">Uang tim tidak cukup. Lewati, atau setor dari rekan setelah giliran ini.</p> : null}
    </Bagian>
  )
}

function Pembangunan({
  permainan, sibuk, onAksi, petakDipilih,
}: {
  permainan: Permainan
  sibuk: boolean
  onAksi: (a: Aksi) => void
  petakDipilih: number | null
}) {
  const papan = papanDari(permainan)
  const pm = pemainAktif(permainan)
  const milikTim = papan.petak
    .filter((x): x is PetakProperti => adalahProperti(x) && permainan.milik[x.id]?.tim === pm.tim)
    .map((x) => ({ petak: x, tingkat: permainan.milik[x.id]!.tingkat, alasan: alasanTakBolehBangun(permainan, x.id, pm.tim) }))
  const bisaBangun = milikTim.filter((x) => x.alasan === null)
  const bisaJual = milikTim.filter((x) => x.tingkat > 0)
  const terpilih = milikTim.find((x) => x.petak.id === petakDipilih)

  if (milikTim.length === 0) {
    return (
      <Bagian judul="Bangunan">
        <p className="text-sm text-muted-foreground">Tim belum punya kota. Kuasai 3 kota satu warna untuk mulai membangun.</p>
      </Bagian>
    )
  }

  return (
    <Bagian judul="Bangunan">
      {terpilih ? (
        <div className="rounded-card border border-primary/40 bg-primary-soft p-3 text-sm">
          <p className="font-bold">{terpilih.petak.nama}</p>
          <p className="text-xs text-muted-foreground">
            {TINGKAT_BANGUNAN[terpilih.tingkat]} · sewa kini {uang(sewaPetak(permainan, terpilih.petak.id))}
          </p>
          {terpilih.alasan ? <p className="mt-1 text-xs text-warning-kuat">{terpilih.alasan}</p> : null}
        </div>
      ) : null}
      {bisaBangun.length > 0 ? (
        <ul className="space-y-1.5">
          {bisaBangun.map(({ petak, tingkat }) => (
            <li key={petak.id} className="flex items-center justify-between gap-2 rounded-control bg-muted px-3 py-2 text-sm">
              <span className="min-w-0 truncate">
                <span className="font-semibold">{petak.nama}</span>
                <span className="text-xs text-muted-foreground"> · {TINGKAT_BANGUNAN[tingkat]} → {TINGKAT_BANGUNAN[tingkat + 1]}</span>
              </span>
              <Tombol ukuran="sm" varian="halus" disabled={sibuk} onClick={() => onAksi({ jenis: 'bangun', petak: petak.id })}>
                <Hammer /> {uang(petak.biayaBangun)}
              </Tombol>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Belum ada kota yang bisa dibangun. Syarat: 3 kota satu warna, dibangun merata, dan kas cukup.
        </p>
      )}
      {bisaJual.length > 0 ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Jual bangunan (setengah harga)</summary>
          <ul className="mt-2 space-y-1.5">
            {bisaJual.map(({ petak, tingkat }) => (
              <li key={petak.id} className="flex items-center justify-between gap-2 rounded-control bg-muted px-3 py-2">
                <span className="truncate">
                  <Building2 className="mr-1 inline size-3.5" /> {petak.nama} · {TINGKAT_BANGUNAN[tingkat]}
                </span>
                <Tombol ukuran="sm" varian="hantu" disabled={sibuk} onClick={() => onAksi({ jenis: 'jual-bangunan', petak: petak.id })}>
                  <Trash2 /> +{uang(Math.floor(petak.biayaBangun / 2))}
                </Tombol>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </Bagian>
  )
}

function Transfer({ permainan, sibuk, onAksi }: { permainan: Permainan; sibuk: boolean; onAksi: (a: Aksi) => void }) {
  const pm = pemainAktif(permainan)
  const anggota = anggotaTim(permainan, pm.tim)
  const [pemain, setPemain] = useState(pm.id)
  const [jumlah, setJumlah] = useState('50')
  const n = Number(jumlah)
  return (
    <Bagian judul="Dompet ↔ kas tim">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-control border border-input bg-card px-2 text-sm"
          value={pemain}
          onChange={(e) => setPemain(Number(e.target.value))}
          aria-label="Pemain"
        >
          {anggota.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({uang(a.uang)})
            </option>
          ))}
        </select>
        <Masukan
          type="number"
          min={1}
          step={10}
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          className="h-9 w-24"
          aria-label="Jumlah"
        />
        <Tombol ukuran="sm" varian="garis" disabled={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'setor', pemain, jumlah: n })}>
          <ArrowDownToLine /> Setor
        </Tombol>
        <Tombol ukuran="sm" varian="garis" disabled={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'tarik', pemain, jumlah: n })}>
          <ArrowUpFromLine /> Tarik
        </Tombol>
      </div>
    </Bagian>
  )
}

// ------------------------------------------------------------------ Log
export function LogPermainan({ permainan }: { permainan: Permainan }) {
  const terbaru = permainan.log.slice(-60).toReversed()
  return (
    <ol className="max-h-72 space-y-1 overflow-y-auto pr-1 text-xs scrollbar-thin" aria-live="polite">
      {terbaru.map((e) => {
        const tim = e.tim !== undefined ? permainan.tim[e.tim] : undefined
        return (
          <li
            key={e.urut}
            className={cn(
              'flex gap-2 rounded-control px-2 py-1.5',
              e.nada === 'baik' && 'bg-success-soft text-success-kuat',
              e.nada === 'buruk' && 'bg-danger-soft text-danger-kuat',
              e.nada === 'penting' && 'bg-warning-soft font-semibold text-warning-kuat',
              e.nada === 'biasa' && 'text-muted-foreground',
            )}
          >
            {tim ? <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: WARNA_TIM_HEX[tim.warna].isi }} aria-hidden /> : <span className="size-2 shrink-0" />}
            <span>{e.teks}</span>
          </li>
        )
      })}
    </ol>
  )
}
