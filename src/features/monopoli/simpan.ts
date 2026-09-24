import { APP } from '@/config/app'
import type { Permainan } from './tipe'

/** Permainan yang sedang berjalan disimpan di localStorage agar tahan muat ulang. */
const KUNCI = `${APP.prefiksSimpanan}monopoli`

export function bacaPermainan(): Permainan | null {
  try {
    const mentah = localStorage.getItem(KUNCI)
    if (!mentah) return null
    const data = JSON.parse(mentah) as Permainan
    return data.versi === 2 ? data : null
  } catch {
    return null
  }
}

export function tulisPermainan(p: Permainan | null) {
  try {
    if (p) localStorage.setItem(KUNCI, JSON.stringify(p))
    else localStorage.removeItem(KUNCI)
  } catch {
    // Mode privat atau kuota penuh — permainan tetap hidup di memori.
  }
}
