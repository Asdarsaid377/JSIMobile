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
  noTelpon?: string;
};
