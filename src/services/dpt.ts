import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  CreateDptRecordInput,
  DptKabScope,
  DptKabupaten,
  DptKecamatan,
  DptKelurahan,
  DptListParams,
  DptListResult,
  DptProvinsi,
  DptRecord,
  DptTpsOption,
  UpdateDptRecordInput,
} from "@/types/dpt";

// ⚠️ 2026-08-23 — Modul DPT TERNYATA sudah ada di backend (`/Users/asdarsaid/JSI/api/src/dpt`),
// koreksi total dari asumsi lama "belum ada repo" (CLAUDE.md Aturan #6, api-standards.md).
// Kontrak di bawah diverifikasi via baca kode (dpt.controller.ts/dpt.service.ts/
// wilayah/kabupaten.dto.ts/dpt.model.ts) + live curl read-only ke semua endpoint GET
// (cocok byte-for-byte dengan contohdpt.ts) — lihat api-standards.md § DPT untuk detail
// lengkap termasuk 2 landmine penting: (1) PUT edit match kolom `id` padahal segment URL-nya
// ":idDpt" (beda dari GET detail/DELETE yang match kolom `idDpt` asli), (2) kolom `idDpt`
// TIDAK PERNAH diisi oleh POST create — record baru selalu `idDpt: null`, jadi tidak bisa
// di-detail/di-delete/di-link ke Dtdoor via idDpt.
const ENDPOINT_NOT_CONFIRMED = "Endpoint DPT bermasalah. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk mode demo.";

type DptApiRecord = {
  id: number;
  idDpt: number | string | null;
  idKec: number;
  idKel: number;
  noTps: number | null;
  namaKec: string | null;
  namaKel: string | null;
  namaTps: string | null;
  nama: string;
  nik: string | null;
  jenisKelamin: string | null;
  usia: number | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  dtdoor: unknown | null;
  gotv: unknown | null;
};

type DptApiKabScope = {
  wilId: number;
  totalDpt: number;
  kabNama: string;
  proNama: string;
  proKode: number;
  totalKec: number;
};

function mapDptRecord(raw: DptApiRecord): DptRecord {
  return {
    id: raw.id,
    idDpt: raw.idDpt === null || raw.idDpt === undefined ? null : Number(raw.idDpt),
    nik: raw.nik,
    nama: raw.nama,
    jenisKelamin: (raw.jenisKelamin as "L" | "P" | null) ?? "L",
    usia: raw.usia,
    alamat: raw.alamat,
    rt: raw.rt ?? "",
    rw: raw.rw ?? "",
    namaKec: raw.namaKec ?? "",
    namaKel: raw.namaKel ?? "",
    namaTps: raw.namaTps ?? "",
    idKec: raw.idKec,
    idKel: raw.idKel,
    noTps: raw.noTps ?? 0,
    sudahDtdoor: raw.dtdoor !== null && raw.dtdoor !== undefined,
    sudahGotv: raw.gotv !== null && raw.gotv !== undefined,
    // Tidak ada padanan di backend real — selalu false dari sumber API, cuma
    // ke-set true optimistically via markDptTokohMock (mock) atau
    // TokohFormScreen (tidak ada mutasi balik ke DPT di real mode).
    sudahTokoh: false,
  };
}

function mapDptKabScope(raw: DptApiKabScope): DptKabScope {
  return {
    wilId: raw.wilId,
    nama: raw.kabNama,
    totalDpt: raw.totalDpt,
    proNama: raw.proNama,
    proKode: raw.proKode,
    totalKec: raw.totalKec,
  };
}

function describeError(error: unknown, fallback: string): Error {
  console.error("[services/dpt]", error);
  if (axios.isAxiosError(error) && error.response) {
    const message = error.response.data?.message;
    return new Error(typeof message === "string" ? message : fallback);
  }
  return new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
}

