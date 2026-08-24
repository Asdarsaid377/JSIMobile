import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  CreateIsuAspirasiInput,
  CreateIsuJanjiInput,
  IsuAspirasi,
  IsuAspirasiSnapshot,
  IsuJanji,
  UpdateIsuAspirasiInput,
  UpdateIsuJanjiInput,
} from "@/types/isuaspirasi";

// Modul backend `isuaspirasi` (src/isuaspirasi/) sekarang ADA — dikonfirmasi
// 2026-08-24 baca isuaspirasi.controller.ts/service.ts/dto/model (cocok 1:1
// dengan spec yang diajukan, tidak ada gap) + live curl ke backend LOKAL
// (semua route balas 401 Unauthorized, BUKAN 404 — route ADA & ter-guard).
// WIRED penuh: READ (3 GET digabung 1 snapshot) + PATCH status/dijadikanMateri
// + POST /isuaspirasi ("+ Catat Aspirasi Warga") + CRUD penuh
// /isuaspirasi/janji (usulan materi kampanye) — 2 form terakhir dibangun
// TANPA referensi visual (izin eksplisit user 2026-08-24, Aturan #1), lihat
// IsuAspirasiFormScreen.tsx/IsuJanjiFormScreen.tsx.

type IsuAspirasiApiRecord = {
  id: number;
  warga: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  kategori: string;
  keluhan: string;
  status: IsuAspirasi["status"];
  dijadikanMateri: boolean;
  createdAt: string;
  relawan?: { id: number; namaLengkap: string } | null;
};

type IsuJanjiApiRecord = {
  id: number;
  janji: string;
  dampak: IsuJanji["dampak"];
  dasar: string;
  wilayah: string;
};

type IsuSummaryApiRecord = {
  totalAspirasi: number;
  isuDominan: string;
  ringkasanSumber: string;
  kategori: IsuAspirasiSnapshot["kategori"];
  petaWilayah: IsuAspirasiSnapshot["petaWilayah"];
};

// laporanSerupa dihitung di sini (bukan dibalas backend) — jumlah record LAIN
// dengan kategori+desa yang sama, pola judgment call yang sudah didokumentasikan
// ke user saat prompt spec backend diajukan (lihat api-standards.md).
function mapIsuAspirasiList(records: IsuAspirasiApiRecord[]): IsuAspirasi[] {
  return records.map((record) => ({
    id: record.id,
    warga: record.warga,
    alamat: record.alamat,
    kecamatan: record.kecamatan,
    desa: record.desa,
    kategori: record.kategori,
    keluhan: record.keluhan,
    relawan: record.relawan?.namaLengkap ?? "-",
    tanggal: record.createdAt,
    status: record.status,
    dijadikanMateri: record.dijadikanMateri,
    laporanSerupa: records.filter(
      (other) => other.id !== record.id && other.kategori === record.kategori && other.desa === record.desa,
    ).length,
  }));
}

function mapIsuJanji(record: IsuJanjiApiRecord): IsuJanji {
  return { id: record.id, janji: record.janji, dampak: record.dampak, dasar: record.dasar, wilayah: record.wilayah };
}

async function fetchIsuAspirasiSnapshotReal(): Promise<IsuAspirasiSnapshot> {
  try {
    const [aspirasiRes, janjiRes, summaryRes] = await Promise.all([
      apiClient.get<{ data: IsuAspirasiApiRecord[] }>("/isuaspirasi"),
      apiClient.get<{ data: IsuJanjiApiRecord[] }>("/isuaspirasi/janji"),
      apiClient.get<{ data: IsuSummaryApiRecord }>("/isuaspirasi/summary"),
    ]);
    return {
      ...summaryRes.data.data,
      janji: janjiRes.data.data.map(mapIsuJanji),
      aspirasi: mapIsuAspirasiList(aspirasiRes.data.data),
    };
  } catch (error) {
    console.error("[services/isuaspirasi/fetchIsuAspirasiSnapshot]", error);
    throw new Error("Gagal memuat data isu & aspirasi. Coba lagi.");
  }
}

async function updateIsuAspirasiReal({ id, ...body }: UpdateIsuAspirasiInput): Promise<void> {
  try {
    await apiClient.patch(`/isuaspirasi/${id}`, body);
  } catch (error) {
    console.error("[services/isuaspirasi/updateIsuAspirasi]", error);
    throw new Error("Gagal memperbarui aspirasi. Coba lagi.");
  }
}

// userId (relawan) TIDAK dikirim di body — backend ambil dari JWT via
// @User(), pola sama createRivalAktivitas.
async function createIsuAspirasiReal(input: CreateIsuAspirasiInput): Promise<void> {
  try {
    await apiClient.post("/isuaspirasi", input);
  } catch (error) {
    console.error("[services/isuaspirasi/createIsuAspirasi]", error);
    throw new Error("Gagal mencatat aspirasi warga. Coba lagi.");
  }
}

async function createIsuJanjiReal(input: CreateIsuJanjiInput): Promise<void> {
  try {
    await apiClient.post("/isuaspirasi/janji", input);
  } catch (error) {
    console.error("[services/isuaspirasi/createIsuJanji]", error);
    throw new Error("Gagal menyimpan usulan materi. Coba lagi.");
  }
}

