/**
 * Panel kendali DI DALAM papan — segala hal yang perlu dibaca pemain ada di
 * lubang tengah papan, jadi mata tidak perlu bolak-balik antara papan dan
 * panel samping.
 *
 * Ditanam lewat `<foreignObject>` di `peta.tsx`, digambar pada kanvas tetap
 * 1000×1000 lalu diskalakan ke ukuran lubang tengah. Artinya tata letaknya
 * sama untuk 2 tim maupun 8 tim — yang berubah hanya skalanya.
 *
 * WARNA: berkas ini memakai warna mentah, bukan token tema, dengan sengaja —
 * isinya "tercetak" di atas papan yang merupakan ilustrasi fisik. Papan tidak
 * ikut berubah saat mode gelap, jadi kontras teks di atasnya harus dikunci di
 * sini. Aturan token tetap berlaku untuk seluruh antarmuka panel lainnya.
 */
import {
  ArrowDownToLine, ArrowUpFromLine, Dice5, Flag, Hammer, Plane, RotateCcw, ScrollText, ShoppingCart,
  SkipForward, Sparkles, Trash2,
} from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Aset, IkonPetiCadangan, IkonTanyaCadangan, NAMA_ASET, PionCadangan, WARNA_TIM_HEX } from './aset'
import { alasanTakBolehBangun, anggotaTim, kekayaanTim, papanDari, pemainAktif, sewaPetak } from './mesin'
import { BONUS_PETAK, DENDA_PENJARA, PAJAK, adalahBandara, adalahProperti } from './papan'
import { TINGKAT_BANGUNAN, type Aksi, type Permainan, type PetakBandara, type PetakProperti } from './tipe'

// ------------------------------------------------------------------ Palet papan
const TINTA = '#1f2a44'
const TINTA_LEMBUT = '#5d6b86'
const KERTAS = '#fffdf6'
const KERTAS_TUA = '#f3e6c8'
const BIRU = '#1e88e5'
const HIJAU = '#2e9e5b'
const MERAH = '#d8443c'
const EMAS = '#f5b301'

export const uang = (n: number) => `$${n.toLocaleString('id-ID')}`

const panel: CSSProperties = {
  background: KERTAS,
  border: `3px solid ${TINTA}`,
  borderRadius: 18,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
}

const judulKolom: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  borderBottom: `3px solid ${TINTA}`,
  background: KERTAS_TUA,
  borderRadius: '15px 15px 0 0',
  fontSize: 17,
  fontWeight: 800,
  letterSpacing: 0.6,
  textTransform: 'uppercase',
  color: TINTA,
}

// ------------------------------------------------------------------ Tombol papan
type VarianTombol = 'utama' | 'garis' | 'sukses' | 'bahaya' | 'emas'

const ISI_TOMBOL: Record<VarianTombol, { latar: string; teks: string }> = {
  utama: { latar: BIRU, teks: '#ffffff' },
  sukses: { latar: HIJAU, teks: '#ffffff' },
  bahaya: { latar: MERAH, teks: '#ffffff' },
  emas: { latar: EMAS, teks: TINTA },
  garis: { latar: KERTAS, teks: TINTA },
}

function TombolPapan({
  varian = 'utama',
  kecil,
  penuh,
  mati,
  denyut,
  onClick,
  children,
}: {
  varian?: VarianTombol
  kecil?: boolean
  penuh?: boolean
  mati?: boolean
  /** Tombol utama giliran — diberi denyut halus supaya terlihat. */
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
        gap: 8,
        width: penuh ? '100%' : undefined,
        padding: kecil ? '8px 14px' : '12px 20px',
        fontSize: kecil ? 17 : 21,
        fontWeight: 800,
        color: w.teks,
        background: w.latar,
        border: `3px solid ${TINTA}`,
        borderRadius: 14,
        boxShadow: mati ? 'none' : `0 4px 0 0 ${TINTA}`,
        opacity: mati ? 0.45 : 1,
        cursor: mati ? 'not-allowed' : 'pointer',
        transform: mati ? 'translateY(4px)' : undefined,
        transition: 'transform 90ms ease, box-shadow 90ms ease',
        lineHeight: 1.15,
      }}
    >
      {children}
    </button>
  )
}

