import type { AdapterData, SumberAuth, SumberKoleksi } from './kontrak'
import type { Halaman, KueriDaftar, Pengguna } from '@/lib/tipe'
import { GalatApi } from '@/lib/tipe'
import type { Peran } from '@/config/peran'
import { adalahSuperadminBawaan } from '@/config/peran'
import { APP, KUNCI_SIMPANAN } from '@/config/app'
import { KOLEKSI_CONTOH, PENGGUNA_CONTOH, avatarDari } from './data-contoh'
import { tunggu } from '@/lib/utils'

/**
 * Jeda buatan, bawaannya NOL supaya aplikasi terasa secepat aslinya.
 * Setel VITE_MOCK_JEDA_MS=300 kalau ingin melihat skeleton dan keadaan memuat.
 */
const JEDA_MS = APP.mockJedaMs

const memori = new Map<string, Record<string, unknown>[]>()

function koleksiMemori(nama: string) {
  if (!memori.has(nama)) {
    const awal = (KOLEKSI_CONTOH[nama] ?? []) as Record<string, unknown>[]
    memori.set(nama, structuredClone(awal))
  }
  return memori.get(nama)!
}

function cocokPencarian(baris: Record<string, unknown>, cari: string) {
  const q = cari.trim().toLowerCase()
  if (!q) return true
  return Object.values(baris).some(
    (v) => typeof v === 'string' && v.toLowerCase().includes(q),
  )
}

function buatKoleksi<T>(nama: string): SumberKoleksi<T> {
  return {
    async daftar(kueri: KueriDaftar = {}): Promise<Halaman<T>> {
      await tunggu(JEDA_MS)
      const { halaman = 1, perHalaman = 10, cari = '', urut, filter = {}, termasukTerhapus } = kueri

      let baris = koleksiMemori(nama)
      if (!termasukTerhapus) baris = baris.filter((b) => !b['deleted_at'])
      if (cari) baris = baris.filter((b) => cocokPencarian(b, cari))

      for (const [kolom, nilai] of Object.entries(filter)) {
        if (nilai === undefined || nilai === null || nilai === '') continue
        baris = baris.filter((b) => b[kolom] === nilai)
      }

      if (urut) {
        const arah = urut.arah === 'turun' ? -1 : 1
        baris = [...baris].sort((a, b) => {
          const x = a[urut.kolom]
          const y = b[urut.kolom]
          if (x === y) return 0
          if (x === null || x === undefined) return 1
          if (y === null || y === undefined) return -1
          return (x < y ? -1 : 1) * arah
        })
      }

      const total = baris.length
      const mulai = (halaman - 1) * perHalaman
      return {
        data: structuredClone(baris.slice(mulai, mulai + perHalaman)) as T[],
        total,
        halaman,
        perHalaman,
        totalHalaman: Math.max(1, Math.ceil(total / perHalaman)),
      }
    },

    async ambil(id) {
      await tunggu(JEDA_MS)
      const baris = koleksiMemori(nama).find((b) => b['id'] === id)
      return baris ? (structuredClone(baris) as T) : null
    },

    async buat(data) {
      await tunggu(JEDA_MS)
      const waktu = new Date().toISOString()
      const baru = {
        ...(data as Record<string, unknown>),
        id: `id-${crypto.randomUUID().slice(0, 8)}`,
        created_at: waktu,
        updated_at: waktu,
        deleted_at: null,
      }
      koleksiMemori(nama).unshift(baru)
      return structuredClone(baru) as T
    },

    async ubah(id, data) {
      await tunggu(JEDA_MS)
      const baris = koleksiMemori(nama)
      const i = baris.findIndex((b) => b['id'] === id)
      if (i < 0) throw new GalatApi('Data yang dicari tidak ditemukan.', 404)
      const diubah = {
        ...baris[i]!,
        ...(data as Record<string, unknown>),
        id,
        updated_at: new Date().toISOString(),
      }
      baris[i] = diubah
      return structuredClone(diubah) as T
    },

    async hapus(id) {
      await tunggu(JEDA_MS)
      const baris = koleksiMemori(nama)
      const i = baris.findIndex((b) => b['id'] === id)
      if (i < 0) throw new GalatApi('Data yang dicari tidak ditemukan.', 404)
      baris[i] = { ...baris[i]!, deleted_at: new Date().toISOString() }
    },

    async pulihkan(id) {
      await tunggu(JEDA_MS)
      const baris = koleksiMemori(nama)
      const i = baris.findIndex((b) => b['id'] === id)
      if (i < 0) throw new GalatApi('Data yang dicari tidak ditemukan.', 404)
      baris[i] = { ...baris[i]!, deleted_at: null, updated_at: new Date().toISOString() }
      return structuredClone(baris[i]!) as T
    },
  }
}

// --------------------------------------------------------------------- Auth
type Pendengar = (p: Pengguna | null) => void
const pendengar = new Set<Pendengar>()

function bacaSesi(): Pengguna | null {
  try {
    const mentah = localStorage.getItem(KUNCI_SIMPANAN.sesiMock)
    return mentah ? (JSON.parse(mentah) as Pengguna) : null
  } catch {
    return null
  }
}

function simpanSesi(p: Pengguna | null) {
  try {
    if (p) localStorage.setItem(KUNCI_SIMPANAN.sesiMock, JSON.stringify(p))
    else localStorage.removeItem(KUNCI_SIMPANAN.sesiMock)
  } catch {
    // Mode privat / storage penuh — abaikan, sesi cukup di memori.
  }
  for (const cb of pendengar) cb(p)
}

const authMock: SumberAuth = {
  async sesiSaatIni() {
    await tunggu(JEDA_MS)
    return bacaSesi()
  },

  async masukGoogle() {
    // Driver mock tidak memanggil Google. Pakai akun superadmin bawaan
    // supaya alur "masuk lalu diarahkan ke dasbor" tetap bisa dicoba.
    await tunggu(JEDA_MS)
    const bawaan = PENGGUNA_CONTOH.find((p) => adalahSuperadminBawaan(p.email)) ?? PENGGUNA_CONTOH[0]!
    simpanSesi({ ...bawaan, terakhir_masuk: new Date().toISOString() })
  },

  async masukPeraga(peran: Peran) {
    await tunggu(JEDA_MS)
    const waktu = new Date().toISOString()
    const nama = `Peraga ${peran.charAt(0).toUpperCase()}${peran.slice(1)}`
    const pengguna: Pengguna = {
      id: `peraga-${peran}`,
      nama,
      email: `${peran}@peraga.ozora`,
      peran,
      avatar_url: avatarDari(nama),
      telepon: null,
      jabatan: 'Akun peraga',
      aktif: true,
      terakhir_masuk: waktu,
      created_at: waktu,
      updated_at: waktu,
      deleted_at: null,
    }
    simpanSesi(pengguna)
    return pengguna
  },

  async keluar() {
    await tunggu(JEDA_MS)
    simpanSesi(null)
  },

  pantau(callback) {
    pendengar.add(callback)
    return () => pendengar.delete(callback)
  },
}

export const adapterMock: AdapterData = {
  nama: 'mock',
  auth: authMock,
  koleksi: buatKoleksi,
}

export default adapterMock