async function updateIsuJanjiReal({ id, ...body }: UpdateIsuJanjiInput): Promise<void> {
  try {
    await apiClient.patch(`/isuaspirasi/janji/${id}`, body);
  } catch (error) {
    console.error("[services/isuaspirasi/updateIsuJanji]", error);
    throw new Error("Gagal memperbarui usulan materi. Coba lagi.");
  }
}

async function deleteIsuJanjiReal(id: number): Promise<void> {
  try {
    await apiClient.delete(`/isuaspirasi/janji/${id}`);
  } catch (error) {
    console.error("[services/isuaspirasi/deleteIsuJanji]", error);
    throw new Error("Gagal menghapus usulan materi. Coba lagi.");
  }
}

// --- Dataset demo (EXPO_PUBLIC_USE_MOCK_API=true) ---
// 4 kelurahan sama dengan yang dipakai fitur lain (QuickCount/Tokoh/Kekuatan
// Wilayah, Kec. Cileunyi) — konsisten dataset demo lintas fitur. Relawan
// (Asep Saepudin/Neng Sari/Mira Anggraini/Dedi Kurniawan) reuse nama dari
// MOCK_SNAPSHOT antifraud.ts supaya nyambung logis. `let` (bukan `const`) —
// mutable, mock update beneran mengubah array in-memory ini, pola sama
// services/rivalcaleg.ts.
let mockAspirasiList: IsuAspirasi[] = [
  {
    id: 1,
    warga: "Warga RT 03",
    alamat: "Jl. Cikuda, Cileunyi Kulon",
    kecamatan: "Cileunyi",
    desa: "Cileunyi Kulon",
    kategori: "Jalan",
    keluhan: "Jalan rusak parah sejak musim hujan, motor sering jatuh di lubang besar dekat gang.",
    relawan: "Asep Saepudin",
    tanggal: "2026-08-20",
    status: "Baru",
    dijadikanMateri: false,
    laporanSerupa: 14,
  },
  {
    id: 2,
    warga: "Ibu Yayah",
    alamat: "Kp. Cibiru, Cinunuk",
    kecamatan: "Cileunyi",
    desa: "Cinunuk",
    kategori: "Air",
    keluhan: "Sudah 2 minggu air PAM mati total, warga terpaksa beli air galon tiap hari.",
    relawan: "Neng Sari",
    tanggal: "2026-08-19",
    status: "Ditindak",
    dijadikanMateri: false,
    laporanSerupa: 9,
  },
  {
    id: 3,
    warga: "Pak Ujang",
    alamat: "Kp. Awilarangan, Cileunyi Wetan",
    kecamatan: "Cileunyi",
    desa: "Cileunyi Wetan",
    kategori: "Pupuk",
    keluhan: "Harga pupuk subsidi naik dan sulit dicari menjelang musim tanam.",
    relawan: "Mira Anggraini",
    tanggal: "2026-08-18",
    status: "Baru",
    dijadikanMateri: false,
    laporanSerupa: 6,
  },
  {
    id: 4,
    warga: "Ibu Rini",
    alamat: "Jl. Padasuka, Cimekar",
    kecamatan: "Cileunyi",
    desa: "Cimekar",
    kategori: "Kesehatan",
    keluhan: "Posyandu tidak buka rutin, jarak ke puskesmas terdekat cukup jauh untuk balita.",
    relawan: "Dedi Kurniawan",
    tanggal: "2026-08-17",
    status: "Selesai",
    dijadikanMateri: false,
    laporanSerupa: 3,
  },
  {
    id: 5,
    warga: "Pak Dadan",
    alamat: "Jl. Cileunyi Raya, Cileunyi Kulon",
    kecamatan: "Cileunyi",
    desa: "Cileunyi Kulon",
    kategori: "Jalan",
    keluhan: "Lampu jalan mati total sejak sebulan, rawan kecelakaan saat malam hari.",
    relawan: "Asep Saepudin",
    tanggal: "2026-08-16",
    status: "Baru",
    dijadikanMateri: false,
    laporanSerupa: 11,
  },
];
let mockAspirasiNextId = 6;

