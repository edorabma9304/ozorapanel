/**
 * Worker Cloudflare: satu deploy untuk permainan dan ruangnya.
 *
 * Satu URL menyajikan dua hal:
 * - berkas statis build permainan (binding `ASET`, dari `dist-game/`);
 * - API ruang di `/api/*`, yang diteruskan ke Durable Object.
 *
 * Kenapa Durable Object: satu ruang = satu objek, dan Cloudflare menjamin
 * hanya ada satu salinannya di dunia yang menjalankan perintah satu per satu.
 * Itu tepat untuk permainan bergiliran — tanpa itu dua pemain yang mengklik
 * bersamaan bisa menimpa keadaan satu sama lain.
 *
 * Mesinnya diimpor langsung dari `src/features/monopoli/` — modul-modul itu
 * murni (tanpa DOM, tanpa alias `@/`), jadi tidak perlu disalin seperti pada
 * Edge Function Deno.
 *
 * Pasang:
 *   pnpm cf:dev      # coba di komputer sendiri lewat runtime Cloudflare asli
 *   pnpm cf:deploy   # terbitkan ke <nama>.<subdomain>.workers.dev
 */
export { RuangPermainan } from './ruang-do'

type Lingkungan = {
  ASET: Fetcher
  RUANG: DurableObjectNamespace
}

/** Kode ruang menentukan Durable Object mana yang dipakai. */
function objekRuang(env: Lingkungan, kode: string) {
  return env.RUANG.get(env.RUANG.idFromName(kode))
}

function tolak(pesan: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, pesan }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export default {
  async fetch(req: Request, env: Lingkungan): Promise<Response> {
    const url = new URL(req.url)

    if (!url.pathname.startsWith('/api/')) return env.ASET.fetch(req)

    if (url.pathname === '/api/sehat') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      })
    }

    // Kode ruang dibaca di sini supaya Worker tahu objek mana yang dituju;
    // pemeriksaan isi perintahnya tetap urusan Durable Object.
    let kode = (url.searchParams.get('kode') ?? '').toUpperCase().slice(0, 8)
    let badan: string | null = null
    if (req.method === 'POST') {
      badan = await req.text()
      try {
        kode = String((JSON.parse(badan) as { kode?: unknown }).kode ?? '').toUpperCase().slice(0, 8)
      } catch {
        return tolak('Isi permintaan bukan JSON yang sah.')
      }
    }
    if (!kode) return tolak('Kode ruang wajib diisi.')

    // Diteruskan apa adanya; badan yang sudah terbaca dipasang ulang.
    const teruskan = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: badan,
    })
    return objekRuang(env, kode).fetch(teruskan)
  },
}
