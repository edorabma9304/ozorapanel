import adapter from '@driver'
import type { AdapterData } from './kontrak'

/**
 * Pintu masuk tunggal ke data.
 *
 * `@driver` di-alias oleh vite.config.ts ke berkas driver yang dipilih lewat
 * VITE_DATA_DRIVER, sehingga driver yang tidak dipakai TIDAK ikut ke bundle.
 * Pakai `data.koleksi<T>('nama')` di hook — jangan pernah memanggil driver
 * atau fetch langsung dari komponen.
 */
export const data: AdapterData = adapter

export type { AdapterData, SumberKoleksi, SumberAuth } from './kontrak'
