import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import { generateSyntheticIdDptNumber } from "@/lib/api/syntheticId";
import { KATEGORI_DTDOOR_OPTIONS } from "@/types/dtdoor";
import type {
  CreateDtdoorInput,
  DtdoorLookupOption,
  Dtdoor,
  DtdoorListResponse,
  JenisKelamin,
  PilihanPilegOption,
} from "@/types/dtdoor";

// Kabupaten & kelurahan default untuk entri standalone (tanpa linkage DPT
// asli) — HARUS berupa wilId nyata: `create()` backend (dtdoor.service.ts)
// lookup `WilKab2024.findOne({where:{wilId: kabId}})` lalu langsung akses
// `.proKode` TANPA null-check — kabId sembarang bikin request crash 500.
// Bantaeng (7303, Prov. Sulawesi Selatan 73) satu-satunya kabupaten dengan
// data DPT lengkap yang dikonfirmasi user (lihat api-standards.md § DPT).
const STANDALONE_KAB_ID = 7303;
const STANDALONE_KEL_ID = 7303011002;

// 2026-08-23: modul dtdoor backend ternyata di-desain ulang total (Sequelize,
// bukan lagi TypeORM lama) — response field CAMELCASE (bukan snake_case),
// kategori sekarang kolom flat `kategoriId` (bukan relasi `kategori.id`), dan
// findAll() SELALU include relasi `kunjungans[]` (INNER JOIN — record tanpa
// kunjungan tidak akan muncul di list). Lihat api-standards.md § dtdoor untuk
// verifikasi lengkap (baca kode + live curl).
type DtdoorKunjunganApiRecord = {
  id: number;
  tipePemilihId: number | null;
  pilihanPilegId: number | null;
  programBantuanId: number | null;
  merchendise: string | null;
  namaRelawan: string | null;
  kontakRelawan: string | null;
  tipePemilih?: DtdoorLookupOption | null;
  pilihanPileg?: PilihanPilegOption | null;
  programBantuan?: DtdoorLookupOption | null;
};

type DtdoorApiRecord = {
  id: number;
  nik: string | null;
  namaLengkap: string;
  tps: string | null;
  rt: string | null;
  rw: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  jenisKelamin: string | null;
  noTelpon: string | null;
  marchendise: string | null;
  kategoriId: number | null;
  jumlahWajibPilih: number;
  programBantuan1: string | null;
  programBantuan2: string | null;
  programBantuan3: string | null;
  namaRelawan: string | null;
  kontakRelawan: string | null;
  kunjungans: DtdoorKunjunganApiRecord[];
  createdAt: string;
};

// Dibungkus { message, data, ...extra } oleh TransformInterceptor global
// (sama pola dengan Auth/Profile) — untuk findAll() extra field-nya `meta`
// (pagination), BUKAN nested di dalam `data`.
type DtdoorApiListEnvelope = {
  message: string;
  data: DtdoorApiRecord[];
  meta: { page: number; limit: number; offset: number; totalPages: number; total: number };
};

function mapDtdoor(record: DtdoorApiRecord): Dtdoor {
  // kategoriId (kolom lama) diprioritaskan kalau ada (data lama), fallback ke
  // tipePemilihId kunjungan pertama (skema baru) — dikonfirmasi live bahwa
  // GET /dtdoor/tipe-pemilih persis sama id/label dengan KATEGORI_DTDOOR_OPTIONS,
  // jadi tipePemilihId adalah padanan langsung kategoriId lama.
  const firstKunjungan = record.kunjungans?.[0];
  const kategoriId = record.kategoriId ?? firstKunjungan?.tipePemilihId ?? null;
  const kunjunganBantuanLabels = (record.kunjungans ?? [])
    .map((k) => k.programBantuan?.nama ?? null)
    .filter((label): label is string => label !== null);
  return {
    id: record.id,
    nik: record.nik,
    namaLengkap: record.namaLengkap,
    tps: record.tps,
    rt: record.rt,
    rw: record.rw,
    desa: record.desa,
    kecamatan: record.kecamatan,
    kabupaten: record.kabupaten,
    jenisKelamin: (record.jenisKelamin as JenisKelamin | null) ?? null,
    noTelpon: record.noTelpon,
    merchandise: record.marchendise ?? firstKunjungan?.merchendise ?? null,
    kategoriId,
    kategoriLabel:
      firstKunjungan?.tipePemilih?.nama ??
      KATEGORI_DTDOOR_OPTIONS.find((option) => option.id === kategoriId)?.label ??
      null,
    jumlahWajibPilih: record.jumlahWajibPilih,
    programBantuan1: record.programBantuan1 ?? kunjunganBantuanLabels[0] ?? null,
    programBantuan2: record.programBantuan2 ?? kunjunganBantuanLabels[1] ?? null,
    programBantuan3: record.programBantuan3 ?? kunjunganBantuanLabels[2] ?? null,
    namaRelawan: record.namaRelawan ?? firstKunjungan?.namaRelawan ?? null,
    kontakRelawan: record.kontakRelawan ?? firstKunjungan?.kontakRelawan ?? null,
    createdAt: record.createdAt,
  };
}

