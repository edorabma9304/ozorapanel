/**
 * Mesin permainan — reducer murni tanpa efek samping.
 *
 *   langkah(permainan, aksi) -> permainan baru
 *
 * Semua keacakan berasal dari `permainan.acak` (PRNG mulberry32), jadi satu
 * benih selalu menghasilkan permainan yang sama — enak untuk test dan replay.
 * Aksi yang tidak sah melempar `GalatAksi` dengan pesan yang bisa langsung
 * ditampilkan ke pemain.
 */
import { KARTU, PETA_KARTU } from './kartu'
import {
  BONUS_PETAK, DENDA_PENJARA, PAJAK, SEWA_BANDARA, adalahBandara, adalahProperti, anggotaKelompok, buatPapan,
} from './papan'
import {
  PENGALI_SEWA, TINGKAT_MAKS,
  type Aksi, type Fase, type Kartu, type Papan, type Pemain, type PengaturanPermainan, type Permainan, type Peristiwa,
  type PetakBandara, type PetakProperti, type Tim,
} from './tipe'

export class GalatAksi extends Error {}

// ------------------------------------------------------------------ PRNG
function acak(benih: number): [number, number] {
  let t = (benih + 0x6d2b79f5) | 0
  let r = Math.imul(t ^ (t >>> 15), 1 | t)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  const nilai = ((r ^ (r >>> 14)) >>> 0) / 4294967296
  return [nilai, t]
}

function acakBulat(p: Permainan, maks: number) {
  const [n, benih] = acak(p.acak)
  p.acak = benih
  return 1 + Math.floor(n * maks)
}

function kocok<T>(p: Permainan, daftar: T[]): T[] {
  const hasil = [...daftar]
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = acakBulat(p, i + 1) - 1
    ;[hasil[i], hasil[j]] = [hasil[j]!, hasil[i]!]
  }
  return hasil
}

// ------------------------------------------------------------------ Papan (memo)
const cachePapan = new Map<number, Papan>()
export function papanDari(p: Pick<Permainan, 'pengaturan'>): Papan {
  const n = p.pengaturan.jumlahTim
  let papan = cachePapan.get(n)
  if (!papan) {
    papan = buatPapan(n)
    cachePapan.set(n, papan)
  }
  return papan
}

// ------------------------------------------------------------------ Pembuatan
export const PENGATURAN_BAWAAN: Omit<PengaturanPermainan, 'jumlahTim' | 'namaTim' | 'warnaTim' | 'namaPemain' | 'benih'> = {
  kasAwal: 1000,
  uangPribadiAwal: 250,
  gaji: 200,
  targetKekayaan: 4000,
  targetKerugian: 1500,
}

export function buatPermainan(pengaturan: PengaturanPermainan): Permainan {
  const tim: Tim[] = Array.from({ length: pengaturan.jumlahTim }, (_, i) => ({
    id: i,
    nama: pengaturan.namaTim[i]?.trim() || `Tim ${i + 1}`,
    warna: pengaturan.warnaTim[i]!,
    kas: pengaturan.kasAwal,
    kerugian: 0,
    gugur: false,
  }))
  const pemain: Pemain[] = []
  for (let t = 0; t < pengaturan.jumlahTim; t++) {
    for (let k = 0; k < 2; k++) {
      pemain.push({
        id: pemain.length,
        tim: t,
        nama: pengaturan.namaPemain[t]?.[k]?.trim() || `${tim[t]!.nama} P${k + 1}`,
        bentuk: k === 0 ? 'bulat' : 'permata',
        posisi: 0,
        uang: pengaturan.uangPribadiAwal,
        diPenjara: false,
        giliranPenjara: 0,
        kartuBebas: 0,
      })
    }
  }
  const p: Permainan = {
    versi: 1,
    pengaturan,
    tim,
    pemain,
    milik: {},
    giliran: 1,
    pemainAktif: 0,
    fase: { jenis: 'lempar' },
    dadu: null,
    kembarBeruntun: 0,
    pot: 0,
    tumpukan: { kesempatan: [], harta: [] },
    log: [],
    acak: pengaturan.benih | 0,
  }
  p.tumpukan.kesempatan = kocok(p, KARTU.filter((k) => k.jenis === 'kesempatan').map((k) => k.id))
  p.tumpukan.harta = kocok(p, KARTU.filter((k) => k.jenis === 'harta').map((k) => k.id))
  catat(p, `Permainan dimulai dengan ${tim.length} tim. ${pemain[0]!.nama} melempar dadu lebih dulu.`, 'penting')
  return p
}

