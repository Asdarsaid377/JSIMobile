import type { Role } from "@/types/auth";

// 2026-08-23: backend `timses` (TypeORM, entity lama) DIGANTI modul `user`
// (Sequelize `TimsesModel`, `src/user/user.controller.ts`) — kolom
// `dusun`/`desa`/`kecamatan`/`no_telpon` yang dulu ada di sini **sudah tidak
// ada sama sekali** di model baru, DIHAPUS dari sini (bukan dibuat opsional)
// supaya setiap pemakaian lama ketahuan via error TypeScript.
// 2026-08-25 — RBAC: `kabId`/`kecId`/`kelId` DITAMBAH (kolom baru di
// TimsesModel, wilId numerik sama skema modul DPT, bukan lagi string bebas
// seperti kecamatan/desa lama) — dipakai AccessScopeNotice untuk tahu apakah
// akun ini sudah di-scope admin atau belum, lihat api-standards.md § RBAC.
export type TimsesProfile = {
  id: number;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  statusOnline: string | null;
  roles: Role;
  kabId: number | null;
  kecId: number | null;
  kelId: number | null;
};

export type UpdateProfileInput = {
  namaLengkap: string;
};
