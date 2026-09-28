/**
 * Jadikan build permainan satu berkas HTML yang bisa dibuka langsung.
 *
 * Tanpa server, tanpa login, tanpa koneksi: gaya, skrip, dan font ditanam ke
 * dalam berkasnya. Dipakai untuk membagikan permainan lewat kirim berkas biasa
 * (WhatsApp, email, flashdisk) — mode satu layar berjalan penuh.
 *
 * Mode bersama TIDAK ikut: itu butuh server ruang, dan berkas yang dibuka
 * lewat file:// tidak punya asal-usul yang sama untuk dihubungi.
 *
 * Pakai: pnpm game:satu   (jalankan `pnpm game:build` lebih dulu)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'

const dist = fileURLToPath(new NodeURL('../dist-game/', import.meta.url))
const html = readFileSync(`${dist}index.html`, 'utf8')

const JENIS_FONT = { woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf' }

function keDataUri(berkas) {
  const ekstensi = berkas.split('.').pop().toLowerCase()
  const jenis = JENIS_FONT[ekstensi] ?? 'application/octet-stream'
  return `data:${jenis};base64,${readFileSync(berkas).toString('base64')}`
}

const gaya = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="\.?\/?([^"]+)"[^>]*>/g)]
const skrip = [...html.matchAll(/<script[^>]+type="module"[^>]+src="\.?\/?([^"]+)"[^>]*><\/script>/g)]
if (gaya.length === 0 || skrip.length === 0) {
  throw new Error('Hasil build tidak berisi stylesheet atau skrip modul — jalankan `pnpm game:build` dulu.')
}

let keluaran = html

for (const [utuh, jalur] of gaya) {
  // Font di dalam CSS ikut ditanam, kalau tidak berkasnya tetap butuh tetangga.
  // Rujukannya relatif terhadap berkas CSS, bukan akar build.
  const akarCss = dirname(`${dist}${jalur}`)
  const css = readFileSync(`${dist}${jalur}`, 'utf8').replace(
    /url\(\s*["']?([^"')]+\.(?:woff2?|ttf))["']?\s*\)/g,
    (_, f) => `url(${keDataUri(join(akarCss, f))})`,
  )
  // Pengganti berupa fungsi, bukan teks: isi CSS/JS bisa mengandung `$&` dan
  // `$\`` yang akan ditafsirkan String.replace dan merusak keluarannya.
  keluaran = keluaran.replace(utuh, () => `<style>\n${css}\n</style>`)
}

for (const [utuh, jalur] of skrip) {
  const js = readFileSync(`${dist}${jalur}`, 'utf8')
  // `</script>` di dalam string JS akan menutup tag lebih awal bila dibiarkan.
  const aman = js.replace(/<\/script>/g, '<\\/script>')
  keluaran = keluaran.replace(utuh, () => `<script type="module">\n${aman}\n</script>`)
}

const tujuan = `${dist}jelajah-dunia.html`
writeFileSync(tujuan, keluaran)
console.log(`${tujuan} ditulis — ${(Buffer.byteLength(keluaran) / 1024 / 1024).toFixed(2)} MB, satu berkas tanpa tetangga.`)
