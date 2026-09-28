/**
 * Salin mesin permainan ke tempat yang menjalankannya di sisi server.
 *
 * Aturan permainan hanya boleh ditulis sekali, di `src/features/monopoli/`.
 * Deno maupun Node dengan `--experimental-strip-types` menuntut ekstensi pada
 * impor relatif, sedangkan sumber di `src/` tidak memakainya, jadi berkasnya
 * disalin apa adanya lalu impornya ditambahi `.ts`.
 *
 * Tujuan salinan:
 * - supabase/functions/ruang/mesin/  → Edge Function (Deno)
 * - server/mesin/                    → server ruang sendiri (Node)
 *
 * Pakai: pnpm mesin:salin   (jalankan ulang tiap kali aturan berubah)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'

/** Modul yang dibutuhkan server: murni, tanpa impor '@/' atau DOM. */
const MODUL = ['tipe.ts', 'kartu.ts', 'papan.ts', 'mesin.ts', 'ruang.ts', 'mesin-ruang.ts']

const TUJUAN = ['../supabase/functions/ruang/mesin/', '../server/mesin/']

const sumber = fileURLToPath(new NodeURL('../src/features/monopoli/', import.meta.url))

for (const relatif of TUJUAN) {
  const tujuan = fileURLToPath(new NodeURL(relatif, import.meta.url))
  mkdirSync(tujuan, { recursive: true })
  for (const nama of MODUL) {
    const isi = readFileSync(`${sumber}${nama}`, 'utf8')
    const berekstensi = isi.replace(/(from\s+')(\.\/[^']+)(')/g, (_, a, jalur, b) =>
      jalur.endsWith('.ts') ? `${a}${jalur}${b}` : `${a}${jalur}.ts${b}`,
    )
    writeFileSync(`${tujuan}${nama}`, berekstensi)
  }
  writeFileSync(`${tujuan}.gitkeep`, '')
}

console.log(`${MODUL.length} modul mesin disalin ke ${TUJUAN.length} tujuan.`)
