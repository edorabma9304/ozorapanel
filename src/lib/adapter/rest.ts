import type { AdapterData, SumberAuth, SumberKoleksi } from './kontrak'
import type { BalasanApi, Halaman, KueriDaftar, Pengguna } from '@/lib/tipe'
import { GalatApi, galatDariStatus } from '@/lib/tipe'
import { APP } from '@/config/app'

/**
 * Driver REST untuk backend sendiri (mis. Laravel), mengikuti bentuk balasan
 * di .claude/rules/api.md: { success, data, message }.
 *
 * Sesi diasumsikan memakai cookie httpOnly (`credentials: 'include'`) —
 * token TIDAK disimpan di localStorage.
 */

async function minta<T>(jalur: string, opsi: RequestInit = {}): Promise<T> {
  if (!APP.apiBaseUrl) {
    throw new GalatApi('Alamat server belum dikonfigurasi. Hubungi administrator.', 503)
  }

  let resp: Response
  try {
    resp = await fetch(`${APP.apiBaseUrl}${jalur}`, {
      ...opsi,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(opsi.body ? { 'Content-Type': 'application/json' } : {}),
        ...opsi.headers,
      },
    })
  } catch (e) {
    throw new GalatApi('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', 0, e)
  }

  if (resp.status === 204) return undefined as T

  let isi: BalasanApi<T> | null = null
  try {
    isi = (await resp.json()) as BalasanApi<T>
  } catch {
    isi = null
  }

  if (!resp.ok || isi?.success === false) {
    // Pesan dari server dipakai hanya bila statusnya 4xx (aman ditampilkan).
    const pesanServer = resp.status < 500 ? isi?.message : undefined
    const galat = galatDariStatus(resp.status, isi)
    throw pesanServer ? new GalatApi(pesanServer, resp.status, isi) : galat
  }

  return (isi?.data ?? (isi as unknown)) as T
}

function keParam(kueri: KueriDaftar): string {
  const p = new URLSearchParams()
  if (kueri.halaman) p.set('halaman', String(kueri.halaman))
  if (kueri.perHalaman) p.set('per_halaman', String(kueri.perHalaman))
  if (kueri.cari) p.set('cari', kueri.cari)
  if (kueri.urut) p.set('urut', `${kueri.urut.kolom}:${kueri.urut.arah}`)
  if (kueri.termasukTerhapus) p.set('termasuk_terhapus', '1')
  for (const [k, v] of Object.entries(kueri.filter ?? {})) {
    if (v === undefined || v === null || v === '') continue
    p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function buatKoleksi<T>(nama: string): SumberKoleksi<T> {
  const dasar = `/api/${nama}`
  return {
    daftar: (kueri = {}) => minta<Halaman<T>>(`${dasar}${keParam(kueri)}`),
    ambil: (id) => minta<T | null>(`${dasar}/${encodeURIComponent(id)}`),
    buat: (data) => minta<T>(dasar, { method: 'POST', body: JSON.stringify(data) }),
    ubah: (id, data) =>
      minta<T>(`${dasar}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    hapus: (id) => minta<void>(`${dasar}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    pulihkan: (id) => minta<T>(`${dasar}/${encodeURIComponent(id)}/pulihkan`, { method: 'POST' }),
  }
}

const pendengar = new Set<(p: Pengguna | null) => void>()

const authRest: SumberAuth = {
  async sesiSaatIni() {
    try {
      return await minta<Pengguna>('/api/auth/saya')
    } catch (e) {
      if (e instanceof GalatApi && e.kode === 401) return null
      throw e
    }
  },

  async masukGoogle(redirectKe = '/') {
    // Alur redirect penuh — server yang memegang client secret Google.
    const tujuan = encodeURIComponent(redirectKe)
    window.location.href = `${APP.apiBaseUrl}/api/auth/google?redirect=${tujuan}`
  },

  async keluar() {
    await minta<void>('/api/auth/keluar', { method: 'POST' })
    for (const cb of pendengar) cb(null)
  },

  pantau(callback) {
    pendengar.add(callback)
    return () => pendengar.delete(callback)
  },
}

export const adapterRest: AdapterData = {
  nama: 'rest',
  auth: authRest,
  koleksi: buatKoleksi,
}

export default adapterRest
