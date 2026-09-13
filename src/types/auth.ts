// 6 role — persis "Posisi Relawan" di client/src/data/dataArea.js (dikonfirmasi
// 2026-08-25 saat menyusun RBAC). `relawantps` yang sebelumnya ada di sini
// DIHAPUS — tidak pernah jadi posisi assignable di web manapun.
export type Role =
  | "admin"
  | "adminsekret"
  | "timses"
  | "relawankabupaten"
  | "relawankecamatan"
  | "relawandesa";

export type AuthUser = {
  id: number;
  nik: string;
  namaLengkap: string;
  roles: Role;
};

export type Session = {
  token: string;
  user: AuthUser;
};
