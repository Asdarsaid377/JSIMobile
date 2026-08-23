export type DptProvinsi = {
  wilId: number;
  nama: string;
  totalDpt: number;
  totalKab: number;
};

export type DptKabupaten = {
  wilId: number;
  nama: string;
  totalDpt: number;
  proNama: string;
  totalKec: number;
  totalKel: number;
};

export type DptKecamatan = {
  wilId: number;
  nama: string;
  totalDpt: number;
  kabKode: number;
  totalKel: number;
};

export type DptKelurahan = {
  wilId: number;
  nama: string;
  totalDpt: number;
  kecKode: number;
  kabKode: number;
};

export type DptRecord = {
  id: number;
  // Field terpisah dari `id` — di response asli (contohdpt.ts) `idDpt` adalah
  // sequence kecil (1, 2, 3…) yang dipakai web sebagai KUNCI LINKAGE ke Dtdoor
  // (`dtdoor-modal.jsx`/`FormDataKunjungan.jsx` kirim `idDpt: dpt.idDpt`, BUKAN
  // `dpt.id`), beda dari `id` yang jadi primary key besar (191483 dst.) dan
  // dipakai murni untuk CRUD record DPT itu sendiri. Lihat progress-tracker.md
  // Decisions untuk fitur "Form Door To Door terintegrasi DPT".
  // ⚠️ 2026-08-23 — nullable sekarang: kolom `idDpt` di backend TIDAK diisi
  // sama sekali oleh POST /dpt/2024-created (dikonfirmasi baca dpt.service.ts)
  // — record yang dibuat lewat app ini SELALU punya idDpt `null`, cuma data
  // impor asli (contohdpt.ts) yang punya nilai. Konsekuensi: record baru TIDAK
  // BISA di-link ke Dtdoor/Gotv asli, dan tidak bisa di-detail/di-delete lewat
  // endpoint yang match by idDpt (lihat api-standards.md § DPT).
  idDpt: number | null;
  nik: string | null;
  nama: string;
  jenisKelamin: "L" | "P";
  // Nullable — backend TIDAK menerima input usia sama sekali (selalu null untuk
  // record baru, lihat api-standards.md § DPT), cuma data impor asli yang punya
  // nilai nyata.
  usia: number | null;
  alamat: string | null;
  rt: string;
  rw: string;
  namaKec: string;
  namaKel: string;
  namaTps: string;
  idKec: number;
  idKel: number;
  noTps: number;
  // `dtdoor`/`gotv` di response asli — object kalau ADA linkage nyata (idDpt+kabId
  // match record Dtdoor/Gotv), `null` kalau belum. Diperlakukan sebagai flag
  // boolean (ada/tidak), BUKAN dipetakan sebagai object (belum ada UI yang baca
  // isinya).
  sudahDtdoor: boolean;
  sudahGotv: boolean;
  // Fitur "Identifikasi Tokoh Baru dari DPT" (2026-08-22, icon bintang di
  // DptCard) — field BARU, TIDAK ada padanannya di response contoh manapun
  // (beda dari sudahDtdoor/sudahGotv yang memang field asli, cuma perilakunya
  // yang di-derive). Murni flag client-side, di-flip via markDptTokoh() —
  // lihat services/dpt.ts & progress-tracker.md Decisions. ⚠️ Tidak persist di
  // backend real (tidak ada kolom untuk ini) — reset ke false tiap list
  // di-refetch dari server, beda dari mock yang persist in-memory.
  sudahTokoh: boolean;
};

export type DptKabScope = {
  wilId: number;
  nama: string;
  totalDpt: number;
  proNama: string;
  proKode: number;
  totalKec: number;
};

export type DptListParams = {
  page: number;
  limit: number;
  nama?: string;
  kecId?: number;
  kelId?: number;
  tps?: number;
};

// ⚠️ 2026-08-23 — backend `GET /dpt/2024/:wilId` cuma balas `meta:{page}` (BUKAN
// {page,limit,offset,totalPages,total} seperti dtdoor — dikonfirmasi baca
// dpt.service.ts::getDpt() langsung setelah crash live "toLocaleString of
// undefined" di device). Tidak ada total count dari endpoint list — `hasMore`
// di-infer dari jumlah record yang balik (== limit yang diminta berarti
// kemungkinan masih ada halaman berikutnya). Total count akurat untuk summary
// card pakai endpoint terpisah GET /dpt/2024/total/:wilId (lihat fetchDptTotal).
export type DptListResult = {
  records: DptRecord[];
  kab: DptKabScope;
  page: number;
  hasMore: boolean;
};

export type DptTpsOption = {
  noTps: number;
  namaTps: string;
};

// CRUD dasar (2026-08-22, mock; WIRED ke backend real 2026-08-23 — lihat
// api-standards.md § DPT). `namaKec`/`namaKel` TIDAK jadi field form —
// diturunkan dari pilihan `idKec`/`idKel` (lookup ke hasil
// `useDptKecamatanList`/`useDptKelurahanList`) di DptRecordFormScreen, bukan
// diketik manual, supaya tetap konsisten dengan hierarki wilayah yang dipakai
// filter DptListScreen. `namaTps` juga diturunkan (`String(noTps)`).
// ⚠️ `usia` DIHAPUS dari sini (2026-08-23) — backend TIDAK punya field ini di
// DTO create/edit sama sekali, kirim apapun tidak akan tersimpan (selalu null
// untuk record baru). `alamat` tetap ada di form tapi dikirim ke backend
// lewat key `tempatLahir` (penamaan asli backend, bukan alamat — lihat
// services/dpt.ts).
export type CreateDptRecordInput = {
  nama: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  rt: string;
  rw: string;
  idKec: number;
  namaKec: string;
  idKel: number;
  namaKel: string;
  noTps: number;
  namaTps: string;
};

// `idDpt` dibawa serta (bukan cuma `id`) — dipakai updateDptRecord() untuk
// fetch ulang record akurat lewat GET detail setelah PUT (lihat services/dpt.ts).
export type UpdateDptRecordInput = CreateDptRecordInput & { id: number; idDpt: number | null };