const MOCK_PROVINSI: DptProvinsi[] = [
  { wilId: 11, nama: "ACEH", totalDpt: 3735579, totalKab: 23 },
  { wilId: 12, nama: "SUMATERA UTARA", totalDpt: 10515191, totalKab: 33 },
  { wilId: 13, nama: "SUMATERA BARAT", totalDpt: 3782182, totalKab: 19 },
  { wilId: 14, nama: "RIAU", totalDpt: 4640615, totalKab: 12 },
  { wilId: 15, nama: "JAMBI", totalDpt: 2523999, totalKab: 11 },
  { wilId: 16, nama: "SUMATERA SELATAN", totalDpt: 6324700, totalKab: 17 },
  { wilId: 17, nama: "BENGKULU", totalDpt: 1489112, totalKab: 10 },
  { wilId: 18, nama: "LAMPUNG", totalDpt: 6229826, totalKab: 15 },
  { wilId: 19, nama: "KEPULAUAN BANGKA BELITUNG", totalDpt: 1065299, totalKab: 7 },
  { wilId: 21, nama: "KEPULAUAN RIAU", totalDpt: 1463975, totalKab: 7 },
  { wilId: 31, nama: "DKI JAKARTA", totalDpt: 8252897, totalKab: 6 },
  { wilId: 32, nama: "JAWA BARAT", totalDpt: 35695195, totalKab: 27 },
  { wilId: 33, nama: "JAWA TENGAH", totalDpt: 28285415, totalKab: 35 },
  { wilId: 34, nama: "DAERAH ISTIMEWA YOGYAKARTA", totalDpt: 2870974, totalKab: 5 },
  { wilId: 35, nama: "JAWA TIMUR", totalDpt: 31371320, totalKab: 38 },
  { wilId: 36, nama: "BANTEN", totalDpt: 8842646, totalKab: 8 },
  { wilId: 51, nama: "BALI", totalDpt: 3103710, totalKab: 9 },
  { wilId: 52, nama: "NUSA TENGGARA BARAT", totalDpt: 3778564, totalKab: 10 },
  { wilId: 53, nama: "NUSA TENGGARA TIMUR", totalDpt: 3905749, totalKab: 22 },
  { wilId: 61, nama: "KALIMANTAN BARAT", totalDpt: 3921013, totalKab: 14 },
  { wilId: 62, nama: "KALIMANTAN TENGAH", totalDpt: 1914239, totalKab: 14 },
  { wilId: 63, nama: "KALIMANTAN SELATAN", totalDpt: 3006070, totalKab: 13 },
  { wilId: 64, nama: "KALIMANTAN TIMUR", totalDpt: 2658119, totalKab: 10 },
  { wilId: 65, nama: "KALIMANTAN UTARA", totalDpt: 429474, totalKab: 5 },
  { wilId: 71, nama: "SULAWESI UTARA", totalDpt: 1951102, totalKab: 15 },
  { wilId: 72, nama: "SULAWESI TENGAH", totalDpt: 2236703, totalKab: 13 },
  { wilId: 73, nama: "SULAWESI SELATAN", totalDpt: 6672295, totalKab: 24 },
  { wilId: 74, nama: "SULAWESI TENGGARA", totalDpt: 1865414, totalKab: 17 },
  { wilId: 75, nama: "GORONTALO", totalDpt: 881206, totalKab: 6 },
  { wilId: 76, nama: "SULAWESI BARAT", totalDpt: 930908, totalKab: 6 },
  { wilId: 81, nama: "MALUKU", totalDpt: 1306836, totalKab: 11 },
  { wilId: 82, nama: "MALUKU UTARA", totalDpt: 937254, totalKab: 10 },
  { wilId: 91, nama: "P A P U A", totalDpt: 706680, totalKab: 9 },
  { wilId: 92, nama: "PAPUA BARAT", totalDpt: 385465, totalKab: 7 },
  { wilId: 93, nama: "PAPUA SELATAN", totalDpt: 339354, totalKab: 4 },
  { wilId: 94, nama: "PAPUA TENGAH", totalDpt: 1067677, totalKab: 8 },
  { wilId: 95, nama: "PAPUA PEGUNUNGAN", totalDpt: 1281368, totalKab: 8 },
  { wilId: 96, nama: "PAPUA BARAT DAYA", totalDpt: 435127, totalKab: 6 },
];

// Cuma provinsi SULAWESI SELATAN (73) yang punya sample kabupaten lengkap di
// contohdpt.ts — provinsi lain balas [] (lihat fetchKabupatenListMock).
const MOCK_KABUPATEN_73: DptKabupaten[] = [
  { wilId: 7301, nama: "KEPULAUAN SELAYAR", totalDpt: 101175, proNama: "SULAWESI SELATAN", totalKec: 11, totalKel: 88 },
  { wilId: 7302, nama: "BULUKUMBA", totalDpt: 340541, proNama: "SULAWESI SELATAN", totalKec: 10, totalKel: 136 },
  { wilId: 7303, nama: "BANTAENG", totalDpt: 151952, proNama: "SULAWESI SELATAN", totalKec: 8, totalKel: 67 },
  { wilId: 7304, nama: "JENEPONTO", totalDpt: 296501, proNama: "SULAWESI SELATAN", totalKec: 11, totalKel: 113 },
  { wilId: 7305, nama: "TAKALAR", totalDpt: 227844, proNama: "SULAWESI SELATAN", totalKec: 12, totalKel: 109 },
  { wilId: 7306, nama: "GOWA", totalDpt: 562623, proNama: "SULAWESI SELATAN", totalKec: 18, totalKel: 167 },
  { wilId: 7307, nama: "SINJAI", totalDpt: 196181, proNama: "SULAWESI SELATAN", totalKec: 9, totalKel: 80 },
  { wilId: 7308, nama: "BONE", totalDpt: 587777, proNama: "SULAWESI SELATAN", totalKec: 27, totalKel: 372 },
  { wilId: 7309, nama: "MAROS", totalDpt: 277265, proNama: "SULAWESI SELATAN", totalKec: 14, totalKel: 103 },
  { wilId: 7310, nama: "PANGKAJENE KEPULAUAN", totalDpt: 249723, proNama: "SULAWESI SELATAN", totalKec: 13, totalKel: 103 },
  { wilId: 7311, nama: "BARRU", totalDpt: 139232, proNama: "SULAWESI SELATAN", totalKec: 7, totalKel: 55 },
  { wilId: 7312, nama: "SOPPENG", totalDpt: 181890, proNama: "SULAWESI SELATAN", totalKec: 8, totalKel: 70 },
  { wilId: 7313, nama: "WAJO", totalDpt: 293077, proNama: "SULAWESI SELATAN", totalKec: 14, totalKel: 190 },
  { wilId: 7314, nama: "SIDENRENG RAPPANG", totalDpt: 231360, proNama: "SULAWESI SELATAN", totalKec: 11, totalKel: 106 },
  { wilId: 7315, nama: "PINRANG", totalDpt: 294966, proNama: "SULAWESI SELATAN", totalKec: 12, totalKel: 109 },
  { wilId: 7316, nama: "ENREKANG", totalDpt: 166030, proNama: "SULAWESI SELATAN", totalKec: 12, totalKel: 129 },
  { wilId: 7317, nama: "LUWU", totalDpt: 267029, proNama: "SULAWESI SELATAN", totalKec: 22, totalKel: 227 },
  { wilId: 7318, nama: "TANA TORAJA", totalDpt: 196548, proNama: "SULAWESI SELATAN", totalKec: 19, totalKel: 159 },
  { wilId: 7322, nama: "LUWU UTARA", totalDpt: 239118, proNama: "SULAWESI SELATAN", totalKec: 15, totalKel: 173 },
  { wilId: 7324, nama: "LUWU TIMUR", totalDpt: 215975, proNama: "SULAWESI SELATAN", totalKec: 11, totalKel: 127 },
  { wilId: 7326, nama: "TORAJA UTARA", totalDpt: 176718, proNama: "SULAWESI SELATAN", totalKec: 21, totalKel: 151 },
  { wilId: 7371, nama: "KOTA MAKASSAR", totalDpt: 1039010, proNama: "SULAWESI SELATAN", totalKec: 15, totalKel: 153 },
  { wilId: 7372, nama: "KOTA PARE PARE", totalDpt: 109653, proNama: "SULAWESI SELATAN", totalKec: 4, totalKel: 22 },
  { wilId: 7373, nama: "KOTA PALOPO", totalDpt: 130107, proNama: "SULAWESI SELATAN", totalKec: 9, totalKel: 48 },
];

