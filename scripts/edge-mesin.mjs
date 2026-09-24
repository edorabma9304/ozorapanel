/**
 * Salin mesin permainan ke dalam Edge Function.
 *
 * Aturan permainan hanya boleh ditulis sekali. Deno menuntut ekstensi pada
 * impor relatif, sedangkan sumber di `src/` tidak memakainya, jadi berkas
 * disalin apa adanya lalu impornya ditambahi `.ts`.
 *
 * Pakai: pnpm edge:mesin   (jalankan ulang tiap kali aturan berubah)
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'

/** Modul yang dibutuhkan server: murni, tanpa impor '@/' atau DOM. */
const MODUL = ['tipe.ts', 'kartu.ts', 'papan.ts', 'mesin.ts', 'ruang.ts', 'mesin-ruang.ts']

const sumber = fileURLToPath(new NodeURL('../src/features/monopoli/', import.meta.url))
const tujuan = fileURLToPath(new NodeURL('../supabase/functions/ruang/mesin/', import.meta.url))
mkdirSync(tujuan, { recursive: true })

for (const nama of MODUL) {
  const isi = readFileSync(`${sumber}${nama}`, 'utf8')
  const untukDeno = isi.replace(/(from\s+')(\.\/[^']+)(')/g, (_, a, jalur, b) =>
    jalur.endsWith('.ts') ? `${a}${jalur}${b}` : `${a}${jalur}.ts${b}`,
  )
  writeFileSync(`${tujuan}${nama}`, untukDeno)
}
copyFileSync(`${sumber}mesin.ts`, `${tujuan}.gitkeep`)
writeFileSync(`${tujuan}.gitkeep`, '')
console.log(`${MODUL.length} modul mesin disalin ke supabase/functions/ruang/mesin/`)
