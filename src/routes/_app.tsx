import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TataLetakAplikasi } from '@/components/layout/tata-letak'
import { Pemuat } from '@/components/ui/rangka'
import { useAuth } from '@/lib/auth'
import { bersihkanAktivitas, MENIT_IDLE, pantauIdle } from '@/lib/sesi-idle'

/**
 * Semua halaman di bawah rute ini wajib login.
 *
 * Catatan keamanan: penjagaan di sisi klien hanya untuk pengalaman pengguna.
 * Otorisasi sebenarnya HARUS ditegakkan di backend (RLS Supabase / middleware API) —
 * lihat .claude/rules/security.md.
 */
function Terlindungi() {
  const { sudahMasuk, memuat, keluar } = useAuth()

  // Keluar otomatis setelah menganggur — syarat .claude/rules/security.md.
  useEffect(() => {
    if (!sudahMasuk) return
    return pantauIdle({
      onPeringatan: (sisaDetik) =>
        toast.warning('Sesi akan berakhir', {
          description: `Anda tidak beraktivitas beberapa saat. Sesi ditutup dalam ${Math.ceil(sisaDetik / 60)} menit — gerakkan kursor untuk melanjutkan.`,
          duration: 15_000,
        }),
      onHabis: () => {
        bersihkanAktivitas()
        void keluar()
        toast.info('Sesi berakhir', {
          description: `Anda keluar otomatis setelah ${MENIT_IDLE} menit tanpa aktivitas.`,
        })
      },
    })
  }, [sudahMasuk, keluar])

  // Alamat tujuan ditangkap SEKALI saat komponen pertama dipasang.
  // Membacanya dari router pada setiap render membuat <Navigate> menembak ulang
  // dengan search yang selalu berubah — router berpindah, href berubah, render
  // lagi, tembak lagi. Loop itu menghabiskan memori sampai tab mati.
  const [tujuanAwal] = useState(() => {
    const jalur = window.location.pathname + window.location.search
    return jalur === '/' ? undefined : jalur
  })

  if (memuat) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Pemuat label="Menyiapkan ruang kerja…" />
      </div>
    )
  }

  if (!sudahMasuk) {
    return <Navigate to="/masuk" search={{ lanjut: tujuanAwal }} replace />
  }

  return (
    <TataLetakAplikasi>
      <Outlet />
    </TataLetakAplikasi>
  )
}

export const Route = createFileRoute('/_app')({
  component: Terlindungi,
})
