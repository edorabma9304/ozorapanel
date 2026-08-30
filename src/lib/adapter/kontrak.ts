import type { Halaman, KueriDaftar, Pengguna } from '@/lib/tipe'
import type { Peran } from '@/config/peran'

/**
 * Kontrak akses data. SELURUH aplikasi hanya bicara lewat antarmuka ini —
 * tidak ada komponen yang boleh memanggil supabase/fetch secara langsung.
 * Menukar backend = menulis satu berkas driver baru, bukan menyunting halaman.
 */
export interface SumberKoleksi<T> {
  daftar(kueri?: KueriDaftar): Promise<Halaman<T>>
  ambil(id: string): Promise<T | null>
  buat(data: Partial<T>): Promise<T>
  ubah(id: string, data: Partial<T>): Promise<T>
  /** Soft delete — mengisi deleted_at, bukan menghapus baris. */
  hapus(id: string): Promise<void>
  pulihkan(id: string): Promise<T>
}

export interface SumberAuth {
  /** Pengguna yang sedang masuk, atau null. */
  sesiSaatIni(): Promise<Pengguna | null>
  /** Satu-satunya jalur masuk produksi (lihat .claude/rules/auth.md). */
  masukGoogle(redirectKe?: string): Promise<void>
  keluar(): Promise<void>
  /** Berlangganan perubahan sesi; kembalikan fungsi untuk berhenti berlangganan. */
  pantau(callback: (pengguna: Pengguna | null) => void): () => void
  /** Hanya tersedia pada driver mock — untuk mencoba tiap peran tanpa backend. */
  masukPeraga?(peran: Peran): Promise<Pengguna>
}

export interface AdapterData {
  readonly nama: 'mock' | 'supabase' | 'rest'
  readonly auth: SumberAuth
  koleksi<T>(nama: string): SumberKoleksi<T>
}
