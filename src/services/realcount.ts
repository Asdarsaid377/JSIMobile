import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { RealCountC1, SubmitRealCountInput } from "@/types/realcount";

// Sama status dengan services/saksi.ts — belum ada endpoint/schema apapun untuk
// Real Count C1, fitur baru UI-dulu (API menyusul dari user). Cabang non-mock
// sengaja throw, bukan menebak kontrak (CLAUDE.md Aturan #6).
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Real Count C1 belum ada — fitur ini masih UI + mock. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

let mockRealCountList: RealCountC1[] = [];
let mockNextId = 1;

function findIndex(kelWilId: number, noTps: number): number {
  return mockRealCountList.findIndex((item) => item.kelWilId === kelWilId && item.noTps === noTps);
}

async function fetchRealCountByTpsMock(kelWilId: number, noTps: number): Promise<RealCountC1 | null> {
  await mockDelay();
  const index = findIndex(kelWilId, noTps);
  return index === -1 ? null : mockRealCountList[index];
}

export async function fetchRealCountByTps(kelWilId: number, noTps: number): Promise<RealCountC1 | null> {
  if (isMockApiEnabled()) return fetchRealCountByTpsMock(kelWilId, noTps);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function fetchRealCountByKelurahanMock(kelWilId: number): Promise<RealCountC1[]> {
  await mockDelay();
  return mockRealCountList.filter((item) => item.kelWilId === kelWilId);
}

// Dipakai RealCountKelurahanScreen untuk kasih tanda "sudah/belum ada C1" di
// daftar TPS — 1 query per kelurahan, bukan N query per TPS.
export async function fetchRealCountByKelurahan(kelWilId: number): Promise<RealCountC1[]> {
  if (isMockApiEnabled()) return fetchRealCountByKelurahanMock(kelWilId);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

// Upsert — 1 TPS cuma punya 1 hasil C1 (submit ulang menimpa yang lama, dianggap
// koreksi/perbaikan input, bukan riwayat versi).
async function submitRealCountMock(input: SubmitRealCountInput): Promise<RealCountC1> {
  await mockDelay();
  const index = findIndex(input.kelWilId, input.noTps);
  const record: RealCountC1 = {
    id: index === -1 ? mockNextId++ : mockRealCountList[index].id,
    kelWilId: input.kelWilId,
    noTps: input.noTps,
    namaTps: input.namaTps,
    suaraCalon: input.suaraCalon,
    suaraPartaiLain: input.suaraPartaiLain,
    suaraTidakSah: input.suaraTidakSah,
    suaraSahTotal: input.suaraSahTotal,
    catatan: input.catatan ?? null,
    submittedAt: new Date().toISOString(),
  };
  if (index === -1) {
    mockRealCountList = [...mockRealCountList, record];
  } else {
    mockRealCountList = mockRealCountList.map((item, i) => (i === index ? record : item));
  }
  return record;
}

export async function submitRealCount(input: SubmitRealCountInput): Promise<RealCountC1> {
  if (isMockApiEnabled()) return submitRealCountMock(input);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
