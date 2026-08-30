import { useSyncExternalStore } from 'react'
import { APP } from '@/config/app'

/**
 * Keranjang belanja sederhana.
 *
 * Memakai store di tingkat modul + useSyncExternalStore, bukan Context —
 * keranjang dibaca dari banyak halaman yang tidak saling bersarang, dan cara
 * ini tidak memaksa seluruh pohon komponen ikut render ulang.
 */
export type BarisKeranjang = {
  id: string
  nama: string
  harga: number
  gambar: string
  qty: number
}

const KUNCI = `${APP.prefiksSimpanan}keranjang`

let isi: BarisKeranjang[] = baca()
const pendengar = new Set<() => void>()

function baca(): BarisKeranjang[] {
  try {
    const mentah = localStorage.getItem(KUNCI)
    return mentah ? (JSON.parse(mentah) as BarisKeranjang[]) : []
  } catch {
    return []
  }
}

function tulis(baru: BarisKeranjang[]) {
  isi = baru
  try {
    localStorage.setItem(KUNCI, JSON.stringify(baru))
  } catch {
    // Mode privat atau kuota penuh — keranjang tetap hidup di memori.
  }
  for (const p of pendengar) p()
}

function langganan(cb: () => void) {
  pendengar.add(cb)
  return () => pendengar.delete(cb)
}

export const keranjang = {
  tambah(barang: Omit<BarisKeranjang, 'qty'>, qty = 1) {
    const ada = isi.find((b) => b.id === barang.id)
    tulis(
      ada
        ? isi.map((b) => (b.id === barang.id ? { ...b, qty: b.qty + qty } : b))
        : [...isi, { ...barang, qty }],
    )
  },
  ubahQty(id: string, qty: number) {
    tulis(qty <= 0 ? isi.filter((b) => b.id !== id) : isi.map((b) => (b.id === id ? { ...b, qty } : b)))
  },
  hapus(id: string) {
    tulis(isi.filter((b) => b.id !== id))
  },
  kosongkan() {
    tulis([])
  },
}

export function useKeranjang() {
  const baris = useSyncExternalStore(
    langganan,
    () => isi,
    () => [] as BarisKeranjang[], // nilai untuk render di server / snapshot awal
  )
  const jumlah = baris.reduce((a, b) => a + b.qty, 0)
  const subtotal = baris.reduce((a, b) => a + b.harga * b.qty, 0)
  return { baris, jumlah, subtotal, ...keranjang }
}
