import axios from "axios";

import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import { generateSyntheticIdDpt } from "@/lib/api/syntheticId";
import type { CreateGotvInput, Gotv, GotvListResponse } from "@/types/gotv";

// Shape confirmed against /Users/asdarsaid/JSI/api/src/gotv/entities/gotv.entity.ts
type GotvApiRecord = {
  id: number;
  nik: string | null;
  nama_lengkap: string;
  nama_kegiatan: string;
  tps: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  no_telpon: string | null;
  jumlah_wajib_pilih: number;
  created_at: string;
};

function mapGotv(record: GotvApiRecord): Gotv {
  return {
    id: record.id,
    nik: record.nik,
    namaLengkap: record.nama_lengkap,
    namaKegiatan: record.nama_kegiatan,
    tps: record.tps,
    desa: record.desa,
    kecamatan: record.kecamatan,
    kabupaten: record.kabupaten,
    noTelpon: record.no_telpon,
    jumlahWajibPilih: record.jumlah_wajib_pilih,
    createdAt: record.created_at,
  };
}

const MOCK_GOTV: Gotv[] = [
  {
    id: 1,
    nik: null,
    namaLengkap: "Mira Anggraini",
    namaKegiatan: "Sosialisasi Program Kesehatan",
    tps: "TPS 01",
    desa: "Cimekar",
    kecamatan: "Cileunyi",
    kabupaten: "Bandung",
    noTelpon: "0812-5555-6666",
    jumlahWajibPilih: 82,
    createdAt: "2026-08-17T08:00:00Z",
  },
  {
    id: 2,
    nik: null,
    namaLengkap: "Asep Saepudin",
    namaKegiatan: "Bagi Sembako",
    tps: "TPS 03",
    desa: "Cinunuk",
    kecamatan: "Cileunyi",
    kabupaten: "Bandung",
    noTelpon: "0812-7777-8888",
    jumlahWajibPilih: 120,
    createdAt: "2026-08-20T09:00:00Z",
  },
];

let mockGotvList: Gotv[] = [...MOCK_GOTV];
let mockNextId = mockGotvList.length + 1;

async function fetchGotvListMock(page: number, limit: number): Promise<GotvListResponse> {
  await mockDelay();
  const start = (page - 1) * limit;
  const data = mockGotvList.slice(start, start + limit);
  return {
    data,
    total: mockGotvList.length,
    page,
    totalPage: Math.max(1, Math.ceil(mockGotvList.length / limit)),
    limit,
  };
}

export async function fetchGotvList(page: number, limit: number): Promise<GotvListResponse> {
  if (isMockApiEnabled()) {
    return fetchGotvListMock(page, limit);
  }
  try {
    // Path root `/gotv` (BUKAN `/gotv/data` — path lama sudah tidak ada, 404).
    // GoTvService.get() (backend) pakai findAll() biasa, BUKAN findAndCountAll —
    // response TIDAK punya total/page/totalPage sama sekali (beda dari dtdoor
    // yang punya `meta`), cuma array data mentah. Lihat api-standards.md § gotv.
    const { data: body } = await apiClient.get<{ message: string; data: GotvApiRecord[] }>(
      "/gotv",
      { params: { page, limit } },
    );
    const rows = body.data;
    return {
      data: rows.map(mapGotv),
      total: (page - 1) * limit + rows.length,
      page,
      // Tidak ada total count asli dari backend — infer dari jumlah baris yang
      // balik: kalau persis `limit`, anggap masih ada halaman berikutnya.
      totalPage: rows.length < limit ? page : page + 1,
      limit,
    };
  } catch (error) {
    console.error("[services/gotv/fetchGotvList]", error);
    throw new Error("Gagal memuat daftar kegiatan. Coba lagi.");
  }
}

async function fetchGotvCountMock(): Promise<number> {
  await mockDelay();
  return mockGotvList.length;
}

export async function fetchGotvCount(): Promise<number> {
  if (isMockApiEnabled()) {
    return fetchGotvCountMock();
  }
  try {
    // GET /gotv/count dibungkus { message, data } oleh TransformInterceptor
    // global (dikonfirmasi baca gotv.controller.ts — apiResponse('Gotv Count', ...)),
    // BUKAN angka mentah seperti asumsi lama.
    const { data: body } = await apiClient.get<{ message: string; data: number }>("/gotv/count");
    const count = body.data;
    if (typeof count !== "number" || Number.isNaN(count)) {
      throw new Error("Format data jumlah kegiatan tidak dikenali.");
    }
    return count;
  } catch (error) {
    console.error("[services/gotv/fetchGotvCount]", error);
    throw new Error("Gagal memuat jumlah kegiatan. Coba lagi.");
  }
}

