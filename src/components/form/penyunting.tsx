import {
  Bold, Code, Heading1, Heading2, Heading3, Image as IkonGambar, Italic, Link2, List,
  ListOrdered, Quote, Redo2, Strikethrough, Undo2, Unlink,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Tombol } from '@/components/ui/tombol'
import { Pemisah } from '@/components/ui/lapisan'
import { cn } from '@/lib/utils'
import { formatAngka } from '@/lib/format'

/**
 * Penyunting teks kaya tanpa pustaka pihak ketiga.
 *
 * Memakai contenteditable + document.execCommand. API itu memang ditandai usang,
 * tetapi masih didukung seluruh peramban arus utama dan merupakan satu-satunya
 * cara ringkas menyunting kaya tanpa menambah ±100 KB pustaka.
 *
 * Kalau kebutuhannya berkembang (kolaborasi, tabel, penyisipan blok kustom),
 * ganti isi komponen ini dengan TipTap — antarmukanya (`nilai`/`onUbah`) sudah
 * dirancang supaya pemanggilnya tidak perlu ikut berubah.
 *
 * CATATAN KEAMANAN: HTML yang dihasilkan berasal dari pengguna. Sebelum
 * ditampilkan kembali dengan dangerouslySetInnerHTML, WAJIB disanitasi dengan
 * DOMPurify di sisi server — lihat .claude/rules/security.md.
 */

type Perintah = {
  ikon: typeof Bold
  label: string
  jalankan: (jalankanPerintah: (p: string, n?: string) => void) => void
  aktifJika?: string
}

const BLOK: Perintah[] = [
  { ikon: Heading1, label: 'Judul besar', jalankan: (j) => j('formatBlock', '<h2>') },
  { ikon: Heading2, label: 'Judul sedang', jalankan: (j) => j('formatBlock', '<h3>') },
  { ikon: Heading3, label: 'Judul kecil', jalankan: (j) => j('formatBlock', '<h4>') },
  { ikon: Quote, label: 'Kutipan', jalankan: (j) => j('formatBlock', '<blockquote>') },
]

const INLINE: Perintah[] = [
  { ikon: Bold, label: 'Tebal', jalankan: (j) => j('bold'), aktifJika: 'bold' },
  { ikon: Italic, label: 'Miring', jalankan: (j) => j('italic'), aktifJika: 'italic' },
  { ikon: Strikethrough, label: 'Coret', jalankan: (j) => j('strikeThrough'), aktifJika: 'strikeThrough' },
  { ikon: Code, label: 'Kode', jalankan: (j) => j('formatBlock', '<pre>') },
]

const DAFTAR: Perintah[] = [
  { ikon: List, label: 'Daftar butir', jalankan: (j) => j('insertUnorderedList'), aktifJika: 'insertUnorderedList' },
  { ikon: ListOrdered, label: 'Daftar nomor', jalankan: (j) => j('insertOrderedList'), aktifJika: 'insertOrderedList' },
]

