// Referensi: artboard "12 · SAKSI & QUICK COUNT" di project Claude Design user
// ("Desain Mobile JSI Dashboard", project 160ea937-2f8a-4ff4-9977-f8bc398c90a0),
// dibaca via DesignSync 2026-08-22. Permintaan eksplisit user: "tiru khusus
// quick count saja" — bagian manajemen Saksi (assign saksi ke TPS) di artboard
// yang sama TIDAK ikut dibangun, sudah ada fiturnya sendiri di SaksiTpsScreen.
// Awalnya fitur murni mobile tanpa backend. 2026-08-24 — "Kelola Kandidat &
// Partai" (CRUD) ditambah atas permintaan eksplisit user, hasil wawancara
// `AskUserQuestion`: struktur data SENGAJA TETAP SEDERHANA (`{nama, partai}`
// flat, 1 kandidat = 1 partai, TIDAK ADA pasangan calon/koalisi banyak
// partai/caleg-per-partai ala Pileg) — user pilih "tetap sederhana seperti
// sekarang" dari 4 opsi jenis pemilu (lihat progress-tracker.md Decisions).
// `partai` boleh string kosong (kandidat independen/tanpa partai, pola sama
// entry "Lainnya"). CRUD **admin-only**.
//
// 2026-08-24 (lanjutan) — modul backend `quickcount` dibuat user & WIRED
// PENUH (lihat api-standards.md § Quick Count). TPS JUGA CRUD admin-only
// sekarang (`QuickCountTps` dulu 5 entri hardcoded) — SENGAJA berdiri
// sendiri, TIDAK terhubung ke data wilayah/DPT/TPS resmi manapun (keputusan
// eksplisit user, "tidak butuh integrasi ke tps di data dpt"). Backend pecah
// 3 resource independen (kandidat/tps/hasil) — mobile gabung TPS+hasil jadi
// 1 shape `QuickCountTps` seperti sebelumnya (status/meta di-derive
// client-side dari ada/tidaknya `namaSaksi` & row hasil, lihat
// services/quickcount.ts).

export type QuickCountStatus = "Terverifikasi" | "Selisih" | "Belum masuk" | "Menunggu" | "Tanpa saksi";

// Warna badge per status persis pixel-match hex di mockup (Terverifikasi
// #DCFCE7/#166534, Selisih & Tanpa saksi #FEE2E2/#991B1B, Belum masuk
// #F1F5F9/#64748B, Menunggu #FEF3C7/#92400E) — semuanya cocok EXACT dengan
// varian Badge yang sudah ada (success/danger/muted/warning), tidak perlu
// token baru.
export const QUICK_COUNT_STATUS_VARIANT: Record<QuickCountStatus, "success" | "danger" | "muted" | "warning"> = {
  Terverifikasi: "success",
  Selisih: "danger",
  "Belum masuk": "muted",
  Menunggu: "warning",
  "Tanpa saksi": "danger",
};

export type QuickCountKandidat = {
  id: number;
  nama: string;
  // "Lainnya" (catch-all suara di luar 4 kandidat utama) sengaja partai="".
  partai: string;
};

export type QuickCountHasilC1 = {
  // kandidatId (number, di-JSON-kan jadi string key) → jumlah suara.
  suaraPerKandidat: Record<number, number>;
  totalSuaraSah: number;
  submittedAt: string;
};

export type QuickCountTps = {
  id: number;
  noTps: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaSaksi: string | null;
  totalDpt: number;
  status: QuickCountStatus;
  meta: string;
  hasilC1: QuickCountHasilC1 | null;
};

export type SubmitQuickCountHasilInput = {
  tpsId: number;
  suaraPerKandidat: { kandidatId: number; jumlah: number }[];
};

// Backing QuickCountKandidatFormScreen (create/edit/hapus, admin-only).
export type CreateQuickCountKandidatInput = {
  nama: string;
  partai: string;
};

export type UpdateQuickCountKandidatInput = Partial<CreateQuickCountKandidatInput> & { id: number };

// Backing QuickCountTpsFormScreen (create/edit/hapus, admin-only). `kabupaten`
// ditambah 2026-08-24 (permintaan eksplisit user) — target kampanye bisa
// menaungi banyak kabupaten (mis. 1 dapil DPR RI = 4 kabupaten), sebelumnya
// TPS cuma punya kecamatan/kelurahan.
export type CreateQuickCountTpsInput = {
  noTps: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaSaksi: string;
  totalDpt: number;
};

export type UpdateQuickCountTpsInput = Partial<CreateQuickCountTpsInput> & { id: number };

// 2026-08-24 (lanjutan lagi) — filtering wilayah + endpoint summary/rekap
// ditambah user ke backend ("saya ingin implementasi fitur filtering dan
// summary... agar lebih mudah digunakan", lihat progress-tracker.md
// Decisions). Filter exact-match per level (BUKAN pencarian teks bebas,
// konsisten dengan `QuickCountTps` yang berdiri sendiri/free text — tidak
// ada hierarki wilayah resmi untuk validasi cascading-nya).
export type QuickCountWilayahFilter = {
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
};

export type QuickCountKandidatSummary = {
  kandidatId: number;
  nama: string;
  partai: string;
  totalSuara: number;
  persentase: number;
};

// Backing GET /quickcount/summary — dihitung server-side, mengganti
// perhitungan client-side lama di QuickCountScreen (yang cuma bisa hitung
// dari data yang sudah di-fetch, tidak pernah tahu totalDpt/persentasePartisipasi
// scoped ke filter tertentu).
export type QuickCountSummary = {
  totalTps: number;
  tpsMasuk: number;
  tpsBelumMasuk: number;
  persentaseTpsMasuk: number;
  totalDpt: number;
  totalSuaraSah: number;
  persentasePartisipasi: number;
  kandidat: QuickCountKandidatSummary[];
};

export type QuickCountRekapLevel = "kabupaten" | "kecamatan" | "kelurahan";

export const QUICK_COUNT_REKAP_LEVEL_OPTIONS: readonly { value: QuickCountRekapLevel; label: string }[] = [
  { value: "kabupaten", label: "Per Kabupaten" },
  { value: "kecamatan", label: "Per Kecamatan" },
  { value: "kelurahan", label: "Per Kelurahan" },
];

// Backing GET /quickcount/rekap?level=X — breakdown per wilayah pada level
// tertentu, dipakai tab baru "Rekap Wilayah" untuk bandingkan progres antar
// kabupaten/kecamatan/kelurahan (kebutuhan aslinya: target kampanye bisa
// menaungi banyak kabupaten sekaligus).
export type QuickCountRekapGroup = {
  wilayah: string;
  totalTps: number;
  tpsMasuk: number;
  tpsBelumMasuk: number;
  persentaseTpsMasuk: number;
  totalDpt: number;
  totalSuaraSah: number;
  suaraPerKandidat: { kandidatId: number; nama: string; partai: string; totalSuara: number }[];
};
