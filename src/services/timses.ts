import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { TimsesMember } from "@/types/timses";

// 2026-08-23: `TimsesApiRecord`/`mapTimsesMember` (kontrak backend LAMA,
// TypeORM entity `Timse` — dusun/desa/kecamatan/no_telpon/lat/long) DIHAPUS.
// Backend baru (`TimsesModel`, Sequelize) tidak punya kolom-kolom itu sama
// sekali, dan tidak ada endpoint list-semua-anggota lagi (lihat
// `fetchTimsesList` di bawah) — tidak ada lagi mapper real API untuk file ini.

// Data demo untuk verifikasi hierarki Kecamatan > Desa + status online snapshot
// (lihat progress-tracker.md Decisions — realtime socket.io TIDAK dipakai, backend
// gateway-nya kosong dan `status_online` tidak pernah direset ke "offline"). 5 nama
// pertama diambil dari context/designs/timses.png, 3 tambahan (kecamatan Rancaekek)
// ditambah supaya drill-down Kecamatan bisa diverifikasi dengan >1 pilihan.
// `lat`/`long` cuma diisi untuk 3 anggota (Dedi/Yayat online, Neng Sari offline) —
// mencerminkan kenyataan backend (Feature 07): field ini tidak pernah ditulis
// siapapun sebelum ada fitur ini, jadi mayoritas anggota belum punya data lokasi.
const MOCK_TIMSES: TimsesMember[] = [
  {
    id: 101,
    nik: "3204011201010001",
    namaLengkap: "Dedi Kurniawan",
    dusun: "Cileunyi Kulon",
    desa: "Cileunyi Kulon",
    kecamatan: "Cileunyi",
    jenisKelamin: "L",
    noTelpon: "0812-1000-0001",
    roles: "relawankecamatan",
    statusOnline: "online",
    lat: -6.928,
    long: 107.7295,
  },
  {
    id: 102,
    nik: "3204011201010002",
    namaLengkap: "Yayat Hidayat",
    dusun: "Cileunyi Kulon",
    desa: "Cileunyi Kulon",
    kecamatan: "Cileunyi",
    jenisKelamin: "L",
    noTelpon: "0812-1000-0002",
    roles: "relawandesa",
    statusOnline: "online",
    lat: -6.931,
    long: 107.725,
  },
  {
    id: 103,
    nik: "3204011201010003",
    namaLengkap: "Neng Sari",
    dusun: "Cileunyi Wetan",
    desa: "Cileunyi Wetan",
    kecamatan: "Cileunyi",
    jenisKelamin: "P",
    noTelpon: "0812-1000-0003",
    roles: "timses",
    statusOnline: "offline",
    lat: -6.935,
    long: 107.733,
  },
  {
    id: 104,
    nik: "3204011201010004",
    namaLengkap: "Asep Saepudin",
    dusun: "Cinunuk",
    desa: "Cinunuk",
    kecamatan: "Cileunyi",
    jenisKelamin: "L",
    noTelpon: "0812-1000-0004",
    roles: "timses",
    statusOnline: "offline",
    lat: null,
    long: null,
  },
  {
    id: 105,
    nik: "3204011201010005",
    namaLengkap: "Mira Anggraini",
    dusun: "Cimekar",
    desa: "Cimekar",
    kecamatan: "Cileunyi",
    jenisKelamin: "P",
    noTelpon: "0812-1000-0005",
    roles: "relawandesa",
    statusOnline: "online",
    lat: null,
    long: null,
  },
  {
    id: 106,
    nik: "3204011201010006",
    namaLengkap: "Rina Marlina",
    dusun: "Rancaekek Kulon",
    desa: "Rancaekek Kulon",
    kecamatan: "Rancaekek",
    jenisKelamin: "P",
    noTelpon: "0812-1000-0006",
    roles: "relawankecamatan",
    statusOnline: "online",
    lat: null,
    long: null,
  },
  {
    id: 107,
    nik: "3204011201010007",
    namaLengkap: "Budi Santoso",
    dusun: "Rancaekek Kulon",
    desa: "Rancaekek Kulon",
    kecamatan: "Rancaekek",
    jenisKelamin: "L",
    noTelpon: "0812-1000-0007",
    roles: "timses",
    statusOnline: "offline",
    lat: null,
    long: null,
  },
  {
    id: 108,
    nik: "3204011201010008",
    namaLengkap: "Siti Aminah",
    dusun: "Bojongloa",
    desa: "Bojongloa",
    kecamatan: "Rancaekek",
    jenisKelamin: "P",
    noTelpon: "0812-1000-0008",
    roles: "relawandesa",
    statusOnline: "online",
    lat: null,
    long: null,
  },
];

