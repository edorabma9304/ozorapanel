/**
 * Suara permainan — disintesis dengan Web Audio, tanpa berkas audio dan tanpa
 * pustaka. Alasannya sama dengan gambar cadangan di `aset.tsx`: permainan
 * harus utuh tanpa menunggu aset diunggah, dan bundel tetap ringan.
 *
 * Browser melarang audio berbunyi sebelum ada interaksi, jadi AudioContext
 * baru dibuat saat bunyi pertama diminta — yang selalu berasal dari klik.
 */
import { APP } from '@/config/app'
import type { Permainan } from './tipe'

export type NamaEfek =
  | 'dadu'
  | 'langkah'
  | 'kartu'
  | 'harta'
  | 'beli'
  | 'klik'
  | 'penjara'
  | 'bayar'
  | 'bonus'
  | 'bangun'
  | 'gugur'
  | 'menang'

// ------------------------------------------------------------------ Dasar audio
let ctx: AudioContext | null = null
let utama: GainNode | null = null
let bufDesis: AudioBuffer | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Konstruktor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Konstruktor) return null
    ctx = new Konstruktor()
    utama = ctx.createGain()
    utama.gain.value = 0.85
    utama.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function desis(c: AudioContext): AudioBuffer {
  if (!bufDesis) {
    bufDesis = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const data = bufDesis.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return bufDesis
}

/** Satu nada dengan amplop naik-turun sederhana. */
function nada(
  c: AudioContext,
  { hz, mulai, durasi, bentuk = 'sine', puncak = 0.2, hzAkhir }: {
    hz: number
    mulai: number
    durasi: number
    bentuk?: OscillatorType
    puncak?: number
    hzAkhir?: number
  },
) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = bentuk
  osc.frequency.setValueAtTime(hz, mulai)
  if (hzAkhir) osc.frequency.exponentialRampToValueAtTime(Math.max(20, hzAkhir), mulai + durasi)
  gain.gain.setValueAtTime(0.0001, mulai)
  gain.gain.exponentialRampToValueAtTime(puncak, mulai + Math.min(0.02, durasi / 3))
  gain.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi)
  osc.connect(gain).connect(utama!)
  osc.start(mulai)
  osc.stop(mulai + durasi + 0.02)
}

/** Semburan desis yang disaring — untuk benturan, gesekan kertas, dan derap. */
function semburan(
  c: AudioContext,
  { mulai, durasi, hz, q = 1, puncak = 0.2, hzAkhir }: {
    mulai: number
    durasi: number
    hz: number
    q?: number
    puncak?: number
    hzAkhir?: number
  },
) {
  const src = c.createBufferSource()
  src.buffer = desis(c)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(hz, mulai)
  if (hzAkhir) filter.frequency.exponentialRampToValueAtTime(Math.max(60, hzAkhir), mulai + durasi)
  filter.Q.value = q
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, mulai)
  gain.gain.exponentialRampToValueAtTime(puncak, mulai + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, mulai + durasi)
  src.connect(filter).connect(gain).connect(utama!)
  src.start(mulai)
  src.stop(mulai + durasi + 0.02)
}