function Pion({ permainan, pemainId, ukuran }: { permainan: Permainan; pemainId: number; ukuran: number }) {
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

function Bilah({ nilai, warna, label }: { nilai: number; warna: string; label: string }) {
  const persen = Math.max(0, Math.min(100, nilai * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: TINTA_LEMBUT, width: 22 }}>{label}</span>
      <div
        role="progressbar"
        aria-valuenow={Math.round(persen)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label === 'K' ? 'Kekayaan menuju target' : 'Kerugian menuju batas'}
        style={{ flex: 1, height: 8, background: '#e4dcc6', border: `1.5px solid ${TINTA}`, borderRadius: 999 }}
      >
        <div style={{ width: `${persen}%`, height: '100%', background: warna, borderRadius: 999 }} />
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ HUD utama
export type PropsHud = {
  permainan: Permainan
  onAksi: (a: Aksi) => void
  sibuk: boolean
  galat: string | null
  petakDipilih: number | null
  ikuti: boolean
  setIkuti: (v: boolean) => void
  onPermainanBaru: () => void
}

export function HudPapan(props: PropsHud) {
  const { permainan, onPermainanBaru, ikuti, setIkuti } = props
  const [tab, setTab] = useState<'catatan' | 'aturan'>('catatan')
  const papan = papanDari(permainan)

  return (
    <div
      style={{
        width: 1000,
        height: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 4,
        color: TINTA,
        fontSynthesis: 'none',
      }}
      // Seret & gulir di dalam HUD tidak boleh menggeser atau mengezum papan.
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <BarisGiliran {...props} />

      <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
        <section style={{ ...panel, width: 268 }}>
          <h2 style={judulKolom}>
            <Flag size={16} strokeWidth={3} /> Tim
          </h2>
          <DaftarTim permainan={permainan} onAksi={props.onAksi} />
        </section>

        <section style={{ ...panel, flex: 1, background: 'rgba(255,253,246,0.94)' }}>
          <Panggung {...props} />
        </section>

        <section style={{ ...panel, width: 276 }}>
          <div style={{ ...judulKolom, gap: 6, padding: '8px 10px' }}>
            <TabKolom aktif={tab === 'catatan'} onClick={() => setTab('catatan')}>
              <ScrollText size={15} strokeWidth={3} /> Catatan
            </TabKolom>
            <TabKolom aktif={tab === 'aturan'} onClick={() => setTab('aturan')}>
              <Sparkles size={15} strokeWidth={3} /> Aturan
            </TabKolom>
          </div>
          {tab === 'catatan' ? <Catatan permainan={permainan} /> : <Aturan permainan={permainan} />}
        </section>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT }}>
          {papan.petak.length} petak · {permainan.pengaturan.jumlahTim} tim · klik petak mana pun untuk melihat rinciannya
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <TombolPapan varian="garis" kecil onClick={() => setIkuti(!ikuti)}>
            {ikuti ? 'Kamera: ikuti pion' : 'Kamera: papan penuh'}
          </TombolPapan>
          <TombolPapan varian="garis" kecil onClick={onPermainanBaru}>
            <RotateCcw size={16} strokeWidth={3} /> Permainan baru
          </TombolPapan>
        </div>
      </div>
    </div>
  )
}

