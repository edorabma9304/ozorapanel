/**
 * Mesin ruang daring — reducer murni yang mengurus siapa boleh melakukan apa.
 *
 *   langkahRuang(ruang, perintah, konteks) -> ruang baru
 *
 * Pemisahan yang disengaja: `mesin.ts` tahu aturan permainan tapi tidak tahu
 * apa pun soal akun; berkas ini tahu siapa duduk di kursi mana dan menolak
 * perintah yang bukan haknya. Otorisasi sungguhan tetap harus ditegakkan di
 * server yang menjalankan fungsi ini, bukan di browser.
 */
import { GalatAksi, aksiMekanis, buatPermainan, langkah, redaksi } from './mesin'
import { TIM_MAKS, TIM_MIN } from './papan'
import {
  GalatRuang, MAKS_HURUF_PESAN, MAKS_OBROLAN, MAKS_PESERTA, PANJANG_KODE,
  type KonteksPerintah, type Kursi, type PerintahRuang, type Ruang,
  kursiPeserta, semuaKursiTerisi, timPeserta,
} from './ruang'
import type { PengaturanPermainan } from './tipe'

/** Huruf yang tidak mudah tertukar saat kode dibacakan lewat telepon. */
const HURUF_KODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function buatKode(acak: () => number = Math.random) {
  let kode = ''
  for (let i = 0; i < PANJANG_KODE; i++) kode += HURUF_KODE[Math.floor(acak() * HURUF_KODE.length)]
  return kode
}

export function buatKursi(jumlahTim: number): Kursi[] {
  const kursi: Kursi[] = []
  for (let tim = 0; tim < jumlahTim; tim++) {
    for (const nomor of [0, 1] as const) {
      kursi.push({ pemain: kursi.length, tim, nomor, peserta: null })
    }
  }
  return kursi
}

export function buatRuang({
  kode, tuanRumah, nama, pengaturan, waktu,
}: {
  kode: string
  tuanRumah: string
  nama: string
  pengaturan: PengaturanPermainan
  waktu: number
}): Ruang {
  return {
    versi: 1,
    kode,
    tuanRumah,
    pengaturan,
    peserta: [{ id: tuanRumah, nama: namaBersih(nama, 'Tuan rumah'), terlihat: waktu }],
    kursi: buatKursi(pengaturan.jumlahTim),
    permainan: null,
    obrolan: [],
    urut: 0,
  }
}

function namaBersih(nama: string, cadangan: string) {
  const bersih = nama.trim().replace(/\s+/g, ' ').slice(0, 24)
  return bersih || cadangan
}

function salin(r: Ruang): Ruang {
  return JSON.parse(JSON.stringify(r)) as Ruang
}

function wajibTuanRumah(r: Ruang, dari: string) {
  if (r.tuanRumah !== dari) throw new GalatRuang('Hanya tuan rumah yang boleh melakukan ini.')
}

function wajibPeserta(r: Ruang, dari: string) {
  const p = r.peserta.find((x) => x.id === dari)
  if (!p) throw new GalatRuang('Anda belum bergabung ke ruang ini.')
  return p
}

