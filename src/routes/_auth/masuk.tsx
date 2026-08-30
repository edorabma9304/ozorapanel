import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { TombolGoogle } from '@/components/layout/tombol-google'
import { Tombol } from '@/components/ui/tombol'
import { Peringatan } from '@/components/ui/keadaan'
import { Pemisah } from '@/components/ui/lapisan'
import { useAuth } from '@/lib/auth'
import { LABEL_PERAN, PERAN } from '@/config/peran'
import { pesanRamah } from '@/lib/tipe'
import { APP } from '@/config/app'

const skemaCari = z.object({ lanjut: z.string().optional() })

function HalamanMasuk() {
  const { masukGoogle, masukPeraga, sudahMasuk } = useAuth()
  const { lanjut } = Route.useSearch()
  const navigate = useNavigate()
  const [memuat, setMemuat] = useState(false)

  // Memanggil navigate() saat render adalah efek samping di fase render dan
  // bisa memicu loop. <Navigate> menunda perpindahan sampai setelah commit.
  if (sudahMasuk) return <Navigate to="/" replace />

  async function onMasuk() {
    setMemuat(true)
    try {
      await masukGoogle(lanjut ?? '/')
      // Driver mock menyelesaikan sesi langsung; driver lain mengalihkan ke Google.
      if (APP.driver === 'mock') await navigate({ to: '/', replace: true })
    } catch (e) {
      toast.error(pesanRamah(e))
    } finally {
      setMemuat(false)
    }
  }

  async function onPeraga(peran: (typeof PERAN)[number]) {
    if (!masukPeraga) return
    await masukPeraga(peran)
    await navigate({ to: '/', replace: true })
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Selamat datang kembali</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masuk memakai akun Google yang sudah didaftarkan administrator.
      </p>

      <div className="mt-8">
        <TombolGoogle onKlik={() => void onMasuk()} memuat={memuat} />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Belum punya akses?{' '}
        <a href="mailto:admin@ozora.id" className="font-semibold text-primary-kuat hover:underline">
          Hubungi administrator
        </a>
      </p>

      {masukPeraga ? (
        <>
          <div className="my-7 flex items-center gap-3">
            <Pemisah className="flex-1" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mode peraga
            </span>
            <Pemisah className="flex-1" />
          </div>

          <Peringatan varian="perhatian" judul="Driver data: mock">
            Tidak ada backend yang terhubung. Masuk sebagai salah satu peran untuk mencoba
            perbedaan hak aksesnya.
          </Peringatan>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {PERAN.map((p) => (
              <Tombol key={p} varian="halus" ukuran="sm" onClick={() => void onPeraga(p)}>
                {LABEL_PERAN[p]}
              </Tombol>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export const Route = createFileRoute('/_auth/masuk')({
  component: HalamanMasuk,
  validateSearch: skemaCari,
})