function TabKolom({ aktif, onClick, children }: { aktif: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 12px',
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: aktif ? '#ffffff' : TINTA_LEMBUT,
        background: aktif ? TINTA : 'transparent',
        border: `2px solid ${aktif ? TINTA : 'transparent'}`,
        borderRadius: 999,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ------------------------------------------------------------------ Baris giliran
function BarisGiliran({ permainan }: PropsHud) {
  const pm = pemainAktif(permainan)
  const tim = permainan.tim[pm.tim]!
  const warna = WARNA_TIM_HEX[tim.warna]
  const selesai = permainan.fase.jenis === 'selesai'

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 18px',
        background: KERTAS,
        border: `3px solid ${TINTA}`,
        borderLeft: `14px solid ${warna.isi}`,
        borderRadius: 18,
      }}
    >
      <Pion permainan={permainan} pemainId={pm.id} ukuran={54} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT, letterSpacing: 0.4 }}>
          {selesai ? 'Permainan selesai' : `Putaran ${permainan.giliran} · giliran ${tim.nama}`}
        </p>
        <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>
          {pm.nama}
          {pm.diPenjara ? ' 🔒' : ''}
        </p>
      </div>
      <Nilai label="Dompet pribadi" nilai={uang(pm.uang)} />
      <Nilai label={`Kas ${tim.nama}`} nilai={uang(tim.kas)} />
      <Nilai label="Pot parkir" nilai={uang(permainan.pot)} warna={EMAS} />
    </header>
  )
}

function Nilai({ label, nilai, warna }: { label: string; nilai: string; warna?: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: TINTA_LEMBUT }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: warna ?? TINTA, fontVariantNumeric: 'tabular-nums' }}>{nilai}</p>
    </div>
  )
}