// Helper cuma dipakai untuk susun MOCK_DTDOOR di bawah — bukan API publik file ini.
function buildMockDtdoor(
  id: number,
  namaLengkap: string,
  desa: string,
  kategoriId: number | null,
  kategoriLabel: string | null,
  createdAt: string,
): Dtdoor {
  return {
    id,
    nik: `320401010180${String(id).padStart(4, "0")}`,
    namaLengkap,
    tps: `TPS ${String((id % 5) + 1).padStart(2, "0")}`,
    rt: "01",
    rw: "02",
    desa,
    kecamatan: "Cileunyi",
    kabupaten: "Bandung",
    jenisKelamin: id % 2 === 0 ? "P" : "L",
    noTelpon: `0812-1000-${String(id).padStart(4, "0")}`,
    merchandise: null,
    kategoriId,
    kategoriLabel,
    jumlahWajibPilih: 2,
    programBantuan1: null,
    programBantuan2: null,
    programBantuan3: null,
    namaRelawan: "Yayat Hidayat",
    kontakRelawan: "0812-3456-7890",
    createdAt,
  };
}

// 21 entri (3 asli Feature 04 + 18 tambahan Feature "Kekuatan Wilayah", 2026-08-22)
// sebar di 4 kelurahan yang sama dengan MOCK_TIMSES (services/timses.ts) supaya
// konsisten lintas fitur — kategoriId divariasikan supaya tiap kelurahan jatuh ke
// tier Kuat/Sedang/Lemah yang berbeda (lihat lib/dtdoorScore.ts), meniru pola
// kekuatanwilayah.png (bukan angka persis, cuma arah tier-nya). id 3 (desa null)
// sengaja dipertahankan — mendemonstrasikan record yang dikecualikan dari agregasi
// per-kelurahan (tidak bisa dikelompokkan tanpa desa).
const MOCK_DTDOOR: Dtdoor[] = [
  {
    id: 1,
    nik: "3204010101800001",
    namaLengkap: "Ujang Supriadi",
    tps: "TPS 01",
    rt: "01",
    rw: "02",
    desa: "Cinunuk",
    kecamatan: "Cileunyi",
    kabupaten: "Bandung",
    jenisKelamin: "L",
    noTelpon: "0812-1111-2222",
    merchandise: "Kaos",
    kategoriId: 1,
    kategoriLabel: "Simpatisan",
    jumlahWajibPilih: 3,
    programBantuan1: "Sembako",
    programBantuan2: null,
    programBantuan3: null,
    namaRelawan: "Yayat Hidayat",
    kontakRelawan: "0812-3456-7890",
    createdAt: "2026-08-17T08:00:00Z",
  },
  {
    id: 2,
    nik: "3204010101800002",
    namaLengkap: "Euis Kartika",
    tps: "TPS 02",
    rt: "03",
    rw: "01",
    desa: "Cimekar",
    kecamatan: "Cileunyi",
    kabupaten: "Bandung",
    jenisKelamin: "P",
    noTelpon: "0812-3333-4444",
    merchandise: null,
    kategoriId: 3,
    kategoriLabel: "Relawan",
    jumlahWajibPilih: 2,
    programBantuan1: "Kesehatan",
    programBantuan2: "Pendidikan",
    programBantuan3: null,
    namaRelawan: "Yayat Hidayat",
    kontakRelawan: "0812-3456-7890",
    createdAt: "2026-08-18T09:30:00Z",
  },
  {
    id: 3,
    nik: null,
    namaLengkap: "Dedi Suherman",
    tps: null,
    rt: null,
    rw: null,
    desa: null,
    kecamatan: null,
    kabupaten: null,
    jenisKelamin: null,
    noTelpon: null,
    merchandise: null,
    kategoriId: 7,
    kategoriLabel: "Belum Menentukan",
    jumlahWajibPilih: 1,
    programBantuan1: null,
    programBantuan2: null,
    programBantuan3: null,
    namaRelawan: null,
    kontakRelawan: null,
    createdAt: "2026-08-19T10:15:00Z",
  },
  // Cileunyi Kulon — target tier Kuat
  buildMockDtdoor(4, "Rina Amelia Putri", "Cileunyi Kulon", 3, "Relawan", "2026-08-19T08:00:00Z"),
  buildMockDtdoor(5, "Ahmad Fauzan", "Cileunyi Kulon", 3, "Relawan", "2026-08-19T08:10:00Z"),
  buildMockDtdoor(6, "Siti Nur Hasanah", "Cileunyi Kulon", 2, "Simpatisan Aktif", "2026-08-19T08:20:00Z"),
  buildMockDtdoor(7, "Bambang Kurniawan", "Cileunyi Kulon", 4, "Saksi", "2026-08-19T08:30:00Z"),
  buildMockDtdoor(8, "Neneng Sari Dewi", "Cileunyi Kulon", 2, "Simpatisan Aktif", "2026-08-19T08:40:00Z"),
  // Cinunuk — target tier Kuat
  buildMockDtdoor(9, "Wawan Setiawan", "Cinunuk", 3, "Relawan", "2026-08-19T09:00:00Z"),
  buildMockDtdoor(10, "Yuli Astuti", "Cinunuk", 2, "Simpatisan Aktif", "2026-08-19T09:10:00Z"),
  buildMockDtdoor(11, "Deni Ramdani", "Cinunuk", 2, "Simpatisan Aktif", "2026-08-19T09:20:00Z"),
  buildMockDtdoor(12, "Lina Marlina", "Cinunuk", 5, "Tim Lain", "2026-08-19T09:30:00Z"),
  buildMockDtdoor(13, "Asep Hidayat", "Cinunuk", 4, "Saksi", "2026-08-19T09:40:00Z"),
  // Cimekar — target tier Sedang (id 2 di atas sudah 1 entri "Relawan" duluan, campur biar rata Sedang)
  buildMockDtdoor(14, "Mira Anggraini", "Cimekar", 5, "Tim Lain", "2026-08-19T10:00:00Z"),
  buildMockDtdoor(15, "Cecep Supriatna", "Cimekar", 1, "Simpatisan", "2026-08-19T10:10:00Z"),
  buildMockDtdoor(16, "Dewi Lestari", "Cimekar", 7, "Belum Menentukan", "2026-08-19T10:20:00Z"),
  buildMockDtdoor(17, "Iwan Gunawan", "Cimekar", 5, "Tim Lain", "2026-08-19T10:30:00Z"),
  // Cileunyi Wetan — target tier Lemah
  buildMockDtdoor(18, "Ujang Kosasih", "Cileunyi Wetan", 6, "Pemilih Kompetitor", "2026-08-19T11:00:00Z"),
  buildMockDtdoor(19, "Sri Wahyuni", "Cileunyi Wetan", 7, "Belum Menentukan", "2026-08-19T11:10:00Z"),
  buildMockDtdoor(20, "Agus Salim", "Cileunyi Wetan", 6, "Pemilih Kompetitor", "2026-08-19T11:20:00Z"),
  buildMockDtdoor(21, "Rita Purnama", "Cileunyi Wetan", 7, "Belum Menentukan", "2026-08-19T11:30:00Z"),
];

