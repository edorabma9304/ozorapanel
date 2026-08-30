#!/usr/bin/env node
/**
 * Buang seluruh halaman peraga (klon Modernize) dan sisakan kerangka kerja.
 *
 *   pnpm demo:strip
 *
 * Yang DIBUANG: dasbor tambahan, semua modul /apl, galeri UI, halaman formulir,
 * widget, tabel, dan bagan peraga — termasuk data contohnya.
 *
 * Yang DIPERTAHANKAN: kerangka aplikasi, autentikasi + RBAC, halaman Pengguna
 * (jalur emas CRUD), Profil, Pengaturan, Jejak audit, Kunci API, halaman galat,
 * serta seluruh isi src/components dan src/lib.
 *
 * Jalankan sekali saat memulai project baru. Tidak bisa dibatalkan —
 * commit dulu sebelum menjalankannya.
 */
import { rm, writeFile, readFile, access } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const akar = join(dirname(fileURLToPath(import.meta.url)), '..')
const p = (...bagian) => join(akar, ...bagian)

const FOLDER_DIBUANG = [
  'src/routes/_app/dasbor',
  'src/routes/_app/apl',
  'src/routes/_app/ui',
  'src/routes/_app/formulir',
  'src/routes/_app/widget',
  'src/routes/_app/tabel',
  'src/routes/_app/bagan',
  // Toko peraga beserta keranjangnya
  'src/features/toko',
]

const BERKAS_DIBUANG = [
  'src/routes/_app/harga.tsx',
  'src/routes/_app/faq.tsx',
  // Halaman peraga yang bergantung pada data contoh
  'src/routes/_app/hak-akses.tsx',
  'src/routes/_app/integrasi.tsx',
  'src/routes/beranda.tsx',
  'src/routes/_app/peta.tsx',
  'src/routes/_app/laporan.tsx',
  'src/routes/_app/kosong.tsx',
  'src/components/data/peta-indonesia.tsx',
  'src/components/data/bagian-peraga.tsx',
]

const DASBOR_MINIMAL = `import { createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { Kartu } from '@/components/ui/kartu'
import { useAuth } from '@/lib/auth'

function Dasbor() {
  const { pengguna } = useAuth()

  return (
    <>
      <KepalaHalaman
        judul={\`Halo, \${pengguna?.nama.split(' ')[0] ?? 'Rekan'}\`}
        deskripsi="Mulai bangun dasbor Anda di sini."
        remah={[{ label: 'Dasbor' }]}
      />

      <Kartu>
        <KeadaanKosong
          ikon={LayoutDashboard}
          judul="Dasbor masih kosong"
          deskripsi="Tambahkan KartuStatistik dan Bagan sesuai kebutuhan. Resepnya ada di docs/RESEP.md."
        />
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/')({ component: Dasbor })
`

const BENIH_MINIMAL = `/**
 * Benih data untuk driver \`mock\`.
 * Berkas peraga sudah dibuang oleh \`pnpm demo:strip\`; yang tersisa hanya
 * satu akun superadmin supaya aplikasi tetap bisa dijalankan tanpa backend.
 */
import type { Pengguna } from '@/lib/tipe'

/** Avatar SVG data-URI — tanpa permintaan jaringan, aman untuk CSP ketat. */
export function avatarDari(nama: string): string {
  const huruf = nama.trim().split(/\\s+/).slice(0, 2).map((k) => k[0]).join('').toUpperCase()
  let h = 0
  for (const c of nama) h = (h * 31 + c.charCodeAt(0)) % 360
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="hsl(\${h} 70% 88%)"/><text x="50%" y="54%" font-family="system-ui,sans-serif" font-size="30" font-weight="700" fill="hsl(\${h} 55% 32%)" text-anchor="middle" dominant-baseline="middle">\${huruf}</text></svg>\`
  return \`data:image/svg+xml,\${encodeURIComponent(svg)}\`
}

const SEKARANG = new Date().toISOString()

export const PENGGUNA_CONTOH: Pengguna[] = [
  {
    id: 'id-00001',
    nama: 'Edo Rabmadhani',
    email: 'edo.rabmadhani@gmail.com',
    peran: 'superadmin',
    avatar_url: avatarDari('Edo Rabmadhani'),
    telepon: null,
    jabatan: 'Pemilik',
    aktif: true,
    terakhir_masuk: SEKARANG,
    created_at: SEKARANG,
    updated_at: SEKARANG,
    deleted_at: null,
  },
]

export const KOLEKSI_CONTOH: Record<string, unknown[]> = {
  pengguna: PENGGUNA_CONTOH,
  audit: [],
}
`

/** Tulis ulang menu.ts tanpa grup & item bertanda demo. */
async function rapikanMenu() {
  const berkas = p('src/config/menu.ts')
  let isi = await readFile(berkas, 'utf8')

  // Buang seluruh grup yang ditandai demo: true
  isi = isi.replace(/\n  \{\n    judul: '[^']+',\n    demo: true,[\s\S]*?\n  \},(?=\n  \{|\n\])/g, '')
  // Buang item tunggal bertanda demo
  isi = isi.replace(/^.*\bdemo: true.*$\n/gm, '')
  // Bersihkan impor ikon yang tak lagi terpakai
  const dipakai = new Set([...isi.matchAll(/icon: ([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))
  isi = isi.replace(
    /import \{\n([\s\S]*?)\n\} from 'lucide-react'/,
    () => {
      const daftar = [...dipakai].sort()
      return `import { ${daftar.join(', ')} } from 'lucide-react'`
    },
  )
  await writeFile(berkas, isi)
}

async function ada(jalur) {
  try {
    await access(jalur)
    return true
  } catch {
    return false
  }
}

async function jalankan() {
  console.log('Membuang halaman peraga…\n')

  for (const f of FOLDER_DIBUANG) {
    if (await ada(p(f))) {
      await rm(p(f), { recursive: true, force: true })
      console.log(`  hapus  ${f}/`)
    }
  }

  for (const f of BERKAS_DIBUANG) {
    if (await ada(p(f))) {
      await rm(p(f), { force: true })
      console.log(`  hapus  ${f}`)
    }
  }

  await writeFile(p('src/routes/_app/index.tsx'), DASBOR_MINIMAL)
  console.log('  tulis  src/routes/_app/index.tsx (dasbor kosong)')

  await writeFile(p('src/lib/adapter/data-contoh.ts'), BENIH_MINIMAL)
  console.log('  tulis  src/lib/adapter/data-contoh.ts (benih minimal)')

  await rapikanMenu()
  console.log('  ubah   src/config/menu.ts (entri demo dibuang)')

  console.log(`
Selesai.

Langkah berikutnya:
  1. pnpm build          — bangkitkan ulang routeTree.gen.ts
  2. pnpm typecheck      — pastikan tidak ada impor yang menggantung
  3. hapus skrip ini dan baris "demo:strip" di package.json
`)
}

jalankan().catch((e) => {
  console.error('Gagal:', e)
  process.exitCode = 1
})