// ------------------------------------------------------------------ Pembacaan
export function pemainAktif(p: Permainan) {
  return p.pemain[p.pemainAktif]!
}
export function timAktif(p: Permainan) {
  return p.tim[pemainAktif(p).tim]!
}
export function anggotaTim(p: Permainan, tim: number) {
  return p.pemain.filter((x) => x.tim === tim)
}
export function timAktifSemua(p: Permainan) {
  return p.tim.filter((t) => !t.gugur)
}

export function kekayaanTim(p: Permainan, tim: number): number {
  const papan = papanDari(p)
  let total = p.tim[tim]!.kas + anggotaTim(p, tim).reduce((a, x) => a + x.uang, 0)
  for (const [idStr, m] of Object.entries(p.milik)) {
    if (m.tim !== tim) continue
    const petak = papan.petak[Number(idStr)]!
    if (adalahProperti(petak)) total += petak.harga + m.tingkat * petak.biayaBangun
    else if (adalahBandara(petak)) total += petak.harga
  }
  return total
}

export function jumlahBandaraTim(p: Permainan, tim: number) {
  const papan = papanDari(p)
  return papan.indeks.bandara.filter((id) => p.milik[id]?.tim === tim).length
}

export function kelompokLengkap(p: Permainan, kelompok: string, tim: number) {
  return anggotaKelompok(papanDari(p), kelompok).every((x) => p.milik[x.id]?.tim === tim)
}

/** Sewa yang harus dibayar bila pemain lawan mendarat di petak ini. */
export function sewaPetak(p: Permainan, id: number): number {
  const papan = papanDari(p)
  const petak = papan.petak[id]!
  const m = p.milik[id]
  if (!m) return 0
  if (adalahBandara(petak)) return SEWA_BANDARA[Math.min(jumlahBandaraTim(p, m.tim), 4) - 1]!
  if (!adalahProperti(petak)) return 0
  const sewa = petak.sewaDasar * PENGALI_SEWA[m.tingkat]!
  // Kelompok warna penuh menggandakan sewa tanah kosong. Tidak ada pengali
  // tersembunyi lain: pemain harus bisa menghitung sewa tanpa membuka aturan.
  return m.tingkat === 0 && kelompokLengkap(p, petak.kelompok, m.tim) ? sewa * 2 : sewa
}

/** Alasan tidak boleh membangun, atau null bila boleh. */
export function alasanTakBolehBangun(p: Permainan, id: number, tim: number): string | null {
  const papan = papanDari(p)
  const petak = papan.petak[id]!
  if (!adalahProperti(petak)) return 'Bangunan hanya bisa didirikan di kota.'
  const m = p.milik[id]
  if (!m || m.tim !== tim) return 'Kota ini bukan milik tim Anda.'
  if (!kelompokLengkap(p, petak.kelompok, tim)) return 'Kuasai ketiga kota dalam kelompok warna ini dulu.'
  if (m.tingkat >= TINGKAT_MAKS) return 'Sudah pencakar langit — tingkat tertinggi.'
  const terendah = Math.min(...anggotaKelompok(papan, petak.kelompok).map((x) => p.milik[x.id]?.tingkat ?? 0))
  if (m.tingkat > terendah) return 'Bangun merata: kota lain di kelompok ini masih lebih rendah.'
  const t = p.tim[tim]!
  const kasGabungan = t.kas + (p.fase.jenis === 'aksi' ? pemainAktif(p).uang : 0)
  if (kasGabungan < petak.biayaBangun) return `Butuh $${petak.biayaBangun}; kas tim dan dompet Anda tidak cukup.`
  return null
}

// ------------------------------------------------------------------ Utilitas mutasi
function salin(p: Permainan): Permainan {
  return JSON.parse(JSON.stringify(p)) as Permainan
}

function catat(p: Permainan, teks: string, nada: Peristiwa['nada'] = 'biasa', tim?: number) {
  const urut = (p.log[p.log.length - 1]?.urut ?? 0) + 1
  p.log.push({ urut, teks, nada, tim })
  if (p.log.length > 200) p.log.splice(0, p.log.length - 200)
}

