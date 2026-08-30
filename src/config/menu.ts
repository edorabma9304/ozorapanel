import type { LucideIcon } from 'lucide-react'
import {
  Activity, ArrowLeftRight, Archive, Banknote, Blocks, Bot, Boxes, Building2, Calendar,
  CalendarCheck, CalendarOff, ChartArea, ChartColumn, ChartLine, ChartNoAxesCombined, ChartPie,
  CircleCheckBig, CircleHelp, Component, Contact, CreditCard, File, FileText, FolderKanban,
  FolderOpen, FormInput, Gauge, Globe, IdCard, Inbox, Kanban, KeyRound, Layers, LayoutDashboard,
  LayoutList, ListChecks, ListTodo, Mail, Map, MessageCircle, Newspaper, NotepadText, Package,
  Palette, PiggyBank, Puzzle, Radar, Receipt, ReceiptText, Rocket, ScanLine, ScrollText,
  ServerCrash, Settings, ShieldCheck, ShieldHalf, ShoppingBag, ShoppingCart, SlidersHorizontal,
  Smile, Sparkles, Star, Store, Table2, Tag, Target, Ticket, TriangleAlert, Truck, UserCircle,
  UserSquare, Users, Wallet,
} from 'lucide-react'
import type { Izin } from './peran'

export type ItemMenu = {
  /** Judul yang tampil di sidebar. */
  judul: string
  /** Tujuan navigasi. Kosongkan bila item ini hanya induk. */
  href?: string
  icon?: LucideIcon
  /** Izin minimal untuk melihat item ini. Kosong = terlihat oleh semua yang sudah masuk. */
  izin?: Izin
  /** Label kecil di kanan, mis. "Baru". */
  lencana?: string
  warnaLencana?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  anak?: ItemMenu[]
  /** Tandai item milik halaman demo — dibuang oleh `pnpm demo:strip`. */
  demo?: boolean
}

export type GrupMenu = {
  judul: string
  item: ItemMenu[]
  demo?: boolean
}

/**
 * SUMBER TUNGGAL menu + breadcrumb + hak akses navigasi.
 * Menambah halaman = tambah satu entri di sini, bukan menyunting Sidebar.
 */