// Cuma kabupaten BANTAENG (7303) yang punya sample kecamatan lengkap.
const MOCK_KECAMATAN_7303: DptKecamatan[] = [
  { wilId: 730301, nama: "BISSAPPU", totalDpt: 26255, kabKode: 7303, totalKel: 11 },
  { wilId: 730302, nama: "BANTAENG", totalDpt: 29046, kabKode: 7303, totalKel: 9 },
  { wilId: 730303, nama: "EREMERASA", totalDpt: 16844, kabKode: 7303, totalKel: 9 },
  { wilId: 730304, nama: "TOMPO BULU", totalDpt: 19829, kabKode: 7303, totalKel: 10 },
  { wilId: 730305, nama: "PAJUKUKANG", totalDpt: 25704, kabKode: 7303, totalKel: 10 },
  { wilId: 730306, nama: "ULUERE", totalDpt: 9146, kabKode: 7303, totalKel: 6 },
  { wilId: 730307, nama: "GANTARANG KEKE", totalDpt: 14677, kabKode: 7303, totalKel: 6 },
  { wilId: 730308, nama: "SINOA", totalDpt: 10451, kabKode: 7303, totalKel: 6 },
];

// Sample kelurahan dari contohdpt.ts (kec 730301/730305/730306/730307/730308) —
// DITAMBAH 1 entry sintetis (wilId 7303011002 "BONTO LEBANG") supaya konsisten
// dengan idKel yang dipakai responseDpt (contohdpt.ts sendiri tidak menyertakan
// kelurahan itu di sample kelurahan-nya — inkonsistensi antar-sample, diperbaiki
// di sini supaya drill-down demo end-to-end tetap jalan, lihat progress-tracker.md).
const MOCK_KELURAHAN_730301: DptKelurahan[] = [
  { wilId: 7303011001, nama: "BONTO MANAI", totalDpt: 2280, kecKode: 730301, kabKode: 7303 },
  { wilId: 7303011002, nama: "BONTO LEBANG", totalDpt: 7, kecKode: 730301, kabKode: 7303 },
];

const MOCK_KELURAHAN_730305: DptKelurahan[] = [
  { wilId: 7303052003, nama: "PA'JUKUKANG", totalDpt: 3753, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052004, nama: "BIANGLOE", totalDpt: 1836, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052005, nama: "BORONG LOE", totalDpt: 3321, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052006, nama: "BARUGA", totalDpt: 4003, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052010, nama: "NIPA-NIPA", totalDpt: 2977, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052012, nama: "PAPAN LOE", totalDpt: 2860, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052013, nama: "RAPPOA", totalDpt: 1402, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052014, nama: "LUMPANGAN", totalDpt: 2261, kecKode: 730305, kabKode: 7303 },
  { wilId: 7303052015, nama: "BATU KARAENG", totalDpt: 835, kecKode: 730305, kabKode: 7303 },
];

const MOCK_KELURAHAN_730306: DptKelurahan[] = [
  { wilId: 7303062001, nama: "BONTO MARANNU", totalDpt: 1240, kecKode: 730306, kabKode: 7303 },
  { wilId: 7303062002, nama: "BONTO TANGNGA", totalDpt: 884, kecKode: 730306, kabKode: 7303 },
  { wilId: 7303062006, nama: "BONTO TALLASA", totalDpt: 1990, kecKode: 730306, kabKode: 7303 },
  { wilId: 7303062007, nama: "BONTO RANNU", totalDpt: 1033, kecKode: 730306, kabKode: 7303 },
  { wilId: 7303062010, nama: "BONTO DAENG", totalDpt: 1559, kecKode: 730306, kabKode: 7303 },
  { wilId: 7303062011, nama: "BONTO LOJONG", totalDpt: 2440, kecKode: 730306, kabKode: 7303 },
];

