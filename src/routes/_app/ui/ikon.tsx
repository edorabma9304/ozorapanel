import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Blocks,
  Bookmark,
  Boxes,
  Building2,
  Calendar,
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Clock,
  Component,
  Contact,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flag,
  FolderOpen,
  Globe,
  Grid3x3,
  Heart,
  Home,
  Image,
  Inbox,
  Info,
  Kanban,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutList,
  LifeBuoy,
  List,
  ListChecks,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  MoreVertical,
  Newspaper,
  NotepadText,
  Package,
  Paperclip,
  Pencil,
  Phone,
  Pin,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Reply,
  Rocket,
  Save,
  ScrollText,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkles,
  Star,
  Sun,
  Table2,
  Tag,
  Target,
  Ticket,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { IsiKartu, Kartu } from '@/components/ui/kartu'
import { Masukan } from '@/components/ui/masukan'
import { Peringatan } from '@/components/ui/keadaan'
import { KeadaanKosong } from '@/components/ui/keadaan'
import { formatAngka } from '@/lib/format'

/**
 * Katalog ikon yang benar-benar dipakai di template ini.
 *
 * Sengaja TIDAK memuat seluruh pustaka lucide (1.600+ ikon) — mengimpor
 * semuanya akan menambah ratusan KB ke bundle hanya untuk halaman peraga.
 * Impor ikon satu per satu di kode Anda supaya tree-shaking bekerja.
 */
const PETA_IKON = {
  Activity,
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  Blocks,
  Bookmark,
  Boxes,
  Building2,
  Calendar,
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Clock,
  Component,
  Contact,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flag,
  FolderOpen,
  Globe,
  Grid3x3,
  Heart,
  Home,
  Image,
  Inbox,
  Info,
  Kanban,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutList,
  LifeBuoy,
  List,
  ListChecks,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  MoreVertical,
  Newspaper,
  NotepadText,
  Package,
  Paperclip,
  Pencil,
  Phone,
  Pin,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Reply,
  Rocket,
  Save,
  ScrollText,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkles,
  Star,
  Sun,
  Table2,
  Tag,
  Target,
  Ticket,
  Trash2,
  TrendingUp,
  Truck,
  Upload,
  UserCircle,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  Zap,
} as const

const NAMA_IKON = Object.keys(PETA_IKON) as Array<keyof typeof PETA_IKON>

function GaleriIkon() {
  const [cari, setCari] = useState('')

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return NAMA_IKON.filter((n) => !q || n.toLowerCase().includes(q))
  }, [cari])

  async function salin(nama: string) {
    try {
      await navigator.clipboard.writeText(`import { ${nama} } from 'lucide-react'`)
      toast.success(`Impor "${nama}" disalin.`)
    } catch {
      toast.error('Peramban menolak akses papan klip.')
    }
  }

  return (
    <>
      <KepalaHalaman
        judul="Ikon"
        deskripsi="Lucide — ikon garis 24px yang dipakai di seluruh panel. Klik untuk menyalin barisan impornya."
        remah={[{ label: 'Elemen UI' }, { label: 'Ikon' }]}
      />

      <Peringatan varian="info" judul="Impor satu per satu, jangan seluruh pustaka">
        Tulis <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">
          {"import { Package } from 'lucide-react'"}
        </code>{' '}
        — bukan <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">import * as Ikon</code>.
        Impor bintang mematikan tree-shaking dan membawa 1.600+ ikon ke dalam bundle.
      </Peringatan>

      <Kartu>
        <IsiKartu>
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Masukan value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari ikon…" className="pl-9" aria-label="Cari ikon" />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {formatAngka(hasil.length)} dari {formatAngka(NAMA_IKON.length)} ikon
          </p>

          {hasil.length === 0 ? (
            <KeadaanKosong judul="Ikon tidak ditemukan" deskripsi="Coba kata kunci lain, mis. “user”, “chart”, atau “file”." />
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {hasil.map((nama) => {
                const Komp = PETA_IKON[nama]
                if (!Komp) return null
                return (
                  <button
                    key={nama}
                    type="button"
                    onClick={() => void salin(nama)}
                    title={nama}
                    className="flex flex-col items-center gap-2 rounded-card border border-border p-3 transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary-kuat"
                  >
                    <Komp className="size-5" />
                    <span className="w-full truncate text-[10px] text-muted-foreground">{nama}</span>
                  </button>
                )
              })}
            </div>
          )}
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/ui/ikon')({ component: GaleriIkon })
