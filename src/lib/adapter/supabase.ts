import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AdapterData, SumberAuth, SumberKoleksi } from './kontrak'
import type { Halaman, KueriDaftar, Pengguna } from '@/lib/tipe'
import { GalatApi } from '@/lib/tipe'
import { APP } from '@/config/app'
import { adalahSuperadminBawaan, type Peran } from '@/config/peran'

/**
 * Driver Supabase.
 *
 * Keamanan (lihat .claude/rules/security.md & database.md):
 *  - hanya anon key yang boleh ada di frontend; service_role TIDAK PERNAH,
 *  - setiap tabel WAJIB punya Row Level Security aktif — driver ini
 *    mengandalkan RLS, bukan pengecekan di klien,
 *  - peran disimpan di tabel `pengguna`, bukan di JWT claim yang bisa dipalsukan
 *    klien. Tulis RLS policy yang membaca tabel itu.
 */

let klien: SupabaseClient | null = null

function db(): SupabaseClient {
  if (!klien) {
    if (!APP.supabase.url || !APP.supabase.anonKey) {
      throw new GalatApi(
        'Koneksi ke server belum dikonfigurasi. Hubungi administrator.',
        503,
        'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY kosong',
      )
    }
    klien = createClient(APP.supabase.url, APP.supabase.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  }
  return klien
}

function lempar(galat: { message: string; code?: string } | null, kodeHttp = 500): never {
  // Detail asli hanya ke console; pengguna dapat pesan generik.
  console.error('[supabase]', galat)
  throw new GalatApi(
    kodeHttp === 404
      ? 'Data yang dicari tidak ditemukan.'
      : 'Terjadi gangguan saat mengambil data. Coba beberapa saat lagi.',
    kodeHttp,
  )
}

function buatKoleksi<T>(nama: string): SumberKoleksi<T> {
  return {
    async daftar(kueri: KueriDaftar = {}): Promise<Halaman<T>> {
      const { halaman = 1, perHalaman = 10, cari = '', urut, filter = {}, termasukTerhapus } = kueri
      const dari = (halaman - 1) * perHalaman

      let q = db().from(nama).select('*', { count: 'exact' })
      if (!termasukTerhapus) q = q.is('deleted_at', null)

      for (const [kolom, nilai] of Object.entries(filter)) {
        if (nilai === undefined || nilai === null || nilai === '') continue
        q = q.eq(kolom, nilai) // .eq() sudah ter-parameterisasi — aman dari injeksi
      }

      // Pencarian teks: butuh kolom `pencarian` (tsvector/generated) di tabel.
      if (cari.trim()) q = q.textSearch('pencarian', cari.trim(), { type: 'websearch' })

      if (urut) q = q.order(urut.kolom, { ascending: urut.arah !== 'turun' })
      else q = q.order('created_at', { ascending: false })

      const { data, error, count } = await q.range(dari, dari + perHalaman - 1)
      if (error) lempar(error)

      const total = count ?? 0
      return {
        data: (data ?? []) as T[],
        total,
        halaman,
        perHalaman,
        totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
      }
    },

    async ambil(id) {
      const { data, error } = await db().from(nama).select('*').eq('id', id).maybeSingle()
      if (error) lempar(error)
      return (data as T) ?? null
    },

    async buat(data) {
      const { data: baris, error } = await db().from(nama).insert(data as never).select().single()
      if (error) lempar(error, 400)
      return baris as T
    },

    async ubah(id, data) {
      const { data: baris, error } = await db()
        .from(nama)
        .update({ ...data, updated_at: new Date().toISOString() } as never)
        .eq('id', id)
        .select()
        .single()
      if (error) lempar(error, 400)
      return baris as T
    },

    async hapus(id) {
      // Soft delete — baris tidak pernah dihapus permanen.
      const { error } = await db()
        .from(nama)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
      if (error) lempar(error, 400)
    },

    async pulihkan(id) {
      const { data, error } = await db()
        .from(nama)
        .update({ deleted_at: null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) lempar(error, 400)
      return data as T
    },
  }
}

/** Ambil profil + peran dari tabel `pengguna`; daftarkan superadmin bawaan bila perlu. */
async function profilDari(userId: string, email: string, meta: Record<string, unknown>) {
  const { data } = await db().from('pengguna').select('*').eq('id', userId).maybeSingle()
  if (data) return data as Pengguna

  if (!adalahSuperadminBawaan(email)) {
    // Belum terdaftar dan bukan superadmin bawaan → tolak (rules/auth.md butir 4).
    await db().auth.signOut()
    throw new GalatApi('Akun Anda belum diberi akses. Hubungi administrator.', 403)
  }

  const waktu = new Date().toISOString()
  const baru: Partial<Pengguna> = {
    id: userId,
    email,
    nama: (meta['full_name'] as string) || (meta['name'] as string) || email.split('@')[0]!,
    avatar_url: (meta['avatar_url'] as string) ?? null,
    peran: 'superadmin' as Peran,
    aktif: true,
    created_at: waktu,
    updated_at: waktu,
    terakhir_masuk: waktu,
  }
  const { data: dibuat, error } = await db().from('pengguna').insert(baru as never).select().single()
  if (error) lempar(error, 400)
  return dibuat as Pengguna
}

const authSupabase: SumberAuth = {
  async sesiSaatIni() {
    const { data } = await db().auth.getUser()
    const u = data.user
    if (!u?.email) return null
    return profilDari(u.id, u.email, u.user_metadata ?? {})
  },

  async masukGoogle(redirectKe = '/') {
    const { error } = await db().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectKe}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) lempar(error, 401)
  },

  async keluar() {
    await db().auth.signOut()
  },

  pantau(callback) {
    const { data } = db().auth.onAuthStateChange((_peristiwa, sesi) => {
      if (!sesi?.user?.email) {
        callback(null)
        return
      }
      void profilDari(sesi.user.id, sesi.user.email, sesi.user.user_metadata ?? {})
        .then(callback)
        .catch(() => callback(null))
    })
    return () => data.subscription.unsubscribe()
  },
}

export const adapterSupabase: AdapterData = {
  nama: 'supabase',
  auth: authSupabase,
  koleksi: buatKoleksi,
}

export default adapterSupabase