const MOCK_KELURAHAN_730307: DptKelurahan[] = [
  { wilId: 7303071001, nama: "GANTARANG KEKE", totalDpt: 2387, kecKode: 730307, kabKode: 7303 },
  { wilId: 7303071002, nama: "TANAH LOE", totalDpt: 2111, kecKode: 730307, kabKode: 7303 },
  { wilId: 7303072003, nama: "LAYOA", totalDpt: 2474, kecKode: 730307, kabKode: 7303 },
  { wilId: 7303072004, nama: "BAJIMINASA", totalDpt: 2891, kecKode: 730307, kabKode: 7303 },
  { wilId: 7303072005, nama: "TOMBOLO", totalDpt: 2223, kecKode: 730307, kabKode: 7303 },
  { wilId: 7303072006, nama: "KALOLING", totalDpt: 2591, kecKode: 730307, kabKode: 7303 },
];

const MOCK_KELURAHAN_730308: DptKelurahan[] = [
  { wilId: 7303082001, nama: "BONTO TIRO", totalDpt: 2006, kecKode: 730308, kabKode: 7303 },
  { wilId: 7303082002, nama: "BONTO KARAENG", totalDpt: 1365, kecKode: 730308, kabKode: 7303 },
  { wilId: 7303082003, nama: "BONTO MACCINI", totalDpt: 1555, kecKode: 730308, kabKode: 7303 },
  { wilId: 7303082004, nama: "BONTO MATE'NE", totalDpt: 2188, kecKode: 730308, kabKode: 7303 },
  { wilId: 7303082005, nama: "BONTO MAJANNANG", totalDpt: 1366, kecKode: 730308, kabKode: 7303 },
  { wilId: 7303082006, nama: "BONTO BULAENG", totalDpt: 1971, kecKode: 730308, kabKode: 7303 },
];

const MOCK_KELURAHAN_BY_KEC: Record<number, DptKelurahan[]> = {
  730301: MOCK_KELURAHAN_730301,
  730305: MOCK_KELURAHAN_730305,
  730306: MOCK_KELURAHAN_730306,
  730307: MOCK_KELURAHAN_730307,
  730308: MOCK_KELURAHAN_730308,
};

// 7 dari 8 pemilih di sample contohdpt.ts (idDpt 6 sengaja tidak ada di sample asli
// user — dilewati, bukan dihapus keliru) — semua kec BISSAPPU (730301) / kel BONTO
// LEBANG (7303011002) / TPS 1.
const MOCK_DPT_KAB_7303_SEED: DptRecord[] = [
  {
    id: 191483,
    idDpt: 1,
    nik: null,
    nama: "HASMAWATI M",
    jenisKelamin: "P",
    usia: 46,
    alamat: "BONTO LEBANG",
    rt: "2",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: false,
    sudahGotv: false,
    sudahTokoh: false,
  },
  {
    id: 191484,
    idDpt: 2,
    nik: null,
    nama: "SYARIFUDDIN",
    jenisKelamin: "L",
    usia: 41,
    alamat: "BONTO LEBANG",
    rt: "2",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: true,
    sudahGotv: false,
    sudahTokoh: false,
  },
  {
    id: 191494,
    idDpt: 3,
    nik: null,
    nama: "MUH IQBAL",
    jenisKelamin: "L",
    usia: 23,
    alamat: "BONTO LEBANG",
    rt: "1",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: true,
    sudahGotv: true,
    sudahTokoh: false,
  },
  {
    id: 191495,
    idDpt: 4,
    nik: null,
    nama: "ABD HARIS IKHSAN",
    jenisKelamin: "L",
    usia: 50,
    alamat: "BONTO LEBANG",
    rt: "1",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: false,
    sudahGotv: false,
    sudahTokoh: false,
  },
  {
    id: 191496,
    idDpt: 5,
    nik: null,
    nama: "KASMAWATI KARIM",
    jenisKelamin: "P",
    usia: 46,
    alamat: "BONTO LEBANG",
    rt: "1",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: false,
    sudahGotv: true,
    sudahTokoh: false,
  },
  {
    id: 191505,
    idDpt: 7,
    nik: null,
    nama: "MALENG",
    jenisKelamin: "L",
    usia: 70,
    alamat: "BONTO LEBANG",
    rt: "1",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: false,
    sudahGotv: false,
    sudahTokoh: false,
  },
  {
    id: 191506,
    idDpt: 8,
    nik: null,
    nama: "USMAN",
    jenisKelamin: "L",
    usia: 29,
    alamat: "BONTO LEBANG",
    rt: "1",
    rw: "1",
    namaKec: "BISSAPPU",
    namaKel: "BONTO LEBANG",
    namaTps: "1",
    idKec: 730301,
    idKel: 7303011002,
    noTps: 1,
    sudahDtdoor: true,
    sudahGotv: false,
    sudahTokoh: false,
  },
];

