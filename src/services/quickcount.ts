import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  CreateQuickCountKandidatInput,
  CreateQuickCountTpsInput,
  QuickCountHasilC1,
  QuickCountKandidat,
  QuickCountRekapGroup,
  QuickCountRekapLevel,
  QuickCountStatus,
  QuickCountSummary,
  QuickCountTps,
  QuickCountWilayahFilter,
  SubmitQuickCountHasilInput,
  UpdateQuickCountKandidatInput,
  UpdateQuickCountTpsInput,
} from "@/types/quickcount";

// Modul backend `quickcount` (src/quickcount/) sekarang ADA — dikonfirmasi
// 2026-08-24 baca quickcount.controller.ts/service.ts/dto/3 model (cocok 1:1
// dengan spec yang diajukan, tidak ada gap) + live curl ke backend LOKAL
// (semua route balas 401 Unauthorized, BUKAN 404 — route ADA & ter-guard).
// WIRED PENUH: kandidat/TPS (CRUD admin-only) + submit hasil C1. Backend
// pecah 3 resource independen (kandidat/tps/hasil) — mobile panggil 2 GET
// paralel (tps+hasil) & gabung jadi 1 QuickCountTps[] client-side (pola sama
// rivalcaleg/isuaspirasi), supaya QuickCountScreen.tsx & component turunannya
// TIDAK PERLU diubah strukturnya. `kabupaten` ditambah 2026-08-24 di
// `QuickCountTps` (permintaan eksplisit user — target kampanye bisa menaungi
// banyak kabupaten, mis. 1 dapil DPR RI = 4 kabupaten) — butuh backend
// nambah kolom ini juga, lihat api-standards.md § Quick Count.

type QuickCountKandidatApiRecord = {
  id: number;
  nama: string;
  partai: string;
};

type QuickCountTpsApiRecord = {
  id: number;
  noTps: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaSaksi: string | null;
  totalDpt: number;
};

type QuickCountHasilStatus = "Menunggu" | "Terverifikasi" | "Selisih";

type QuickCountHasilApiRecord = {
  id: number;
  tpsId: number;
  status: QuickCountHasilStatus;
  suaraPerKandidat: Record<string, number>;
  totalSuaraSah: number;
  updatedAt: string;
  relawan?: { id: number; namaLengkap: string } | null;
};

