/**
 * Panggung keputusan di tengah papan.
 *
 * Isinya HANYA apa yang harus diputuskan pemain detik ini: siapa yang
 * bermain, berapa uangnya, hasil dadu, dan tombol yang berlaku. Daftar tim,
 * catatan peristiwa, dan aturan pindah ke menu pojok (lihat `menu.tsx`)
 * supaya papan tidak lagi penuh bacaan.
 *
 * Ditanam lewat `<foreignObject>` di `peta.tsx`, digambar pada kanvas tetap
 * 1000×1000 lalu diskalakan ke lubang tengah. Tata letaknya sama untuk 2 tim
 * maupun 8 tim — yang berubah hanya skalanya.
 *
 * WARNA: berkas ini memakai warna mentah, bukan token tema, dengan sengaja —
 * isinya "tercetak" di atas papan yang merupakan ilustrasi fisik dan tidak
 * ikut berubah saat mode gelap. Aturan token tetap berlaku di luar papan.
 */
import { Coins, Dice5, Hammer, RotateCcw, ShoppingCart, SkipForward, Trash2 } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Aset, IkonPetiCadangan, IkonTanyaCadangan, NAMA_ASET, PionCadangan, WARNA_TIM_HEX } from './aset'
import { alasanTakBolehBangun, anggotaTim, papanDari, pemainAktif, sewaPetak } from './mesin'
import { BONUS_PETAK, DENDA_PENJARA, PAJAK, adalahBandara, adalahProperti } from './papan'
import { PENGALI_SEWA, TINGKAT_BANGUNAN, TINGKAT_MAKS, type Aksi, type Permainan, type PetakBandara, type PetakProperti } from './tipe'

// ------------------------------------------------------------------ Palet papan
export const TINTA = '#1f2a44'
export const TINTA_LEMBUT = '#5d6b86'
const KERTAS = '#fffdf6'
const KERTAS_TUA = '#f3e6c8'
const BIRU = '#1e88e5'
const HIJAU = '#2e9e5b'
const MERAH = '#d8443c'

export const uang = (n: number) => `$${n.toLocaleString('id-ID')}`

// ------------------------------------------------------------------ Tombol papan
type VarianTombol = 'utama' | 'garis' | 'sukses'

const ISI_TOMBOL: Record<VarianTombol, { latar: string; teks: string }> = {
  utama: { latar: BIRU, teks: '#ffffff' },
  sukses: { latar: HIJAU, teks: '#ffffff' },
  garis: { latar: KERTAS, teks: TINTA },
}

function TombolPapan({
  varian = 'utama', kecil, penuh, mati, denyut, onClick, children,
}: {
  varian?: VarianTombol
  kecil?: boolean
  penuh?: boolean
  mati?: boolean
  /** Tombol utama giliran — diberi denyut halus supaya langsung terlihat. */
  denyut?: boolean
  onClick: () => void
  children: ReactNode
}) {
  const w = ISI_TOMBOL[varian]
  return (
    <button
      type="button"
      disabled={mati}
      onClick={onClick}
      className={denyut && !mati ? 'monopoli-tombol-utama' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: penuh ? '100%' : undefined,
        padding: kecil ? '9px 16px' : '15px 26px',
        fontSize: kecil ? 19 : 25,
        fontWeight: 800,
        color: w.teks,
        background: w.latar,
        border: `3px solid ${TINTA}`,
        borderRadius: 16,
        boxShadow: mati ? 'none' : `0 5px 0 0 ${TINTA}`,
        opacity: mati ? 0.45 : 1,
        cursor: mati ? 'not-allowed' : 'pointer',
        transform: mati ? 'translateY(5px)' : undefined,
        lineHeight: 1.15,
      }}
    >
      {children}
    </button>
  )
}

export function Pion({ permainan, pemainId, ukuran }: { permainan: Permainan; pemainId: number; ukuran: number }) {
  const pm = permainan.pemain[pemainId]!
  const tim = permainan.tim[pm.tim]!
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-hidden>
      <Aset
        nama={NAMA_ASET.pion(tim.warna, pm.bentuk)}
        lebar={100}
        tinggi={100}
        cadangan={<PionCadangan warna={tim.warna} bentuk={pm.bentuk} />}
      />
    </svg>
  )
}

