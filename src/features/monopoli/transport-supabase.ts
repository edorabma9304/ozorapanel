/**
 * Transport daring lintas perangkat lewat Supabase.
 *
 * Alur satu perubahan:
 * 1. Klien mengirim perintah ke Edge Function `ruang`.
 * 2. Fungsi menjalankan mesin, menyimpan dengan kunci optimistik, lalu
 *    menyiarkan nomor urut terbaru ke kanal Realtime `ruang-<kode>`.
 * 3. Semua klien yang mendengar siaran mengambil pandangannya sendiri.
 *
 * Yang disiarkan hanya nomor urut, bukan isi ruangnya. Sengaja: obrolan tim
 * dan benih dadu berbeda per penerima, jadi setiap klien harus meminta
 * pandangannya sendiri ke server.
 *
 * Aktifkan dengan mengisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, lalu
 * pasang skema dan fungsinya — langkahnya ada di docs/MONOPOLI.md.
 */
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { APP } from '@/config/app'
import type { PerintahRuang, Ruang } from './ruang'
import { idPeserta, type StatusTransport, type Transport } from './transport'
import type { PengaturanPermainan } from './tipe'

/** Jaring pengaman bila satu siaran Realtime terlewat. */
const JEDA_JAJAK_MS = 8000

let klien: SupabaseClient | null = null

function supabase(): SupabaseClient | null {
  if (!APP.supabase.url || !APP.supabase.anonKey) return null
  klien ??= createClient(APP.supabase.url, APP.supabase.anonKey, { auth: { persistSession: false } })
  return klien
}

/** Apakah mode daring lintas perangkat bisa dipakai di build ini. */
export function supabaseSiap() {
  return Boolean(APP.supabase.url && APP.supabase.anonKey)
}

type Jawaban = { ok: true; ruang: Ruang } | { ok: false; pesan: string }

export function transportSupabase(opsi: {
  kode: string
  nama: string
  pengaturan?: PengaturanPermainan
}): Transport {
  const mungkin = supabase()
  if (!mungkin) throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.')
  const db: SupabaseClient = mungkin

  const id = idPeserta()
  const pendengar = new Set<Parameters<Transport['langgan']>[0]>()
  let ruang: Ruang | null = null
  let status: StatusTransport = 'menyambung'
  let galat: string | null = null
  let hidup = true
  let kanal: RealtimeChannel | null = null
  let jajak: ReturnType<typeof setInterval> | null = null

  function siarkan() {
    const keadaan = { ruang, status, galat }
    for (const cb of pendengar) cb(keadaan)
  }

  async function panggil(badan: Record<string, unknown>): Promise<Jawaban> {
    const { data, error } = await db.functions.invoke<Jawaban>('ruang', {
      body: { kode: opsi.kode, dari: id, ...badan },
    })
    if (error) return { ok: false, pesan: 'Tidak bisa menghubungi server permainan.' }
    return data ?? { ok: false, pesan: 'Server tidak menjawab.' }
  }

  function terima(jawaban: Jawaban, { diamkanGagal = false } = {}) {
    if (!hidup) return
    if (jawaban.ok) {
      ruang = jawaban.ruang
      status = 'tersambung'
      galat = null
    } else if (!diamkanGagal) {
      // "Ruang tidak ditemukan" hanya berarti kode salah, bukan sambungan putus.
      if (/tidak ditemukan/i.test(jawaban.pesan) && !ruang) status = 'tidak-ada'
      else galat = jawaban.pesan
    }
    siarkan()
  }

  async function segarkan(diamkanGagal = false) {
    terima(await panggil({ aksi: 'lihat' }), { diamkanGagal })
  }

  async function mulai() {
    if (opsi.pengaturan) {
      terima(await panggil({ aksi: 'buat', nama: opsi.nama, pengaturan: opsi.pengaturan }))
    } else {
      await segarkan()
    }
    if (!hidup) return

    kanal = db
      .channel(`ruang-${opsi.kode}`)
      .on('broadcast', { event: 'urut' }, () => void segarkan(true))
      .subscribe()

    jajak = setInterval(() => void segarkan(true), JEDA_JAJAK_MS)
  }

  void mulai()

  return {
    id,
    kode: opsi.kode,
    langgan(cb) {
      pendengar.add(cb)
      cb({ ruang, status, galat })
      return () => pendengar.delete(cb)
    },
    kirim(perintah: PerintahRuang) {
      void panggil({ aksi: 'perintah', perintah }).then((j) => terima(j))
    },
    tutup() {
      hidup = false
      void panggil({ aksi: 'perintah', perintah: { jenis: 'pergi' } })
      if (jajak) clearInterval(jajak)
      if (kanal) void db.removeChannel(kanal)
      pendengar.clear()
    },
  }
}