let mockDtdoorList: Dtdoor[] = [...MOCK_DTDOOR];
let mockNextId = mockDtdoorList.length + 1;

async function fetchDtdoorListMock(page: number, limit: number): Promise<DtdoorListResponse> {
  await mockDelay();
  const start = (page - 1) * limit;
  const data = mockDtdoorList.slice(start, start + limit);
  return {
    data,
    total: mockDtdoorList.length,
    page,
    totalPage: Math.max(1, Math.ceil(mockDtdoorList.length / limit)),
    limit,
  };
}

export async function fetchDtdoorList(page: number, limit: number): Promise<DtdoorListResponse> {
  if (isMockApiEnabled()) {
    return fetchDtdoorListMock(page, limit);
  }
  try {
    // Path root `/dtdoor` (BUKAN `/dtdoor/data` — path lama sudah tidak ada,
    // balas 404). Lihat api-standards.md § dtdoor untuk verifikasi lengkap.
    const { data: body } = await apiClient.get<DtdoorApiListEnvelope>("/dtdoor", {
      params: { page, limit },
    });
    return {
      data: body.data.map(mapDtdoor),
      total: body.meta.total,
      page: body.meta.page,
      totalPage: body.meta.totalPages,
      limit: body.meta.limit,
    };
  } catch (error) {
    console.error("[services/dtdoor/fetchDtdoorList]", error);
    throw new Error("Gagal memuat daftar kunjungan. Coba lagi.");
  }
}