// ------------------------------------------------------------------ Panggung
export type PropsHud = {
  permainan: Permainan
  onAksi: (a: Aksi) => void
  sibuk: boolean
  galat: string | null
  petakDipilih: number | null
  /** Dadu sedang bergulir — kartu diredupkan supaya dadu jadi pusat perhatian. */
  menggulir?: boolean
  onPermainanBaru: () => void
}

export function HudPapan(props: PropsHud) {
  const { permainan, sibuk, galat, menggulir } = props
  const pm = pemainAktif(permainan)
  const tim = permainan.tim[pm.tim]!
  const warna = WARNA_TIM_HEX[tim.warna]
  // Selama dadu bergulir, hasilnya disembunyikan supaya tidak mendahului animasi.
  const [d1, d2] = (sibuk ? null : permainan.dadu) ?? [0, 0]
  const selesai = permainan.fase.jenis === 'selesai'

  return (
    <div
      style={{ width: 1000, height: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      // Seret & gulir di dalam panel tidak boleh menggeser atau mengezum papan.
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        style={{
          width: 660,
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: KERTAS,
          border: `4px solid ${TINTA}`,
          borderRadius: 24,
          boxShadow: '0 12px 0 0 rgba(31,42,68,0.18)',
          color: TINTA,
          overflow: 'hidden',
          opacity: menggulir ? 0.25 : 1,
          transform: menggulir ? 'scale(0.97)' : undefined,
          transition: 'opacity 200ms ease, transform 200ms ease',
          pointerEvents: menggulir ? 'none' : undefined,
        }}
      >
        {/* Siapa yang bermain dan berapa uangnya */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 20px',
            background: KERTAS_TUA,
            borderBottom: `3px solid ${TINTA}`,
            borderLeft: `16px solid ${warna.isi}`,
          }}
        >
          <Pion permainan={permainan} pemainId={pm.id} ukuran={58} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: TINTA_LEMBUT }}>
              {selesai ? 'Permainan selesai' : `Putaran ${permainan.giliran} · ${tim.nama}`}
            </p>
            <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>
              {pm.nama}
              {pm.diPenjara ? ' 🔒' : ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT }}>Dompet</p>
            <p style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{uang(pm.uang)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT }}>Kas tim</p>
            <p style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{uang(tim.kas)}</p>
          </div>
        </header>

        {/* Dadu hanya tampil sebelum & sesudah lemparan, bukan saat permainan usai */}
        {!selesai ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 0', borderBottom: `3px solid ${TINTA}` }}>
            <MataDadu nilai={d1} berputar={sibuk} />
            <MataDadu nilai={d2} berputar={sibuk} />
            <p style={{ fontSize: 24, fontWeight: 800, color: d1 ? TINTA : TINTA_LEMBUT }}>
              {d1 ? `${d1} + ${d2} = ${d1 + d2}` : sibuk ? 'mengocok…' : 'belum dilempar'}
            </p>
          </div>
        ) : null}

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {galat ? (
            <p role="alert" style={{ padding: '10px 14px', borderRadius: 12, border: `2px solid ${MERAH}`, background: '#fdecea', color: '#9b2820', fontSize: 18, fontWeight: 700 }}>
              {galat}
            </p>
          ) : null}
          <Keputusan {...props} />
        </div>

        {permainan.fase.jenis === 'aksi' ? (
          <div style={{ padding: 16, borderTop: `3px solid ${TINTA}`, background: KERTAS_TUA }}>
            <TombolPapan denyut penuh mati={sibuk} onClick={() => props.onAksi({ jenis: 'akhiri-giliran' })}>
              <SkipForward size={24} strokeWidth={3} />
              {permainan.dadu && permainan.dadu[0] === permainan.dadu[1] && permainan.kembarBeruntun > 0 && !pm.diPenjara
                ? 'Lempar lagi (dadu kembar)'
                : 'Akhiri giliran'}
            </TombolPapan>
            <p style={{ fontSize: 16, fontWeight: 600, color: TINTA_LEMBUT, textAlign: 'center', marginTop: 8 }}>
              Berikutnya: {namaPemainBerikutnya(permainan)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function namaPemainBerikutnya(permainan: Permainan) {
  const n = permainan.pemain.length
  for (let i = 1; i <= n; i++) {
    const kandidat = permainan.pemain[(permainan.pemainAktif + i) % n]!
    if (!permainan.tim[kandidat.tim]!.gugur) return kandidat.nama
  }
  return '—'
}

function MataDadu({ nilai, berputar }: { nilai: number; berputar: boolean }) {
  const titik: Record<number, Array<[number, number]>> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
  }
  return (
    <svg
      width={64}
      height={64}
      viewBox="0 0 100 100"
      className={berputar ? 'monopoli-dadu-putar' : undefined}
      style={{ transformOrigin: 'center' }}
      aria-hidden
    >
      <rect x="6" y="6" width="88" height="88" rx="20" fill="#ffffff" stroke={TINTA} strokeWidth="6" />
      {titik[nilai] ? (
        titik[nilai]!.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill={TINTA} />)
      ) : (
        <text x="50" y="70" textAnchor="middle" fontSize="54" fontWeight="800" fill={TINTA} opacity="0.25">?</text>
      )}
    </svg>
  )
}

const judulKecil: CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: TINTA_LEMBUT,
}

