import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { QuickCountKandidat, QuickCountTps, SubmitQuickCountHasilInput } from "@/types/quickcount";

// Pola mock service STANDAR (array in-memory, cabang non-mock throw) — sama
// dengan tokoh.ts/rivalcaleg.ts/saksi.ts. Tidak ada endpoint/schema apapun
// untuk "Quick Count" (CLAUDE.md Aturan #6) — lihat types/quickcount.ts.
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Quick Count belum ada — fitur ini masih UI + mock. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

// 5 kandidat persis nama/partai di mockup (contoh ilustratif, bukan data
// pileg asli) — jumlah suara TIDAK disimpan di sini, selalu di-derive dari
// hasilC1 tiap TPS yang sudah masuk (lihat QuickCountScreen), supaya angka
// "Perolehan Suara Kandidat" benar-benar hidup begitu ada input baru, bukan
// statis kayak qcCandidates di mockup.
export const MOCK_KANDIDAT: QuickCountKandidat[] = [
  { id: 1, nama: "H. Rahmat Wijaya", partai: "PNB" },
  { id: 2, nama: "Siti Marlina", partai: "PHR" },
  { id: 3, nama: "Agus Permana", partai: "PKB" },
  { id: 4, nama: "Tatang Suryana", partai: "PAS" },
  { id: 5, nama: "Lainnya", partai: "" },
];

// 5 TPS tersebar di 4 kelurahan yang sama dengan MOCK_DTDOOR/MOCK_TIMSES/
// MOCK_TOKOH (Cileunyi Kulon/Cinunuk/Cileunyi Wetan/Cimekar, Kec. Cileunyi) —
// konsisten lintas fitur. `namaSaksi`/`totalDpt`/`status`/`meta` persis
// qcTpsList di mockup; `hasilC1` DITAMBAH sendiri (tidak ada di mockup —
// qcInputRows di sana statis/demo) supaya kartu ringkasan & "Perolehan Suara
// Kandidat" bisa dihitung sungguhan dari data yang "sudah masuk", bukan
// angka mati. 3 dari 5 TPS diberi hasilC1 (Terverifikasi/Selisih/Menunggu —
// 3 status yang secara logis berarti "sudah pernah kirim C1"), 2 sisanya
// (Belum masuk/Tanpa saksi) null.
const MOCK_QC_TPS: QuickCountTps[] = [
  {
    id: 1,
    noTps: "TPS 12",
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
    kecamatan: "Cileunyi",
    kelurahan: "Cimekar",
    namaSaksi: null,
    totalDpt: 405,
    status: "Tanpa saksi",
    meta: "Perlu penugasan saksi segera",
    hasilC1: null,
  },
];

let mockQcTpsList: QuickCountTps[] = [...MOCK_QC_TPS];

async function fetchQuickCountTpsListMock(): Promise<QuickCountTps[]> {
  await mockDelay();
  return mockQcTpsList;
}

export async function fetchQuickCountTpsList(): Promise<QuickCountTps[]> {
  if (isMockApiEnabled()) return fetchQuickCountTpsListMock();
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

// Submit (atau koreksi — upsert, bukan riwayat versi, pola sama Real Count
// C1) hasil C1 satu TPS. Status SELALU jadi "Menunggu" setelah submit —
// mockup tidak punya alur review korwil (yang akan mengubahnya jadi
// Terverifikasi/Selisih), di luar scope sesi ini.
async function submitQuickCountHasilMock(input: SubmitQuickCountHasilInput): Promise<QuickCountTps> {
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
  return updated;
}

export async function submitQuickCountHasil(input: SubmitQuickCountHasilInput): Promise<QuickCountTps> {
  if (isMockApiEnabled()) return submitQuickCountHasilMock(input);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