// Ringkasan/kategori/petaWilayah/janji sengaja TIDAK dihitung dari
// mockAspirasiList di atas (beda dari backend real) — angka-angka ini demo
// flavor text yang sudah dikurasi manual sejak awal fitur ini dibuat, tidak
// perlu konsisten sampai ke desimal dengan 5 baris demo `aspirasi[]`.
const MOCK_SUMMARY: Omit<IsuAspirasiSnapshot, "aspirasi" | "janji"> = {
  totalAspirasi: 1284,
  isuDominan: "Jalan Rusak",
  ringkasanSumber: "Dari 245 kunjungan D2D di 4 kelurahan · 68% warga menyebut isu infrastruktur",
  kategori: [
    { nama: "Jalan Rusak", jumlah: 412, wilayahTerkuat: "Cileunyi Kulon" },
    { nama: "Air Bersih", jumlah: 268, wilayahTerkuat: "Cinunuk" },
    { nama: "Pupuk & Pertanian", jumlah: 195, wilayahTerkuat: "Cileunyi Wetan" },
    { nama: "Kesehatan", jumlah: 158, wilayahTerkuat: "Cimekar" },
    { nama: "Pendidikan", jumlah: 132, wilayahTerkuat: "Cinunuk" },
    { nama: "Ekonomi & UMKM", jumlah: 119, wilayahTerkuat: "Cileunyi Kulon" },
  ],
  petaWilayah: [
    { nama: "Cileunyi Kulon", totalAspirasi: 356, isuDominan: "Jalan Rusak", level: "tinggi" },
    { nama: "Cinunuk", totalAspirasi: 298, isuDominan: "Air Bersih", level: "tinggi" },
    { nama: "Cileunyi Wetan", totalAspirasi: 341, isuDominan: "Pupuk & Pertanian", level: "sedang" },
    { nama: "Cimekar", totalAspirasi: 289, isuDominan: "Jalan Rusak", level: "sedang" },
  ],
};

let mockJanjiList: IsuJanji[] = [
  {
    id: 1,
    janji: "Program Perbaikan Jalan Lingkungan Bertahap",
    dampak: "Prioritas Tinggi",
    dasar: "412 aspirasi menyebut kondisi jalan rusak, mayoritas dari Cileunyi Kulon dan Cinunuk.",
    wilayah: "Cileunyi Kulon",
  },
  {
    id: 2,
    janji: "Bantuan Sumur Bor & Perbaikan Saluran Air Bersih",
    dampak: "Prioritas Tinggi",
    dasar: "268 aspirasi soal krisis air bersih, terutama menjelang musim kemarau.",
    wilayah: "Cinunuk",
  },
  {
    id: 3,
    janji: "Subsidi Pupuk & Pendampingan Kelompok Tani",
    dampak: "Prioritas Sedang",
    dasar: "195 aspirasi petani soal harga dan kelangkaan pupuk bersubsidi.",
    wilayah: "Cileunyi Wetan",
  },
];
let mockJanjiNextId = 4;

async function fetchIsuAspirasiSnapshotMock(): Promise<IsuAspirasiSnapshot> {
  await mockDelay();
  return { ...MOCK_SUMMARY, janji: mockJanjiList, aspirasi: mockAspirasiList };
}

async function updateIsuAspirasiMock({ id, ...input }: UpdateIsuAspirasiInput): Promise<void> {
  await mockDelay();
  mockAspirasiList = mockAspirasiList.map((item) => (item.id === id ? { ...item, ...input } : item));
}

// relawan (nama user sesi aktif) parameter terpisah, cuma dipakai mock — real
// branch backend ambil dari JWT, pola sama createRivalAktivitas(input, pelapor).
async function createIsuAspirasiMock(input: CreateIsuAspirasiInput, relawan: string): Promise<void> {
  await mockDelay();
  mockAspirasiList = [
    ...mockAspirasiList,
    {
      id: mockAspirasiNextId++,
      ...input,
      relawan,
      tanggal: new Date().toISOString().slice(0, 10),
      status: "Baru",
      dijadikanMateri: false,
      laporanSerupa: 0,
    },
  ];
}

async function createIsuJanjiMock(input: CreateIsuJanjiInput): Promise<void> {
  await mockDelay();
  mockJanjiList = [...mockJanjiList, { id: mockJanjiNextId++, ...input }];
}

async function updateIsuJanjiMock({ id, ...input }: UpdateIsuJanjiInput): Promise<void> {
  await mockDelay();
  mockJanjiList = mockJanjiList.map((item) => (item.id === id ? { ...item, ...input } : item));
}

async function deleteIsuJanjiMock(id: number): Promise<void> {
  await mockDelay();
  mockJanjiList = mockJanjiList.filter((item) => item.id !== id);
}

export async function fetchIsuAspirasiSnapshot(): Promise<IsuAspirasiSnapshot> {
  if (isMockApiEnabled()) return fetchIsuAspirasiSnapshotMock();
  return fetchIsuAspirasiSnapshotReal();
}

export async function updateIsuAspirasi(input: UpdateIsuAspirasiInput): Promise<void> {
  if (isMockApiEnabled()) return updateIsuAspirasiMock(input);
  return updateIsuAspirasiReal(input);
}

export async function createIsuAspirasi(input: CreateIsuAspirasiInput, relawan: string): Promise<void> {
  if (isMockApiEnabled()) return createIsuAspirasiMock(input, relawan);
  return createIsuAspirasiReal(input);
}

export async function createIsuJanji(input: CreateIsuJanjiInput): Promise<void> {
  if (isMockApiEnabled()) return createIsuJanjiMock(input);
  return createIsuJanjiReal(input);
}

export async function updateIsuJanji(input: UpdateIsuJanjiInput): Promise<void> {
  if (isMockApiEnabled()) return updateIsuJanjiMock(input);
  return updateIsuJanjiReal(input);
}

export async function deleteIsuJanji(id: number): Promise<void> {
  if (isMockApiEnabled()) return deleteIsuJanjiMock(id);
  return deleteIsuJanjiReal(id);
}
