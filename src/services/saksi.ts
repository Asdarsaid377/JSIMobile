import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { CreateSaksiInput, Saksi, SaksiStatus } from "@/types/saksi";

// Belum ada endpoint/schema apapun untuk Saksi TPS — fitur baru di luar
// build-plan awal, permintaan user langsung. User eksplisit minta UI dulu saja,
// API dikembangkan belakangan (bukan modul DPT/Hasil Rekap yang backend-nya
// "belum dikonfirmasi" — ini malah belum ADA sama sekali, jadi cabang non-mock
// sengaja throw pesan jelas, sama pola dengan services/dpt.ts § Aturan #6).
const ENDPOINT_NOT_CONFIRMED =
  "Endpoint Saksi TPS belum ada — fitur ini masih UI + mock. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk demo.";

let mockSaksiList: Saksi[] = [];
let mockNextId = 1;

async function fetchSaksiByTpsMock(kelWilId: number, noTps: number): Promise<Saksi[]> {
  await mockDelay();
  return mockSaksiList.filter((item) => item.kelWilId === kelWilId && item.noTps === noTps);
}

export async function fetchSaksiByTps(kelWilId: number, noTps: number): Promise<Saksi[]> {
  if (isMockApiEnabled()) return fetchSaksiByTpsMock(kelWilId, noTps);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function createSaksiMock(input: CreateSaksiInput): Promise<Saksi> {
  await mockDelay();
  const created: Saksi = {
    id: mockNextId++,
    namaLengkap: input.namaLengkap,
    noTelpon: input.noTelpon,
    kelWilId: input.kelWilId,
    noTps: input.noTps,
    namaTps: input.namaTps,
    status: "belum_konfirmasi",
    createdAt: new Date().toISOString(),
  };
  mockSaksiList = [...mockSaksiList, created];
  return created;
}

export async function createSaksi(input: CreateSaksiInput): Promise<Saksi> {
  if (isMockApiEnabled()) return createSaksiMock(input);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}

async function updateSaksiStatusMock(id: number, status: SaksiStatus): Promise<Saksi> {
  await mockDelay();
  const existing = mockSaksiList.find((item) => item.id === id);
  if (!existing) throw new Error("Saksi tidak ditemukan.");
  const updated: Saksi = { ...existing, status };
  mockSaksiList = mockSaksiList.map((item) => (item.id === id ? updated : item));
  return updated;
}

export async function updateSaksiStatus(id: number, status: SaksiStatus): Promise<Saksi> {
  if (isMockApiEnabled()) return updateSaksiStatusMock(id, status);
  throw new Error(ENDPOINT_NOT_CONFIRMED);
}