export function langkahRuang(sebelum: Ruang, perintah: PerintahRuang, konteks: KonteksPerintah): Ruang {
  const r = salin(sebelum)
  const { dari, waktu } = konteks

  // Setiap perintah menandai pengirimnya masih hidup.
  const pengirim = r.peserta.find((x) => x.id === dari)
  if (pengirim) pengirim.terlihat = waktu

  switch (perintah.jenis) {
    case 'gabung': {
      if (pengirim) {
        pengirim.nama = namaBersih(perintah.nama, pengirim.nama)
        break
      }
      if (r.peserta.length >= MAKS_PESERTA) {
        throw new GalatRuang(`Ruang sudah penuh (maksimal ${MAKS_PESERTA} orang). Buat ruang lain.`)
      }
      // Datang saat permainan sudah jalan dan kursi penuh: jadi penonton.
      r.peserta.push({ id: dari, nama: namaBersih(perintah.nama, `Pemain ${r.peserta.length + 1}`), terlihat: waktu })
      break
    }

    case 'pergi': {
      wajibPeserta(r, dari)
      r.peserta = r.peserta.filter((x) => x.id !== dari)
      // Kursi dikosongkan supaya orang lain bisa menggantikan; pion dan
      // hartanya tetap utuh di dalam permainan.
      for (const k of r.kursi) if (k.peserta === dari) k.peserta = null
      if (r.tuanRumah === dari && r.peserta[0]) r.tuanRumah = r.peserta[0].id
      break
    }

    case 'atur': {
      wajibTuanRumah(r, dari)
      if (r.permainan) throw new GalatRuang('Permainan sudah dimulai.')
      const jumlah = perintah.pengaturan.jumlahTim
      if (jumlah < TIM_MIN || jumlah > TIM_MAKS) throw new GalatRuang(`Jumlah tim harus ${TIM_MIN}–${TIM_MAKS}.`)
      r.pengaturan = perintah.pengaturan
      if (r.kursi.length !== jumlah * 2) {
        // Jumlah tim berubah: susun ulang kursi, pertahankan yang masih ada.
        const lama = r.kursi
        const baru = buatKursi(jumlah)
        for (const [i, k] of baru.entries()) k.peserta = lama[i]?.peserta ?? null
        r.kursi = baru
      }
      break
    }

    case 'duduk': {
      wajibPeserta(r, dari)
      if (r.permainan) throw new GalatRuang('Permainan sudah dimulai.')
      const kursi = r.kursi[perintah.kursi]
      if (!kursi) throw new GalatRuang('Kursi tidak ada.')
      if (kursi.peserta && kursi.peserta !== dari) throw new GalatRuang('Kursi itu sudah diduduki.')
      kursi.peserta = dari
      break
    }

    case 'berdiri': {
      wajibPeserta(r, dari)
      const kursi = r.kursi[perintah.kursi]
      if (!kursi) throw new GalatRuang('Kursi tidak ada.')
      if (kursi.peserta !== dari) throw new GalatRuang('Itu bukan kursi Anda.')
      kursi.peserta = null
      break
    }

    case 'mulai': {
      wajibTuanRumah(r, dari)
      if (r.permainan) throw new GalatRuang('Permainan sudah dimulai.')
      if (!semuaKursiTerisi(r)) throw new GalatRuang('Semua kursi harus terisi sebelum mulai.')
      // Nama pemain diambil dari nama peserta yang mendudukinya.
      const namaPemain: string[][] = []
      for (const k of r.kursi) {
        const nama = r.peserta.find((x) => x.id === k.peserta)?.nama ?? ''
        ;(namaPemain[k.tim] ??= [])[k.nomor] = nama
      }
      r.permainan = buatPermainan({ ...r.pengaturan, namaPemain })
      break
    }

    case 'aksi': {
      wajibPeserta(r, dari)
      const permainan = r.permainan
      if (!permainan) throw new GalatRuang('Permainan belum dimulai.')

      const aksi = perintah.aksi
      const mekanis = aksiMekanis(aksi)
      if (!mekanis) {
        if (aksi.jenis === 'menyerah') {
          // Menyerah boleh diputuskan siapa pun di tim itu.
          if (!kursiPeserta(r, dari).some((k) => k.tim === aksi.tim)) {
            throw new GalatRuang('Hanya anggota tim itu yang boleh menyerah.')
          }
        } else {
          const kursiAktif = r.kursi.find((k) => k.pemain === permainan.pemainAktif)
          if (kursiAktif?.peserta !== dari) throw new GalatRuang('Bukan giliran Anda.')
        }
      }

      try {
        r.permainan = langkah(permainan, aksi)
      } catch (e) {
        // Aksi mekanis dikirim oleh semua klien setelah animasinya masing-masing.
        // Yang datang terlambat menemukan fase sudah berganti; itu wajar.
        if (mekanis && e instanceof GalatAksi) return sebelum
        throw e
      }
      break
    }

    case 'obrol': {
      const peserta = wajibPeserta(r, dari)
      const teks = perintah.teks.trim().slice(0, MAKS_HURUF_PESAN)
      if (!teks) return sebelum
      const tim = perintah.saluran === 'tim' ? timPeserta(r, dari) : null
      if (perintah.saluran === 'tim' && tim === null) {
        throw new GalatRuang('Anda belum duduk di kursi mana pun, jadi belum punya tim.')
      }
      r.obrolan.push({ id: konteks.id, peserta: dari, nama: peserta.nama, saluran: perintah.saluran, tim, teks, waktu })
      if (r.obrolan.length > MAKS_OBROLAN) r.obrolan.splice(0, r.obrolan.length - MAKS_OBROLAN)
      break
    }

    case 'bubar': {
      wajibTuanRumah(r, dari)
      r.permainan = null
      break
    }

    default: {
      // Menolak, bukan mengabaikan: perintah yang lolos diam-diam tetap
      // menaikkan nomor urut, jadi satu klien usang bisa memaksa semua orang
      // menyegarkan tanpa henti.
      const takDikenal: never = perintah
      throw new GalatRuang(
        `Perintah "${(takDikenal as { jenis?: string }).jenis ?? '?'}" tidak dikenal. Muat ulang halaman supaya versi permainannya sama.`,
      )
    }
  }

  r.urut = sebelum.urut + 1
  return r
}

/**
 * Pandangan yang boleh dikirim ke satu peserta: rahasia bandar dibuang, dan
 * obrolan tim lain disaring. Wajib dipakai oleh transport mana pun yang
 * menyiarkan ruang ke pemain.
 */
export function pandangan(ruang: Ruang, untuk: string): Ruang {
  const tim = timPeserta(ruang, untuk)
  return {
    ...ruang,
    permainan: ruang.permainan ? redaksi(ruang.permainan) : null,
    obrolan: ruang.obrolan.filter((m) => m.saluran === 'semua' || m.tim === tim),
  }
}
