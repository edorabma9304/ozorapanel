/**
 * Ubah hasil `pnpm game:build` menjadi satu berkas halaman untuk diterbitkan
 * sebagai Artifact claude.ai: tanpa tag <html>/<head>/<body>, hanya isi
 * halaman (judul, gaya, dan skrip modul hasil build).
 *
 * Pakai: pnpm game:build && node scripts/game-artifact.mjs
 * Hasil: dist-game/artifact.html (+ dist-game/assets/* apa adanya)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'

const dist = fileURLToPath(new NodeURL('../dist-game/', import.meta.url))
const html = readFileSync(`${dist}index.html`, 'utf8')

const judul = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Jelajah Dunia'
const gaya = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].map((m) =>
  m[0].replace(/\s+crossorigin/g, '').replace(/href="\.\//, 'href="'),
)
const skrip = [...html.matchAll(/<script[^>]+type="module"[^>]*><\/script>/g)].map((m) =>
  m[0].replace(/\s+crossorigin/g, '').replace(/src="\.\//, 'src="'),
)
const praPaint = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''

if (gaya.length === 0 || skrip.length === 0) {
  throw new Error('Hasil build tidak berisi stylesheet atau skrip modul — jalankan `pnpm game:build` dulu.')
}

const keluaran = `<title>${judul}</title>
${gaya.join('\n')}
<style>
  /* Penampil Artifact memberi :root padding aman layar & body 14px —
     biarkan globals.css yang menentukan latar dan tipografi. */
  html,
  body {
    min-height: 100%;
  }
</style>
<script>${praPaint}</script>
<div id="root"></div>
${skrip.join('\n')}
`

writeFileSync(`${dist}artifact.html`, keluaran)
console.log(`dist-game/artifact.html ditulis (${judul}) — ${gaya.length} gaya, ${skrip.length} skrip.`)
