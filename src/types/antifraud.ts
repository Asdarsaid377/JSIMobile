// Referensi: artboard "14 · VERIFIKASI KUNJUNGAN / ANTI-FRAUD" di project
// Claude Design user ("Desain Mobile JSI Dashboard",
// 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via DesignSync 2026-08-22.
// Permintaan eksplisit user: "generate UI-nya saja dulu, nanti saya buatkan
// API-nya" — screen ini SENGAJA read-only (cuma 1 fungsi fetch, tidak ada
// mutation approve/reject sungguhan, lihat services/antifraud.ts &
// AntiFraudEvidenceSheet.tsx). Fitur baru murni mobile — TIDAK ADA modul ini
// di backend manapun (CLAUDE.md Aturan #6).

export type FraudLevel = "Tinggi" | "Sedang" | "Rendah";

export type FraudGpsStatus = "ada" | "menyimpang" | "manual";
export type FraudFotoStatus = "ada" | "duplikat" | "galeri";

export type FraudCaseCheck = {
  label: string;
  value: string;
  // true = merah (bermasalah), false = hijau (aman) — persis `k.bad` di mockup.
  bermasalah: boolean;
};

export type FraudCase = {
  id: number;
  relawan: string;
  target: string;
  waktu: string;
  level: FraudLevel;
  alasan: string;
  gpsStatus: FraudGpsStatus;
  fotoStatus: FraudFotoStatus;
  checks: FraudCaseCheck[];
};

export type FraudJenisAnomali = {
  nama: string;
  jumlahKasus: number;
  // Dipakai untuk warna bar saja (bukan urutan) — 2 tingkat cukup, persis
  // mockup (2 jenis merah/"tinggi", 2 jenis oranye/"sedang").
  severity: "tinggi" | "sedang";
};

export type FraudRelawanSkor = {
  id: number;
  nama: string;
  skor: number; // 0-100
  jumlahKunjungan: number;
  jumlahDitandai: number;
};

export type AntiFraudSnapshot = {
  kunjunganTervalidasi: number;
  totalKunjungan: number;
  jenisAnomali: FraudJenisAnomali[];
  cases: FraudCase[];
  relawanSkor: FraudRelawanSkor[];
};
