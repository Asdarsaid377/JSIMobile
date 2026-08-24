export type BudgetScope = "bulan" | "total";

export const BUDGET_SCOPE_OPTIONS: readonly { value: BudgetScope; label: string }[] = [
  { value: "bulan", label: "Bulan Ini" },
  { value: "total", label: "Total Kampanye" },
];

// 5 pos anggaran OPERASIONAL — ikut context/designs/budgeting-kampanye.dc.html
// (canvas asli) apa adanya. BUKAN kategori resmi LPSDK/LPPDK (KPU/PKPU) yang
// sempat dikonfirmasi user di sesi sebelumnya sebagai rencana skema data —
// keputusan itu SUPERSEDED begitu contoh UI nyata ditemukan (lihat
// progress-tracker.md Decisions, 2026-08-22).
export const BUDGET_POS_VALUES = [
  "Atribut & Alat Peraga",
  "Operasional Timses",
  "Door To Door",
  "Social Event",
  "Digital & Broadcast",
] as const;

export type BudgetPosName = (typeof BUDGET_POS_VALUES)[number];

export const BUDGET_POS_OPTIONS: readonly { value: BudgetPosName; label: string }[] = BUDGET_POS_VALUES.map(
  (value) => ({ value, label: value }),
);

export type BudgetTransactionStatus = "Disetujui" | "Menunggu" | "Ditolak";

export type BudgetSummary = {
  scope: BudgetScope;
  scopeLabel: string;
  total: number;
  used: number;
  left: number;
  usedPct: number;
  txCount: number;
  overCount: number;
};

export type BudgetPosRealisasi = {
  name: BudgetPosName;
  pct: number;
  used: number;
  plafon: number;
};

export type BudgetTrendPoint = {
  label: string;
  amount: number;
  heightPct: number;
};

export type BudgetTransaction = {
  id: number;
  title: string;
  pos: BudgetPosName;
  nominal: number;
  oleh: string;
  status: BudgetTransactionStatus;
  createdAt: string;
};

// "keterangan" (bukan "title") — mengikuti label field di form "Catat
// Pengeluaran" pada canvas asli; service memetakannya jadi BudgetTransaction.title.
export type CreateBudgetTransactionInput = {
  pos: BudgetPosName;
  nominal: number;
  keterangan: string;
};

// Set Plafon Anggaran (admin-only) — TIDAK ada di canvas asli, dibangun tanpa
// referensi visual atas izin eksplisit user (2026-08-24, lihat
// progress-tracker.md Decisions). `periode` backend ("YYYY-MM" atau literal
// "TOTAL") diturunkan dari `scope` di service, bukan dikirim dari screen.
export type UpsertBudgetPlafonInput = {
  scope: BudgetScope;
  pos: BudgetPosName;
  nominal: number;
};

// Approval transaksi (admin-only) — juga TIDAK ada di canvas asli (pill
// status di sana read-only), izin eksplisit user (2026-08-24). Backend
// (`UpdateBudgetTransactionStatusDto`) sengaja tidak menerima "Menunggu" —
// itu cuma default saat transaksi dibuat, bukan status yang bisa di-set balik.
export type UpdateBudgetTransactionStatusInput = {
  id: number;
  status: Extract<BudgetTransactionStatus, "Disetujui" | "Ditolak">;
};
