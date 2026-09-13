import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type { CreatePengumumanInput, Pengumuman } from "@/types/pengumuman";

// Modul backend `pengumuman` (src/pengumuman/) — dibuat user 2026-08-26
// mengikuti spec di api-standards.md § Pengumuman (guard/DTO/konvensi field
// disamakan modul `isuaspirasi`). GET /pengumuman SUDAH di-scope server-side
// (backend baca kabId/kecId/kelId requester dari TimsesModel via
// getRequesterScope(), balas cuma pengumuman targetLevel='semua' + yang match
// wilayah requester, admin/adminsekret bypass lihat semua) — mobile TIDAK perlu
// filter ulang di client, tinggal render apa adanya.
type PengumumanApiRecord = {
  id: number;
  judul: string;
  isi: string;
  prioritas: Pengumuman["prioritas"];
  targetLevel: Pengumuman["targetLevel"];
  targetKabId: number | null;
  targetKecId: number | null;
  targetKelId: number | null;
  createdAt: string;
  pembuat?: { id: number; namaLengkap: string } | null;
};

function mapPengumuman(raw: PengumumanApiRecord): Pengumuman {
  return {
    id: raw.id,
    judul: raw.judul,
    isi: raw.isi,
    prioritas: raw.prioritas,
    targetLevel: raw.targetLevel,
    targetKabId: raw.targetKabId,
    targetKecId: raw.targetKecId,
    targetKelId: raw.targetKelId,
    pembuat: raw.pembuat?.namaLengkap ?? "-",
    createdAt: raw.createdAt,
  };
}

// Dataset demo kecil — 1 pengumuman per targetLevel supaya semua kasus tampil
// saat mock aktif. Mock TIDAK mensimulasikan scoping per-wilayah (butuh tahu
// kabId/kecId/kelId akun demo yang login, di luar scope mock sederhana ini) —
// semua akun demo lihat seluruh list, beda dari backend real yang sudah scoped.
let mockPengumumanList: Pengumuman[] = [
  {
    id: 1,
    judul: "Briefing Persiapan Kampanye Akbar",
    isi: "Seluruh koordinator wilayah wajib hadir briefing persiapan kampanye akbar hari Sabtu pukul 09.00 di sekretariat pusat.",
    prioritas: "Mendesak",
    targetLevel: "semua",
    targetKabId: null,
    targetKecId: null,
    targetKelId: null,
    pembuat: "Admin JSI",
    createdAt: "2026-08-25T08:00:00Z",
  },
  {
    id: 2,
    judul: "Update Target Suara Kabupaten",
    isi: "Mohon tim kabupaten segera perbarui capaian target suara minggu ini sebelum rapat evaluasi.",
    prioritas: "Penting",
    targetLevel: "kabupaten",
    targetKabId: 7303,
    targetKecId: null,
    targetKelId: null,
    pembuat: "Admin Sekretariat",
    createdAt: "2026-08-24T10:30:00Z",
  },
  {
    id: 3,
    judul: "Jadwal Door To Door Pekan Ini",
    isi: "Jadwal kunjungan Door To Door untuk Kec. Cileunyi sudah dibagikan, cek grup koordinasi masing-masing.",
    prioritas: "Normal",
    targetLevel: "kecamatan",
    targetKabId: 7303,
    targetKecId: 730301,
    targetKelId: null,
    pembuat: "Admin JSI",
    createdAt: "2026-08-23T14:00:00Z",
  },
];
let mockPengumumanNextId = 4;

async function fetchPengumumanListMock(): Promise<Pengumuman[]> {
  await mockDelay();
  return mockPengumumanList;
}

export async function fetchPengumumanList(): Promise<Pengumuman[]> {
  if (isMockApiEnabled()) return fetchPengumumanListMock();
  try {
    const { data: body } = await apiClient.get<{ message: string; data: PengumumanApiRecord[] }>("/pengumuman");
    return body.data.map(mapPengumuman);
  } catch (error) {
    console.error("[services/pengumuman/fetchPengumumanList]", error);
    throw new Error("Gagal memuat daftar pengumuman. Coba lagi.");
  }
}

async function createPengumumanMock(input: CreatePengumumanInput): Promise<Pengumuman> {
  await mockDelay();
  const created: Pengumuman = {
    id: mockPengumumanNextId++,
    judul: input.judul,
    isi: input.isi,
    prioritas: input.prioritas ?? "Normal",
    targetLevel: input.targetLevel,
    targetKabId: input.targetKabId ?? null,
    targetKecId: input.targetKecId ?? null,
    targetKelId: input.targetKelId ?? null,
    pembuat: "Admin JSI",
    createdAt: new Date().toISOString(),
  };
  mockPengumumanList = [created, ...mockPengumumanList];
  return created;
}

// Admin/adminsekret only — RolesGuard di backend, gating tombol "+ Buat
// Pengumuman" client-side juga wajib pola sama modul lain (BudgetPlafonScreen dst).
export async function createPengumuman(input: CreatePengumumanInput): Promise<Pengumuman> {
  if (isMockApiEnabled()) return createPengumumanMock(input);
  try {
    const { data: body } = await apiClient.post<{ message: string; data: PengumumanApiRecord }>(
      "/pengumuman",
      input,
    );
    return mapPengumuman(body.data);
  } catch (error) {
    console.error("[services/pengumuman/createPengumuman]", error);
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message;
      throw new Error(typeof message === "string" ? message : "Gagal membuat pengumuman. Coba lagi.");
    }
    throw new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
  }
}

async function deletePengumumanMock(id: number): Promise<void> {
  await mockDelay();
  mockPengumumanList = mockPengumumanList.filter((item) => item.id !== id);
}

export async function deletePengumuman(id: number): Promise<void> {
  if (isMockApiEnabled()) return deletePengumumanMock(id);
  try {
    await apiClient.delete(`/pengumuman/${id}`);
  } catch (error) {
    console.error("[services/pengumuman/deletePengumuman]", error);
    throw new Error("Gagal menghapus pengumuman. Coba lagi.");
  }
}