// Mutable copy — `updateOwnLocation` (Feature 07) menulis ke sini di mock mode
// supaya beacon lokasi device sendiri kelihatan efeknya tanpa backend asli
// (pola sama dengan `mockDtdoorList`/`mockGotvList` di services/dtdoor.ts & gotv.ts).
let mockTimsesList: TimsesMember[] = [...MOCK_TIMSES];

async function fetchTimsesListMock(): Promise<TimsesMember[]> {
  await mockDelay();
  return mockTimsesList;
}

// 2026-08-23: modul backend `timses` (TypeORM, `GET /timses`) SUDAH TIDAK ADA
// — diganti modul `user` (Sequelize, `src/user/user.controller.ts`) yang
// SELF-SERVICE SAJA (`GET /user/profile`, dari JWT, tidak ada `:id`, apalagi
// list-semua-anggota). Dicari ke seluruh backend, tidak ketemu endpoint
// pengganti untuk kapabilitas "list semua anggota timses" — bukan cuma salah
// path, kapabilitasnya sendiri belum ada. Real branch sengaja `throw` pesan
// jelas (Aturan #6 — jangan mengarang endpoint), BUKAN mencoba path lain.
// TimsesScreen/LacakRelawanScreen akan tampil "gagal memuat" sampai ada
// sumber data pengganti — lihat progress-tracker.md Decisions & api-standards.md.
const LIST_ENDPOINT_NOT_AVAILABLE =
  "Daftar anggota timses belum tersedia dari server (endpoint-nya sudah tidak ada di backend). Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

export async function fetchTimsesList(): Promise<TimsesMember[]> {
  if (isMockApiEnabled()) {
    return fetchTimsesListMock();
  }
  throw new Error(LIST_ENDPOINT_NOT_AVAILABLE);
}

async function updateOwnLocationMock(id: number, coords: { lat: number; long: number }): Promise<void> {
  await mockDelay();
  mockTimsesList = mockTimsesList.map((member) =>
    member.id === id ? { ...member, lat: coords.lat, long: coords.long } : member,
  );
}

// Beacon lokasi (Feature 07 — Lacak Relawan): dipanggil berkala oleh
// useLocationBeacon selama app di foreground, untuk SEMUA role yang login (bukan
// cuma admin) — supaya map admin punya data posisi anggota lapangan. Best-effort:
// kegagalan di-log tapi tidak dilempar ke UI (bukan aksi yang diminta user secara
// eksplisit, tidak boleh mengganggu screen manapun yang sedang dibuka).
//
// 2026-08-23: model `TimsesModel` (Sequelize, backend baru) TIDAK PUNYA kolom
// lat/long sama sekali (dikonfirmasi baca `database/models/user/timses.mode.ts`)
// — bukan cuma endpoint pindah, kapabilitasnya sendiri sudah tidak ada.
// No-op langsung (BUKAN coba PATCH lalu gagal tiap 30 detik) — hindari spam
// request 404 percuma ke server. Sengaja tidak `throw` (pola sama sebelumnya,
// silent best-effort) supaya tidak butuh penanganan baru di useLocationBeacon.
export async function updateOwnLocation(id: number, coords: { lat: number; long: number }): Promise<void> {
  if (isMockApiEnabled()) {
    return updateOwnLocationMock(id, coords);
  }
  console.warn("[services/timses/updateOwnLocation] Dilewati — backend tidak punya kolom lat/long lagi.", { id });
}
