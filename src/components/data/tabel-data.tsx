import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  BadanTabel,
  BarisTabel,
  BingkaiTabel,
  KepalaTabel,
  Sel,
  SelKepala,
  Tabel,
} from '@/components/ui/tabel'
import { KotakCentang } from '@/components/ui/kendali'
import { KeadaanGalat, KeadaanKosong } from '@/components/ui/keadaan'
import { RangkaBaris } from '@/components/ui/rangka'
import { Paginasi } from './paginasi'
import { cn } from '@/lib/utils'
import type { ArahUrut, Halaman } from '@/lib/tipe'

export type Kolom<T> = {
  /** Kunci kolom — juga dipakai sebagai nama kolom saat mengurutkan di server. */
  kunci: string
  judul: ReactNode
  render: (baris: T, indeks: number) => ReactNode
  /** Aktifkan tombol urut pada kepala kolom. */
  urutkan?: boolean
  rata?: 'kiri' | 'tengah' | 'kanan'
  lebar?: string
  /** Sembunyikan di layar kecil supaya tabel tetap terbaca. */
  sembunyiHp?: boolean
  className?: string
}

type Props<T> = {
  kolom: Array<Kolom<T>>
  halaman?: Halaman<T>
  memuat?: boolean
  galat?: unknown
  onCobaLagi?: () => void
  /** Pengurutan sisi server. */
  urut?: { kolom: string; arah: ArahUrut }
  onUrut?: (u: { kolom: string; arah: ArahUrut }) => void
  onHalaman?: (h: number) => void
  onPerHalaman?: (n: number) => void
  /** Pilih baris (checkbox). Beri `idBaris` agar seleksi stabil lintas halaman. */
  terpilih?: string[]
  onTerpilih?: (id: string[]) => void
  idBaris?: (baris: T) => string
  /** Kolom aksi paling kanan. */
  aksi?: (baris: T) => ReactNode
  onKlikBaris?: (baris: T) => void
  kosong?: { judul?: string; deskripsi?: string; aksi?: ReactNode }
  className?: string
}

const rataKelas = { kiri: 'text-left', tengah: 'text-center', kanan: 'text-right' } as const

/**
 * Tabel serba guna untuk semua halaman daftar.
 * Pengurutan, pencarian, dan paginasi dikerjakan di sisi server lewat adapter —
 * komponen ini hanya menampilkan dan mengirim niat pengguna ke atas.
 */
