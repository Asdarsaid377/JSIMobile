import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  BudgetPosRealisasi,
  BudgetScope,
  BudgetSummary,
  BudgetTransaction,
  BudgetTrendPoint,
  CreateBudgetTransactionInput,
  UpdateBudgetTransactionStatusInput,
  UpsertBudgetPlafonInput,
} from "@/types/budgeting";

// Modul backend `budgeting` (src/budgeting/) sekarang ADA — dikonfirmasi
// 2026-08-24 baca budgeting.controller.ts/service.ts/dto + live curl ke
// backend dev lokal (endpoint balas 401 Unauthorized tanpa token, BUKAN 404 —
// artinya route ADA & di-guard AuthGuard, konsisten dengan module lain).
// summary/pos/trend sudah wired. transactions (list+create) SENGAJA belum
// diwiring — lihat ENDPOINT_TRANSAKSI_BELUM_LENGKAP di bawah.
const BULAN_LABEL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "YYYY-MM" bulan berjalan — mobile tidak punya month-picker, jadi scope
 * "bulan" SELALU merujuk bulan berjalan (judgment call, lihat progress-tracker.md). */
function currentPeriode(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** GET /budgeting/summary|pos|trend butuh `periode` HANYA kalau scope=bulan
 * (BudgetScopeDto @ValidateIf) — untuk scope=total, `periode` diabaikan
 * backend, jadi tidak dikirim sama sekali. */
function scopeParams(scope: BudgetScope): { scope: BudgetScope; periode?: string } {
  return scope === "bulan" ? { scope, periode: currentPeriode() } : { scope };
}

/** Backend summary/pos TIDAK balas scope/scopeLabel (cuma angka) — dihitung
 * di mobile dari periode "YYYY-MM" yang sama yang dikirim di query. */
function scopeLabel(scope: BudgetScope, periode?: string): string {
  if (scope === "total") return "Keseluruhan";
  const [year, month] = (periode ?? currentPeriode()).split("-").map(Number);
  return `${BULAN_LABEL[month - 1]} ${year}`;
}

// GET/POST /budgeting/transactions sekarang nge-include relasi `user` (fix
// backend 2026-08-24, dikonfirmasi baca ulang budgeting.service.ts: kedua
// method pakai `include: [{ model: TimsesModel, as: 'user', attributes:
// ['id','namaLengkap'] }]`, alias 'user' cocok dengan nama property
// `@BelongsTo` di model — findTransactions() include langsung di
// findAndCountAll(), createTransaction() include via `.reload()` sesudah
// create). List+create transaksi sekarang WIRED penuh, lihat mapBudgetTransaction.

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

type BudgetSummaryApiRecord = {
  total: number;
  used: number;
  left: number;
  usedPct: number;
  txCount: number;
  overCount: number;
};

export async function fetchBudgetSummary(scope: BudgetScope): Promise<BudgetSummary> {
  if (isMockApiEnabled()) return fetchBudgetSummaryMock(scope);
  try {
    const params = scopeParams(scope);
    const { data: body } = await apiClient.get<{ message: string; data: BudgetSummaryApiRecord }>(
      "/budgeting/summary",
      { params },
    );
    return { scope, scopeLabel: scopeLabel(scope, params.periode), ...body.data };
  } catch (error) {
    console.error("[services/budgeting/fetchBudgetSummary]", error);
    throw new Error("Gagal memuat ringkasan anggaran. Coba lagi.");
  }
}

async function fetchBudgetPosMock(scope: BudgetScope): Promise<BudgetPosRealisasi[]> {
  await mockDelay();
  return POS_BY_SCOPE[scope];
}

export async function fetchBudgetPos(scope: BudgetScope): Promise<BudgetPosRealisasi[]> {
  if (isMockApiEnabled()) return fetchBudgetPosMock(scope);
  try {
    // Shape balik ({name,plafon,used,pct}) sudah cocok 1:1 dengan
    // BudgetPosRealisasi — tidak perlu mapping field.
    const { data: body } = await apiClient.get<{ message: string; data: BudgetPosRealisasi[] }>(
      "/budgeting/pos",
      { params: scopeParams(scope) },
    );
    return body.data;
  } catch (error) {
    console.error("[services/budgeting/fetchBudgetPos]", error);
    throw new Error("Gagal memuat realisasi per pos anggaran. Coba lagi.");
  }
}

async function fetchBudgetTrendMock(scope: BudgetScope): Promise<BudgetTrendPoint[]> {
  await mockDelay();
  return TREND_BY_SCOPE[scope];
}

type BudgetTrendApiPoint = { label: string; amount: number };

export async function fetchBudgetTrend(scope: BudgetScope): Promise<BudgetTrendPoint[]> {
  if (isMockApiEnabled()) return fetchBudgetTrendMock(scope);
  try {
    // Backend cuma balas {label,amount} — heightPct (dipakai BudgetTrendChart
    // untuk tinggi batang) dihitung di mobile, relatif ke titik amount tertinggi.
    const { data: body } = await apiClient.get<{ message: string; data: BudgetTrendApiPoint[] }>(
      "/budgeting/trend",
      { params: scopeParams(scope) },
    );
    const points = body.data;
    const maxAmount = Math.max(0, ...points.map((p) => p.amount));
    return points.map((p) => ({ ...p, heightPct: maxAmount > 0 ? Math.round((p.amount / maxAmount) * 100) : 0 }));
  } catch (error) {
    console.error("[services/budgeting/fetchBudgetTrend]", error);
    throw new Error("Gagal memuat tren pengeluaran. Coba lagi.");
  }
}

async function fetchBudgetTransactionsMock(): Promise<BudgetTransaction[]> {
  await mockDelay();
  return [...mockBudgetTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

type BudgetTransactionApiRecord = {
  id: number;
  pos: BudgetTransaction["pos"];
  nominal: number;
  keterangan: string;
  status: BudgetTransaction["status"];
  userId: number;
  createdAt: string;
  user: { id: number; namaLengkap: string | null } | null;
};

function mapBudgetTransaction(record: BudgetTransactionApiRecord): BudgetTransaction {
  return {
    id: record.id,
    title: record.keterangan,
    pos: record.pos,
    nominal: record.nominal,
    // Fallback ID kalau relasi `user` null (mis. akun pembuat sudah dihapus) —
    // seharusnya tidak pernah terjadi normal (userId NOT NULL, diisi dari JWT).
    oleh: record.user?.namaLengkap ?? `Pengguna #${record.userId}`,
    status: record.status,
    createdAt: record.createdAt,
  };
}

// "Pengeluaran Terbaru" di desain cuma menampilkan daftar ringkas, bukan
// riwayat penuh — mobile belum punya UI pagination/infinite-scroll untuk
// section ini (beda dari DPT), jadi cukup ambil 1 halaman pertama dengan
// limit lebih besar dari default backend (10). Judgment call, bukan
// pertanyaan yang dijawab eksplisit user — revisit kalau nanti perlu lihat
// riwayat lebih lama.
const RECENT_TRANSACTIONS_LIMIT = 20;

export async function fetchBudgetTransactions(): Promise<BudgetTransaction[]> {
  if (isMockApiEnabled()) return fetchBudgetTransactionsMock();
  try {
    const { data: body } = await apiClient.get<{ message: string; data: BudgetTransactionApiRecord[] }>(
      "/budgeting/transactions",
      { params: { page: 1, limit: RECENT_TRANSACTIONS_LIMIT } },
    );
    return body.data.map(mapBudgetTransaction);
  } catch (error) {
    console.error("[services/budgeting/fetchBudgetTransactions]", error);
    throw new Error("Gagal memuat daftar transaksi. Coba lagi.");
  }
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
  try {
    // userId TIDAK dikirim di body — backend ambil dari JWT (@User() decorator).
    // Response sudah include relasi `user` (backend fix 2026-08-24), jadi
    // `oleh` di sini (nama user sesi aktif, dari useAuth()) cuma dipakai
    // mock — real branch selalu pakai nama dari response server sebagai
    // sumber kebenaran (bisa beda kalau session lama, meski jarang terjadi).
    const { data: body } = await apiClient.post<{ message: string; data: BudgetTransactionApiRecord }>(
      "/budgeting/transactions",
      input,
    );
    return mapBudgetTransaction(body.data);
  } catch (error) {
    console.error("[services/budgeting/createBudgetTransaction]", error);
    throw new Error("Gagal menyimpan transaksi. Coba lagi.");
  }
}

// Set Plafon Anggaran (admin-only, screen tanpa referensi desain — izin
// eksplisit user 2026-08-24, lihat progress-tracker.md Decisions).
async function upsertBudgetPlafonMock({ scope, pos, nominal }: UpsertBudgetPlafonInput): Promise<void> {
  await mockDelay();
  const row = POS_BY_SCOPE[scope].find((p) => p.name === pos);
  if (row) {
    row.plafon = nominal;
    row.pct = row.plafon > 0 ? Math.round((row.used / row.plafon) * 100) : 0;
  }
}

export async function upsertBudgetPlafon(input: UpsertBudgetPlafonInput): Promise<void> {
  if (isMockApiEnabled()) return upsertBudgetPlafonMock(input);
  try {
    // `periode` backend: "YYYY-MM" untuk scope=bulan (bulan berjalan, sama
    // seperti scopeParams()), literal "TOTAL" untuk scope=total — lihat
    // UpsertBudgetPlafonDto (`PERIODE_PLAFON_REGEX`) di backend.
    const periode = input.scope === "total" ? "TOTAL" : currentPeriode();
    await apiClient.post("/budgeting/plafon", { periode, pos: input.pos, nominal: input.nominal });
  } catch (error) {
    console.error("[services/budgeting/upsertBudgetPlafon]", error);
    throw new Error("Gagal menyimpan plafon. Coba lagi.");
  }
}

// Approval transaksi (admin-only, tombol Setujui/Tolak di BudgetTransactionRow
// — screen tanpa referensi desain, izin eksplisit user 2026-08-24, lihat
// progress-tracker.md Decisions).
async function updateBudgetTransactionStatusMock({ id, status }: UpdateBudgetTransactionStatusInput): Promise<void> {
  await mockDelay();
  mockBudgetTransactions = mockBudgetTransactions.map((tx) => (tx.id === id ? { ...tx, status } : tx));
}

export async function updateBudgetTransactionStatus(input: UpdateBudgetTransactionStatusInput): Promise<void> {
  if (isMockApiEnabled()) return updateBudgetTransactionStatusMock(input);
  try {
    await apiClient.patch(`/budgeting/transactions/${input.id}/status`, { status: input.status });
  } catch (error) {
    console.error("[services/budgeting/updateBudgetTransactionStatus]", error);
    throw new Error("Gagal memperbarui status transaksi. Coba lagi.");
  }
}
