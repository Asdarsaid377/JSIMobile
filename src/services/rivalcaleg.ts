import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { CreateRivalCalegInput, RivalAssessment, RivalCaleg, UpsertRivalAssessmentInput } from "@/types/rivalcaleg";

// Sama status dengan services/saksi.ts & services/realcount.ts — belum ada
// endpoint/schema apapun untuk Rival Caleg (fitur baru, di luar build-plan awal,
// permintaan user langsung). Pola mock service STANDAR (array in-memory), cabang
// non-mock sengaja throw, bukan menebak kontrak (CLAUDE.md Aturan #6).
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Rival Caleg belum ada — fitur ini masih UI + mock. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

let mockRivalCalegList: RivalCaleg[] = [];
let mockRivalCalegNextId = 1;

let mockAssessmentList: RivalAssessment[] = [];
let mockAssessmentNextId = 1;

async function fetchRivalCalegListMock(): Promise<RivalCaleg[]> {
  await mockDelay();
  return mockRivalCalegList;
}

export async function fetchRivalCalegList(): Promise<RivalCaleg[]> {
  if (isMockApiEnabled()) return fetchRivalCalegListMock();
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function createRivalCalegMock(input: CreateRivalCalegInput): Promise<RivalCaleg> {
  await mockDelay();
  const created: RivalCaleg = {
    id: mockRivalCalegNextId++,
    namaLengkap: input.namaLengkap,
    noUrut: input.noUrut ?? null,
    catatan: input.catatan ?? null,
    createdAt: new Date().toISOString(),
  };
  mockRivalCalegList = [...mockRivalCalegList, created];
  return created;
}

export async function createRivalCaleg(input: CreateRivalCalegInput): Promise<RivalCaleg> {
  if (isMockApiEnabled()) return createRivalCalegMock(input);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function fetchRivalAssessmentsMock(rivalCalegId: number): Promise<RivalAssessment[]> {
  await mockDelay();
  return mockAssessmentList.filter((item) => item.rivalCalegId === rivalCalegId);
}

export async function fetchRivalAssessments(rivalCalegId: number): Promise<RivalAssessment[]> {
  if (isMockApiEnabled()) return fetchRivalAssessmentsMock(rivalCalegId);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

function findAssessmentIndex(rivalCalegId: number, kecamatan: string, desa: string | null): number {
  return mockAssessmentList.findIndex(
    (item) => item.rivalCalegId === rivalCalegId && item.kecamatan === kecamatan && item.desa === desa,
  );
}

// Upsert by (rivalCalegId, kecamatan, desa) — 1 wilayah cuma punya 1 assessment
// aktif per rival, submit ulang dianggap update penilaian, bukan riwayat versi
// (pola sama Real Count C1 per TPS).
async function upsertRivalAssessmentMock(input: UpsertRivalAssessmentInput): Promise<RivalAssessment> {
  await mockDelay();
  const desa = input.desa ?? null;
  const index = findAssessmentIndex(input.rivalCalegId, input.kecamatan, desa);
  const record: RivalAssessment = {
    id: index === -1 ? mockAssessmentNextId++ : mockAssessmentList[index].id,
    rivalCalegId: input.rivalCalegId,
    kecamatan: input.kecamatan,
    desa,
    levelAncaman: input.levelAncaman,
    catatan: input.catatan ?? null,
    updatedAt: new Date().toISOString(),
  };
  if (index === -1) {
    mockAssessmentList = [...mockAssessmentList, record];
  } else {
    mockAssessmentList = mockAssessmentList.map((item, i) => (i === index ? record : item));
  }
  return record;
}

export async function upsertRivalAssessment(input: UpsertRivalAssessmentInput): Promise<RivalAssessment> {
  if (isMockApiEnabled()) return upsertRivalAssessmentMock(input);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