export function TabelData<T>({
  kolom,
  halaman,
  memuat,
  galat,
  onCobaLagi,
  urut,
  onUrut,
  onHalaman,
  onPerHalaman,
  terpilih,
  onTerpilih,
  idBaris,
  aksi,
  onKlikBaris,
  kosong,
  className,
}: Props<T>) {
  const bolehPilih = Boolean(terpilih && onTerpilih && idBaris)
  const baris = halaman?.data ?? []
  const idTampil = bolehPilih ? baris.map((b) => idBaris!(b)) : []
  const semuaTerpilih = idTampil.length > 0 && idTampil.every((id) => terpilih!.includes(id))
  const sebagianTerpilih = !semuaTerpilih && idTampil.some((id) => terpilih!.includes(id))
  const jumlahKolom = kolom.length + (bolehPilih ? 1 : 0) + (aksi ? 1 : 0)

  function toggleSemua() {
    if (!bolehPilih) return
    onTerpilih!(
      semuaTerpilih
        ? terpilih!.filter((id) => !idTampil.includes(id))
        : [...new Set([...terpilih!, ...idTampil])],
    )
  }

  function toggleSatu(id: string) {
    if (!bolehPilih) return
    onTerpilih!(terpilih!.includes(id) ? terpilih!.filter((x) => x !== id) : [...terpilih!, id])
  }

  function klikUrut(k: Kolom<T>) {
    if (!k.urutkan || !onUrut) return
    const arah: ArahUrut = urut?.kolom === k.kunci && urut.arah === 'naik' ? 'turun' : 'naik'
    onUrut({ kolom: k.kunci, arah })
  }

  if (galat) {
    return (
      <div className={className}>
        <KeadaanGalat galat={galat} onCobaLagi={onCobaLagi} />
      </div>
    )
  }

  return (
    <div className={className}>
      <BingkaiTabel>
        <Tabel>
          <KepalaTabel>
            <tr>
              {bolehPilih ? (
                <SelKepala className="w-10">
                  <KotakCentang
                    checked={semuaTerpilih ? true : sebagianTerpilih ? 'indeterminate' : false}
                    onCheckedChange={toggleSemua}
                    aria-label="Pilih semua baris di halaman ini"
                  />
                </SelKepala>
              ) : null}

              {kolom.map((k) => (
                <SelKepala
                  key={k.kunci}
                  style={k.lebar ? { width: k.lebar } : undefined}
                  className={cn(
                    k.rata && rataKelas[k.rata],
                    k.sembunyiHp && 'hidden md:table-cell',
                    k.className,
                  )}
                  aria-sort={
                    urut?.kolom === k.kunci
                      ? urut.arah === 'naik'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {k.urutkan && onUrut ? (
                    <button
                      type="button"
                      onClick={() => klikUrut(k)}
                      className="inline-flex items-center gap-1.5 rounded transition-colors hover:text-foreground"
                    >
                      {k.judul}
                      {urut?.kolom === k.kunci ? (
                        urut.arah === 'naik' ? (
                          <ArrowUp className="size-3.5 text-primary-kuat" />
                        ) : (
                          <ArrowDown className="size-3.5 text-primary-kuat" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    k.judul
                  )}
                </SelKepala>
              ))}

              {aksi ? <SelKepala className="w-16 text-right">Aksi</SelKepala> : null}
            </tr>
          </KepalaTabel>

          <BadanTabel>
            {memuat && baris.length === 0 ? (
              <RangkaBaris jumlah={6} kolom={jumlahKolom} />
            ) : baris.length === 0 ? (
              <tr>
                <td colSpan={jumlahKolom}>
                  <KeadaanKosong
                    ikon={Inbox}
                    judul={kosong?.judul ?? 'Belum ada data'}
                    deskripsi={kosong?.deskripsi ?? 'Coba ubah kata kunci atau filter pencarian.'}
                    aksi={kosong?.aksi}
                  />
                </td>
              </tr>
            ) : (
              baris.map((b, i) => {
                const id = bolehPilih ? idBaris!(b) : String(i)
                const dipilih = bolehPilih && terpilih!.includes(id)
                return (
                  <BarisTabel
                    key={id}
                    data-terpilih={dipilih}
                    onClick={onKlikBaris ? () => onKlikBaris(b) : undefined}
                    className={cn(onKlikBaris && 'cursor-pointer', memuat && 'opacity-60')}
                  >
                    {bolehPilih ? (
                      <Sel onClick={(e) => e.stopPropagation()}>
                        <KotakCentang
                          checked={dipilih}
                          onCheckedChange={() => toggleSatu(id)}
                          aria-label="Pilih baris"
                        />
                      </Sel>
                    ) : null}

                    {kolom.map((k) => (
                      <Sel
                        key={k.kunci}
                        className={cn(
                          k.rata && rataKelas[k.rata],
                          k.sembunyiHp && 'hidden md:table-cell',
                        )}
                      >
                        {k.render(b, i)}
                      </Sel>
                    ))}

                    {aksi ? (
                      <Sel className="text-right" onClick={(e) => e.stopPropagation()}>
                        {aksi(b)}
                      </Sel>
                    ) : null}
                  </BarisTabel>
                )
              })
            )}
          </BadanTabel>
        </Tabel>
      </BingkaiTabel>

      {halaman && onHalaman ? (
        <Paginasi
          halaman={halaman.halaman}
          totalHalaman={halaman.totalHalaman}
          total={halaman.total}
          perHalaman={halaman.perHalaman}
          onHalaman={onHalaman}
          onPerHalaman={onPerHalaman}
        />
      ) : null}
    </div>
  )
}
