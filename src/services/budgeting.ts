import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  BudgetPosRealisasi,
  BudgetScope,
  BudgetSummary,
  BudgetTransaction,
  BudgetTrendPoint,
  CreateBudgetTransactionInput,
} from "@/types/budgeting";

// Belum ada endpoint/schema apapun untuk Budgeting Kampanye (fitur baru, di luar
// build-plan awal, item #3 "saran konsultan politik"). Pola mock service
// STANDAR (array in-memory), cabang non-mock sengaja throw, bukan menebak
// kontrak (CLAUDE.md Aturan #6) — sama pola dengan services/rivalcaleg.ts,
// services/saksi.ts, services/realcount.ts.
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Budgeting Kampanye belum ada — fitur ini masih UI + mock. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

// Ringkasan/realisasi-pos/tren adalah angka demo STATIS per scope — persis
// seperti di context/designs/budgeting-kampanye.dc.html. SENGAJA tidak
// diturunkan dari mockBudgetTransactions di bawah: canvas sumbernya sendiri
// juga tidak menghubungkan keduanya (txCount 84 tidak match 4 transaksi contoh,
// overCount 2 tidak sama dengan jumlah pos pct>100 di array budgetPos "bulan"
// yang cuma 1) — bukan bug, mengikuti data demo asli apa adanya.
const SUMMARY_BY_SCOPE: Record<BudgetScope, BudgetSummary> = {
  bulan: {
    scope: "bulan",
    scopeLabel: "Agustus 2026",
    total: 450_000_000,
    used: 318_500_000,
    left: 131_500_000,
    usedPct: 71,
    txCount: 84,
    overCount: 2,
  },
  total: {
    scope: "total",
    scopeLabel: "Kampanye 2026",
    total: 2_750_000_000,
    used: 1_842_000_000,
    left: 908_000_000,
    usedPct: 67,
    txCount: 512,
    overCount: 3,
  },
};

const POS_BY_SCOPE: Record<BudgetScope, BudgetPosRealisasi[]> = {
  bulan: [
    { name: "Atribut & Alat Peraga", pct: 92, used: 138_000_000, plafon: 150_000_000 },
    { name: "Operasional Timses", pct: 74, used: 74_000_000, plafon: 100_000_000 },
    { name: "Door To Door", pct: 108, used: 54_000_000, plafon: 50_000_000 },
    { name: "Social Event", pct: 61, used: 36_600_000, plafon: 60_000_000 },
    { name: "Digital & Broadcast", pct: 43, used: 15_900_000, plafon: 37_000_000 },
  ],
  total: [
    { name: "Atribut & Alat Peraga", pct: 81, used: 729_000_000, plafon: 900_000_000 },
    { name: "Operasional Timses", pct: 66, used: 429_000_000, plafon: 650_000_000 },
    { name: "Door To Door", pct: 104, used: 416_000_000, plafon: 400_000_000 },
    { name: "Social Event", pct: 52, used: 182_000_000, plafon: 350_000_000 },
    { name: "Digital & Broadcast", pct: 17, used: 86_000_000, plafon: 450_000_000 },
  ],
};

const TREND_BY_SCOPE: Record<BudgetScope, BudgetTrendPoint[]> = {
  bulan: [
    { label: "W1", amount: 52_000_000, heightPct: 58 },
    { label: "W2", amount: 78_000_000, heightPct: 86 },
    { label: "W3", amount: 64_000_000, heightPct: 71 },
    { label: "W4", amount: 91_000_000, heightPct: 100 },
    { label: "W5", amount: 33_000_000, heightPct: 37 },
  ],
  total: [
    { label: "Apr", amount: 286_000_000, heightPct: 47 },
    { label: "Mei", amount: 342_000_000, heightPct: 56 },
    { label: "Jun", amount: 408_000_000, heightPct: 67 },
    { label: "Jul", amount: 506_000_000, heightPct: 83 },
    { label: "Agu", amount: 612_000_000, heightPct: 100 },
  ],
};

let mockBudgetTransactions: BudgetTransaction[] = [
  {
    id: 1,
    title: "Cetak baliho 40 titik",
    pos: "Atribut & Alat Peraga",
    nominal: 28_400_000,
    oleh: "Dedi K.",
    status: "Disetujui",
    createdAt: "2026-08-20T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Konsumsi kunjungan D2D",
    pos: "Door To Door",
    nominal: 4_150_000,
    oleh: "Neng Sari",
    status: "Disetujui",
    createdAt: "2026-08-19T09:00:00.000Z",
  },
  {
    id: 3,
    title: "Sewa panggung Cimekar",
    pos: "Social Event",
    nominal: 12_800_000,
    oleh: "Mira A.",
    status: "Menunggu",
    createdAt: "2026-08-18T09:00:00.000Z",
  },
  {
    id: 4,
    title: "Iklan WhatsApp blast",
    pos: "Digital & Broadcast",
    nominal: 3_600_000,
    oleh: "Yayat H.",
    status: "Ditolak",
    createdAt: "2026-08-17T09:00:00.000Z",
  },
];
let mockBudgetTransactionNextId = 5;

async function fetchBudgetSummaryMock(scope: BudgetScope): Promise<BudgetSummary> {
  await mockDelay();
  return SUMMARY_BY_SCOPE[scope];
}

export async function fetchBudgetSummary(scope: BudgetScope): Promise<BudgetSummary> {
  if (isMockApiEnabled()) return fetchBudgetSummaryMock(scope);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function fetchBudgetPosMock(scope: BudgetScope): Promise<BudgetPosRealisasi[]> {
  await mockDelay();
  return POS_BY_SCOPE[scope];
}

export async function fetchBudgetPos(scope: BudgetScope): Promise<BudgetPosRealisasi[]> {
  if (isMockApiEnabled()) return fetchBudgetPosMock(scope);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function fetchBudgetTrendMock(scope: BudgetScope): Promise<BudgetTrendPoint[]> {
  await mockDelay();
  return TREND_BY_SCOPE[scope];
}

export async function fetchBudgetTrend(scope: BudgetScope): Promise<BudgetTrendPoint[]> {
  if (isMockApiEnabled()) return fetchBudgetTrendMock(scope);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function fetchBudgetTransactionsMock(): Promise<BudgetTransaction[]> {
  await mockDelay();
  return [...mockBudgetTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchBudgetTransactions(): Promise<BudgetTransaction[]> {
  if (isMockApiEnabled()) return fetchBudgetTransactionsMock();
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

// Transaksi baru selalu masuk sebagai "Menunggu" — tidak ada UI approve/tolak
// di canvas maupun scope sesi ini (cuma pill status yang ditampilkan read-only),
// jadi siapa/lewat mana status berubah ke Disetujui/Ditolak masih di luar scope
// sampai alur approval sungguhan diputuskan user. Judgment call yang
// didokumentasikan, bukan pertanyaan yang dijawab eksplisit — lihat
// progress-tracker.md Decisions.
async function createBudgetTransactionMock(input: CreateBudgetTransactionInput, oleh: string): Promise<BudgetTransaction> {
  await mockDelay();
  const created: BudgetTransaction = {
    id: mockBudgetTransactionNextId++,
    title: input.keterangan,
    pos: input.pos,
    nominal: input.nominal,
    oleh,
    status: "Menunggu",
    createdAt: new Date().toISOString(),
  };
  mockBudgetTransactions = [created, ...mockBudgetTransactions];
  return created;
}

export async function createBudgetTransaction(input: CreateBudgetTransactionInput, oleh: string): Promise<BudgetTransaction> {
  if (isMockApiEnabled()) return createBudgetTransactionMock(input, oleh);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