const MOCK_KAB_SCOPE_7303: DptKabScope = {
  wilId: 7303,
  nama: "BANTAENG",
  totalDpt: 151952,
  proNama: "SULAWESI SELATAN",
  proKode: 73,
  totalKec: 8,
};

async function fetchProvinsiListMock(): Promise<DptProvinsi[]> {
  await mockDelay();
  return MOCK_PROVINSI;
}

export async function fetchProvinsiList(): Promise<DptProvinsi[]> {
  if (isMockApiEnabled()) return fetchProvinsiListMock();
  try {
    const { data: body } = await apiClient.get<{ message: string; data: { wilId: number; proNama: string; totalDpt: number; totalKab: number }[] }>(
      "/provinsi",
      { params: { tahun: 2024 } },
    );
    return body.data.map((item) => ({ wilId: item.wilId, nama: item.proNama, totalDpt: item.totalDpt, totalKab: item.totalKab }));
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar provinsi.");
  }
}

async function fetchKabupatenListMock(provinsiWilId: number): Promise<DptKabupaten[]> {
  await mockDelay();
  return provinsiWilId === 73 ? MOCK_KABUPATEN_73 : [];
}

export async function fetchKabupatenList(provinsiWilId: number): Promise<DptKabupaten[]> {
  if (isMockApiEnabled()) return fetchKabupatenListMock(provinsiWilId);
  try {
    const { data: body } = await apiClient.get<{
      message: string;
      data: { wilId: number; kabNama: string; totalDpt: number; proNama: string; totalKec: number; totalKel: number }[];
    }>("/kabupaten", { params: { tahun: 2024, provId: provinsiWilId } });
    return body.data.map((item) => ({
      wilId: item.wilId,
      nama: item.kabNama,
      totalDpt: item.totalDpt,
      proNama: item.proNama,
      totalKec: item.totalKec,
      totalKel: item.totalKel,
    }));
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar kabupaten.");
  }
}

async function fetchKecamatanListMock(kabWilId: number): Promise<DptKecamatan[]> {
  await mockDelay();
  return kabWilId === 7303 ? MOCK_KECAMATAN_7303 : [];
}

export async function fetchKecamatanList(kabWilId: number): Promise<DptKecamatan[]> {
  if (isMockApiEnabled()) return fetchKecamatanListMock(kabWilId);
  try {
    const { data: body } = await apiClient.get<{
      message: string;
      data: { wilId: number; totalDpt: number; kecNama: string; kabKode: number; totalKel: number }[];
    }>("/kecamatan", { params: { tahun: 2024, kabId: kabWilId } });
    return body.data.map((item) => ({ wilId: item.wilId, nama: item.kecNama, totalDpt: item.totalDpt, kabKode: item.kabKode, totalKel: item.totalKel }));
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar kecamatan.");
  }
}

async function fetchKelurahanListMock(kecWilId: number): Promise<DptKelurahan[]> {
  await mockDelay();
  return MOCK_KELURAHAN_BY_KEC[kecWilId] ?? [];
}

// Butuh kabWilId JUGA (bukan cuma kecWilId) — endpoint asli GET /kelurahan
// wajib query param kabId & kecId bersamaan (dikonfirmasi live).
export async function fetchKelurahanList(kabWilId: number, kecWilId: number): Promise<DptKelurahan[]> {
  if (isMockApiEnabled()) return fetchKelurahanListMock(kecWilId);
  try {
    const { data: body } = await apiClient.get<{
      message: string;
      data: { wilId: number; totalDpt: number; kecKode: number; kabKode: number; kelNama: string }[];
    }>("/kelurahan", { params: { tahun: 2024, kabId: kabWilId, kecId: kecWilId } });
    return body.data.map((item) => ({ wilId: item.wilId, nama: item.kelNama, totalDpt: item.totalDpt, kecKode: item.kecKode, kabKode: item.kabKode }));
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar kelurahan.");
  }
}

// State mock DPT MUTABLE (di luar 7303, list mulai kosong `[]`) — supaya
// create/update/delete (CRUD dasar) terlihat efeknya. Key = kabWilId.
const mockDptByKab: Record<number, DptRecord[]> = {
  7303: MOCK_DPT_KAB_7303_SEED,
};
// Range tinggi (900000+) SENGAJA dipilih supaya tidak pernah bentrok dengan id
// asli contohdpt.ts (191xxx-an).
let mockDptNextId = 900001;

function getMockDptList(kabWilId: number): DptRecord[] {
  return mockDptByKab[kabWilId] ?? [];
}

function applyMockDptFilter(records: DptRecord[], params: DptListParams): DptRecord[] {
  let result = records;
  if (params.kecId !== undefined) result = result.filter((r) => r.idKec === params.kecId);
  if (params.kelId !== undefined) result = result.filter((r) => r.idKel === params.kelId);
  if (params.tps !== undefined) result = result.filter((r) => r.noTps === params.tps);
  if (params.nama) {
    const query = params.nama.trim().toLowerCase();
    result = result.filter((r) => r.nama.toLowerCase().includes(query));
  }
  return result;
}

