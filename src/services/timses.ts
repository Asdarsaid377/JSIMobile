import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { CreateTimsesMemberInput, TimsesMember, UpdateTimsesRoleInput } from "@/types/timses";

// 2026-08-25 — RBAC: wired penuh ke backend real (`GET/POST/PATCH /user*`,
// modul `user`, lihat api-standards.md § RBAC). Kolom `dusun`/`desa`/
// `kecamatan`/`no_telpon`/`nik` (skema lama) TIDAK kembali — diganti
// `kabId`/`kecId`/`kelId` numerik (lihat types/timses.ts).
const MOCK_TIMSES: TimsesMember[] = [
  { id: 101, namaLengkap: "Dedi Kurniawan", roles: "relawankecamatan", statusOnline: "online", lat: -6.928, long: 107.7295, kabId: 7303, kecId: 730301, kelId: null },
  { id: 102, namaLengkap: "Yayat Hidayat", roles: "relawandesa", statusOnline: "online", lat: -6.931, long: 107.725, kabId: 7303, kecId: 730301, kelId: 7303010001 },
  { id: 103, namaLengkap: "Neng Sari", roles: "timses", statusOnline: "offline", lat: -6.935, long: 107.733, kabId: 7303, kecId: 730301, kelId: 7303010002 },
  { id: 104, namaLengkap: "Asep Saepudin", roles: "timses", statusOnline: "offline", lat: null, long: null, kabId: 7303, kecId: 730301, kelId: 7303010003 },
  { id: 105, namaLengkap: "Mira Anggraini", roles: "relawandesa", statusOnline: "online", lat: null, long: null, kabId: 7303, kecId: 730302, kelId: 7303020001 },
  { id: 106, namaLengkap: "Rina Marlina", roles: "relawankecamatan", statusOnline: "online", lat: null, long: null, kabId: 7303, kecId: 730302, kelId: null },
  { id: 107, namaLengkap: "Budi Santoso", roles: "timses", statusOnline: "offline", lat: null, long: null, kabId: 7303, kecId: 730302, kelId: 7303020002 },
  { id: 108, namaLengkap: "Siti Aminah", roles: "relawankabupaten", statusOnline: "online", lat: null, long: null, kabId: 7303, kecId: null, kelId: null },
];

// Mutable copy — `updateOwnLocation` (Feature 07) menulis ke sini di mock mode
// supaya beacon lokasi device sendiri kelihatan efeknya tanpa backend asli.
let mockTimsesList: TimsesMember[] = [...MOCK_TIMSES];

async function fetchTimsesListMock(): Promise<TimsesMember[]> {
  await mockDelay();
  return mockTimsesList;
}

type UserListApiRecord = {
  id: number;
  namaLengkap: string;
  roles: TimsesMember["roles"];
  statusOnline: string | null;
  lat: number | string | null;
  long: number | string | null;
  kabId: number | null;
  kecId: number | null;
  kelId: number | null;
};

// `lat`/`long` DECIMAL di MySQL — Sequelize/driver kadang balikin sebagai
// string, bukan number (kuirk umum node-mysql2 untuk kolom DECIMAL). Parse
// eksplisit di sini supaya konsumen (TrackingMapView dst.) selalu dapat
// number|null, tidak perlu tahu soal kuirk ini.
function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapMember(record: UserListApiRecord): TimsesMember {
  return {
    id: record.id,
    namaLengkap: record.namaLengkap,
    roles: record.roles,
    statusOnline: record.statusOnline === "online" ? "online" : "offline",
    lat: toNumberOrNull(record.lat),
    long: toNumberOrNull(record.long),
    kabId: record.kabId,
    kecId: record.kecId,
    kelId: record.kelId,
  };
}

export async function fetchTimsesList(): Promise<TimsesMember[]> {
  if (isMockApiEnabled()) {
    return fetchTimsesListMock();
  }
  try {
    // Dibungkus {message,data} oleh TransformInterceptor global (pola sama
    // /user/profile). Backend SUDAH menerapkan scoping wilayah server-side
    // (lihat commons/helpers/scope.helper.ts) — response ini otomatis
    // terbatas sesuai role+wilayah requester, tidak perlu filter ulang di sini.
    const { data } = await apiClient.get<{ message: string; data: UserListApiRecord[] }>("/user/list");
    return data.data.map(mapMember);
  } catch (error) {
    console.error("[services/timses/fetchTimsesList]", error);
    throw new Error("Gagal memuat daftar anggota timses.");
  }
}

async function updateOwnLocationMock(id: number, coords: { lat: number; long: number }): Promise<void> {
  await mockDelay();
  mockTimsesList = mockTimsesList.map((member) =>
    member.id === id ? { ...member, lat: coords.lat, long: coords.long } : member,
  );
}

// Beacon lokasi (Feature 07 — Lacak Relawan): dipanggil berkala oleh
// useLocationBeacon selama app di foreground, untuk SEMUA role yang login.
// Best-effort: kegagalan di-log tapi tidak dilempar ke UI.
export async function updateOwnLocation(id: number, coords: { lat: number; long: number }): Promise<void> {
  if (isMockApiEnabled()) {
    return updateOwnLocationMock(id, coords);
  }
  try {
    await apiClient.post("/user/location", coords);
  } catch (error) {
    console.error("[services/timses/updateOwnLocation]", error, { id });
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    const message = error.response.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

// Admin-only — POST /user (@Roles admin/adminsekret di backend). Belum
// dipakai UI manapun (form "Tambah Anggota" menunggu referensi desain, lihat
// progress-tracker.md), disiapkan lebih dulu supaya screen-nya tinggal
// panggil begitu dibangun.
export async function createTimsesMember(input: CreateTimsesMemberInput): Promise<TimsesMember> {
  try {
    const { data } = await apiClient.post<{ message: string; data: UserListApiRecord }>("/user", input);
    return mapMember(data.data);
  } catch (error) {
    console.error("[services/timses/createTimsesMember]", error);
    throw new Error(extractErrorMessage(error, "Gagal membuat akun relawan."));
  }
}

// Admin-only — PATCH /user/:id (@Roles admin/adminsekret di backend).
export async function updateTimsesRole(id: number, input: UpdateTimsesRoleInput): Promise<TimsesMember> {
  try {
    const { data } = await apiClient.patch<{ message: string; data: UserListApiRecord }>(`/user/${id}`, input);
    return mapMember(data.data);
  } catch (error) {
    console.error("[services/timses/updateTimsesRole]", error);
    throw new Error(extractErrorMessage(error, "Gagal memperbarui role/wilayah akun."));
  }
}

// Admin-only — DELETE /user/:id (@Roles admin/adminsekret di backend,
// 2026-08-26, spesifikasi diajukan mobile → dibuat user di repo backend).
// Hard delete (tabel `timses` tidak punya kolom soft-delete) — backend juga
// menolak (422) kalau admin coba hapus akun sendiri, pesan errornya
// diteruskan apa adanya lewat extractErrorMessage.
export async function deleteTimsesMember(id: number): Promise<void> {
  try {
    await apiClient.delete(`/user/${id}`);
  } catch (error) {
    console.error("[services/timses/deleteTimsesMember]", error);
    throw new Error(extractErrorMessage(error, "Gagal menghapus akun."));
  }
}
