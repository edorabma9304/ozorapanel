import { z } from 'zod'

/**
 * Satu-satunya tempat membaca environment variable.
 * Jangan pernah `import.meta.env` langsung di komponen — baca dari sini,
 * supaya salah ketik nama variabel ketahuan saat aplikasi start, bukan saat runtime.
 */
const skemaEnv = z.object({
  VITE_APP_NAME: z.string().default('Ozora Panel'),
  VITE_DATA_DRIVER: z.enum(['mock', 'supabase', 'rest']).default('mock'),
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string().optional().or(z.literal('')),
  VITE_API_BASE_URL: z.string().optional().or(z.literal('')),
  /** Jeda buatan driver mock (ms). Bawaan 0 — naikkan hanya saat ingin
   *  menguji tampilan skeleton dan keadaan memuat. */
  VITE_MOCK_JEDA_MS: z.coerce.number().int().min(0).max(5000).default(0),
})

const hasil = skemaEnv.safeParse(import.meta.env)

if (!hasil.success) {
  // Gagal cepat: lebih baik blank screen dengan pesan jelas daripada error misterius.
  console.error('Environment tidak valid:', z.treeifyError(hasil.error))
  throw new Error('Konfigurasi environment tidak valid — periksa berkas .env')
}

const env = hasil.data

export const APP = {
  nama: env.VITE_APP_NAME,
  versi: '1.0.0',
  driver: env.VITE_DATA_DRIVER,
  supabase: { url: env.VITE_SUPABASE_URL || '', anonKey: env.VITE_SUPABASE_ANON_KEY || '' },
  apiBaseUrl: env.VITE_API_BASE_URL || '',
  mockJedaMs: env.VITE_MOCK_JEDA_MS,
  /** Prefiks semua key localStorage — cegah tabrakan antar aplikasi di domain yang sama. */
  prefiksSimpanan: 'ozora_panel_',
} as const

export const KUNCI_SIMPANAN = {
  tema: `${APP.prefiksSimpanan}tema`,
  sidebarKuncup: `${APP.prefiksSimpanan}sidebar_kuncup`,
  sesiMock: `${APP.prefiksSimpanan}sesi_mock`,
} as const