async function fetchDptListMock(kabWilId: number, params: DptListParams): Promise<DptListResult> {
  await mockDelay();
  const kab =
    kabWilId === 7303
      ? MOCK_KAB_SCOPE_7303
      : (() => {
          const found = MOCK_KABUPATEN_73.find((item) => item.wilId === kabWilId);
          return found
            ? { wilId: found.wilId, nama: found.nama, totalDpt: found.totalDpt, proNama: found.proNama, proKode: 73, totalKec: found.totalKec }
            : { wilId: kabWilId, nama: "-", totalDpt: 0, proNama: "-", proKode: 0, totalKec: 0 };
        })();
  const filtered = applyMockDptFilter(getMockDptList(kabWilId), params);
  const start = (params.page - 1) * params.limit;
  const page = filtered.slice(start, start + params.limit);
  return { records: page, kab, page: params.page, hasMore: start + params.limit < filtered.length };
}

export async function fetchDptList(kabWilId: number, params: DptListParams): Promise<DptListResult> {
  if (isMockApiEnabled()) return fetchDptListMock(kabWilId, params);
  try {
    const { data: body } = await apiClient.get<{ message: string; data: DptApiRecord[]; kab: DptApiKabScope; meta: { page: number } }>(
      `/dpt/2024/${kabWilId}`,
      {
        params: {
          page: params.page,
          limit: params.limit,
          nama: params.nama || undefined,
          kecId: params.kecId,
          kelId: params.kelId,
          tps: params.tps,
        },
      },
    );
    return {
      records: body.data.map(mapDptRecord),
      kab: mapDptKabScope(body.kab),
      page: body.meta.page,
      // Endpoint list TIDAK balas total count (lihat catatan DptListResult di
      // types/dpt.ts) — infer dari jumlah baris yang balik: kalau persis sama
      // dengan limit yang diminta, anggap masih ada halaman berikutnya.
      hasMore: body.data.length === params.limit,
    };
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar DPT.");
  }
}

// GET /dpt/2024/total/:wilId (tanpa query `type`) — total count AKURAT yang
// ikut filter kecId/kelId/tps/nama, dipakai summary card DptListScreen (list
// endpoint sendiri tidak balas total, lihat DptListResult).
async function fetchDptTotalMock(kabWilId: number, params: Omit<DptListParams, "page" | "limit">): Promise<number> {
  await mockDelay();
  return applyMockDptFilter(getMockDptList(kabWilId), { page: 1, limit: Number.MAX_SAFE_INTEGER, ...params }).length;
}

export async function fetchDptTotal(kabWilId: number, params: Omit<DptListParams, "page" | "limit">): Promise<number> {
  if (isMockApiEnabled()) return fetchDptTotalMock(kabWilId, params);
  try {
    const { data: body } = await apiClient.get<{ message: string; data: number }>(`/dpt/2024/total/${kabWilId}`, {
      params: { nama: params.nama || undefined, kecId: params.kecId, kelId: params.kelId, tps: params.tps },
    });
    return body.data;
  } catch (error) {
    throw describeError(error, "Gagal memuat total data DPT.");
  }
}

// Helper "fetch semua halaman" — dipakai fitur yang butuh SELURUH record utuh
// buat agregasi client-side (Target Suara/Real Count TPS grouping, demo widget
// HomeScreen), bukan tampilan list berpaginasi biasa (itu pakai useDptList/
// fetchDptList langsung). ⚠️ RISIKO SKALABILITAS tetap ada untuk kabupaten
// tanpa filter kec/kel (bisa >100rb baris di data asli) — dibatasi hardcap
// `maxRecords` (default 5000) supaya tidak hang/crash, BUKAN solusi sebenarnya
// (idealnya backend punya endpoint agregat sendiri). Lihat api-standards.md § DPT.
export async function fetchDptListAll(
  kabWilId: number,
  filter: { kecId?: number; kelId?: number } = {},
  maxRecords = 5000,
): Promise<DptRecord[]> {
  const limit = 200;
  let page = 1;
  let all: DptRecord[] = [];
  for (;;) {
    const result = await fetchDptList(kabWilId, { page, limit, ...filter });
    all = all.concat(result.records);
    if (!result.hasMore || all.length >= maxRecords) break;
    page += 1;
  }
  return all;
}

async function fetchDptTpsListMock(kabWilId: number, filter: { kecId?: number; kelId?: number }): Promise<DptTpsOption[]> {
  await mockDelay();
  const records = getMockDptList(kabWilId).filter(
    (r) => (filter.kecId === undefined || r.idKec === filter.kecId) && (filter.kelId === undefined || r.idKel === filter.kelId),
  );
  const map = new Map<number, string>();
  for (const record of records) map.set(record.noTps, record.namaTps);
  return Array.from(map.entries()).map(([noTps, namaTps]) => ({ noTps, namaTps }));
}

// GET /dpt/2024/:wilId?type=tps — endpoint lookup TPS asli (baru ditemukan
// 2026-08-23, sebelumnya opsi TPS di-derive client-side dari record yang
// sudah termuat, tidak akurat untuk dataset besar/paginated).
export async function fetchDptTpsList(kabWilId: number, filter: { kecId?: number; kelId?: number }): Promise<DptTpsOption[]> {
  if (isMockApiEnabled()) return fetchDptTpsListMock(kabWilId, filter);
  try {
    const { data: body } = await apiClient.get<{ message: string; data: DptTpsOption[] }>(`/dpt/2024/${kabWilId}`, {
      params: { type: "tps", kecId: filter.kecId, kelId: filter.kelId },
    });
    return body.data;
  } catch (error) {
    throw describeError(error, "Gagal memuat daftar TPS.");
  }
}