/** Satu keputusan per layar: hanya yang berlaku pada fase saat ini. */
function Keputusan({ permainan, onAksi, sibuk, petakDipilih, onPermainanBaru }: PropsHud) {
  const papan = papanDari(permainan)
  const pm = pemainAktif(permainan)
  const fase = permainan.fase

  switch (fase.jenis) {
    case 'lempar':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
          {pm.diPenjara ? (
            <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4 }}>
              Di penjara, giliran ke-{pm.giliranPenjara + 1} dari 3. Dadu kembar membebaskan.
            </p>
          ) : null}
          <TombolPapan denyut mati={sibuk} onClick={() => onAksi({ jenis: 'lempar' })}>
            <Dice5 size={26} strokeWidth={3} /> Lempar dadu
          </TombolPapan>
          {pm.diPenjara ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'bayar-keluar-penjara' })}>
                Bayar {uang(DENDA_PENJARA)}
              </TombolPapan>
              {pm.kartuBebas > 0 ? (
                <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'pakai-kartu-bebas' })}>
                  Pakai kartu bebas
                </TombolPapan>
              ) : null}
            </div>
          ) : null}
        </div>
      )

    case 'bergerak':
      return (
        <p style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', color: TINTA_LEMBUT }}>
          Berjalan {Math.abs(fase.langkah)} langkah{fase.langkah < 0 ? ' mundur' : ''}…
        </p>
      )

    case 'tawaran':
      return <Tawaran permainan={permainan} petak={papan.petak[fase.petak] as PetakProperti | PetakBandara} sibuk={sibuk} onAksi={onAksi} />

    case 'kartu':
      return (
        <div className="monopoli-kartu-muncul" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <svg width={112} height={154} viewBox="0 0 100 138" style={{ flexShrink: 0 }} aria-hidden>
            <rect x="2" y="2" width="96" height="134" rx="12" fill={fase.kartu.jenis === 'kesempatan' ? '#e91e63' : BIRU} stroke={TINTA} strokeWidth="4" />
            <Aset
              nama={fase.kartu.jenis === 'kesempatan' ? NAMA_ASET.kartuKesempatan : NAMA_ASET.kartuHarta}
              lebar={100}
              tinggi={138}
              cadangan={
                <svg x="22" y="30" width="56" height="56" viewBox="0 0 100 100">
                  {fase.kartu.jenis === 'kesempatan' ? <IkonTanyaCadangan /> : <IkonPetiCadangan />}
                </svg>
              }
            />
          </svg>
          <div style={{ minWidth: 0 }}>
            <p style={judulKecil}>Kartu {fase.kartu.jenis === 'kesempatan' ? 'Kesempatan' : 'Harta Karun'}</p>
            <p style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.35, margin: '6px 0 16px' }}>{fase.kartu.teks}</p>
            <TombolPapan denyut mati={sibuk} onClick={() => onAksi({ jenis: 'terapkan-kartu' })}>
              Jalankan
            </TombolPapan>
          </div>
        </div>
      )

    case 'aksi':
      return (
        <>
          <Bangunan permainan={permainan} sibuk={sibuk} onAksi={onAksi} />
          <Uang permainan={permainan} sibuk={sibuk} onAksi={onAksi} />
          {petakDipilih !== null ? <RincianPetak permainan={permainan} id={petakDipilih} /> : null}
        </>
      )

    case 'selesai':
      return (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: 42, fontWeight: 800, color: fase.pemenang !== null ? WARNA_TIM_HEX[permainan.tim[fase.pemenang]!.warna].gelap : TINTA }}>
            {fase.pemenang !== null ? `🏆 ${permainan.tim[fase.pemenang]!.nama} menang!` : 'Tidak ada pemenang'}
          </p>
          <p style={{ fontSize: 20, color: TINTA_LEMBUT, fontWeight: 600, margin: '10px 0 18px' }}>{fase.alasan}.</p>
          <TombolPapan denyut onClick={onPermainanBaru}>
            <RotateCcw size={24} strokeWidth={3} /> Permainan baru
          </TombolPapan>
        </div>
      )
  }
}

