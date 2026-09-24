/**
 * Edge Function `ruang` — satu-satunya pihak yang boleh mengubah permainan.
 *
 * Klien tidak pernah menyentuh tabel. Mereka mengirim perintah ke sini,
 * fungsi ini menjalankan `langkahRuang` (mesin yang sama persis dengan yang
 * dipakai klien, disalin oleh `pnpm edge:mesin`), menyimpan hasilnya dengan
 * kunci optimistik, lalu mengirim pandangan yang sudah disaring.
 *
 * Kenapa otoritatif: benih dadu dan urutan kartu ada di dalam keadaan. Kalau
 * klien yang menghitung, siapa pun bisa meramalkan dadu dan mengintip kartu.
 *
 * Pasang:
 *   supabase db push
 *   pnpm edge:mesin && supabase functions deploy ruang
 */
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { buatRuang, langkahRuang, pandangan } from './mesin/mesin-ruang.ts'
import type { PerintahRuang, Ruang } from './mesin/ruang.ts'
import type { PengaturanPermainan } from './mesin/tipe.ts'

type Permintaan =
  | { aksi: 'buat'; kode: string; dari: string; nama: string; pengaturan: PengaturanPermainan }
  | { aksi: 'lihat'; kode: string; dari: string }
  | { aksi: 'perintah'; kode: string; dari: string; perintah: PerintahRuang }

const URL_SUPABASE = Deno.env.get('SUPABASE_URL')!
const KUNCI_LAYANAN = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const db = createClient(URL_SUPABASE, KUNCI_LAYANAN, { auth: { persistSession: false } })

const KEPALA = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey',
  'access-control-allow-methods': 'POST, OPTIONS',
}

function jawab(isi: unknown, status = 200) {
  return new Response(JSON.stringify(isi), { status, headers: KEPALA })
}

/**
 * Beri tahu semua klien di ruang bahwa ada perubahan. Sengaja hanya nomor urut
 * yang disiarkan: isi ruang berbeda-beda per penerima (obrolan tim), jadi tiap
 * klien mengambil pandangannya sendiri lewat `lihat`.
 */
async function beriTahu(kode: string, urut: number) {
  await fetch(`${URL_SUPABASE}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', apikey: KUNCI_LAYANAN, authorization: `Bearer ${KUNCI_LAYANAN}` },
    body: JSON.stringify({
      messages: [{ topic: `ruang-${kode}`, event: 'urut', payload: { urut } }],
    }),
  }).catch(() => {
    // Siaran gagal bukan alasan menggagalkan perintah; klien juga menjajaki
    // secara berkala sebagai jaring pengaman.
  })
}

async function ambil(kode: string): Promise<{ ruang: Ruang; urut: number } | null> {
  const { data, error } = await db.from('ruang_permainan').select('ruang, urut').eq('kode', kode).maybeSingle()
  if (error) throw error
  return data ? { ruang: data.ruang as Ruang, urut: data.urut as number } : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: KEPALA })
  if (req.method !== 'POST') return jawab({ ok: false, pesan: 'Metode tidak didukung.' }, 405)

  let permintaan: Permintaan
  try {
    permintaan = await req.json()
  } catch {
    return jawab({ ok: false, pesan: 'Isi permintaan bukan JSON.' }, 400)
  }

  const kode = String(permintaan.kode ?? '').toUpperCase().slice(0, 8)
  const dari = String(permintaan.dari ?? '').slice(0, 64)
  if (!kode || !dari) return jawab({ ok: false, pesan: 'Kode ruang dan identitas wajib diisi.' }, 400)

  try {
    if (permintaan.aksi === 'buat') {
      const ruang = buatRuang({
        kode,
        tuanRumah: dari,
        nama: permintaan.nama,
        pengaturan: permintaan.pengaturan,
        waktu: Date.now(),
      })
      const { error } = await db.from('ruang_permainan').insert({ kode, ruang, urut: ruang.urut })
      if (error) return jawab({ ok: false, pesan: 'Kode ruang itu sudah dipakai, coba lagi.' }, 409)
      return jawab({ ok: true, ruang: pandangan(ruang, dari) })
    }

    if (permintaan.aksi === 'lihat') {
      const baris = await ambil(kode)
      if (!baris) return jawab({ ok: false, pesan: 'Ruang tidak ditemukan.' }, 404)
      return jawab({ ok: true, ruang: pandangan(baris.ruang, dari) })
    }

    if (permintaan.aksi === 'perintah') {
      // Kunci optimistik: tulis hanya bila nomor urut belum berubah sejak
      // dibaca. Dua pemain yang mengklik bersamaan tidak saling menimpa.
      for (let percobaan = 0; percobaan < 4; percobaan++) {
        const baris = await ambil(kode)
        if (!baris) return jawab({ ok: false, pesan: 'Ruang tidak ditemukan.' }, 404)

        const berikut = langkahRuang(baris.ruang, permintaan.perintah, {
          dari,
          waktu: Date.now(),
          id: crypto.randomUUID(),
        })
        if (berikut === baris.ruang) return jawab({ ok: true, ruang: pandangan(berikut, dari) })

        const { data, error } = await db
          .from('ruang_permainan')
          .update({ ruang: berikut, urut: berikut.urut, diperbarui: new Date().toISOString() })
          .eq('kode', kode)
          .eq('urut', baris.urut)
          .select('urut')
        if (error) throw error
        if (data && data.length > 0) {
          await beriTahu(kode, berikut.urut)
          return jawab({ ok: true, ruang: pandangan(berikut, dari) })
        }
        // Orang lain menulis lebih dulu; baca ulang dan coba lagi.
      }
      return jawab({ ok: false, pesan: 'Ruang sedang sibuk, coba lagi sebentar.' }, 409)
    }

    return jawab({ ok: false, pesan: 'Aksi tidak dikenal.' }, 400)
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Perintah ditolak.'
    return jawab({ ok: false, pesan }, 400)
  }
})