async function fetchDptDetailMock(kabWilId: number, idDpt: number): Promise<DptRecord> {
  await mockDelay();
  const found = getMockDptList(kabWilId).find((r) => r.idDpt === idDpt);
  if (!found) throw new Error("Data pemilih tidak ditemukan.");
  return found;
}

// GET /dpt/2024/details/:kabId/:idDpt — match kolom `idDpt` ASLI (bukan `id`).
// Dipakai internal oleh updateDptRecord() untuk fetch ulang record akurat
// setelah PUT (yang cuma balas affected-count mentah, bukan entity).
export async function fetchDptDetail(kabWilId: number, idDpt: number): Promise<DptRecord> {
  if (isMockApiEnabled()) return fetchDptDetailMock(kabWilId, idDpt);
  try {
    const { data: body } = await apiClient.get<{ message: string; data: DptApiRecord }>(`/dpt/2024/details/${kabWilId}/${idDpt}`);
    return mapDptRecord(body.data);
  } catch (error) {
    throw describeError(error, "Gagal memuat detail data pemilih.");
  }
}

async function createDptRecordMock(kabWilId: number, input: CreateDptRecordInput): Promise<DptRecord> {
  await mockDelay();
  const id = mockDptNextId++;
  const created: DptRecord = {
    id,
    // Data buatan sesi ini tidak punya `idDpt` asli dari sumber pemerintah —
    // reuse `id` sebagai idDpt sintetis di MOCK SAJA (di real API, idDpt
    // record baru selalu null — lihat mapDptRecord/services/dpt.ts § catatan
        // di atas file ini).
    idDpt: id,
    nik: null,
    usia: null,
    ...input,
    sudahDtdoor: false,
    sudahGotv: false,
    sudahTokoh: false,
  };
  mockDptByKab[kabWilId] = [created, ...getMockDptList(kabWilId)];
  return created;
}

// POST /dpt/2024-created/:wilId — field wajib backend cuma idKec/namaKec/
// idKel/namaKel/nama (dikonfirmasi live via 422). `usia` TIDAK ADA di DTO
// (selalu null di record baru, tidak bisa diisi). `alamat` mobile dikirim ke
// backend lewat key `tempatLahir` (penamaan asli backend, quirk terverifikasi
// baca dpt.service.ts: `alamat: dptDto.tempatLahir`).
export async function createDptRecord(kabWilId: number, input: CreateDptRecordInput): Promise<DptRecord> {
  if (isMockApiEnabled()) return createDptRecordMock(kabWilId, input);
  try {
    const body = {
      idKec: input.idKec,
      namaKec: input.namaKec,
      idKel: input.idKel,
      namaKel: input.namaKel,
      nama: input.nama,
      noTps: input.noTps,
      namaTps: input.namaTps,
      jenisKelamin: input.jenisKelamin,
      rt: input.rt,
      rw: input.rw,
      tempatLahir: input.alamat,
    };
    const { data: envelope } = await apiClient.post<{ message: string; data: DptApiRecord }>(`/dpt/2024-created/${kabWilId}`, body);
    return mapDptRecord(envelope.data);
  } catch (error) {
    throw describeError(error, "Gagal menyimpan data DPT.");
  }
}

async function updateDptRecordMock(kabWilId: number, input: UpdateDptRecordInput): Promise<DptRecord> {
  await mockDelay();
  const list = getMockDptList(kabWilId);
  const index = list.findIndex((record) => record.id === input.id);
  if (index === -1) throw new Error("Data pemilih tidak ditemukan (mungkin sudah dihapus).");
  const updated: DptRecord = { ...list[index], ...input };
  mockDptByKab[kabWilId] = list.map((record, i) => (i === index ? updated : record));
  return updated;
}

// PUT /dpt/details/:kabId/:idDpt — ⚠️ Path segment ":idDpt" di sini SEBENARNYA
// dicocokkan ke kolom `id` (primary key besar), BUKAN kolom `idDpt` — beda
// dari GET detail & DELETE yang sama-sama pakai path ":idDpt" tapi match
// kolom `idDpt` asli. Inkonsistensi asli backend, dikonfirmasi baca
// dpt.service.ts editDpt2024() (`where:{id: idDpt}`) — WAJIB pakai
// `input.id` di sini, bukan `input.idDpt`. Body WAJIB sertakan `tahun: 2024`
// eksplisit — endpoint ini dipakai bareng data 2019, default ke jalur 2019
// kalau field ini tidak dikirim (bug yang sama juga ada di web, tidak
// diikuti di sini).
export async function updateDptRecord(kabWilId: number, input: UpdateDptRecordInput): Promise<DptRecord> {
  if (isMockApiEnabled()) return updateDptRecordMock(kabWilId, input);
  try {
    const body = {
      idKec: input.idKec,
      namaKec: input.namaKec,
      idKel: input.idKel,
      namaKel: input.namaKel,
      nama: input.nama,
      noTps: input.noTps,
      namaTps: input.namaTps,
      jenisKelamin: input.jenisKelamin,
      rt: input.rt,
      rw: input.rw,
      tempatLahir: input.alamat,
      tahun: 2024,
    };
    await apiClient.put(`/dpt/details/${kabWilId}/${input.id}`, body);
    // PUT balas hasil model.update() mentah (affected-count), bukan entity —
    // fetch ulang via GET detail (match kolom idDpt asli) kalau tersedia;
    // kalau idDpt null (record dibuat sesi ini, lihat DptRecord.idDpt),
    // susun manual dari input yang baru dikirim sebagai fallback.
    if (input.idDpt !== null) {
      return fetchDptDetail(kabWilId, input.idDpt);
    }
    return {
      id: input.id,
      idDpt: null,
      nik: null,
      usia: null,
      nama: input.nama,
      jenisKelamin: input.jenisKelamin,
      alamat: input.alamat,
      rt: input.rt,
      rw: input.rw,
      namaKec: input.namaKec,
      namaKel: input.namaKel,
      namaTps: input.namaTps,
      idKec: input.idKec,
      idKel: input.idKel,
      noTps: input.noTps,
      sudahDtdoor: false,
      sudahGotv: false,
      sudahTokoh: false,
    };
  } catch (error) {
    throw describeError(error, "Gagal menyimpan perubahan data DPT.");
  }
}

