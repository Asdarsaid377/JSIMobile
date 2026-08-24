export type Gotv = {
  id: number;
  nik: string | null;
  namaLengkap: string;
  namaKegiatan: string;
  tps: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  noTelpon: string | null;
  jumlahWajibPilih: number;
  createdAt: string;
};

export type GotvListResponse = {
  data: Gotv[];
  total: number;
  page: number;
  totalPage: number;
  limit: number;
};

export type CreateGotvInput = {
  namaLengkap: string;
  namaKegiatan: string;
  tps: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  jumlahWajibPilih: number;
  // Wajib diisi — kolom `nik` di database NOT NULL tanpa default (dikonfirmasi
  // live 2026-08-23, lihat api-standards.md § gotv), meski DTO backend
  // menandainya optional. Insert tanpa nik gagal di level SQL, bukan 422.
  nik: string;
  // Wajib juga — DTO backend `@IsNumberString()` TANPA `@IsOptional()` (beda
  // dari dokumentasi lama yang mengira ini opsional, dikonfirmasi live curl
  // 2026-08-24: body tanpa `no_telpon` balas "no_telpon must be a number
  // string" — bukan bug baru dari fitur linkage DPT, field ini SELALU wajib
  // sejak awal, cuma baru ketahuan sekarang). Lihat api-standards.md § gotv.
  noTelpon: string;
  // Terisi cuma kalau form ini dibuka dari "Tandai ikut Social Event"
  // (DptVoterActionSheet, 2026-08-24) — nilai asli dari DptRecord terpilih
  // (idDpt/kabWilId), dipakai backend untuk join balik dpt.gotv (lihat
  // services/gotv.ts). Kosong = entri standalone, idDpt sintetis di-generate.
  idDpt?: number;
  kabId?: number;
};