async function fetchDtdoorAllMock(): Promise<Dtdoor[]> {
  await mockDelay();
  return mockDtdoorList;
}

// Fetch penuh tanpa pagination — dipakai fitur "Kekuatan Wilayah" untuk agregasi
// per-kelurahan (butuh SEMUA record, bukan 1 halaman). Tidak ada endpoint agregat
// asli yang terkonfirmasi (grep "skor"/"score"/"kekuatan" di backend nihil) —
// cabang API asli sengaja throw, bukan menebak endpoint (Aturan #6 CLAUDE.md).
export async function fetchDtdoorAll(): Promise<Dtdoor[]> {
  if (isMockApiEnabled()) {
    return fetchDtdoorAllMock();
  }
  throw new Error("Endpoint agregat Dtdoor belum dikonfirmasi. Aktifkan EXPO_PUBLIC_USE_MOCK_API=true untuk mode demo.");
}

async function fetchDtdoorCountMock(): Promise<number> {
  await mockDelay();
  return mockDtdoorList.length;
}

export async function fetchDtdoorCount(): Promise<number> {
  if (isMockApiEnabled()) {
    return fetchDtdoorCountMock();
  }
  try {
    // GET /dtdoor/count SUDAH TIDAK ADA di controller (dikonfirmasi baca
    // dtdoor.controller.ts, tidak ada route ini sama sekali) — diganti derive
    // dari `meta.total` hasil GET /dtdoor?limit=1 (fetch termurah yang masih
    // memberi angka total asli, bukan tebakan).
    const { data: body } = await apiClient.get<DtdoorApiListEnvelope>("/dtdoor", {
      params: { page: 1, limit: 1 },
    });
    return body.meta.total;
  } catch (error) {
    console.error("[services/dtdoor/fetchDtdoorCount]", error);
    throw new Error("Gagal memuat jumlah kunjungan. Coba lagi.");
  }
}

async function fetchDtdoorLookupsMock(): Promise<{
  tipePemilih: DtdoorLookupOption[];
  pilihanPileg: PilihanPilegOption[];
  programBantuan: DtdoorLookupOption[];
}> {
  await mockDelay();
  return {
    tipePemilih: KATEGORI_DTDOOR_OPTIONS.map((option) => ({ id: option.id, nama: option.label })),
    pilihanPileg: ["A", "B", "C", "D", "E", "F", "G"].map((label, index) => ({
      id: index + 1,
      nameKategori: label,
    })),
    programBantuan: [
      "Kesehatan",
      "Olahraga",
      "Pendidikan",
      "Pertanian",
      "Rutilahu",
      "Sembako",
      "UMKM",
      "Lainnya",
    ].map((nama, index) => ({ id: index + 1, nama })),
  };
}

// 3 endpoint lookup BARU (dikonfirmasi live 2026-08-23) yang wajib diisi
// mengisi dropdown "Kunjungans" di form create — dulu dikira tidak ada
// endpoint lookup sama sekali untuk kategori/program bantuan, ternyata ada,
// cuma bentuknya beda dari yang didokumentasikan sebelumnya (lihat
// api-standards.md § dtdoor).
export async function fetchDtdoorLookups(): Promise<{
  tipePemilih: DtdoorLookupOption[];
  pilihanPileg: PilihanPilegOption[];
  programBantuan: DtdoorLookupOption[];
}> {
  if (isMockApiEnabled()) {
    return fetchDtdoorLookupsMock();
  }
  try {
    const [tipePemilihRes, pilihanPilegRes, programBantuanRes] = await Promise.all([
      apiClient.get<{ data: DtdoorLookupOption[] }>("/dtdoor/tipe-pemilih"),
      apiClient.get<{ data: PilihanPilegOption[] }>("/dtdoor/pilihan-pileg"),
      apiClient.get<{ data: DtdoorLookupOption[] }>("/dtdoor/program-bantuans"),
    ]);
    return {
      tipePemilih: tipePemilihRes.data.data,
      pilihanPileg: pilihanPilegRes.data.data,
      programBantuan: programBantuanRes.data.data,
    };
  } catch (error) {
    console.error("[services/dtdoor/fetchDtdoorLookups]", error);
    throw new Error("Gagal memuat daftar pilihan kunjungan. Coba lagi.");
  }
}

