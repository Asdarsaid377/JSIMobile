// Modul backend `pengumuman` (src/pengumuman/) dibuat user 2026-08-26 dari
// spec yang diajukan (prompt disiapkan, lihat api-standards.md § Pengumuman) —
// dikonfirmasi baca kode server 1:1 cocok dengan spec ini, belum dites live
// (server lokal tidak reachable saat verifikasi, lihat catatan di dokumen).
// Fitur baru: pengumuman satu-arah dari HQ (admin/adminsekret) ke seluruh
// jajaran timses (kabupaten → kecamatan → desa) — MENGGANTIKAN shortcut
// "Broadcast" lama di Home (yang sebelumnya cuma Alert "Segera hadir").

export type PengumumanPrioritas = "Normal" | "Penting" | "Mendesak";

export const PENGUMUMAN_PRIORITAS_OPTIONS: readonly PengumumanPrioritas[] = [
  "Normal",
  "Penting",
  "Mendesak",
];

// Level paling bawah SENGAJA "desa", bukan "tps" — tidak ada kolom/role TPS
// di RBAC wilayah (kabId/kecId/kelId di TimsesModel, lihat api-standards.md
// § RBAC), relawantps juga sudah dihapus dari Role. "Sampai TPS" di permintaan
// user diartikan sebagai level individual timses/relawan desa (paling granular
// yang ada), bukan literal TPS.
export type PengumumanTargetLevel = "semua" | "kabupaten" | "kecamatan" | "desa";

export const PENGUMUMAN_TARGET_LEVEL_OPTIONS: readonly { value: PengumumanTargetLevel; label: string }[] = [
  { value: "semua", label: "Semua Wilayah" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "kecamatan", label: "Kecamatan" },
  { value: "desa", label: "Desa" },
];

export type Pengumuman = {
  id: number;
  judul: string;
  isi: string;
  prioritas: PengumumanPrioritas;
  targetLevel: PengumumanTargetLevel;
  targetKabId: number | null;
  targetKecId: number | null;
  targetKelId: number | null;
  // Nama pembuat (namaLengkap) — "-" kalau relasi null (tidak seharusnya
  // terjadi, backend selalu isi userId dari JWT saat create).
  pembuat: string;
  createdAt: string;
};

// Backing form admin "+ Buat Pengumuman" (belum dibangun — lihat
// PengumumanScreen.tsx). userId (pembuat) TIDAK di sini, backend ambil dari
// JWT via @User(), pola sama CreateTokohInput/CreateIsuAspirasiInput.
export type CreatePengumumanInput = {
  judul: string;
  isi: string;
  prioritas?: PengumumanPrioritas;
  targetLevel: PengumumanTargetLevel;
  targetKabId?: number;
  targetKecId?: number;
  targetKelId?: number;
};