export const MENU: GrupMenu[] = [
  {
    judul: 'Beranda',
    item: [
      { judul: 'Dasbor Modern', href: '/', icon: LayoutDashboard, izin: 'dasbor.lihat' },
      { judul: 'Toko Online', href: '/dasbor/toko', icon: ShoppingBag, izin: 'dasbor.lihat', demo: true },
      { judul: 'Analitik', href: '/dasbor/analitik', icon: ChartPie, izin: 'dasbor.lihat', demo: true },
      { judul: 'CRM', href: '/dasbor/crm', icon: Activity, izin: 'dasbor.lihat', demo: true },
      { judul: 'Umum', href: '/dasbor/umum', icon: Gauge, izin: 'dasbor.lihat', demo: true },
      { judul: 'Keuangan', href: '/dasbor/keuangan', icon: PiggyBank, izin: 'laporan.lihat', demo: true },
      { judul: 'Penjualan', href: '/dasbor/penjualan', icon: Target, izin: 'pesanan.lihat', demo: true },
      { judul: 'Logistik', href: '/dasbor/logistik', icon: Truck, izin: 'dasbor.lihat', demo: true },
    ],
  },
  {
    judul: 'Aplikasi',
    demo: true,
    item: [
      { judul: 'Asisten AI', href: '/apl/asisten', icon: Bot, lencana: 'Baru', warnaLencana: 'primary', demo: true },
      { judul: 'Kalender', href: '/apl/kalender', icon: Calendar, demo: true },
      { judul: 'Daftar Tugas', href: '/apl/tugas', icon: ListTodo, demo: true },
      { judul: 'Berkas', href: '/apl/berkas', icon: FolderOpen, demo: true },
      { judul: 'Papan Kanban', href: '/apl/kanban', icon: Kanban, demo: true },
      { judul: 'Obrolan', href: '/apl/obrolan', icon: MessageCircle, demo: true },
      { judul: 'Surel', href: '/apl/surel', icon: Mail, demo: true },
      { judul: 'Catatan', href: '/apl/catatan', icon: NotepadText, demo: true },
      { judul: 'Kontak', href: '/apl/kontak', icon: Contact, demo: true },
      {
        judul: 'Faktur', icon: Receipt, demo: true,
        anak: [
          { judul: 'Daftar Faktur', href: '/apl/faktur', demo: true },
          { judul: 'Buat Faktur', href: '/apl/faktur/baru', demo: true },
        ],
      },
      { judul: 'Pesanan', href: '/apl/pesanan', icon: Truck, izin: 'pesanan.lihat', demo: true },
      { judul: 'Pelanggan', href: '/apl/pelanggan', icon: Users, izin: 'pelanggan.lihat', demo: true },
      {
        judul: 'Produk', icon: Package, izin: 'katalog.lihat', demo: true,
        anak: [
          { judul: 'Daftar produk', href: '/apl/produk', demo: true },
          { judul: 'Tambah produk', href: '/apl/produk/baru', izin: 'katalog.buat', demo: true },
        ],
      },
      { judul: 'Transaksi', href: '/apl/transaksi', icon: ArrowLeftRight, izin: 'pesanan.lihat', demo: true },
      {
        judul: 'Etalase', icon: Store, izin: 'katalog.lihat', demo: true,
        anak: [
          { judul: 'Semua produk', href: '/apl/toko', demo: true },
          { judul: 'Checkout', href: '/apl/toko/checkout', demo: true },
        ],
      },
      { judul: 'Profil Pengguna', href: '/apl/profil', icon: UserSquare, demo: true },
      {
        judul: 'Blog', icon: Newspaper, demo: true,
        anak: [
          { judul: 'Semua artikel', href: '/apl/blog', demo: true },
          { judul: 'Tulis artikel', href: '/apl/blog/baru', izin: 'katalog.buat', demo: true },
        ],
      },
      { judul: 'Proyek', href: '/apl/proyek', icon: FolderKanban, demo: true },
      { judul: 'Ulasan', href: '/apl/ulasan', icon: Star, izin: 'katalog.lihat', demo: true },
      { judul: 'Tiket', href: '/apl/tiket', icon: Ticket, demo: true },
    ],
  },
  {
    judul: 'Ritel & Stok',
    demo: true,
    item: [
      { judul: 'Kasir', href: '/apl/kasir', icon: ScanLine, izin: 'pesanan.lihat', lencana: 'Baru', warnaLencana: 'primary', demo: true },
      { judul: 'Stok', href: '/apl/stok', icon: Boxes, izin: 'stok.lihat', demo: true },
      { judul: 'Pembelian', href: '/apl/pembelian', icon: ShoppingCart, izin: 'stok.lihat', demo: true },
      { judul: 'Supplier', href: '/apl/supplier', icon: Building2, izin: 'stok.lihat', demo: true },
      { judul: 'Promo & Kupon', href: '/apl/promo', icon: Tag, izin: 'katalog.lihat', demo: true },
    ],
  },
  {
    judul: 'Kepegawaian',
    demo: true,
    item: [
      { judul: 'Karyawan', href: '/apl/karyawan', icon: IdCard, izin: 'pengguna.lihat', demo: true },
      { judul: 'Absensi', href: '/apl/absensi', icon: CalendarCheck, izin: 'pengguna.lihat', demo: true },
      { judul: 'Cuti & Izin', href: '/apl/cuti', icon: CalendarOff, izin: 'pengguna.lihat', demo: true },
      { judul: 'Penggajian', href: '/apl/penggajian', icon: Banknote, izin: 'laporan.lihat', demo: true },
    ],
  },
  {
    judul: 'Elemen UI',
    demo: true,
    item: [
      { judul: 'Galeri Komponen', href: '/ui/komponen', icon: Component, demo: true },
      { judul: 'Komponen Lanjutan', href: '/ui/lanjutan', icon: Layers, lencana: 'Baru', warnaLencana: 'success', demo: true },
      { judul: 'Ikon', href: '/ui/ikon', icon: Smile, demo: true },
      { judul: 'Animasi', href: '/ui/animasi', icon: Sparkles, demo: true },
      { judul: 'Warna & Tipografi', href: '/ui/tema', icon: Palette, demo: true },
    ],
  },
  {
    judul: 'Formulir',
    demo: true,
    item: [
      { judul: 'Elemen Formulir', href: '/formulir/elemen', icon: FormInput, demo: true },
      { judul: 'Tata Letak', href: '/formulir/tata-letak', icon: LayoutList, demo: true },
      { judul: 'Formulir Bertahap', href: '/formulir/bertahap', icon: ListChecks, demo: true },
      { judul: 'Validasi', href: '/formulir/validasi', icon: ShieldCheck, demo: true },
      { judul: 'Tambahan', href: '/formulir/tambahan', icon: SlidersHorizontal, lencana: 'Baru', warnaLencana: 'success', demo: true },
    ],
  },
  {
    judul: 'Widget',
    demo: true,
    item: [
      { judul: 'Kartu', href: '/widget/kartu', icon: Blocks, demo: true },
      { judul: 'Banner', href: '/widget/banner', icon: Archive, demo: true },
      { judul: 'Bagan', href: '/widget/bagan', icon: ChartColumn, demo: true },
    ],
  },
  {
    judul: 'Tabel',
    demo: true,
    item: [
      { judul: 'Tabel Dasar', href: '/tabel/dasar', icon: Table2, demo: true },
      { judul: 'Tabel Data', href: '/tabel/data', icon: Boxes, lencana: 'Baru', warnaLencana: 'success', demo: true },
    ],
  },
  {
    judul: 'Bagan',
    demo: true,
    item: [
      { judul: 'Garis', href: '/bagan/garis', icon: ChartLine, demo: true },
      { judul: 'Area', href: '/bagan/area', icon: ChartArea, demo: true },
      { judul: 'Batang', href: '/bagan/batang', icon: ChartColumn, demo: true },
      { judul: 'Donat & Pai', href: '/bagan/donat', icon: ChartPie, demo: true },
      { judul: 'Radar', href: '/bagan/radar', icon: Radar, demo: true },
      { judul: 'Campuran', href: '/bagan/campuran', icon: Activity, demo: true },
    ],
  },
  {
    judul: 'Halaman',
    item: [
      { judul: 'Pengguna & Peran', href: '/pengguna', icon: Users, izin: 'pengguna.lihat' },
      { judul: 'Profil Saya', href: '/profil', icon: UserCircle, izin: 'profil.lihat' },
      { judul: 'Pengaturan', href: '/pengaturan', icon: Settings, izin: 'pengaturan.lihat' },
      { judul: 'Pusat Laporan', href: '/laporan', icon: ChartNoAxesCombined, izin: 'laporan.lihat' },
      { judul: 'Jejak Audit', href: '/audit', icon: ScrollText, izin: 'audit.lihat' },
      { judul: 'Hak Akses', href: '/hak-akses', icon: ShieldHalf, izin: 'dasbor.lihat' },
      { judul: 'Integrasi', href: '/integrasi', icon: Puzzle, izin: 'pengaturan.lihat' },
      { judul: 'Kunci API', href: '/kunci-api', icon: KeyRound, izin: 'pengaturan.lihat' },
      { judul: 'Tagihan', href: '/tagihan', icon: ReceiptText, izin: 'pengaturan.lihat' },
      { judul: 'Peta Sebaran', href: '/peta', icon: Map, izin: 'dasbor.lihat', demo: true },
      { judul: 'Halaman Kosong', href: '/kosong', icon: File, demo: true },
      { judul: 'Paket Harga', href: '/harga', icon: CreditCard, demo: true },
      { judul: 'Tanya Jawab', href: '/faq', icon: CircleHelp, demo: true },
      { judul: 'Halaman Depan', href: '/beranda', icon: Globe, demo: true },
    ],
  },
  {
    judul: 'Autentikasi',
    demo: true,
    item: [
      { judul: 'Masuk', href: '/masuk', icon: Inbox, demo: true },
      { judul: 'Daftar', href: '/daftar', icon: FileText, demo: true },
      { judul: 'Lupa Sandi', href: '/lupa-sandi', icon: KeyRound, demo: true },
      { judul: 'Dua Faktor', href: '/dua-faktor', icon: ShieldCheck, demo: true },
      { judul: 'Perawatan', href: '/perawatan', icon: Wallet, demo: true },
      { judul: 'Galat 500', href: '/galat', icon: TriangleAlert, demo: true },
      { judul: 'Galat 503', href: '/galat-503', icon: ServerCrash, demo: true },
      { judul: 'Segera Hadir', href: '/segera', icon: Rocket, demo: true },
      { judul: 'Berhasil', href: '/berhasil', icon: CircleCheckBig, demo: true },
    ],
  },
]

/** Daftar rata semua item ber-href — dipakai breadcrumb & pencarian cepat (Cmd+K). */
export const MENU_RATA: Array<{ judul: string; href: string; grup: string; icon?: LucideIcon; izin?: Izin }> =
  MENU.flatMap((grup) =>
    grup.item.flatMap((item) =>
      item.anak
        ? item.anak
            .filter((a): a is ItemMenu & { href: string } => Boolean(a.href))
            .map((a) => ({ judul: `${item.judul} · ${a.judul}`, href: a.href, grup: grup.judul, icon: item.icon, izin: a.izin ?? item.izin }))
        : item.href
          ? [{ judul: item.judul, href: item.href, grup: grup.judul, icon: item.icon, izin: item.izin }]
          : [],
    ),
  )