// ------------------------------------------------------------------ Kolom tim
function DaftarTim({ permainan, onAksi }: { permainan: Permainan; onAksi: (a: Aksi) => void }) {
  const papan = papanDari(permainan)
  const aktif = pemainAktif(permainan)

  return (
    <ul style={{ flex: 1, overflowY: 'auto', listStyle: 'none', margin: 0, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {permainan.tim.map((tim) => {
        const warna = WARNA_TIM_HEX[tim.warna]
        const kekayaan = kekayaanTim(permainan, tim.id)
        const properti = Object.values(permainan.milik).filter((m) => m.tim === tim.id)
        const bangunan = properti.reduce((a, m) => a + m.tingkat, 0)
        const giliran = aktif.tim === tim.id && permainan.fase.jenis !== 'selesai'
        return (
          <li
            key={tim.id}
            style={{
              padding: '7px 9px',
              borderRadius: 12,
              border: `2px solid ${giliran ? TINTA : 'transparent'}`,
              background: giliran ? KERTAS_TUA : 'transparent',
              opacity: tim.gugur ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: warna.isi, border: `2px solid ${TINTA}`, flexShrink: 0 }} />
              <span style={{ fontSize: 18, fontWeight: 800, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tim.nama}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{uang(kekayaan)}</span>
            </div>

            {tim.gugur ? (
              <p style={{ fontSize: 14, color: MERAH, fontWeight: 700, marginTop: 3 }}>Gugur — {tim.alasanGugur}</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 5 }}>
                  <Bilah label="K" warna={HIJAU} nilai={kekayaan / permainan.pengaturan.targetKekayaan} />
                  <Bilah label="R" warna={MERAH} nilai={tim.kerugian / permainan.pengaturan.targetKerugian} />
                </div>
                <div
                  title={`Wilayah asal: ${papan.wilayah[tim.id]!.nama}`}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4, fontSize: 13, color: TINTA_LEMBUT, fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  <span>Dompet {anggotaTim(permainan, tim.id).map((x) => uang(x.uang)).join(' + ')}</span>
                  <span>
                    {properti.length} properti · {bangunan} bangunan
                  </span>
                </div>
                {giliran ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`${tim.nama} menyerah? Semua properti kembali ke bank.`)) onAksi({ jenis: 'menyerah', tim: tim.id })
                    }}
                    style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: MERAH, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    menyerah
                  </button>
                ) : null}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// ------------------------------------------------------------------ Panggung tengah
function Panggung(props: PropsHud) {
  const { permainan, onAksi, sibuk, galat, petakDipilih } = props
  const papan = papanDari(permainan)
  const pm = pemainAktif(permainan)
  const tim = permainan.tim[pm.tim]!
  const fase = permainan.fase
  const [d1, d2] = permainan.dadu ?? [0, 0]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Hasil dadu selalu di puncak panggung */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '12px 0',
          borderBottom: `3px solid ${TINTA}`,
          background: KERTAS_TUA,
          borderRadius: '15px 15px 0 0',
        }}
      >
        <MataDadu nilai={d1} berputar={sibuk} />
        <MataDadu nilai={d2} berputar={sibuk} />
        <p style={{ fontSize: 22, fontWeight: 800, color: permainan.dadu ? TINTA : TINTA_LEMBUT }}>
          {permainan.dadu ? `${d1} + ${d2} = ${d1 + d2}` : 'belum dilempar'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {galat ? (
          <p role="alert" style={{ padding: '9px 12px', borderRadius: 12, border: `2px solid ${MERAH}`, background: '#fdecea', color: '#9b2820', fontSize: 17, fontWeight: 700 }}>
            {galat}
          </p>
        ) : null}

        {fase.jenis === 'lempar' ? (
          <>
            {pm.diPenjara ? (
              <Keterangan
                judul="Di penjara"
                isi={`Bebas bila dadu kembar. Ini giliran ke-${pm.giliranPenjara + 1} dari 3; setelah itu denda ${uang(DENDA_PENJARA)} otomatis dipotong.`}
              />
            ) : (
              <Keterangan judul="Giliranmu" isi="Lempar dadu untuk bergerak. Dadu kembar memberi satu lemparan tambahan." />
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <TombolPapan denyut mati={sibuk} onClick={() => onAksi({ jenis: 'lempar' })}>
                <Dice5 size={22} strokeWidth={3} /> {pm.diPenjara ? 'Coba dadu kembar' : 'Lempar dadu'}
              </TombolPapan>
              {pm.diPenjara ? (
                <>
                  <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'bayar-keluar-penjara' })}>
                    Bayar {uang(DENDA_PENJARA)}
                  </TombolPapan>
                  {pm.kartuBebas > 0 ? (
                    <TombolPapan varian="emas" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'pakai-kartu-bebas' })}>
                      Pakai kartu bebas ({pm.kartuBebas})
                    </TombolPapan>
                  ) : null}
                </>
              ) : null}
            </div>
          </>
        ) : null}

        {fase.jenis === 'bergerak' ? (
          <Keterangan
            judul="Pion berjalan"
            isi={fase.langkah === 0 ? 'Terbang ke bandara tujuan…' : `${Math.abs(fase.langkah)} langkah ${fase.langkah < 0 ? 'mundur' : 'maju'}…`}
          />
        ) : null}

        {fase.jenis === 'tawaran' ? (
          <Tawaran permainan={permainan} petak={papan.petak[fase.petak] as PetakProperti | PetakBandara} sibuk={sibuk} onAksi={onAksi} />
        ) : null}

        {fase.jenis === 'kartu' ? (
          <div className="monopoli-kartu-muncul" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <svg width={96} height={132} viewBox="0 0 100 138" style={{ flexShrink: 0 }} aria-hidden>
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
              <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>
                Kartu {fase.kartu.jenis === 'kesempatan' ? 'Kesempatan' : 'Harta Karun'}
              </p>
              <p style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.35, margin: '4px 0 12px' }}>{fase.kartu.teks}</p>
              <TombolPapan denyut mati={sibuk} onClick={() => onAksi({ jenis: 'terapkan-kartu' })}>
                Jalankan kartu
              </TombolPapan>
            </div>
          </div>
        ) : null}

        {fase.jenis === 'terbang' ? (
          <>
            <Keterangan judul="Bandara sendiri" isi="Mendarat di bandara milik tim sendiri boleh langsung terbang ke bandara lain. Tidak melewati Mulai, jadi tanpa gaji." />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {papan.indeks.bandara
                .filter((id) => id !== fase.dari)
                .map((id) => (
                  <TombolPapan key={id} varian="utama" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'terbang', ke: id })}>
                    <Plane size={16} strokeWidth={3} /> {papan.petak[id]!.nama}
                  </TombolPapan>
                ))}
              <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'terbang', ke: null })}>
                Tetap di sini
              </TombolPapan>
            </div>
          </>
        ) : null}

        {fase.jenis === 'aksi' ? (
          <>
            <Pembangunan permainan={permainan} sibuk={sibuk} onAksi={onAksi} petakDipilih={petakDipilih} />
            <Transfer permainan={permainan} sibuk={sibuk} onAksi={onAksi} />
          </>
        ) : null}

        {fase.jenis === 'selesai' ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: 38, fontWeight: 800, color: fase.pemenang !== null ? WARNA_TIM_HEX[permainan.tim[fase.pemenang]!.warna].gelap : TINTA }}>
              {fase.pemenang !== null ? `🏆 ${permainan.tim[fase.pemenang]!.nama} menang!` : 'Tidak ada pemenang'}
            </p>
            <p style={{ fontSize: 19, color: TINTA_LEMBUT, fontWeight: 600, margin: '6px 0 14px' }}>{fase.alasan}.</p>
            <TombolPapan denyut onClick={props.onPermainanBaru}>
              <RotateCcw size={20} strokeWidth={3} /> Permainan baru
            </TombolPapan>
          </div>
        ) : null}

        {petakDipilih !== null && fase.jenis !== 'selesai' ? (
          <RincianPetak permainan={permainan} id={petakDipilih} />
        ) : null}
      </div>

      {fase.jenis === 'aksi' ? (
        <div style={{ padding: 12, borderTop: `3px solid ${TINTA}`, background: KERTAS_TUA, borderRadius: '0 0 15px 15px' }}>
          <TombolPapan denyut penuh mati={sibuk} onClick={() => onAksi({ jenis: 'akhiri-giliran' })}>
            <SkipForward size={20} strokeWidth={3} />
            {permainan.dadu && permainan.dadu[0] === permainan.dadu[1] && permainan.kembarBeruntun > 0 && !pm.diPenjara
              ? 'Selesai — lempar lagi (kembar)'
              : `Akhiri giliran ${pm.nama}`}
          </TombolPapan>
          <p style={{ fontSize: 14, color: TINTA_LEMBUT, fontWeight: 600, textAlign: 'center', marginTop: 6 }}>
            Berikutnya: {namaPemainBerikutnya(permainan)} · kas {tim.nama} {uang(tim.kas)}
          </p>
        </div>
      ) : null}
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
      width={58}
      height={58}
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