function pastikanFase<J extends Fase['jenis']>(p: Permainan, jenis: J): Extract<Fase, { jenis: J }> {
  if (p.fase.jenis !== jenis) throw new GalatAksi(`Aksi ini tidak tersedia sekarang (fase: ${p.fase.jenis}).`)
  return p.fase as Extract<Fase, { jenis: J }>
}

/**
 * Menagih `jumlah` dari pemain: dompet pribadi → kas tim → dompet rekan.
 * Bila masih kurang, bangunan dijual otomatis (setengah harga). Bila tetap
 * kurang, tim bangkrut. Mengembalikan jumlah yang benar-benar terbayar.
 */
function tagih(p: Permainan, pemainId: number, jumlah: number, alasan: string): number {
  if (jumlah <= 0) return 0
  const pemain = p.pemain[pemainId]!
  const tim = p.tim[pemain.tim]!
  const rekan = anggotaTim(p, pemain.tim).find((x) => x.id !== pemainId)!
  let sisa = jumlah

  const ambil = (dari: { uang: number } | { kas: number }) => {
    const kunci = 'uang' in dari ? 'uang' : 'kas'
    const tersedia = (dari as Record<string, number>)[kunci]!
    const diambil = Math.min(tersedia, sisa)
    ;(dari as Record<string, number>)[kunci] = tersedia - diambil
    sisa -= diambil
  }
  ambil(pemain)
  if (sisa > 0) ambil(tim)
  if (sisa > 0) ambil(rekan)

  if (sisa > 0) {
    // Likuidasi bangunan, tingkat tertinggi dulu.
    const papan = papanDari(p)
    const bangunan = Object.entries(p.milik)
      .filter(([, m]) => m.tim === tim.id && m.tingkat > 0)
      .map(([id, m]) => ({ id: Number(id), m, petak: papan.petak[Number(id)] as PetakProperti }))
      .sort((a, b) => b.m.tingkat - a.m.tingkat)
    for (const b of bangunan) {
      while (sisa > 0 && b.m.tingkat > 0) {
        b.m.tingkat--
        const laku = Math.floor(b.petak.biayaBangun / 2)
        catat(p, `${tim.nama} terpaksa menjual bangunan di ${b.petak.nama} seharga $${laku}.`, 'buruk', tim.id)
        sisa -= laku
      }
    }
    if (sisa < 0) {
      tim.kas += -sisa
      sisa = 0
    }
  }

  const terbayar = jumlah - sisa
  tim.kerugian += terbayar
  if (sisa > 0) {
    gugurkan(p, tim.id, `bangkrut saat ${alasan} (kurang $${sisa})`)
  } else if (tim.kerugian >= p.pengaturan.targetKerugian) {
    gugurkan(p, tim.id, `kerugian mencapai $${tim.kerugian}, melewati batas $${p.pengaturan.targetKerugian}`)
  }
  return terbayar
}

/** Bayar belanja (properti/bangunan): kas tim dulu, lalu dompet pemain aktif. Tidak pernah memaksa jual. */
function belanja(p: Permainan, pemainId: number, jumlah: number): boolean {
  const pemain = p.pemain[pemainId]!
  const tim = p.tim[pemain.tim]!
  if (tim.kas + pemain.uang < jumlah) return false
  const dariKas = Math.min(tim.kas, jumlah)
  tim.kas -= dariKas
  pemain.uang -= jumlah - dariKas
  return true
}

function gugurkan(p: Permainan, timId: number, alasan: string) {
  const tim = p.tim[timId]!
  if (tim.gugur) return
  tim.gugur = true
  tim.alasanGugur = alasan
  for (const id of Object.keys(p.milik)) {
    if (p.milik[Number(id)]!.tim === timId) delete p.milik[Number(id)]
  }
  tim.kas = 0
  for (const x of anggotaTim(p, timId)) x.uang = 0
  catat(p, `${tim.nama} GUGUR: ${alasan}. Semua propertinya kembali ke bank.`, 'buruk', timId)
  periksaAkhir(p)
}