// ------------------------------------------------------------------ Efek
function mainkanEfek(nama: NamaEfek) {
  const c = audio()
  if (!c) return
  const t = c.currentTime

  switch (nama) {
    case 'dadu':
      // Dadu beradu di dalam genggaman: beberapa benturan kayu beruntun.
      for (let i = 0; i < 9; i++) {
        const saat = t + i * 0.11 + Math.random() * 0.03
        semburan(c, { mulai: saat, durasi: 0.05, hz: 1100 + Math.random() * 900, q: 3, puncak: 0.16 })
        nada(c, { hz: 200 + Math.random() * 120, mulai: saat, durasi: 0.05, bentuk: 'triangle', puncak: 0.06 })
      }
      break
    case 'langkah':
      semburan(c, { mulai: t, durasi: 0.05, hz: 900, q: 2, puncak: 0.1 })
      nada(c, { hz: 320, mulai: t, durasi: 0.06, bentuk: 'triangle', puncak: 0.05, hzAkhir: 200 })
      break
    case 'kartu':
      // Kartu ditarik dari tumpukan: gesekan kertas menyapu ke atas.
      semburan(c, { mulai: t, durasi: 0.34, hz: 700, hzAkhir: 2600, q: 0.8, puncak: 0.16 })
      nada(c, { hz: 520, mulai: t + 0.18, durasi: 0.18, bentuk: 'triangle', puncak: 0.09 })
      break
    case 'harta':
      // Peti harta terbuka: arpeggio berkilau.
      [0, 4, 7, 12, 16].forEach((semi, i) => {
        nada(c, { hz: 440 * 2 ** (semi / 12), mulai: t + i * 0.07, durasi: 0.34, bentuk: 'triangle', puncak: 0.14 })
      })
      break
    case 'beli':
      // Koin masuk laci: dua nada naik plus dentingan.
      nada(c, { hz: 660, mulai: t, durasi: 0.1, bentuk: 'square', puncak: 0.1 })
      nada(c, { hz: 990, mulai: t + 0.08, durasi: 0.22, bentuk: 'triangle', puncak: 0.14 })
      semburan(c, { mulai: t + 0.08, durasi: 0.12, hz: 5200, q: 6, puncak: 0.08 })
      break
    case 'klik':
      semburan(c, { mulai: t, durasi: 0.03, hz: 2200, q: 4, puncak: 0.09 })
      break
    case 'penjara':
      // Pintu jeruji dibanting.
      semburan(c, { mulai: t, durasi: 0.5, hz: 380, hzAkhir: 140, q: 1.4, puncak: 0.26 })
      nada(c, { hz: 150, mulai: t, durasi: 0.5, bentuk: 'square', puncak: 0.12, hzAkhir: 70 })
      nada(c, { hz: 1400, mulai: t + 0.02, durasi: 0.3, bentuk: 'triangle', puncak: 0.07 })
      break
    case 'bayar':
      nada(c, { hz: 560, mulai: t, durasi: 0.14, bentuk: 'triangle', puncak: 0.12, hzAkhir: 300 })
      nada(c, { hz: 280, mulai: t + 0.1, durasi: 0.22, bentuk: 'sine', puncak: 0.1, hzAkhir: 170 })
      break
    case 'bonus':
      nada(c, { hz: 780, mulai: t, durasi: 0.14, bentuk: 'triangle', puncak: 0.11 })
      nada(c, { hz: 1170, mulai: t + 0.1, durasi: 0.24, bentuk: 'triangle', puncak: 0.11 })
      break
    case 'bangun':
      // Palu menghantam papan.
      semburan(c, { mulai: t, durasi: 0.13, hz: 500, hzAkhir: 180, q: 1.2, puncak: 0.24 })
      nada(c, { hz: 120, mulai: t, durasi: 0.18, bentuk: 'square', puncak: 0.12, hzAkhir: 60 })
      break
    case 'gugur':
      nada(c, { hz: 420, mulai: t, durasi: 0.9, bentuk: 'sawtooth', puncak: 0.14, hzAkhir: 70 })
      semburan(c, { mulai: t + 0.1, durasi: 0.6, hz: 600, hzAkhir: 120, q: 0.8, puncak: 0.1 })
      break
    case 'menang':
      [0, 4, 7, 12].forEach((semi, i) => {
        nada(c, { hz: 523.25 * 2 ** (semi / 12), mulai: t + i * 0.13, durasi: 0.5, bentuk: 'triangle', puncak: 0.16 })
      })
      ;[0, 7, 12, 16].forEach((semi) => {
        nada(c, { hz: 523.25 * 2 ** (semi / 12), mulai: t + 0.56, durasi: 1.1, bentuk: 'sine', puncak: 0.12 })
      })
      break
  }
}

// ------------------------------------------------------------------ Musik latar
/**
 * Empat birama berulang, nada rendah yang lembut supaya tidak melelahkan.
 * Dijadwalkan sedikit demi sedikit ke depan, cara baku Web Audio supaya
 * ketukan tidak meleset saat tab sibuk.
 */
const BIRAMA = 3.2
const AKOR: number[][] = [
  [-12, -5, 0, 4],
  [-14, -7, -3, 2],
  [-17, -10, -5, -1],
  [-15, -8, -3, 0],
]
const ARPEGGIO = [0, 7, 12, 7, 16, 7, 12, 4]
const DASAR = 220

let jam: ReturnType<typeof setInterval> | null = null
let birama = 0
let waktuBerikut = 0
let gainMusik: GainNode | null = null

function jadwalkanBirama(c: AudioContext, mulai: number) {
  const akor = AKOR[birama % AKOR.length]!
  for (const semi of akor) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = DASAR * 2 ** (semi / 12)
    g.gain.setValueAtTime(0.0001, mulai)
    g.gain.exponentialRampToValueAtTime(0.07, mulai + 0.6)
    g.gain.exponentialRampToValueAtTime(0.0001, mulai + BIRAMA)
    osc.connect(g).connect(gainMusik!)
    osc.start(mulai)
    osc.stop(mulai + BIRAMA + 0.05)
  }
  ARPEGGIO.forEach((semi, i) => {
    const saat = mulai + (i * BIRAMA) / ARPEGGIO.length
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = DASAR * 2 * 2 ** ((semi + akor[0]! + 12) / 12)
    g.gain.setValueAtTime(0.0001, saat)
    g.gain.exponentialRampToValueAtTime(0.035, saat + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, saat + 0.45)
    osc.connect(g).connect(gainMusik!)
    osc.start(saat)
    osc.stop(saat + 0.5)
  })
  birama++
}

