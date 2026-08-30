import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDaftar } from '@/lib/kueri'
import type { ArahUrut, KueriDaftar } from '@/lib/tipe'

type Opsi = {
  perHalamanAwal?: number
  urutAwal?: { kolom: string; arah: ArahUrut }
  filterAwal?: Record<string, string | undefined>
  /** Jeda debounce pencarian (ms) — 300 sesuai .claude/rules/performance.md */
  jedaCari?: number
}

/**
 * Satu hook untuk seluruh halaman daftar: pencarian ter-debounce, filter,
 * pengurutan, dan paginasi — sudah tersambung ke adapter data.
 *
 * ```tsx
 * const t = useDaftarTabel<Produk>('produk', { urutAwal: { kolom: 'nama', arah: 'naik' } })
 * <TabelData kolom={kolom} {...t.propsTabel} />
 * ```
 */
export function useDaftarTabel<T>(koleksi: string, opsi: Opsi = {}) {
  const { perHalamanAwal = 10, urutAwal, filterAwal = {}, jedaCari = 300 } = opsi

  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(perHalamanAwal)
  const [cari, setCari] = useState('')
  const [cariTertunda, setCariTertunda] = useState('')
  const [urut, setUrut] = useState(urutAwal)
  const [filter, setFilter] = useState<Record<string, string | undefined>>(filterAwal)
  const [terpilih, setTerpilih] = useState<string[]>([])

  // Debounce pencarian — jangan tembak server tiap ketukan tombol.
  useEffect(() => {
    const t = setTimeout(() => setCariTertunda(cari), jedaCari)
    return () => clearTimeout(t)
  }, [cari, jedaCari])

  // Kembali ke halaman 1 setiap kriteria berubah, supaya tidak "halaman kosong".
  useEffect(() => {
    setHalaman(1)
  }, [cariTertunda, filter, perHalaman])

  const kueri: KueriDaftar = useMemo(
    () => ({ halaman, perHalaman, cari: cariTertunda, urut, filter }),
    [halaman, perHalaman, cariTertunda, urut, filter],
  )

  const hasil = useDaftar<T>(koleksi, kueri)

  const ubahFilter = useCallback((kolom: string, nilai: string | undefined) => {
    setFilter((f) => ({ ...f, [kolom]: nilai === '' ? undefined : nilai }))
  }, [])

  const bersihkanFilter = useCallback(() => {
    setFilter({})
    setCari('')
  }, [])

  const adaFilterAktif = Boolean(cari) || Object.values(filter).some(Boolean)

  return {
    // keadaan mentah bila halaman butuh kendali khusus
    halaman,
    perHalaman,
    cari,
    setCari,
    urut,
    filter,
    ubahFilter,
    bersihkanFilter,
    adaFilterAktif,
    terpilih,
    setTerpilih,
    hasil,

    /** Sebar langsung ke <TabelData />. */
    propsTabel: {
      halaman: hasil.data,
      memuat: hasil.isFetching,
      galat: hasil.error,
      onCobaLagi: () => void hasil.refetch(),
      urut,
      onUrut: setUrut,
      onHalaman: setHalaman,
      onPerHalaman: setPerHalaman,
      terpilih,
      onTerpilih: setTerpilih,
    } as const,
  }
}
