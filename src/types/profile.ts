import type { Role } from "@/types/auth";

// 2026-08-23: backend `timses` (TypeORM, entity lama) DIGANTI modul `user`
// (Sequelize `TimsesModel`, `src/user/user.controller.ts`) — kolom
// `dusun`/`desa`/`kecamatan`/`no_telpon` yang dulu ada di sini **sudah tidak
// ada sama sekali** di model baru (dikonfirmasi baca langsung
// `database/models/user/timses.mode.ts`), bukan cuma belum di-map. Field-field
// itu DIHAPUS dari sini (bukan dibuat opsional) supaya setiap pemakaian lama
// (scoping wilayah di 9+ screen — TimsesScreen/KekuatanWilayah/dst.) ketahuan
// via error TypeScript, bukan diam-diam jadi `undefined` di runtime. Scoping
// wilayah SEMENTARA dimatikan di semua pemakai (permintaan eksplisit user)
// sampai ada sumber data pengganti — lihat progress-tracker.md Decisions.
export type TimsesProfile = {
  id: number;
  nik: string;
  namaLengkap: string;
  jenisKelamin: string;
  statusOnline: string | null;
  roles: Role;
};

export type UpdateProfileInput = {
  namaLengkap: string;
};
