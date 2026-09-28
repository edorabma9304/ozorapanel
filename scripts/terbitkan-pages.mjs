/**
 * Terbitkan ulang permainan ke GitHub Pages (branch `gh-pages`).
 *
 * Branch itu hanya berisi hasil build, tanpa riwayat kode — setiap penerbitan
 * menimpa isinya. Kode sumber tetap di branch biasa.
 *
 * Kenapa branch terpisah dan bukan folder `docs/`: hasil build 0,5 MB tidak
 * ikut mengotori riwayat branch kerja, dan GitHub menyalakan Pages sendiri
 * begitu branch `gh-pages` ada.
 *
 * Pakai: pnpm game:terbit
 *
 * Yang terbit adalah build statis, jadi hanya mode satu layar. Mode bersama
 * lintas perangkat butuh server ruang — lihat docs/MONOPOLI.md.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, URL as NodeURL } from 'node:url'

const akar = fileURLToPath(new NodeURL('../', import.meta.url))
const dist = join(akar, 'dist-game')

function git(kerja, ...argumen) {
  return execFileSync('git', argumen, { cwd: kerja, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
}

const asal = git(akar, 'remote', 'get-url', 'origin')
const kerja = mkdtempSync(join(tmpdir(), 'gh-pages-'))

cpSync(dist, kerja, { recursive: true })
// Tanpa berkas ini GitHub menjalankan Jekyll, yang membuang folder berawalan '_'.
writeFileSync(join(kerja, '.nojekyll'), '')

git(kerja, 'init', '-q', '-b', 'gh-pages')
git(kerja, 'add', '-A')
git(kerja, 'commit', '-q', '-m', `Terbitkan permainan (${new Date().toISOString().slice(0, 16).replace('T', ' ')})`)
git(kerja, 'remote', 'add', 'origin', asal)
// Riwayatnya sengaja dibuang tiap terbit, jadi dorongan paksa memang niatnya.
git(kerja, 'push', '-q', '--force', 'origin', 'gh-pages')

console.log('Terbit ke branch gh-pages. Halaman menyala 1–2 menit lagi.')
