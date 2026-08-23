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
