import { z } from 'zod'
import { PERAN } from '@/config/peran'

/**
 * Skema validasi pengguna.
 *
 * Ini juga dipakai sebagai sumber tipe formulir — jangan menulis ulang
 * bentuk data di komponen. Ingat: validasi di sini untuk pengalaman pengguna;
 * backend WAJIB memvalidasi ulang (.claude/rules/api.md).
 */
export const skemaPengguna = z.object({
  nama: z
    .string()
    .trim()
    .min(3, 'Nama minimal 3 huruf.')
    .max(80, 'Nama maksimal 80 huruf.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Format surel tidak valid.'),
  peran: z.enum(PERAN, { message: 'Pilih peran pengguna.' }),
  jabatan: z.string().trim().max(60, 'Jabatan maksimal 60 huruf.').optional().or(z.literal('')),
  telepon: z
    .string()
    .trim()
    .regex(/^$|^0\d[\d\s-]{7,15}$/, 'Nomor HP harus diawali 0 dan berisi 9–17 digit.')
    .optional()
    .or(z.literal('')),
  aktif: z.boolean(),
})

export type IsiPengguna = z.infer<typeof skemaPengguna>

export const NILAI_AWAL: IsiPengguna = {
  nama: '',
  email: '',
  peran: 'sales',
  jabatan: '',
  telepon: '',
  aktif: true,
}