export function PenyuntingKaya({
  nilai,
  onUbah,
  placeholder = 'Mulai menulis…',
  tinggiMin = 320,
  className,
  id,
}: {
  nilai: string
  onUbah: (html: string) => void
  placeholder?: string
  tinggiMin?: number
  className?: string
  id?: string
}) {
  const area = useRef<HTMLDivElement>(null)
  const [aktif, setAktif] = useState<Record<string, boolean>>({})
  const [fokus, setFokus] = useState(false)

  // Tulis nilai awal sekali saja. Menulis ulang tiap render akan memindahkan
  // kursor pengguna ke awal dokumen di tengah pengetikan.
  useEffect(() => {
    const el = area.current
    if (el && el.innerHTML !== nilai && document.activeElement !== el) {
      el.innerHTML = nilai
    }
  }, [nilai])

  const perbaruiStatus = useCallback(() => {
    const status: Record<string, boolean> = {}
    for (const p of [...INLINE, ...DAFTAR]) {
      if (!p.aktifJika) continue
      try {
        status[p.aktifJika] = document.queryCommandState(p.aktifJika)
      } catch {
        status[p.aktifJika] = false
      }
    }
    setAktif(status)
  }, [])

  const jalankan = useCallback(
    (perintah: string, nilaiPerintah?: string) => {
      area.current?.focus()
      document.execCommand(perintah, false, nilaiPerintah)
      onUbah(area.current?.innerHTML ?? '')
      perbaruiStatus()
    },
    [onUbah, perbaruiStatus],
  )

  function sisipkanTautan() {
    const url = prompt('Alamat tautan:', 'https://')
    if (url) jalankan('createLink', url)
  }

  function sisipkanGambar() {
    const url = prompt('Alamat gambar:', 'https://')
    if (url) jalankan('insertImage', url)
  }

  // Tempel sebagai teks biasa — mencegah gaya dari Word/Google Docs ikut masuk.
  function tempelBersih(e: React.ClipboardEvent) {
    e.preventDefault()
    const teks = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, teks)
    onUbah(area.current?.innerHTML ?? '')
  }

  // Diturunkan dari prop, bukan dari ref: membaca ref saat render membuat
  // hitungannya selalu tertinggal satu ketukan tombol.
  const teksPolos = nilai
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const kata = teksPolos ? teksPolos.split(' ').length : 0
  const menitBaca = Math.max(1, Math.round(kata / 200))

  function TombolPerintah({ p }: { p: Perintah }) {
    return (
      <Tombol
        type="button"
        varian={p.aktifJika && aktif[p.aktifJika] ? 'halus' : 'hantu'}
        ukuran="ikon-sm"
        aria-label={p.label}
        aria-pressed={p.aktifJika ? Boolean(aktif[p.aktifJika]) : undefined}
        onMouseDown={(e) => {
          e.preventDefault()
          p.jalankan(jalankan)
        }}
      >
        <p.ikon />
      </Tombol>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-control border transition-[border-color,box-shadow]',
        fokus ? 'border-primary ring-2 ring-primary/25' : 'border-input',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/60 p-1.5">
        {BLOK.map((p) => <TombolPerintah key={p.label} p={p} />)}
        <Pemisah orientation="vertical" className="mx-1 h-5" />
        {INLINE.map((p) => <TombolPerintah key={p.label} p={p} />)}
        <Pemisah orientation="vertical" className="mx-1 h-5" />
        {DAFTAR.map((p) => <TombolPerintah key={p.label} p={p} />)}
        <Pemisah orientation="vertical" className="mx-1 h-5" />
        <Tombol type="button" varian="hantu" ukuran="ikon-sm" aria-label="Sisipkan tautan" onMouseDown={(e) => { e.preventDefault(); sisipkanTautan() }}>
          <Link2 />
        </Tombol>
        <Tombol type="button" varian="hantu" ukuran="ikon-sm" aria-label="Hapus tautan" onMouseDown={(e) => { e.preventDefault(); jalankan('unlink') }}>
          <Unlink />
        </Tombol>
        <Tombol type="button" varian="hantu" ukuran="ikon-sm" aria-label="Sisipkan gambar" onMouseDown={(e) => { e.preventDefault(); sisipkanGambar() }}>
          <IkonGambar />
        </Tombol>
        <Pemisah orientation="vertical" className="mx-1 h-5" />
        <Tombol type="button" varian="hantu" ukuran="ikon-sm" aria-label="Urungkan" onMouseDown={(e) => { e.preventDefault(); jalankan('undo') }}>
          <Undo2 />
        </Tombol>
        <Tombol type="button" varian="hantu" ukuran="ikon-sm" aria-label="Ulangi" onMouseDown={(e) => { e.preventDefault(); jalankan('redo') }}>
          <Redo2 />
        </Tombol>
      </div>

      <div
        id={id}
        ref={area}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={() => onUbah(area.current?.innerHTML ?? '')}
        onKeyUp={perbaruiStatus}
        onMouseUp={perbaruiStatus}
        onFocus={() => setFokus(true)}
        onBlur={() => setFokus(false)}
        onPaste={tempelBersih}
        style={{ minHeight: tinggiMin }}
        className={cn(
          'prose-panel scrollbar-thin overflow-y-auto bg-card p-4 text-sm leading-relaxed outline-none',
          'empty:before:text-muted-foreground/70 empty:before:content-[attr(data-placeholder)]',
          '[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold',
          '[&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold',
          '[&_h4]:mt-3 [&_h4]:text-base [&_h4]:font-bold',
          '[&_p]:mt-2.5',
          '[&_ul]:mt-2.5 [&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:mt-2.5 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_blockquote]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
          '[&_pre]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-card [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs',
          '[&_a]:text-primary-kuat [&_a]:underline',
          '[&_img]:mt-3 [&_img]:max-w-full [&_img]:rounded-card',
        )}
      />

      <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>{formatAngka(kata)} kata · {formatAngka(teksPolos.length)} karakter</span>
        <span>± {menitBaca} menit baca</span>
      </div>
    </div>
  )
}

