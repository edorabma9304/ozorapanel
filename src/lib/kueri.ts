import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { data } from '@/lib/adapter'
import { pesanRamah, type Halaman, type KueriDaftar } from '@/lib/tipe'

export const klienKueri = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data jarang berubah tidak diminta ulang tiap fokus
      gcTime: 5 * 60_000,
      retry: (gagal, galat) => {
        // Jangan ulangi kalau memang tidak berhak / tidak ada.
        const kode = (galat as { kode?: number })?.kode
        if (kode && kode >= 400 && kode < 500) return false
        return gagal < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (galat) => toast.error(pesanRamah(galat)),
    },
  },
})

export const kunci = {
  koleksi: (nama: string) => [nama] as const,
  daftar: (nama: string, kueri?: KueriDaftar) => [nama, 'daftar', kueri ?? {}] as const,
  detail: (nama: string, id: string) => [nama, 'detail', id] as const,
}

/**
 * Ambil daftar berhalaman dari sebuah koleksi.
 *
 * ```tsx
 * const { data: hal, isPending } = useDaftar<Produk>('produk', { halaman, cari })
 * ```
 */
export function useDaftar<T>(nama: string, kueri: KueriDaftar = {}, aktif = true) {
  return useQuery({
    queryKey: kunci.daftar(nama, kueri),
    queryFn: () => data.koleksi<T>(nama).daftar(kueri),
    placeholderData: keepPreviousData, // cegah tabel berkedip saat ganti halaman
    enabled: aktif,
  })
}

export function useDetail<T>(nama: string, id: string | undefined) {
  return useQuery({
    queryKey: kunci.detail(nama, id ?? ''),
    queryFn: () => data.koleksi<T>(nama).ambil(id!),
    enabled: Boolean(id),
  })
}

/** Simpan (buat bila `id` kosong, ubah bila ada). Satu hook untuk kedua kasus. */
export function useSimpan<T extends { id?: string }>(nama: string, pesanSukses?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...isi }: Partial<T> & { id?: string }) =>
      id
        ? data.koleksi<T>(nama).ubah(id, isi as Partial<T>)
        : data.koleksi<T>(nama).buat(isi as Partial<T>),
    onSuccess: (hasil, variabel) => {
      void qc.invalidateQueries({ queryKey: kunci.koleksi(nama) })
      toast.success(pesanSukses ?? (variabel.id ? 'Perubahan tersimpan.' : 'Data berhasil dibuat.'))
      return hasil
    },
  })
}

export function useHapus(nama: string, pesanSukses = 'Data berhasil dihapus.') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => data.koleksi(nama).hapus(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.koleksi(nama) })
      toast.success(pesanSukses)
    },
  })
}

export function usePulihkan(nama: string, pesanSukses = 'Data berhasil dipulihkan.') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => data.koleksi(nama).pulihkan(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: kunci.koleksi(nama) })
      toast.success(pesanSukses)
    },
  })
}

/** Halaman kosong — dipakai sebagai nilai awal supaya UI tidak perlu cek undefined. */
export function halamanKosong<T>(perHalaman = 10): Halaman<T> {
  return { data: [], total: 0, halaman: 1, perHalaman, totalHalaman: 1 }
}
