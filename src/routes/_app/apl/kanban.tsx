import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, MoveRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { Kartu } from '@/components/ui/kartu'
import { Tombol } from '@/components/ui/tombol'
import { Lencana, type WarnaLencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Dropdown, IsiDropdown, ItemDropdown, LabelDropdown, PemicuDropdown } from '@/components/ui/lapisan'
import { KANBAN_CONTOH } from '@/lib/adapter/data-contoh'
import { formatTanggal } from '@/lib/format'
import { cn } from '@/lib/utils'

type Kartu = (typeof KANBAN_CONTOH)[number]['kartu'][number]

const WARNA_LABEL: Record<string, WarnaLencana> = {
  Fitur: 'primary',
  Bug: 'danger',
  Riset: 'info',
  Perawatan: 'warning',
}

const WARNA_PRIORITAS: Record<string, WarnaLencana> = {
  rendah: 'netral',
  sedang: 'info',
  tinggi: 'danger',
}

function HalamanKanban() {
  const [papan, setPapan] = useState(KANBAN_CONTOH)
  const [seret, setSeret] = useState<{ kartu: Kartu; dariKolom: string } | null>(null)

  function pindahkan(kartu: Kartu, dariKolom: string, keKolom: string) {
    if (dariKolom === keKolom) return
    setPapan((p) =>
      p.map((kol) => {
        if (kol.id === dariKolom) return { ...kol, kartu: kol.kartu.filter((k) => k.id !== kartu.id) }
        if (kol.id === keKolom) return { ...kol, kartu: [kartu, ...kol.kartu] }
        return kol
      }),
    )
    toast.success(`"${kartu.judul}" dipindahkan.`)
  }

  function jatuhkan(keKolom: string) {
    if (seret) pindahkan(seret.kartu, seret.dariKolom, keKolom)
    setSeret(null)
  }

  return (
    <>
      <KepalaHalaman
        judul="Papan kanban"
        deskripsi="Seret kartu antar kolom untuk memperbarui statusnya."
        remah={[{ label: 'Aplikasi' }, { label: 'Kanban' }]}
        aksi={<Tombol><Plus /> Kartu baru</Tombol>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {papan.map((kolom) => (
          <section
            key={kolom.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => jatuhkan(kolom.id)}
            className={cn(
              'flex flex-col rounded-card border border-border bg-muted/40 p-3 transition-colors',
              seret && seret.dariKolom !== kolom.id && 'border-primary/40 bg-primary-soft/30',
            )}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Lencana warna={kolom.warna} ukuran="sm" padat>{kolom.kartu.length}</Lencana>
                {kolom.judul}
              </h2>
              <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Tambah kartu di ${kolom.judul}`}>
                <Plus />
              </Tombol>
            </header>

            <div className="flex-1 space-y-3">
              {kolom.kartu.map((k) => (
                <article
                  key={k.id}
                  draggable
                  onDragStart={() => setSeret({ kartu: k, dariKolom: kolom.id })}
                  onDragEnd={() => setSeret(null)}
                  className="cursor-grab rounded-card border border-border bg-card p-3.5 shadow-soft transition-shadow active:cursor-grabbing hover:shadow-raised"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Lencana warna={WARNA_LABEL[k.label] ?? 'netral'} ukuran="sm">{k.label}</Lencana>
                    <Lencana warna={WARNA_PRIORITAS[k.prioritas] ?? 'netral'} ukuran="sm">{k.prioritas}</Lencana>
                  </div>
                  <h3 className="mt-2.5 text-sm font-semibold leading-snug">{k.judul}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatTanggal(k.tenggat)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Avatar nama={k.penanggung} src={k.avatar} ukuran="xs" />
                      {/* Menyeret tidak bisa dilakukan dengan papan ketik —
                          menu ini jalur setara untuk pengguna non-tetikus. */}
                      <Dropdown>
                        <PemicuDropdown asChild>
                          <Tombol varian="hantu" ukuran="ikon-sm" aria-label={`Pindahkan "${k.judul}"`}>
                            <MoveRight />
                          </Tombol>
                        </PemicuDropdown>
                        <IsiDropdown>
                          <LabelDropdown>Pindahkan ke</LabelDropdown>
                          {papan
                            .filter((tujuan) => tujuan.id !== kolom.id)
                            .map((tujuan) => (
                              <ItemDropdown key={tujuan.id} onSelect={() => pindahkan(k, kolom.id, tujuan.id)}>
                                {tujuan.judul}
                              </ItemDropdown>
                            ))}
                        </IsiDropdown>
                      </Dropdown>
                    </span>
                  </div>
                </article>
              ))}

              {kolom.kartu.length === 0 ? (
                <p className="rounded-card border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Kosong — seret kartu ke sini
                </p>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

export const Route = createFileRoute('/_app/apl/kanban')({ component: HalamanKanban })