async function createDtdoorMock(input: CreateDtdoorInput): Promise<Dtdoor> {
  await mockDelay();
  const firstKunjungan = input.kunjungans[0];
  const created: Dtdoor = {
    id: mockNextId++,
    nik: input.nik,
    namaLengkap: input.namaLengkap,
    tps: input.tps,
    rt: input.rt,
    rw: input.rw,
    desa: input.desa,
    kecamatan: input.kecamatan,
    kabupaten: input.kabupaten,
    jenisKelamin: input.jenisKelamin,
    noTelpon: input.noTelpon ?? null,
    merchandise: firstKunjungan.merchendise,
    kategoriId: firstKunjungan.tipePemilihId,
    kategoriLabel:
      KATEGORI_DTDOOR_OPTIONS.find((option) => option.id === firstKunjungan.tipePemilihId)?.label ?? null,
    jumlahWajibPilih: input.jumlahWajibPilih,
    programBantuan1: null,
    programBantuan2: null,
    programBantuan3: null,
    namaRelawan: firstKunjungan.namaRelawan,
    kontakRelawan: firstKunjungan.kontakRelawan ?? null,
    createdAt: new Date().toISOString(),
  };
  mockDtdoorList = [created, ...mockDtdoorList];
  return created;
}

// 2026-08-23: schema create baru total (lihat types/dtdoor.ts § CreateDtdoorInput
// & api-standards.md § dtdoor) — field flat camelCase + array `kunjungans`
// wajib diisi minimal 1, ganti total dari body snake_case lama.
export async function createDtdoor(input: CreateDtdoorInput): Promise<Dtdoor> {
  if (isMockApiEnabled()) {
    return createDtdoorMock(input);
  }
  try {
    const body = {
      nik: input.nik,
      namaLengkap: input.namaLengkap,
      desa: input.desa,
      kecamatan: input.kecamatan,
      kabupaten: input.kabupaten,
      tps: input.tps,
      rt: input.rt,
      rw: input.rw,
      jenisKelamin: input.jenisKelamin,
      noTelpon: input.noTelpon,
      jumlahWajibPilih: input.jumlahWajibPilih,
      kunjungans: input.kunjungans,
      // Terhubung ke DPT (input.idDpt/kabId/kelId terisi) -> pakai nilai asli
      // record itu. Standalone (tanpa DPT) -> fallback idDpt sintetis unik +
      // kabId/kelId default Bantaeng (satu-satunya kabupaten dengan data DPT
      // nyata, lihat STANDALONE_KAB_ID di atas) supaya tidak crash 500 di
      // lookup WilKab2024 backend.
      idDpt: input.idDpt ?? generateSyntheticIdDptNumber(),
      kabId: input.kabId ?? STANDALONE_KAB_ID,
      kelId: input.kelId ?? STANDALONE_KEL_ID,
      // WAJIB null eksplisit, BUKAN diomit — DtdoorService.create() (backend)
      // build `Dtdoor.findOne({where:{...,kepalaKeluargaId: createDtdoorDto.kepalaKeluargaId}}})`
      // tanpa guard, dan Sequelize throw "has invalid undefined value" kalau
      // key ini absen dari body (bukan 422 yang rapi, langsung crash 500).
      // `null` valid (jadi `IS NULL` di SQL) karena field opsional di DTO
      // (`@IsOptional()`) tetap meloloskan null. Belum ada UI pilih Kepala
      // Keluarga di form standalone ini (butuh linkage DPT asli).
      kepalaKeluarga: null,
      kepalaKeluargaId: null,
    };
    const { data: envelope } = await apiClient.post<{ message: string; data: DtdoorApiRecord }>(
      "/dtdoor",
      body,
    );
    return mapDtdoor(envelope.data);
  } catch (error) {
    console.error("[services/dtdoor/createDtdoor]", error);
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message;
      throw new Error(typeof message === "string" ? message : "Gagal menyimpan kunjungan. Coba lagi.");
    }
    throw new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
  }
}