function periksaAkhir(p: Permainan) {
  if (p.fase.jenis === 'selesai') return
  const hidup = timAktifSemua(p)
  if (hidup.length === 1) {
    p.fase = { jenis: 'selesai', pemenang: hidup[0]!.id, alasan: 'satu-satunya tim yang bertahan' }
    catat(p, `${hidup[0]!.nama} MENANG sebagai tim terakhir yang bertahan!`, 'penting', hidup[0]!.id)
    return
  }
  if (hidup.length === 0) {
    p.fase = { jenis: 'selesai', pemenang: null, alasan: 'semua tim gugur' }
    catat(p, 'Semua tim gugur. Tidak ada pemenang.', 'penting')
  }
}

function periksaKemenangan(p: Permainan) {
  if (p.fase.jenis === 'selesai') return
  const kandidat = timAktifSemua(p)
    .map((t) => ({ t, kekayaan: kekayaanTim(p, t.id) }))
    .filter((x) => x.kekayaan >= p.pengaturan.targetKekayaan)
    .sort((a, b) => b.kekayaan - a.kekayaan)
  if (kandidat.length > 0) {
    const { t, kekayaan } = kandidat[0]!
    p.fase = { jenis: 'selesai', pemenang: t.id, alasan: `kekayaan $${kekayaan} mencapai target $${p.pengaturan.targetKekayaan}` }
    catat(p, `${t.nama} MENANG dengan kekayaan $${kekayaan}!`, 'penting', t.id)
  }
}

function masukPenjara(p: Permainan, pemain: Pemain) {
  const papan = papanDari(p)
  pemain.posisi = papan.indeks.penjara
  pemain.diPenjara = true
  pemain.giliranPenjara = 0
  p.kembarBeruntun = 0
  catat(p, `${pemain.nama} masuk penjara.`, 'buruk', pemain.tim)
}

function ambilKartu(p: Permainan, jenis: Kartu['jenis']): Kartu {
  const tumpukan = p.tumpukan[jenis]
  const id = tumpukan.shift()!
  tumpukan.push(id)
  return PETA_KARTU[id]!
}

function giliranBerikutnya(p: Permainan) {
  if (p.fase.jenis === 'selesai') return
  const n = p.pemain.length
  let i = p.pemainAktif
  for (let langkahKe = 0; langkahKe < n; langkahKe++) {
    i = (i + 1) % n
    if (!p.tim[p.pemain[i]!.tim]!.gugur) break
  }
  if (i <= p.pemainAktif) p.giliran++
  p.pemainAktif = i
  p.dadu = null
  p.kembarBeruntun = 0
  p.fase = { jenis: 'lempar' }
}

function mulaiGerak(p: Permainan, pemain: Pemain, ke: number, jumlahLangkah: number) {
  p.fase = { jenis: 'bergerak', dari: pemain.posisi, ke, langkah: jumlahLangkah }
}

// ------------------------------------------------------------------ Penyelesaian petak
function selesaikanPendaratan(p: Permainan, pemain: Pemain) {
  const papan = papanDari(p)
  const petak = papan.petak[pemain.posisi]!
  const tim = p.tim[pemain.tim]!

  switch (petak.jenis) {
    case 'properti':
    case 'bandara': {
      const m = p.milik[petak.id]
      if (!m) {
        p.fase = { jenis: 'tawaran', petak: petak.id }
        return
      }
      if (m.tim === pemain.tim) {
        catat(p, `${pemain.nama} singgah di ${petak.nama}, milik tim sendiri.`, 'biasa', pemain.tim)
        p.fase = { jenis: 'aksi' }
        return
      }
      const sewa = sewaPetak(p, petak.id)
      const pemilik = p.tim[m.tim]!
      const terbayar = tagih(p, pemain.id, sewa, `membayar sewa ${petak.nama}`)
      pemilik.kas += terbayar
      catat(p, `${pemain.nama} membayar sewa $${terbayar} ke ${pemilik.nama} untuk ${petak.nama}.`, 'buruk', pemain.tim)
      break
    }
    case 'kesempatan':
    case 'harta': {
      const kartu = ambilKartu(p, petak.jenis)
      catat(p, `${pemain.nama} menarik kartu ${petak.nama}: “${kartu.teks}”`, 'penting', pemain.tim)
      p.fase = { jenis: 'kartu', kartu }
      return
    }
    case 'pajak': {
      const terbayar = tagih(p, pemain.id, PAJAK, 'membayar pajak')
      p.pot += terbayar
      catat(p, `${pemain.nama} membayar pajak $${terbayar}. Pot Parkir Bebas kini $${p.pot}.`, 'buruk', pemain.tim)
      break
    }
    case 'bonus':
      pemain.uang += BONUS_PETAK
      catat(p, `${pemain.nama} mendapat bonus $${BONUS_PETAK}.`, 'baik', pemain.tim)
      break
    case 'parkir':
      if (p.pot > 0) {
        tim.kas += p.pot
        catat(p, `${pemain.nama} mengambil pot Parkir Bebas $${p.pot} untuk kas ${tim.nama}!`, 'baik', pemain.tim)
        p.pot = 0
      } else {
        catat(p, `${pemain.nama} beristirahat di Parkir Bebas.`, 'biasa', pemain.tim)
      }
      break
    case 'masuk-penjara':
      masukPenjara(p, pemain)
      break
    case 'mulai':
    case 'penjara':
      catat(p, `${pemain.nama} berhenti di ${petak.nama}.`, 'biasa', pemain.tim)
      break
  }
  if (p.fase.jenis !== 'selesai') p.fase = { jenis: 'aksi' }
  if (tim.gugur && p.fase.jenis === 'aksi') giliranBerikutnya(p)
}