async function deleteDptRecordMock(kabWilId: number, id: number): Promise<void> {
  await mockDelay();
  mockDptByKab[kabWilId] = getMockDptList(kabWilId).filter((record) => record.id !== id);
}

// DELETE /dpt/details/:kabId/:idDpt?tahun=2024 — match kolom `idDpt` ASLI
// (konsisten dengan GET detail, BEDA dari PUT edit yang match `id`). Query
// `tahun=2024` WAJIB eksplisit (default 2019 di backend kalau tidak dikirim).
// ⚠️ Record yang dibuat lewat app ini (idDpt selalu null, lihat createDptRecord)
// TIDAK BISA dihapus lewat endpoint ini — tidak ada nilai idDpt yang valid untuk
// dikirim di path. Di-guard di sini dengan pesan jelas (Aturan #6), bukan
// mengirim request yang pasti gagal dengan pesan generik.
export async function deleteDptRecord(kabWilId: number, record: Pick<DptRecord, "id" | "idDpt">): Promise<void> {
  if (isMockApiEnabled()) return deleteDptRecordMock(kabWilId, record.id);
  if (record.idDpt === null) {
    throw new Error(
      "Data ini dibuat lewat aplikasi dan belum bisa dihapus dari sini — keterbatasan backend (idDpt belum tersedia untuk data baru).",
    );
  }
  try {
    await apiClient.delete(`/dpt/details/${kabWilId}/${record.idDpt}`, { params: { tahun: 2024 } });
  } catch (error) {
    throw describeError(error, "Gagal menghapus data DPT.");
  }
}

// Fitur "Form Door To Door terintegrasi DPT" — dipanggil setelah createDtdoor()
// sukses dengan idDpt terhubung ke record DPT ini, supaya badge "Door To Door"
// di DptCard berubah tanpa perlu round-trip baca-ulang. Real mode: TIDAK ada
// endpoint "mark" khusus — status sudahDtdoor yang benar datang dari refetch
// list (field `dtdoor` di response asli, sudah ke-derive di mapDptRecord via
// linkage idDpt+kabId sungguhan). Fungsi ini jadi no-op di real mode, cuma
// invalidate query (lihat useMarkDptDtdoor) yang memicu refetch itu.
async function markDptDtdoorMock(kabWilId: number, id: number): Promise<void> {
  await mockDelay();
  mockDptByKab[kabWilId] = getMockDptList(kabWilId).map((record) => (record.id === id ? { ...record, sudahDtdoor: true } : record));
}

export async function markDptDtdoor(kabWilId: number, id: number): Promise<void> {
  if (isMockApiEnabled()) return markDptDtdoorMock(kabWilId, id);
}

// Fitur "Tandai ikut Social Event" (2026-08-24) — pola identik markDptDtdoor
// di atas (real mode no-op, sudahGotv datang dari field `gotv` di response
// list via linkage idDpt+kabId sungguhan, lihat createGotv di services/gotv.ts).
async function markDptGotvMock(kabWilId: number, id: number): Promise<void> {
  await mockDelay();
  mockDptByKab[kabWilId] = getMockDptList(kabWilId).map((record) => (record.id === id ? { ...record, sudahGotv: true } : record));
}

export async function markDptGotv(kabWilId: number, id: number): Promise<void> {
  if (isMockApiEnabled()) return markDptGotvMock(kabWilId, id);
}

// Fitur "Identifikasi Tokoh Baru dari DPT" (icon bintang di DptCard) — pola
// sama markDptDtdoor. ⚠️ Real mode: TIDAK ADA kolom "sudahTokoh" di backend
// sama sekali (Tokoh Masyarakat modul terpisah, tidak ada relasi ke DPT) —
// flag ini SELALU reset ke false tiap list di-refetch dari server real,
// beda dari mock yang persist in-memory. Didokumentasikan, bukan bug.
async function markDptTokohMock(kabWilId: number, id: number): Promise<void> {
  await mockDelay();
  mockDptByKab[kabWilId] = getMockDptList(kabWilId).map((record) => (record.id === id ? { ...record, sudahTokoh: true } : record));
}

export async function markDptTokoh(kabWilId: number, id: number): Promise<void> {
  if (isMockApiEnabled()) return markDptTokohMock(kabWilId, id);
}