function Tawaran({
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
  const wilayah = adalahProperti(petak) ? papanDari(permainan).wilayah[petak.wilayah] : null

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={judulKecil}>Properti kosong</p>
      <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: '4px 0' }}>{petak.nama}</p>
      {wilayah ? <p style={{ fontSize: 17, color: TINTA_LEMBUT, fontWeight: 600 }}>{wilayah.nama}</p> : null}

      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, margin: '16px 0 20px' }}>
        <Angka label="Harga" nilai={uang(petak.harga)} />
        <Angka label="Sewa" nilai={adalahProperti(petak) ? uang(petak.sewaDasar) : '$25'} />
        <Angka
          label={adalahProperti(petak) ? 'Sewa penuh' : 'Sewa 4 bandara'}
          nilai={adalahProperti(petak) ? uang(petak.sewaDasar * PENGALI_SEWA[TINGKAT_MAKS]!) : '$200'}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <TombolPapan varian="sukses" denyut mati={sibuk || !mampu} onClick={() => onAksi({ jenis: 'beli' })}>
          <ShoppingCart size={24} strokeWidth={3} /> Beli
        </TombolPapan>
        <TombolPapan varian="garis" mati={sibuk} onClick={() => onAksi({ jenis: 'lewati' })}>
          Lewati
        </TombolPapan>
      </div>
      {!mampu ? <p style={{ fontSize: 17, color: MERAH, fontWeight: 700, marginTop: 10 }}>Uang tim tidak cukup.</p> : null}
    </div>
  )
}

function Angka({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{nilai}</p>
    </div>
  )
}

/** Hanya muncul bila memang ada yang bisa dibangun atau dijual. */
function Bangunan({ permainan, sibuk, onAksi }: { permainan: Permainan; sibuk: boolean; onAksi: (a: Aksi) => void }) {
  const papan = papanDari(permainan)
  const pm = pemainAktif(permainan)
  const milik = papan.petak
    .filter((x): x is PetakProperti => adalahProperti(x) && permainan.milik[x.id]?.tim === pm.tim)
    .map((x) => ({ petak: x, tingkat: permainan.milik[x.id]!.tingkat, boleh: alasanTakBolehBangun(permainan, x.id, pm.tim) === null }))
  const bisaBangun = milik.filter((x) => x.boleh)
  const bisaJual = milik.filter((x) => x.tingkat > 0)
  if (bisaBangun.length === 0 && bisaJual.length === 0) return null

  return (
    <div>
      <p style={judulKecil}>Bangunan</p>
      <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bisaBangun.map(({ petak, tingkat }) => (
          <li key={petak.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: KERTAS_TUA, border: `2px solid ${TINTA}`, borderRadius: 14, padding: '8px 12px' }}>
            <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 700 }}>
              {petak.nama} <span style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>→ {TINGKAT_BANGUNAN[tingkat + 1]}</span>
            </span>
            <TombolPapan varian="sukses" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'bangun', petak: petak.id })}>
              <Hammer size={17} strokeWidth={3} /> {uang(petak.biayaBangun)}
            </TombolPapan>
          </li>
        ))}
      </ul>
      {bisaJual.length > 0 ? (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 16, fontWeight: 700, color: TINTA_LEMBUT, cursor: 'pointer' }}>Jual bangunan</summary>
          <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bisaJual.map(({ petak, tingkat }) => (
              <li key={petak.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>
                  {petak.nama} <span style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>· {TINGKAT_BANGUNAN[tingkat]}</span>
                </span>
                <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'jual-bangunan', petak: petak.id })}>
                  <Trash2 size={16} strokeWidth={3} /> +{uang(Math.floor(petak.biayaBangun / 2))}
                </TombolPapan>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