// ------------------------------------------------------------------ Reducer
export function langkah(sebelum: Permainan, aksi: Aksi): Permainan {
  const p = salin(sebelum)
  if (p.fase.jenis === 'selesai' && aksi.jenis !== 'menyerah') throw new GalatAksi('Permainan sudah selesai.')
  const papan = papanDari(p)
  const pemain = pemainAktif(p)
  const tim = p.tim[pemain.tim]!
  const N = papan.petak.length

  switch (aksi.jenis) {
    case 'lempar': {
      pastikanFase(p, 'lempar')
      const d1 = acakBulat(p, 6)
      const d2 = acakBulat(p, 6)
      p.dadu = [d1, d2]
      const kembar = d1 === d2
      const total = d1 + d2

      if (pemain.diPenjara) {
        if (kembar) {
          pemain.diPenjara = false
          catat(p, `${pemain.nama} melempar kembar ${d1}-${d2} dan bebas dari penjara!`, 'baik', pemain.tim)
          p.kembarBeruntun = 0 // bebas dari penjara tidak memberi lemparan ekstra
          mulaiGerak(p, pemain, (pemain.posisi + total) % N, total)
          return p
        }
        pemain.giliranPenjara++
        if (pemain.giliranPenjara >= 3) {
          const terbayar = tagih(p, pemain.id, DENDA_PENJARA, 'membayar denda penjara')
          p.pot += terbayar
          pemain.diPenjara = false
          catat(p, `${pemain.nama} membayar denda $${terbayar} setelah 3 giliran dan bebas.`, 'buruk', pemain.tim)
          if (tim.gugur) {
            giliranBerikutnya(p)
            return p
          }
          mulaiGerak(p, pemain, (pemain.posisi + total) % N, total)
          return p
        }
        catat(p, `${pemain.nama} melempar ${d1}-${d2}, masih di penjara (giliran ${pemain.giliranPenjara}/3).`, 'biasa', pemain.tim)
        p.fase = { jenis: 'aksi' }
        return p
      }

      if (kembar) {
        p.kembarBeruntun++
        if (p.kembarBeruntun >= 3) {
          catat(p, `${pemain.nama} melempar kembar tiga kali berturut-turut — dicurigai curang!`, 'buruk', pemain.tim)
          masukPenjara(p, pemain)
          p.fase = { jenis: 'aksi' }
          return p
        }
      }
      catat(p, `${pemain.nama} melempar ${d1}-${d2} = ${total}${kembar ? ' (kembar, dapat giliran lagi)' : ''}.`, 'biasa', pemain.tim)
      mulaiGerak(p, pemain, (pemain.posisi + total) % N, total)
      return p
    }

    case 'bayar-keluar-penjara': {
      pastikanFase(p, 'lempar')
      if (!pemain.diPenjara) throw new GalatAksi('Pemain tidak sedang di penjara.')
      const terbayar = tagih(p, pemain.id, DENDA_PENJARA, 'membayar denda penjara')
      p.pot += terbayar
      pemain.diPenjara = false
      pemain.giliranPenjara = 0
      catat(p, `${pemain.nama} membayar $${terbayar} dan keluar dari penjara.`, 'biasa', pemain.tim)
      if (tim.gugur) giliranBerikutnya(p)
      return p
    }

    case 'pakai-kartu-bebas': {
      pastikanFase(p, 'lempar')
      if (!pemain.diPenjara) throw new GalatAksi('Pemain tidak sedang di penjara.')
      if (pemain.kartuBebas < 1) throw new GalatAksi('Tidak punya kartu bebas penjara.')
      pemain.kartuBebas--
      pemain.diPenjara = false
      pemain.giliranPenjara = 0
      catat(p, `${pemain.nama} memakai kartu bebas penjara.`, 'baik', pemain.tim)
      return p
    }

    case 'tiba': {
      const f = pastikanFase(p, 'bergerak')
      const lewatMulai = f.langkah > 0 && f.ke < f.dari
      pemain.posisi = f.ke
      if (lewatMulai) {
        pemain.uang += p.pengaturan.gaji
        catat(p, `${pemain.nama} melewati Mulai dan menerima gaji $${p.pengaturan.gaji}.`, 'baik', pemain.tim)
      }
      selesaikanPendaratan(p, pemain)
      return p
    }

    case 'beli': {
      const f = pastikanFase(p, 'tawaran')
      const petak = papan.petak[f.petak] as PetakProperti | PetakBandara
      if (!belanja(p, pemain.id, petak.harga)) {
        throw new GalatAksi(`Butuh $${petak.harga}. Kas tim ($${tim.kas}) dan dompet ${pemain.nama} ($${pemain.uang}) tidak cukup.`)
      }
      p.milik[petak.id] = { tim: pemain.tim, tingkat: 0 }
      catat(p, `${tim.nama} membeli ${petak.nama} seharga $${petak.harga}.`, 'baik', pemain.tim)
      p.fase = { jenis: 'aksi' }
      return p
    }

    case 'lewati': {
      const f = pastikanFase(p, 'tawaran')
      catat(p, `${pemain.nama} tidak membeli ${papan.petak[f.petak]!.nama}.`, 'biasa', pemain.tim)
      p.fase = { jenis: 'aksi' }
      return p
    }

    case 'terapkan-kartu': {
      const f = pastikanFase(p, 'kartu')
      const e = f.kartu.efek
      switch (e.jenis) {
        case 'uang': {
          if (e.jumlah >= 0) {
            if (e.ke === 'kas') tim.kas += e.jumlah
            else pemain.uang += e.jumlah
          } else {
            const terbayar = tagih(p, pemain.id, -e.jumlah, 'membayar kartu')
            p.pot += terbayar
          }
          break
        }
        case 'bayar-tiap-tim': {
          for (const lain of timAktifSemua(p)) {
            if (lain.id === tim.id || tim.gugur) continue
            lain.kas += tagih(p, pemain.id, e.jumlah, 'membayar ke tim lain')
          }
          break
        }
        case 'terima-tiap-tim': {
          for (const lain of timAktifSemua(p)) {
            if (lain.id === tim.id) continue
            const diambil = Math.min(lain.kas, e.jumlah)
            lain.kas -= diambil
            lain.kerugian += diambil
            pemain.uang += diambil
          }
          break
        }
        case 'kartu-bebas':
          pemain.kartuBebas++
          break
        case 'perbaikan': {
          const tingkat = Object.values(p.milik).filter((m) => m.tim === tim.id).reduce((a, m) => a + m.tingkat, 0)
          const biaya = tingkat * e.perTingkat
          if (biaya > 0) p.pot += tagih(p, pemain.id, biaya, 'membayar renovasi')
          else catat(p, `${tim.nama} belum punya bangunan, tidak ada biaya renovasi.`, 'biasa', tim.id)
          break
        }
        case 'pindah': {
          if (e.ke === 'penjara') {
            masukPenjara(p, pemain)
            break
          }
          if (e.ke === 'mulai') {
            mulaiGerak(p, pemain, 0, (N - pemain.posisi) % N || N)
            return p
          }
          if (e.ke === 'mundur-3') {
            p.fase = { jenis: 'bergerak', dari: pemain.posisi, ke: (pemain.posisi - 3 + N) % N, langkah: -3 }
            return p
          }
          const tujuan = papan.indeks.bandara.find((id) => id > pemain.posisi) ?? papan.indeks.bandara[0]!
          const jarak = (tujuan - pemain.posisi + N) % N
          mulaiGerak(p, pemain, tujuan, jarak)
          return p
        }
      }
      if (p.fase.jenis !== 'selesai') p.fase = { jenis: 'aksi' }
      if (tim.gugur) giliranBerikutnya(p)
      return p
    }

    case 'bangun': {
      pastikanFase(p, 'aksi')
      const alasan = alasanTakBolehBangun(p, aksi.petak, pemain.tim)
      if (alasan) throw new GalatAksi(alasan)
      const petak = papan.petak[aksi.petak] as PetakProperti
      belanja(p, pemain.id, petak.biayaBangun)
      p.milik[aksi.petak]!.tingkat++
      catat(p, `${tim.nama} membangun tingkat ${p.milik[aksi.petak]!.tingkat} di ${petak.nama} ($${petak.biayaBangun}).`, 'baik', pemain.tim)
      return p
    }

    case 'jual-bangunan': {
      pastikanFase(p, 'aksi')
      const m = p.milik[aksi.petak]
      const petak = papan.petak[aksi.petak]!
      if (!m || m.tim !== pemain.tim || !adalahProperti(petak)) throw new GalatAksi('Kota ini bukan milik tim Anda.')
      if (m.tingkat === 0) throw new GalatAksi('Tidak ada bangunan untuk dijual.')
      const tertinggi = Math.max(...anggotaKelompok(papan, petak.kelompok).map((x) => p.milik[x.id]?.tingkat ?? 0))
      if (m.tingkat < tertinggi) throw new GalatAksi('Jual dari kota dengan bangunan tertinggi dulu supaya tetap merata.')
      m.tingkat--
      const laku = Math.floor(petak.biayaBangun / 2)
      tim.kas += laku
      catat(p, `${tim.nama} menjual satu tingkat bangunan di ${petak.nama} seharga $${laku}.`, 'biasa', pemain.tim)
      return p
    }

    case 'setor':
    case 'tarik': {
      if (!['lempar', 'aksi', 'tawaran'].includes(p.fase.jenis)) throw new GalatAksi('Transfer hanya bisa dilakukan di luar fase bergerak.')
      const target = p.pemain[aksi.pemain]
      if (!target || target.tim !== pemain.tim) throw new GalatAksi('Hanya anggota tim yang sedang bermain yang bisa transfer.')
      const jumlah = Math.floor(aksi.jumlah)
      if (!(jumlah > 0)) throw new GalatAksi('Jumlah harus lebih dari nol.')
      if (aksi.jenis === 'setor') {
        if (target.uang < jumlah) throw new GalatAksi(`Dompet ${target.nama} hanya $${target.uang}.`)
        target.uang -= jumlah
        tim.kas += jumlah
        catat(p, `${target.nama} menyetor $${jumlah} ke kas ${tim.nama}.`, 'biasa', pemain.tim)
      } else {
        if (tim.kas < jumlah) throw new GalatAksi(`Kas tim hanya $${tim.kas}.`)
        tim.kas -= jumlah
        target.uang += jumlah
        catat(p, `${target.nama} menarik $${jumlah} dari kas ${tim.nama}.`, 'biasa', pemain.tim)
      }
      return p
    }

    case 'akhiri-giliran': {
      pastikanFase(p, 'aksi')
      periksaKemenangan(p)
      if (p.fase.jenis === 'selesai') return p
      const kembar = p.dadu !== null && p.dadu[0] === p.dadu[1] && p.kembarBeruntun > 0 && !pemain.diPenjara
      if (kembar) {
        p.fase = { jenis: 'lempar' }
        catat(p, `${pemain.nama} melempar lagi karena dadu kembar.`, 'biasa', pemain.tim)
        return p
      }
      giliranBerikutnya(p)
      return p
    }

    case 'menyerah': {
      const t = p.tim[aksi.tim]
      if (!t || t.gugur) throw new GalatAksi('Tim tidak ditemukan atau sudah gugur.')
      gugurkan(p, aksi.tim, 'menyerah')
      if (p.fase.jenis !== 'selesai' && pemainAktif(p).tim === aksi.tim) giliranBerikutnya(p)
      return p
    }
  }
}
