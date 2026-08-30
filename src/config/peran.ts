/**
 * Peran & izin — mengikuti .claude/rules/auth.md.
 * Ubah MATRIKS_IZIN saja saat menyesuaikan template ini untuk project baru.
 */

export const PERAN = ['superadmin', 'admin', 'finance', 'produksi', 'sales'] as const
export type Peran = (typeof PERAN)[number]

export const LABEL_PERAN: Record<Peran, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  finance: 'Finance',
  produksi: 'Produksi',
  sales: 'Sales',
}

export const WARNA_PERAN: Record<Peran, 'primary' | 'success' | 'warning' | 'info' | 'secondary'> = {
  superadmin: 'primary',
  admin: 'info',
  finance: 'success',
  produksi: 'warning',
  sales: 'secondary',
}

/**
 * Surel yang otomatis jadi Superadmin saat pertama kali masuk.
 * Tidak bisa dihapus atau diturunkan perannya oleh siapa pun.
 */
export const SUPERADMIN_BAWAAN = ['ozolab.official@gmail.com', 'edo.rabmadhani@gmail.com'] as const

export function adalahSuperadminBawaan(surel: string | null | undefined): boolean {
  if (!surel) return false
  return SUPERADMIN_BAWAAN.includes(surel.trim().toLowerCase() as (typeof SUPERADMIN_BAWAAN)[number])
}

/**
 * Izin ditulis sebagai "modul.aksi". Tanda `*` berarti semua.
 * Contoh: "pesanan.*" = semua aksi pada modul pesanan; "*" = akses penuh.
 */
export type Izin = string

export const MATRIKS_IZIN: Record<Peran, Izin[]> = {
  superadmin: ['*'],
  admin: ['*', '!pengguna.hapus'],
  finance: [
    'dasbor.lihat',
    'pesanan.*',
    'pelanggan.*',
    'pengeluaran.*',
    'laporan.*',
    'audit.lihat',
    'profil.*',
  ],
  produksi: ['dasbor.lihat', 'stok.*', 'resep.*', 'produksi.*', 'katalog.*', 'profil.*'],
  sales: ['dasbor.lihat', 'pesanan.*', 'pelanggan.*', 'katalog.lihat', 'profil.*'],
}

/**
 * Cek satu izin. Aturan urut:
 *  1. penolakan eksplisit (`!modul.aksi`) selalu menang,
 *  2. cocok persis,
 *  3. wildcard modul (`modul.*`),
 *  4. wildcard penuh (`*`).
 */
export function punyaIzin(peran: Peran | null | undefined, izin: Izin): boolean {
  if (!peran) return false
  const daftar = MATRIKS_IZIN[peran]
  if (!daftar) return false

  if (daftar.includes(`!${izin}`)) return false
  const [modul] = izin.split('.')
  if (modul && daftar.includes(`!${modul}.*`)) return false

  if (daftar.includes(izin)) return true
  if (modul && daftar.includes(`${modul}.*`)) return true
  return daftar.includes('*')
}

/** True bila peran boleh mengakses minimal satu aksi pada modul. */
export function bisaAksesModul(peran: Peran | null | undefined, modul: string): boolean {
  return punyaIzin(peran, `${modul}.lihat`) || punyaIzin(peran, `${modul}.*`)
}