async function createGotvMock(input: CreateGotvInput): Promise<Gotv> {
  await mockDelay();
  const created: Gotv = {
    id: mockNextId++,
    nik: input.nik ?? null,
    namaLengkap: input.namaLengkap,
    namaKegiatan: input.namaKegiatan,
    tps: input.tps,
    desa: input.desa,
    kecamatan: input.kecamatan,
    kabupaten: input.kabupaten,
    noTelpon: input.noTelpon ?? null,
    jumlahWajibPilih: input.jumlahWajibPilih,
    createdAt: new Date().toISOString(),
  };
  mockGotvList = [created, ...mockGotvList];
  return created;
}

export async function createGotv(input: CreateGotvInput): Promise<Gotv> {
  if (isMockApiEnabled()) {
    return createGotvMock(input);
  }
  try {
    // POST /gotv (GotvController.create) lookup by idDpt SEBELUM insert —
    // beda dari dtdoor (yang upsert diam-diam), gotv langsung throw error
    // "DPT telah di input sebelumnya" (404) kalau ada match. Karena idDpt
    // kosong/undefined bikin lookup match row APAPUN yang sudah ada (where
    // kosong = ambil row pertama), tanpa idDpt sintetis yang unik setiap
    // create kedua dst. akan SELALU gagal dengan error palsu itu. Lihat
    // src/lib/api/syntheticId.ts.
    // tps: DTO backend decorate `@IsNumber()` (meski konsepnya string TPS) —
    // CustomValidationPipe global auto-convert string numerik ke number,
    // KECUALI diawali nol ("01" dipertahankan sebagai string oleh
    // checkIfZeroPaddedString, lalu gagal @IsNumber() — dikonfirmasi live
    // curl). Strip leading zero di sini supaya selalu lolos jalur konversi.
    const tpsNumeric = Number(input.tps);
    const body = {
      nama_lengkap: input.namaLengkap,
      nama_kegiatan: input.namaKegiatan,
      tps: Number.isNaN(tpsNumeric) ? input.tps : String(tpsNumeric),
      desa: input.desa,
      kecamatan: input.kecamatan,
      kabupaten: input.kabupaten,
      jumlah_wajib_pilih: input.jumlahWajibPilih,
      // nik WAJIB terisi di level database (NOT NULL tanpa default — beda dari
      // DTO yang menandainya optional, dikonfirmasi live via error SQL mentah
      // "Field 'nik' doesn't have a default value") — GotvFormScreen sekarang
      // mewajibkan field ini juga.
      nik: input.nik,
      // DTO backend decorate `@IsNumberString()` (angka murni, TIDAK terima
      // strip "-"/spasi) — dikonfirmasi live curl 2026-08-24, lihat
      // api-standards.md § gotv. Strip semua karakter non-digit sebelum kirim.
      no_telpon: input.noTelpon.replace(/\D/g, ""),
      // Terhubung ke DPT ("Tandai ikut Social Event", 2026-08-24) -> idDpt/kabId
      // asli record itu, supaya join balik dpt.gotv match (lihat
      // /Users/asdarsaid/JSI/api/src/dpt/dpt.service.ts: GoTV.findAll({where:
      // {kabId: wilKab.wilId, idDpt: {[Op.in]: dptsIds}}})). Standalone -> idDpt
      // sintetis unik + kabId null eksplisit (BUKAN diomit — GoTvController.insert()
      // build findOne({where:{idDpt,kabId}}) tanpa guard, Sequelize throw "has
      // invalid undefined value" kalau key ini absen, pola bug sama persis dengan
      // kepalaKeluargaId di dtdoor).
      idDpt: input.idDpt !== undefined ? String(input.idDpt) : generateSyntheticIdDpt(),
      kabId: input.kabId ?? null,
    };
    // Beda dari dtdoor/timses: GotvService.create() balas entity hasil
    // create() langsung (bukan UpdateResult), jadi tidak perlu fetch ulang.
    // Dibungkus { message, data } oleh TransformInterceptor global — sama
    // pola dengan seluruh endpoint lain (lihat api-standards.md § gotv).
    const { data: envelope } = await apiClient.post<{ message: string; data: GotvApiRecord }>(
      "/gotv",
      body,
    );
    return mapGotv(envelope.data);
  } catch (error) {
    console.error("[services/gotv/createGotv]", error);
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message;
      throw new Error(typeof message === "string" ? message : "Gagal menyimpan kegiatan. Coba lagi.");
    }
    throw new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
  }
}
