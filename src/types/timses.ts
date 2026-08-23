import type { Role } from "@/types/auth";

export type TimsesStatusOnline = "online" | "offline";

export type TimsesMember = {
  id: number;
  nik: string;
  namaLengkap: string;
  dusun: string | null;
  desa: string;
  kecamatan: string;
  jenisKelamin: string;
  noTelpon: string | null;
  roles: Role;
  statusOnline: TimsesStatusOnline;
  lat: number | null;
  long: number | null;
};
