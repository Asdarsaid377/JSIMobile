import type { Role } from "@/types/auth";

export type TimsesStatusOnline = "online" | "offline";

// 2026-08-25 — RBAC: shape ini SEKARANG cocok persis `GET /user/list`
// (`UserService.listAnggota`, attributes: id/namaLengkap/roles/statusOnline/
// lat/long/kabId/kecId/kelId). `nik`/`dusun`/`desa`/`kecamatan`/`noTelpon`
// (versi lama, string bebas) DIHAPUS — kolom itu tidak pernah kembali ke
// TimsesModel, diganti wilId numerik (kabId/kecId/kelId, sama skema dengan
// modul DPT) yang BUKAN human-readable tanpa lookup tambahan (belum dibangun,
// lihat progress-tracker.md Decisions — komponen yang menampilkan member
// SEKARANG cuma tampilkan role, bukan lagi "Kec. X"/"Ds. Y").
export type TimsesMember = {
  id: number;
  namaLengkap: string;
  roles: Role;
  statusOnline: TimsesStatusOnline;
  lat: number | null;
  long: number | null;
  kabId: number | null;
  kecId: number | null;
  kelId: number | null;
};

// Payload admin bikin akun relawan baru — POST /user (@Roles admin/adminsekret).
export type CreateTimsesMemberInput = {
  nik: string;
  password: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P";
  roles: Role;
  kabId?: number;
  kecId?: number;
  kelId?: number;
};

// Payload admin ubah role/wilayah akun existing — PATCH /user/:id.
export type UpdateTimsesRoleInput = {
  roles?: Role;
  kabId?: number;
  kecId?: number;
  kelId?: number;
};
