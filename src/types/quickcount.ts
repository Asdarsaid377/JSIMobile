// Referensi: artboard "12 · SAKSI & QUICK COUNT" di project Claude Design user
// ("Desain Mobile JSI Dashboard", project 160ea937-2f8a-4ff4-9977-f8bc398c90a0),
// dibaca via DesignSync 2026-08-22. Permintaan eksplisit user: "tiru khusus
// quick count saja" — bagian manajemen Saksi (assign saksi ke TPS) di artboard
// yang sama TIDAK ikut dibangun, sudah ada fiturnya sendiri di SaksiTpsScreen.
// Fitur baru murni mobile — TIDAK ADA modul ini di backend manapun (bukan cuma
// belum dikonfirmasi seperti DPT/Hasil Rekap — memang tidak ada sama sekali,
// mock service standar pola sama tokoh.ts/rivalcaleg.ts, CLAUDE.md Aturan #6).

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
