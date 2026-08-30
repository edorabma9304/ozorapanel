import { createFileRoute } from '@tanstack/react-router'
import { KepalaHalaman } from '@/components/layout/kepala-halaman'
import { DeskripsiKartu, IsiKartu, JudulKartu, Kartu, KepalaKartu } from '@/components/ui/kartu'
import { BadanTabel, BarisTabel, BingkaiTabel, KepalaTabel, Sel, SelKepala, Tabel } from '@/components/ui/tabel'
import { Lencana } from '@/components/ui/lencana'
import { Avatar } from '@/components/ui/avatar'
import { Peringatan } from '@/components/ui/keadaan'
import { formatAngka, formatRp } from '@/lib/format'
import { PRODUK_CONTOH } from '@/lib/adapter/data-contoh'

const BARIS = PRODUK_CONTOH.slice(0, 6)

function HalamanTabelDasar() {
  return (
    <>
      <KepalaHalaman
        judul="Tabel dasar"
        deskripsi="Primitif tabel tanpa logika — untuk data statis yang tidak perlu paginasi."
        remah={[{ label: 'Tabel' }, { label: 'Dasar' }]}
      />

      <Peringatan varian="info" judul="Kapan memakai yang mana">
        Pakai tabel dasar untuk daftar pendek dan tetap (rincian faktur, ringkasan).
        Untuk daftar yang perlu pencarian, pengurutan, dan paginasi, pakai{' '}
        <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs">TabelData</code> —
        contohnya ada di halaman Tabel Data.
      </Peringatan>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Tabel sederhana</JudulKartu>
            <DeskripsiKartu>Kepala, badan, dan baris dengan efek sorot</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="px-0 pt-3">
          <BingkaiTabel>
            <Tabel>
              <KepalaTabel>
                <tr>
                  <SelKepala>Produk</SelKepala>
                  <SelKepala>Kategori</SelKepala>
                  <SelKepala className="text-right">Harga</SelKepala>
                  <SelKepala className="text-right">Stok</SelKepala>
                </tr>
              </KepalaTabel>
              <BadanTabel>
                {BARIS.map((p) => (
                  <BarisTabel key={p.id}>
                    <Sel className="font-semibold">{p.nama}</Sel>
                    <Sel className="text-muted-foreground">{p.kategori}</Sel>
                    <Sel className="text-right">{formatRp(p.harga)}</Sel>
                    <Sel className="text-right">{formatAngka(p.stok)}</Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
            </Tabel>
          </BingkaiTabel>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Dengan avatar &amp; lencana</JudulKartu>
            <DeskripsiKartu>Sel bisa memuat komponen apa pun</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="px-0 pt-3">
          <BingkaiTabel>
            <Tabel>
              <KepalaTabel>
                <tr>
                  <SelKepala>Produk</SelKepala>
                  <SelKepala className="hidden sm:table-cell">SKU</SelKepala>
                  <SelKepala>Status</SelKepala>
                  <SelKepala className="text-right">Terjual</SelKepala>
                </tr>
              </KepalaTabel>
              <BadanTabel>
                {BARIS.map((p) => (
                  <BarisTabel key={p.id}>
                    <Sel>
                      <div className="flex items-center gap-3">
                        <Avatar nama={p.nama} src={p.gambar} ukuran="sm" />
                        <span className="font-semibold">{p.nama}</span>
                      </div>
                    </Sel>
                    <Sel className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{p.sku}</Sel>
                    <Sel>
                      <Lencana warna={p.status === 'terbit' ? 'success' : p.status === 'draf' ? 'warning' : 'netral'}>
                        {p.status}
                      </Lencana>
                    </Sel>
                    <Sel className="text-right font-semibold">{formatAngka(p.terjual)}</Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
            </Tabel>
          </BingkaiTabel>
        </IsiKartu>
      </Kartu>

      <Kartu>
        <KepalaKartu>
          <div>
            <JudulKartu>Dengan baris ringkasan</JudulKartu>
            <DeskripsiKartu>Pola yang dipakai pada rincian faktur</DeskripsiKartu>
          </div>
        </KepalaKartu>
        <IsiKartu className="px-0 pt-3">
          <BingkaiTabel>
            <Tabel>
              <KepalaTabel>
                <tr>
                  <SelKepala>Item</SelKepala>
                  <SelKepala className="text-right">Jumlah</SelKepala>
                  <SelKepala className="text-right">Harga</SelKepala>
                  <SelKepala className="text-right">Subtotal</SelKepala>
                </tr>
              </KepalaTabel>
              <BadanTabel>
                {BARIS.slice(0, 4).map((p, i) => (
                  <BarisTabel key={p.id}>
                    <Sel className="font-medium">{p.nama}</Sel>
                    <Sel className="text-right">{i + 1}</Sel>
                    <Sel className="text-right">{formatRp(p.harga)}</Sel>
                    <Sel className="text-right font-semibold">{formatRp(p.harga * (i + 1))}</Sel>
                  </BarisTabel>
                ))}
              </BadanTabel>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/50">
                  <Sel colSpan={3} className="text-right font-bold">Total</Sel>
                  <Sel className="text-right text-base font-extrabold text-primary-kuat">
                    {formatRp(BARIS.slice(0, 4).reduce((a, p, i) => a + p.harga * (i + 1), 0))}
                  </Sel>
                </tr>
              </tfoot>
            </Tabel>
          </BingkaiTabel>
        </IsiKartu>
      </Kartu>
    </>
  )
}

export const Route = createFileRoute('/_app/tabel/dasar')({ component: HalamanTabelDasar })