/** Pindah uang antara dompet pribadi dan kas tim — aksi sesekali, jadi dilipat. */
function Uang({ permainan, sibuk, onAksi }: { permainan: Permainan; sibuk: boolean; onAksi: (a: Aksi) => void }) {
  const pm = pemainAktif(permainan)
  const anggota = anggotaTim(permainan, pm.tim)
  const [buka, setBuka] = useState(false)
  const [pemain, setPemain] = useState(pm.id)
  const [jumlah, setJumlah] = useState('50')
  const n = Number(jumlah)
  const pilihan = anggota.some((a) => a.id === pemain) ? pemain : pm.id

  const kendali: CSSProperties = {
    height: 42,
    fontSize: 18,
    fontWeight: 700,
    color: TINTA,
    background: '#ffffff',
    border: `2px solid ${TINTA}`,
    borderRadius: 10,
    padding: '0 10px',
  }

  if (!buka) {
    return (
      <TombolPapan varian="garis" kecil onClick={() => setBuka(true)}>
        <Coins size={17} strokeWidth={3} /> Pindah uang dompet ↔ kas tim
      </TombolPapan>
    )
  }

  return (
    <div>
      <p style={judulKecil}>Pindah uang</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <select value={pilihan} onChange={(e) => setPemain(Number(e.target.value))} aria-label="Pemain" style={kendali}>
          {anggota.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama} ({uang(a.uang)})
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          step={10}
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          aria-label="Jumlah"
          style={{ ...kendali, width: 110 }}
        />
        <TombolPapan varian="garis" kecil mati={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'setor', pemain: pilihan, jumlah: n })}>
          Setor
        </TombolPapan>
        <TombolPapan varian="garis" kecil mati={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'tarik', pemain: pilihan, jumlah: n })}>
          Tarik
        </TombolPapan>
      </div>
    </div>
  )
}

/** Muncul hanya setelah pemain mengklik sebuah petak di papan. */
function RincianPetak({ permainan, id }: { permainan: Permainan; id: number }) {
  const papan = papanDari(permainan)
  const petak = papan.petak[id]
  if (!petak) return null
  const milik = permainan.milik[id]
  const pemilik = milik ? permainan.tim[milik.tim]! : null

  const keterangan = adalahProperti(petak)
    ? `${uang(petak.harga)} · bangun ${uang(petak.biayaBangun)} per tingkat${milik ? ` · ${TINGKAT_BANGUNAN[milik.tingkat]}, sewa ${uang(sewaPetak(permainan, id))}` : ''}`
    : adalahBandara(petak)
      ? `${uang(petak.harga)} · sewa $25 sampai $200 menurut jumlah bandara pemiliknya`
      : petak.jenis === 'pajak'
        ? `Bayar ${uang(PAJAK)} ke pot Parkir Bebas`
        : petak.jenis === 'bonus'
          ? `Terima ${uang(BONUS_PETAK)}`
          : petak.jenis === 'parkir'
            ? `Ambil seluruh pot, sekarang ${uang(permainan.pot)}`
            : petak.jenis === 'mulai'
              ? `Gaji ${uang(permainan.pengaturan.gaji)} tiap melewatinya`
              : petak.jenis === 'penjara'
                ? 'Hanya berkunjung'
                : petak.jenis === 'masuk-penjara'
                  ? 'Langsung ke penjara'
                  : 'Ambil satu kartu'

  return (
    <div style={{ borderTop: `2px dashed ${TINTA_LEMBUT}`, paddingTop: 12 }}>
      <p style={judulKecil}>Petak dipilih</p>
      <p style={{ fontSize: 24, fontWeight: 800 }}>{petak.nama}</p>
      <p style={{ fontSize: 18, fontWeight: 600, color: TINTA_LEMBUT, lineHeight: 1.4 }}>{keterangan}</p>
      {pemilik ? (
        <p style={{ fontSize: 18, fontWeight: 800, color: WARNA_TIM_HEX[pemilik.warna].gelap, marginTop: 4 }}>Milik {pemilik.nama}</p>
      ) : null}
    </div>
  )
}