function Keterangan({ judul, isi }: { judul: string; isi: string }) {
  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>{judul}</p>
      <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4, marginTop: 2 }}>{isi}</p>
    </div>
  )
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
  const papan = papanDari(permainan)
  const wilayah = adalahProperti(petak) ? papan.wilayah[petak.wilayah] : null

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>Properti kosong</p>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15 }}>{petak.nama}</p>
      {wilayah ? <p style={{ fontSize: 16, color: TINTA_LEMBUT, fontWeight: 600 }}>{wilayah.nama} · {wilayah.julukan}</p> : null}

      <dl style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '3px 14px', margin: '10px 0', fontSize: 17 }}>
        <dt style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>Harga</dt>
        <dd style={{ fontWeight: 800, margin: 0 }}>{uang(petak.harga)}</dd>
        {adalahProperti(petak) ? (
          <>
            <dt style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>Sewa tanah kosong</dt>
            <dd style={{ fontWeight: 800, margin: 0 }}>{uang(petak.sewaDasar)}</dd>
            <dt style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>Sewa pencakar langit</dt>
            <dd style={{ fontWeight: 800, margin: 0 }}>{uang(petak.sewaDasar * 45)}</dd>
            <dt style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>Biaya bangun</dt>
            <dd style={{ fontWeight: 800, margin: 0 }}>{uang(petak.biayaBangun)} / tingkat</dd>
          </>
        ) : (
          <>
            <dt style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>Sewa</dt>
            <dd style={{ fontWeight: 800, margin: 0 }}>$25 → $200 menurut jumlah bandara</dd>
          </>
        )}
      </dl>

      <p style={{ fontSize: 15, color: TINTA_LEMBUT, fontWeight: 600, marginBottom: 10 }}>
        Dibayar dari kas tim ({uang(tim.kas)}); kekurangannya dari dompet {pm.nama} ({uang(pm.uang)}).
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <TombolPapan varian="sukses" denyut mati={sibuk || !mampu} onClick={() => onAksi({ jenis: 'beli' })}>
          <ShoppingCart size={20} strokeWidth={3} /> Beli {uang(petak.harga)}
        </TombolPapan>
        <TombolPapan varian="garis" mati={sibuk} onClick={() => onAksi({ jenis: 'lewati' })}>
          Lewati
        </TombolPapan>
      </div>
      {!mampu ? (
        <p style={{ fontSize: 15, color: MERAH, fontWeight: 700, marginTop: 8 }}>
          Uang tim tidak cukup. Lewati dulu, atau kumpulkan dari rekan pada giliran berikutnya.
        </p>
      ) : null}
    </div>
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

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>Bangunan</p>
      {milikTim.length === 0 ? (
        <p style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>
          Tim belum punya kota. Kuasai tiga kota berwarna sama untuk mulai membangun.
        </p>
      ) : bisaBangun.length === 0 ? (
        <p style={{ fontSize: 16, fontWeight: 600, color: TINTA_LEMBUT, marginTop: 4 }}>
          Belum ada yang bisa dibangun. Syaratnya: satu kelompok warna penuh, dibangun merata, dan kas mencukupi.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bisaBangun.map(({ petak, tingkat }) => (
            <li key={petak.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: KERTAS_TUA, border: `2px solid ${TINTA}`, borderRadius: 12, padding: '6px 10px' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700 }}>
                {petak.nama}
                <span style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>
                  {' '}· {TINGKAT_BANGUNAN[tingkat]} → {TINGKAT_BANGUNAN[tingkat + 1]}
                </span>
              </span>
              <TombolPapan varian="sukses" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'bangun', petak: petak.id })}>
                <Hammer size={15} strokeWidth={3} /> {uang(petak.biayaBangun)}
              </TombolPapan>
            </li>
          ))}
        </ul>
      )}

      {petakDipilih !== null && milikTim.some((x) => x.petak.id === petakDipilih && x.alasan) ? (
        <p style={{ fontSize: 15, color: '#8a5a00', fontWeight: 700, marginTop: 6 }}>
          {milikTim.find((x) => x.petak.id === petakDipilih)!.alasan}
        </p>
      ) : null}

      {bisaJual.length > 0 ? (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 15, fontWeight: 700, color: TINTA_LEMBUT, cursor: 'pointer' }}>
            Jual bangunan (kembali setengah harga)
          </summary>
          <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bisaJual.map(({ petak, tingkat }) => (
              <li key={petak.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                <span style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>
                  {petak.nama} <span style={{ color: TINTA_LEMBUT, fontWeight: 600 }}>· {TINGKAT_BANGUNAN[tingkat]}</span>
                </span>
                <TombolPapan varian="garis" kecil mati={sibuk} onClick={() => onAksi({ jenis: 'jual-bangunan', petak: petak.id })}>
                  <Trash2 size={14} strokeWidth={3} /> +{uang(Math.floor(petak.biayaBangun / 2))}
                </TombolPapan>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

function Transfer({ permainan, sibuk, onAksi }: { permainan: Permainan; sibuk: boolean; onAksi: (a: Aksi) => void }) {
  const pm = pemainAktif(permainan)
  const anggota = anggotaTim(permainan, pm.tim)
  const [pemain, setPemain] = useState(pm.id)
  const [jumlah, setJumlah] = useState('50')
  const n = Number(jumlah)
  const pilihan = anggota.some((a) => a.id === pemain) ? pemain : pm.id

  const kendali: CSSProperties = {
    height: 38,
    fontSize: 16,
    fontWeight: 700,
    color: TINTA,
    background: '#ffffff',
    border: `2px solid ${TINTA}`,
    borderRadius: 10,
    padding: '0 8px',
  }

  return (
    <div>
      <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>
        Dompet pribadi ↔ kas tim
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <select
          value={pilihan}
          onChange={(e) => setPemain(Number(e.target.value))}
          aria-label="Pemain"
          style={kendali}
        >
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
          style={{ ...kendali, width: 96 }}
        />
        <TombolPapan varian="garis" kecil mati={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'setor', pemain: pilihan, jumlah: n })}>
          <ArrowDownToLine size={15} strokeWidth={3} /> Setor
        </TombolPapan>
        <TombolPapan varian="garis" kecil mati={sibuk || !(n > 0)} onClick={() => onAksi({ jenis: 'tarik', pemain: pilihan, jumlah: n })}>
          <ArrowUpFromLine size={15} strokeWidth={3} /> Tarik
        </TombolPapan>
      </div>
    </div>
  )
}

function RincianPetak({ permainan, id }: { permainan: Permainan; id: number }) {
  const papan = papanDari(permainan)
  const petak = papan.petak[id]
  if (!petak) return null
  const milik = permainan.milik[id]
  const pemilik = milik ? permainan.tim[milik.tim]! : null
  const wilayah = petak.wilayah !== undefined ? papan.wilayah[petak.wilayah] : null

  return (
    <div style={{ borderTop: `2px dashed ${TINTA_LEMBUT}`, paddingTop: 10 }}>
      <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', color: TINTA_LEMBUT }}>Petak dipilih</p>
      <p style={{ fontSize: 22, fontWeight: 800 }}>{petak.nama}</p>
      {wilayah ? <p style={{ fontSize: 15, color: TINTA_LEMBUT, fontWeight: 600 }}>{wilayah.nama} · {wilayah.julukan}</p> : null}
      <p style={{ fontSize: 17, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
        {adalahProperti(petak)
          ? `Harga ${uang(petak.harga)} · bangun ${uang(petak.biayaBangun)} per tingkat · ${milik ? `${TINGKAT_BANGUNAN[milik.tingkat]}, sewa kini ${uang(sewaPetak(permainan, id))}` : 'belum ada pemilik'}`
          : adalahBandara(petak)
            ? `Harga ${uang(petak.harga)}. Sewa naik menurut jumlah bandara yang dikuasai pemiliknya.`
            : petak.jenis === 'pajak'
              ? `Bayar ${uang(PAJAK)} ke pot Parkir Bebas.`
              : petak.jenis === 'bonus'
                ? `Terima ${uang(BONUS_PETAK)} ke dompet pribadi.`
                : petak.jenis === 'parkir'
                  ? `Ambil seluruh pot (${uang(permainan.pot)}) untuk kas tim.`
                  : petak.jenis === 'mulai'
                    ? `Setiap melewatinya: gaji ${uang(permainan.pengaturan.gaji)} ke dompet pribadi.`
                    : petak.jenis === 'penjara'
                      ? 'Hanya berkunjung, kecuali sedang ditahan.'
                      : petak.jenis === 'masuk-penjara'
                        ? 'Langsung ke penjara, tanpa gaji.'
                        : 'Ambil satu kartu dan jalankan isinya.'}
      </p>
      {pemilik ? (
        <p style={{ fontSize: 16, fontWeight: 800, color: WARNA_TIM_HEX[pemilik.warna].gelap, marginTop: 4 }}>Milik {pemilik.nama}</p>
      ) : null}
    </div>
  )
}

// ------------------------------------------------------------------ Catatan & aturan
function Catatan({ permainan }: { permainan: Permainan }) {
  const terbaru = permainan.log.slice(-60).toReversed()
  const LATAR: Record<string, string> = {
    baik: '#e7f7ec',
    buruk: '#fdecea',
    penting: '#fff6db',
    biasa: 'transparent',
  }
  return (
    <ol
      aria-live="polite"
      style={{ flex: 1, overflowY: 'auto', listStyle: 'none', margin: 0, padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      {terbaru.map((e) => {
        const tim = e.tim !== undefined ? permainan.tim[e.tim] : undefined
        return (
          <li
            key={e.urut}
            style={{
              display: 'flex',
              gap: 7,
              padding: '5px 8px',
              borderRadius: 9,
              background: LATAR[e.nada],
              fontSize: 15,
              fontWeight: e.nada === 'penting' ? 700 : 600,
              color: e.nada === 'biasa' ? TINTA_LEMBUT : TINTA,
              lineHeight: 1.35,
            }}
          >
            {tim ? (
              <span style={{ width: 9, height: 9, borderRadius: 999, background: WARNA_TIM_HEX[tim.warna].isi, border: `1.5px solid ${TINTA}`, flexShrink: 0, marginTop: 4 }} />
            ) : (
              <span style={{ width: 9, flexShrink: 0 }} />
            )}
            <span>{e.teks}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Aturan({ permainan }: { permainan: Permainan }) {
  const p = permainan.pengaturan
  const baris: Array<[string, string]> = [
    ['Tim & pion', 'Satu tim dua pemain: pion bulat dan pion permata. Giliran berputar Tim 1 P1 → Tim 1 P2 → Tim 2 P1 → dan seterusnya.'],
    ['Dua dompet', `Gaji, bonus, dan hadiah kartu masuk dompet pribadi. Sewa yang diterima masuk kas tim. Properti dan bangunan dibayar kas tim; kekurangannya diambil dari dompet pemain yang sedang bermain.`],
    ['Membayar tagihan', 'Urutannya: dompet pemain yang mendarat, kas tim, dompet rekan, lalu bangunan dijual otomatis. Bila tetap kurang, tim bangkrut.'],
    ['Properti milik tim', 'Siapa pun yang membeli, propertinya milik seluruh tim. Rekan setim tidak saling membayar sewa.'],
    ['Kelompok warna', 'Kuasai tiga kota sewarna: sewa tanah kosong jadi dua kali lipat dan tim boleh membangun. Bangunan harus merata.'],
    ['Tingkat bangunan', 'Rumah → Vila → Menara → Pencakar langit. Sewa naik 4×, 10×, 25×, lalu 45× dari sewa dasar.'],
    ['Wilayah asal', 'Setiap tim punya satu wilayah asal di papan. Sewa properti tim di wilayah asalnya bertambah 25 persen.'],
    ['Bandara', 'Sewa $25 sampai $200 menurut jumlah bandara yang dikuasai. Mendarat di bandara sendiri boleh terbang ke bandara lain.'],
    ['Penjara', `Bebas dengan dadu kembar, kartu bebas, atau denda ${uang(DENDA_PENJARA)}. Setelah tiga giliran denda dipotong otomatis.`],
    ['Menang', `Kekayaan tim (kas + dompet + nilai properti + bangunan) mencapai ${uang(p.targetKekayaan)} saat giliran berakhir.`],
    ['Gugur', `Kerugian terkumpul menembus ${uang(p.targetKerugian)}, atau bangkrut. Semua properti tim itu kembali ke bank.`],
  ]
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 9 }}>
      {baris.map(([judul, isi]) => (
        <div key={judul}>
          <p style={{ fontSize: 15, fontWeight: 800, color: TINTA }}>{judul}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: TINTA_LEMBUT, lineHeight: 1.4 }}>{isi}</p>
        </div>
      ))}
    </div>
  )
}