// Status/meta TPS tidak dibalas backend sama sekali (`QuickCountTps` backend
// cuma simpan fakta mentah: noTps/kecamatan/kelurahan/namaSaksi/totalDpt) —
// "Belum masuk"/"Tanpa saksi"/dst DIHITUNG DI SINI dari ada/tidaknya
// `namaSaksi` & row hasil, pola sama judgment call laporanSerupa di
// isuaspirasi. Backend juga TIDAK punya alur review korwil (status hasil
// SELALU "Menunggu" begitu submit) — Terverifikasi/Selisih di bawah ini
// murni jaga-jaga kalau backend suatu saat dapat endpoint verifikasi.
function deriveStatusMeta(
  namaSaksi: string | null,
  hasil: { status: QuickCountHasilStatus; updatedAt: string } | null,
): { status: QuickCountStatus; meta: string } {
  if (!hasil) {
    if (namaSaksi) return { status: "Belum masuk", meta: "Saksi online · belum kirim hasil" };
    return { status: "Tanpa saksi", meta: "Perlu penugasan saksi segera" };
  }
  const jam = new Date(hasil.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (hasil.status === "Terverifikasi") return { status: "Terverifikasi", meta: `Dikirim ${jam} · C1 terlampir` };
  if (hasil.status === "Selisih") return { status: "Selisih", meta: `Dikirim ${jam} · selisih data ditemukan` };
  return { status: "Menunggu", meta: `Dikirim ${jam} · menunggu review korwil` };
}

function mapQuickCountTpsList(
  tpsRecords: QuickCountTpsApiRecord[],
  hasilRecords: QuickCountHasilApiRecord[],
): QuickCountTps[] {
  const hasilByTpsId = new Map(hasilRecords.map((h) => [h.tpsId, h]));
  return tpsRecords.map((tps) => {
    const hasil = hasilByTpsId.get(tps.id) ?? null;
    const { status, meta } = deriveStatusMeta(tps.namaSaksi, hasil);
    const hasilC1: QuickCountHasilC1 | null = hasil
      ? {
          suaraPerKandidat: Object.fromEntries(
            Object.entries(hasil.suaraPerKandidat).map(([kandidatId, jumlah]) => [Number(kandidatId), jumlah]),
          ),
          totalSuaraSah: hasil.totalSuaraSah,
          submittedAt: hasil.updatedAt,
        }
      : null;
    return {
      id: tps.id,
      noTps: tps.noTps,
      kabupaten: tps.kabupaten,
      kecamatan: tps.kecamatan,
      kelurahan: tps.kelurahan,
      namaSaksi: tps.namaSaksi,
      totalDpt: tps.totalDpt,
      status,
      meta,
      hasilC1,
    };
  });
}

async function fetchQuickCountTpsListReal(): Promise<QuickCountTps[]> {
  try {
    const [tpsRes, hasilRes] = await Promise.all([
      apiClient.get<{ data: QuickCountTpsApiRecord[] }>("/quickcount/tps"),
      apiClient.get<{ data: QuickCountHasilApiRecord[] }>("/quickcount/hasil"),
    ]);
    return mapQuickCountTpsList(tpsRes.data.data, hasilRes.data.data);
  } catch (error) {
    console.error("[services/quickcount/fetchQuickCountTpsList]", error);
    throw new Error("Gagal memuat data Quick Count. Coba lagi.");
  }
}

async function submitQuickCountHasilReal(input: SubmitQuickCountHasilInput): Promise<void> {
  try {
    await apiClient.post("/quickcount/hasil", input);
  } catch (error) {
    console.error("[services/quickcount/submitQuickCountHasil]", error);
    throw new Error("Gagal menyimpan hasil C1. Coba lagi.");
  }
}

async function fetchQuickCountSummaryReal(filter: QuickCountWilayahFilter): Promise<QuickCountSummary> {
  try {
    const res = await apiClient.get<{ data: QuickCountSummary }>("/quickcount/summary", { params: filter });
    return res.data.data;
  } catch (error) {
    console.error("[services/quickcount/fetchQuickCountSummary]", error);
    throw new Error("Gagal memuat ringkasan Quick Count. Coba lagi.");
  }
}

async function fetchQuickCountRekapReal(
  level: QuickCountRekapLevel,
  filter: QuickCountWilayahFilter,
): Promise<QuickCountRekapGroup[]> {
  try {
    const res = await apiClient.get<{ data: QuickCountRekapGroup[] }>("/quickcount/rekap", {
      params: { level, ...filter },
    });
    return res.data.data;
  } catch (error) {
    console.error("[services/quickcount/fetchQuickCountRekap]", error);
    throw new Error("Gagal memuat rekap Quick Count. Coba lagi.");
  }
}

async function fetchQuickCountKandidatListReal(): Promise<QuickCountKandidat[]> {
  try {
    const res = await apiClient.get<{ data: QuickCountKandidatApiRecord[] }>("/quickcount/kandidat");
    return res.data.data.map((r) => ({ id: r.id, nama: r.nama, partai: r.partai ?? "" }));
  } catch (error) {
    console.error("[services/quickcount/fetchQuickCountKandidatList]", error);
    throw new Error("Gagal memuat daftar kandidat. Coba lagi.");
  }
}

async function createQuickCountKandidatReal(input: CreateQuickCountKandidatInput): Promise<void> {
  try {
    await apiClient.post("/quickcount/kandidat", input);
  } catch (error) {
    console.error("[services/quickcount/createQuickCountKandidat]", error);
    throw new Error("Gagal menyimpan kandidat. Coba lagi.");
  }
}

async function updateQuickCountKandidatReal({ id, ...body }: UpdateQuickCountKandidatInput): Promise<void> {
  try {
    await apiClient.patch(`/quickcount/kandidat/${id}`, body);
  } catch (error) {
    console.error("[services/quickcount/updateQuickCountKandidat]", error);
    throw new Error("Gagal memperbarui kandidat. Coba lagi.");
  }
}

async function deleteQuickCountKandidatReal(id: number): Promise<void> {
  try {
    await apiClient.delete(`/quickcount/kandidat/${id}`);
  } catch (error) {
    console.error("[services/quickcount/deleteQuickCountKandidat]", error);
    throw new Error("Gagal menghapus kandidat. Coba lagi.");
  }
}

async function createQuickCountTpsReal(input: CreateQuickCountTpsInput): Promise<void> {
  try {
    await apiClient.post("/quickcount/tps", input);
  } catch (error) {
    console.error("[services/quickcount/createQuickCountTps]", error);
    throw new Error("Gagal menyimpan TPS. Coba lagi.");
  }
}

async function updateQuickCountTpsReal({ id, ...body }: UpdateQuickCountTpsInput): Promise<void> {
  try {
    await apiClient.patch(`/quickcount/tps/${id}`, body);
  } catch (error) {
    console.error("[services/quickcount/updateQuickCountTps]", error);
    throw new Error("Gagal memperbarui TPS. Coba lagi.");
  }
}

async function deleteQuickCountTpsReal(id: number): Promise<void> {
  try {
    await apiClient.delete(`/quickcount/tps/${id}`);
  } catch (error) {
    console.error("[services/quickcount/deleteQuickCountTps]", error);
    throw new Error("Gagal menghapus TPS. Coba lagi.");
  }
}

// --- Dataset demo (EXPO_PUBLIC_USE_MOCK_API=true) ---

// 5 kandidat persis nama/partai di mockup (contoh ilustratif, bukan data
// pileg asli) — jumlah suara TIDAK disimpan di sini, selalu di-derive dari
// hasilC1 tiap TPS yang sudah masuk (lihat QuickCountScreen), supaya angka
// "Perolehan Suara Kandidat" benar-benar hidup begitu ada input baru, bukan
// statis kayak qcCandidates di mockup. `let` (bukan `const`) — mutable, CRUD
// "Kelola Kandidat & Partai" beneran mengubah array in-memory ini, pola sama
// services/rivalcaleg.ts.
let mockKandidatList: QuickCountKandidat[] = [
  { id: 1, nama: "H. Rahmat Wijaya", partai: "PNB" },
  { id: 2, nama: "Siti Marlina", partai: "PHR" },
  { id: 3, nama: "Agus Permana", partai: "PKB" },
  { id: 4, nama: "Tatang Suryana", partai: "PAS" },
  { id: 5, nama: "Lainnya", partai: "" },
];
let mockKandidatNextId = 6;

// 5 TPS tersebar di 4 kelurahan yang sama dengan MOCK_DTDOOR/MOCK_TIMSES/
// MOCK_TOKOH (Cileunyi Kulon/Cinunuk/Cileunyi Wetan/Cimekar, Kec. Cileunyi) —
// konsisten lintas fitur. `namaSaksi`/`totalDpt`/`status`/`meta` persis
// qcTpsList di mockup; `hasilC1` DITAMBAH sendiri (tidak ada di mockup —
// qcInputRows di sana statis/demo) supaya kartu ringkasan & "Perolehan Suara
// Kandidat" bisa dihitung sungguhan dari data yang "sudah masuk", bukan
// angka mati. 3 dari 5 TPS diberi hasilC1 (Terverifikasi/Selisih/Menunggu —
// 3 status yang secara logis berarti "sudah pernah kirim C1"), 2 sisanya
// (Belum masuk/Tanpa saksi) null. `kabupaten` ditambah 2026-08-24 — Kec.
// Cileunyi memang secara nyata bagian dari Kab. Bandung, jadi "Bandung" bukan
// karangan (target kampanye bisa menaungi kabupaten lain di luar dataset demo
// ini, CRUD-nya sekarang mendukung itu).
let mockQcTpsList: QuickCountTps[] = [
  {
    id: 1,
    noTps: "TPS 12",
    kabupaten: "Bandung",
    kecamatan: "Cileunyi",
    kelurahan: "Cileunyi Kulon",
    namaSaksi: "Neng Sari",
    totalDpt: 412,
    status: "Terverifikasi",
    meta: "Dikirim 13:42 · C1 terlampir",
    hasilC1: {
      suaraPerKandidat: { 1: 148, 2: 112, 3: 74, 4: 48, 5: 16 },
      totalSuaraSah: 398,
      submittedAt: "2026-08-20T13:42:00Z",
    },
  },
  {
    id: 2,
    noTps: "TPS 08",
    kabupaten: "Bandung",
    kecamatan: "Cileunyi",
    kelurahan: "Cileunyi Wetan",
    namaSaksi: "Asep Saepudin",
    totalDpt: 386,
    status: "Selisih",
    meta: "Input saksi ≠ angka C1 (beda 14 suara)",
    hasilC1: {
      suaraPerKandidat: { 1: 135, 2: 98, 3: 65, 4: 44, 5: 18 },
      totalSuaraSah: 360,
      submittedAt: "2026-08-20T13:50:00Z",
    },
  },
  {
    id: 3,
    noTps: "TPS 05",
    kabupaten: "Bandung",
    kecamatan: "Cileunyi",
    kelurahan: "Cinunuk",
    namaSaksi: "Mira Anggraini",
    totalDpt: 398,
    status: "Belum masuk",
    meta: "Saksi online · belum kirim hasil",
    hasilC1: null,
  },
  {
    id: 4,
    noTps: "TPS 17",
    kabupaten: "Bandung",
    kecamatan: "Cileunyi",
    kelurahan: "Cimekar",
    namaSaksi: "Dedi Kurniawan",
    totalDpt: 424,
    status: "Menunggu",
    meta: "Dikirim 13:58 · menunggu review korwil",
    hasilC1: {
      suaraPerKandidat: { 1: 152, 2: 110, 3: 78, 4: 50, 5: 22 },
      totalSuaraSah: 412,
      submittedAt: "2026-08-20T13:58:00Z",
    },
  },
  {
    id: 5,
    noTps: "TPS 21",
    kabupaten: "Bandung",
    kecamatan: "Cileunyi",
    kelurahan: "Cimekar",
    namaSaksi: null,
    totalDpt: 405,
    status: "Tanpa saksi",
    meta: "Perlu penugasan saksi segera",
    hasilC1: null,
  },
];
let mockQcTpsNextId = 6;

async function fetchQuickCountTpsListMock(): Promise<QuickCountTps[]> {
  await mockDelay();
  return mockQcTpsList;
}

export async function fetchQuickCountTpsList(): Promise<QuickCountTps[]> {
  if (isMockApiEnabled()) return fetchQuickCountTpsListMock();
  return fetchQuickCountTpsListReal();
}

// Submit (atau koreksi — upsert, bukan riwayat versi, pola sama Real Count
// C1) hasil C1 satu TPS. Status SELALU jadi "Menunggu" setelah submit —
// backend belum punya alur review korwil (yang akan mengubahnya jadi
// Terverifikasi/Selisih), di luar scope sesi ini.
async function submitQuickCountHasilMock(input: SubmitQuickCountHasilInput): Promise<void> {
  await mockDelay();
  const index = mockQcTpsList.findIndex((item) => item.id === input.tpsId);
  if (index === -1) throw new Error("TPS tidak ditemukan.");
  const suaraPerKandidat: Record<number, number> = {};
  let totalSuaraSah = 0;
  for (const row of input.suaraPerKandidat) {
    suaraPerKandidat[row.kandidatId] = row.jumlah;
    totalSuaraSah += row.jumlah;
  }
  const jam = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const updated: QuickCountTps = {
    ...mockQcTpsList[index],
    status: "Menunggu",
    meta: `Dikirim ${jam} · menunggu review korwil`,
    hasilC1: { suaraPerKandidat, totalSuaraSah, submittedAt: new Date().toISOString() },
  };
  mockQcTpsList = mockQcTpsList.map((item, i) => (i === index ? updated : item));
}

export async function submitQuickCountHasil(input: SubmitQuickCountHasilInput): Promise<void> {
  if (isMockApiEnabled()) return submitQuickCountHasilMock(input);
  return submitQuickCountHasilReal(input);
}

// --- CRUD Kandidat & Partai (admin-only) ---
// Menghapus kandidat TIDAK membersihkan `hasilC1.suaraPerKandidat` di TPS
// yang sudah lapor — baris suara di bawah kandidatId yang dihapus berhenti
// dihitung di "Perolehan Suara Kandidat" (QuickCountScreen iterate dari
// kandidatList saat ini, bukan dari key hasilC1), bukan di-migrasi/dijumlah
// ke kandidat lain. Simplifikasi yang disengaja, sama di backend real
// (lihat api-standards.md § Quick Count).

async function fetchQuickCountKandidatListMock(): Promise<QuickCountKandidat[]> {
  await mockDelay();
  return mockKandidatList;
}

export async function fetchQuickCountKandidatList(): Promise<QuickCountKandidat[]> {
  if (isMockApiEnabled()) return fetchQuickCountKandidatListMock();
  return fetchQuickCountKandidatListReal();
}

async function createQuickCountKandidatMock(input: CreateQuickCountKandidatInput): Promise<void> {
  await mockDelay();
  mockKandidatList = [...mockKandidatList, { id: mockKandidatNextId++, ...input }];
}

export async function createQuickCountKandidat(input: CreateQuickCountKandidatInput): Promise<void> {
  if (isMockApiEnabled()) return createQuickCountKandidatMock(input);
  return createQuickCountKandidatReal(input);
}

async function updateQuickCountKandidatMock({ id, ...input }: UpdateQuickCountKandidatInput): Promise<void> {
  await mockDelay();
  mockKandidatList = mockKandidatList.map((item) => (item.id === id ? { ...item, ...input } : item));
}

export async function updateQuickCountKandidat(input: UpdateQuickCountKandidatInput): Promise<void> {
  if (isMockApiEnabled()) return updateQuickCountKandidatMock(input);
  return updateQuickCountKandidatReal(input);
}

async function deleteQuickCountKandidatMock(id: number): Promise<void> {
  await mockDelay();
  mockKandidatList = mockKandidatList.filter((item) => item.id !== id);
}

export async function deleteQuickCountKandidat(id: number): Promise<void> {
  if (isMockApiEnabled()) return deleteQuickCountKandidatMock(id);
  return deleteQuickCountKandidatReal(id);
}

// --- CRUD TPS (admin-only) ---
// TPS baru/diedit lewat sini SELALU dapat status/meta ter-derive dari
// deriveStatusMeta() (hasil null karena belum pernah submit C1) — konsisten
// dengan cara real branch menghitungnya, pola sama tapi dipakai di titik
// mutasi mock alih-alih titik fetch (mock tidak fetch ulang gabungan
// TPS+hasil seperti real, jadi status/meta di-hitung ulang saat TPS itu
// sendiri berubah).

async function createQuickCountTpsMock(input: CreateQuickCountTpsInput): Promise<void> {
  await mockDelay();
  const namaSaksi = input.namaSaksi || null;
  const { status, meta } = deriveStatusMeta(namaSaksi, null);
  mockQcTpsList = [
    ...mockQcTpsList,
    { id: mockQcTpsNextId++, ...input, namaSaksi, status, meta, hasilC1: null },
  ];
}

export async function createQuickCountTps(input: CreateQuickCountTpsInput): Promise<void> {
  if (isMockApiEnabled()) return createQuickCountTpsMock(input);
  return createQuickCountTpsReal(input);
}

async function updateQuickCountTpsMock({ id, ...input }: UpdateQuickCountTpsInput): Promise<void> {
  await mockDelay();
  mockQcTpsList = mockQcTpsList.map((item) => {
    if (item.id !== id) return item;
    const merged = { ...item, ...input };
    const namaSaksi = input.namaSaksi !== undefined ? input.namaSaksi || null : item.namaSaksi;
    const { status, meta } = item.hasilC1
      ? { status: item.status, meta: item.meta }
      : deriveStatusMeta(namaSaksi, null);
    return { ...merged, namaSaksi, status, meta };
  });
}

export async function updateQuickCountTps(input: UpdateQuickCountTpsInput): Promise<void> {
  if (isMockApiEnabled()) return updateQuickCountTpsMock(input);
  return updateQuickCountTpsReal(input);
}

async function deleteQuickCountTpsMock(id: number): Promise<void> {
  await mockDelay();
  mockQcTpsList = mockQcTpsList.filter((item) => item.id !== id);
}

export async function deleteQuickCountTps(id: number): Promise<void> {
  if (isMockApiEnabled()) return deleteQuickCountTpsMock(id);
  return deleteQuickCountTpsReal(id);
}

// --- Summary & Rekap Wilayah (2026-08-24, filtering ditambah user di backend) ---
// Mock branch MENIRU LOGIKA AGREGASI backend persis (getSummary()/getRekap() di
// quickcount.service.ts) — bukan cuma reuse status/meta yang sudah ter-derive,
// supaya hasil mock & real konsisten kalau nanti dibandingkan.

function persen(bagian: number, total: number): number {
  return total > 0 ? Math.round((bagian / total) * 1000) / 10 : 0;
}

function matchesWilayahFilter(filter: QuickCountWilayahFilter) {
  return (tps: QuickCountTps): boolean =>
    (!filter.kabupaten || tps.kabupaten === filter.kabupaten) &&
    (!filter.kecamatan || tps.kecamatan === filter.kecamatan) &&
    (!filter.kelurahan || tps.kelurahan === filter.kelurahan);
}

async function fetchQuickCountSummaryMock(filter: QuickCountWilayahFilter): Promise<QuickCountSummary> {
  await mockDelay();
  const filteredTps = mockQcTpsList.filter(matchesWilayahFilter(filter));
  const totalTps = filteredTps.length;
  const withHasil = filteredTps.filter((tps) => tps.hasilC1 !== null);
  const tpsMasuk = withHasil.length;
  const totalDpt = filteredTps.reduce((sum, tps) => sum + tps.totalDpt, 0);
  const totalSuaraSah = withHasil.reduce((sum, tps) => sum + (tps.hasilC1?.totalSuaraSah ?? 0), 0);

  const suaraByKandidat = new Map<number, number>();
  for (const tps of withHasil) {
    for (const [kandidatId, jumlah] of Object.entries(tps.hasilC1?.suaraPerKandidat ?? {})) {
      suaraByKandidat.set(Number(kandidatId), (suaraByKandidat.get(Number(kandidatId)) ?? 0) + jumlah);
    }
  }

  const kandidat = mockKandidatList
    .map((k) => {
      const totalSuara = suaraByKandidat.get(k.id) ?? 0;
      return { kandidatId: k.id, nama: k.nama, partai: k.partai, totalSuara, persentase: persen(totalSuara, totalSuaraSah) };
    })
    .sort((a, b) => b.totalSuara - a.totalSuara);

  return {
    totalTps,
    tpsMasuk,
    tpsBelumMasuk: totalTps - tpsMasuk,
    persentaseTpsMasuk: persen(tpsMasuk, totalTps),
    totalDpt,
    totalSuaraSah,
    persentasePartisipasi: persen(totalSuaraSah, totalDpt),
    kandidat,
  };
}

export async function fetchQuickCountSummary(filter: QuickCountWilayahFilter): Promise<QuickCountSummary> {
  if (isMockApiEnabled()) return fetchQuickCountSummaryMock(filter);
  return fetchQuickCountSummaryReal(filter);
}

async function fetchQuickCountRekapMock(
  level: QuickCountRekapLevel,
  filter: QuickCountWilayahFilter,
): Promise<QuickCountRekapGroup[]> {
  await mockDelay();
  const filteredTps = mockQcTpsList.filter(matchesWilayahFilter(filter));

  type Group = { totalTps: number; tpsMasuk: number; totalDpt: number; totalSuaraSah: number; suaraByKandidat: Map<number, number> };
  const groups = new Map<string, Group>();
  for (const tps of filteredTps) {
    const wilayah = tps[level];
    if (!groups.has(wilayah)) {
      groups.set(wilayah, { totalTps: 0, tpsMasuk: 0, totalDpt: 0, totalSuaraSah: 0, suaraByKandidat: new Map() });
    }
    const group = groups.get(wilayah)!;
    group.totalTps += 1;
    group.totalDpt += tps.totalDpt;
    if (!tps.hasilC1) continue;
    group.tpsMasuk += 1;
    group.totalSuaraSah += tps.hasilC1.totalSuaraSah;
    for (const [kandidatId, jumlah] of Object.entries(tps.hasilC1.suaraPerKandidat)) {
      group.suaraByKandidat.set(Number(kandidatId), (group.suaraByKandidat.get(Number(kandidatId)) ?? 0) + jumlah);
    }
  }

  return Array.from(groups.entries())
    .map(([wilayah, group]) => ({
      wilayah,
      totalTps: group.totalTps,
      tpsMasuk: group.tpsMasuk,
      tpsBelumMasuk: group.totalTps - group.tpsMasuk,
      persentaseTpsMasuk: persen(group.tpsMasuk, group.totalTps),
      totalDpt: group.totalDpt,
      totalSuaraSah: group.totalSuaraSah,
      suaraPerKandidat: mockKandidatList.map((k) => ({
        kandidatId: k.id,
        nama: k.nama,
        partai: k.partai,
        totalSuara: group.suaraByKandidat.get(k.id) ?? 0,
      })),
    }))
    .sort((a, b) => a.wilayah.localeCompare(b.wilayah));
}

export async function fetchQuickCountRekap(
  level: QuickCountRekapLevel,
  filter: QuickCountWilayahFilter,
): Promise<QuickCountRekapGroup[]> {
  if (isMockApiEnabled()) return fetchQuickCountRekapMock(level, filter);
  return fetchQuickCountRekapReal(level, filter);
}
