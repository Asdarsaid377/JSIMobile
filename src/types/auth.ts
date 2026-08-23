export type Role =
  | "admin"
  | "adminsekret"
  | "timses"
  | "relawankabupaten"
  | "relawankecamatan"
  | "relawandesa"
  | "relawantps";

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