function mulaiMusik() {
  const c = audio()
  if (!c || jam) return
  if (!gainMusik) {
    gainMusik = c.createGain()
    gainMusik.gain.value = 0.55
    gainMusik.connect(utama!)
  }
  waktuBerikut = c.currentTime + 0.15
  jam = setInterval(() => {
    if (!ctx) return
    while (waktuBerikut < ctx.currentTime + 2) {
      jadwalkanBirama(ctx, waktuBerikut)
      waktuBerikut += BIRAMA
    }
  }, 400)
}

function hentikanMusik() {
  if (jam) clearInterval(jam)
  jam = null
  if (gainMusik && ctx) {
    gainMusik.gain.cancelScheduledValues(ctx.currentTime)
    gainMusik.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25)
    const simpul = gainMusik
    setTimeout(() => {
      if (simpul === gainMusik && ctx) gainMusik.gain.setValueAtTime(0.55, ctx.currentTime)
    }, 1200)
  }
}

// ------------------------------------------------------------------ Sakelar
const KUNCI_MUSIK = `${APP.prefiksSimpanan}monopoli_musik`
const KUNCI_EFEK = `${APP.prefiksSimpanan}monopoli_efek`

function baca(kunci: string) {
  try {
    return localStorage.getItem(kunci) !== '0'
  } catch {
    return true
  }
}

let musikAktif = baca(KUNCI_MUSIK)
let efekAktif = baca(KUNCI_EFEK)
const pendengar = new Set<() => void>()
let cuplikan = { musik: musikAktif, efek: efekAktif }

function siarkan() {
  cuplikan = { musik: musikAktif, efek: efekAktif }
  for (const p of pendengar) p()
}

function simpan(kunci: string, nilai: boolean) {
  try {
    localStorage.setItem(kunci, nilai ? '1' : '0')
  } catch {
    // mode privat — cukup berlaku untuk sesi ini
  }
}

export const suara = {
  efek(nama: NamaEfek) {
    if (!efekAktif) return
    mainkanEfek(nama)
  },
  /** Dipanggil saat papan terbuka; musik hanya jalan bila sakelarnya hidup. */
  masukPermainan() {
    if (musikAktif) mulaiMusik()
  },
  keluarPermainan() {
    hentikanMusik()
  },
  aturMusik(nilai: boolean) {
    musikAktif = nilai
    simpan(KUNCI_MUSIK, nilai)
    if (nilai) mulaiMusik()
    else hentikanMusik()
    siarkan()
  },
  aturEfek(nilai: boolean) {
    efekAktif = nilai
    simpan(KUNCI_EFEK, nilai)
    if (nilai) mainkanEfek('klik')
    siarkan()
  },
  langganan(cb: () => void) {
    pendengar.add(cb)
    return () => pendengar.delete(cb)
  },
  cuplikan: () => cuplikan,
}

// ------------------------------------------------------------------ Pemetaan peristiwa
/**
 * Bunyi apa yang pantas untuk perubahan keadaan ini. Murni supaya bisa diuji
 * dan supaya pemanggilnya tidak perlu tahu detail permainan.
 */
export function efekDariPerubahan(sebelum: Permainan, sesudah: Permainan): NamaEfek[] {
  const keluar: NamaEfek[] = []

  if (sesudah.fase.jenis === 'kartu' && sebelum.fase.jenis !== 'kartu') {
    keluar.push(sesudah.fase.kartu.jenis === 'harta' ? 'harta' : 'kartu')
  }

  const jumlahMilik = (p: Permainan) => Object.keys(p.milik).length
  if (jumlahMilik(sesudah) > jumlahMilik(sebelum)) keluar.push('beli')

  const totalTingkat = (p: Permainan) => Object.values(p.milik).reduce((a, m) => a + m.tingkat, 0)
  if (totalTingkat(sesudah) > totalTingkat(sebelum)) keluar.push('bangun')

  if (sesudah.pemain.some((x, i) => x.diPenjara && !sebelum.pemain[i]?.diPenjara)) keluar.push('penjara')
  if (sesudah.tim.some((t, i) => t.gugur && !sebelum.tim[i]?.gugur)) keluar.push('gugur')
  if (sesudah.tim.some((t, i) => t.kerugian > (sebelum.tim[i]?.kerugian ?? 0))) keluar.push('bayar')

  // Uang masuk tanpa sebab lain: gaji, bonus, atau hadiah kartu.
  const bertambah =
    sesudah.pemain.some((x, i) => x.uang > (sebelum.pemain[i]?.uang ?? 0)) ||
    sesudah.tim.some((t, i) => t.kas > (sebelum.tim[i]?.kas ?? 0))
  if (bertambah && keluar.length === 0) keluar.push('bonus')

  if (sesudah.fase.jenis === 'selesai' && sebelum.fase.jenis !== 'selesai') keluar.push('menang')

  return keluar
}
