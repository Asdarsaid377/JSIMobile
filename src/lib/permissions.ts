import type { Role } from "@/types/auth";

// Util bersama — sebelumnya `ADMIN_ROLES` di-duplikasi lokal di 5 file berbeda
// (RootNavigator, HomeScreen, BudgetingKampanyeScreen, QuickCountScreen,
// DtdoorAnalyticsScreen). Disatukan di sini saat menyusun RBAC (2026-08-25)
// supaya cuma ada 1 sumber kebenaran untuk "siapa admin".
export const ADMIN_ROLES: readonly Role[] = ["admin", "adminsekret"];

export function isAdmin(role: Role | undefined): boolean {
  return role !== undefined && ADMIN_ROLES.includes(role);
}

// Label role — sebelumnya ada 3 versi berbeda copy-nya (ProfileScreen.tsx,
// HomeScreen.tsx, TimsesMemberCard.tsx). Disatukan jadi 1 (copy TimsesMemberCard
// dipakai sebagai basis, paling deskriptif) — kalau ada konteks yang butuh copy
// beda, override lokal masih boleh, tapi default-nya dari sini.
export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  adminsekret: "Admin Sekretariat",
  relawankabupaten: "Korwil Kabupaten",
  relawankecamatan: "Korwil Kecamatan",
  relawandesa: "Koordinator Desa",
  timses: "Relawan",
};

// Role yang bisa ditugaskan admin ke akun baru lewat POST /user — urutan
// paling luas ke paling sempit, dipakai Select di form "Tambah Anggota"
// (belum dibangun, lihat progress-tracker.md — menunggu referensi desain).
export const ASSIGNABLE_ROLES: readonly Role[] = [
  "admin",
  "adminsekret",
  "relawankabupaten",
  "relawankecamatan",
  "relawandesa",
  "timses",
];

// Granularitas wilayah yang WAJIB diisi admin per role (dari
// commons/helpers/scope.helper.ts backend) — dipakai form Tambah/Edit
// Anggota untuk validasi field mana yang wajib sebelum submit.
export function requiredWilayahLevel(role: Role): "kabupaten" | "kecamatan" | "desa" | null {
  switch (role) {
    case "relawankabupaten":
      return "kabupaten";
    case "relawankecamatan":
      return "kecamatan";
    case "relawandesa":
    case "timses":
      return "desa";
    default:
      return null;
  }
}
