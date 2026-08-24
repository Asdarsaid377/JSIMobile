import { apiClient } from "@/lib/api/client";
import { isMockApiEnabled, mockDelay } from "@/lib/api/mock";
import type {
  CreateRivalAktivitasInput,
  CreateRivalCalegInput,
  CreateRivalWilayahInput,
  RivalAktivitas,
  RivalAncamanLevel,
  RivalCalegSummary,
  RivalDeteksiSnapshot,
  RivalKekuatanItem,
  RivalTren,
  RivalWilayahPeta,
  RivalWilayahStatus,
  UpdateRivalCalegInput,
  UpdateRivalWilayahInput,
} from "@/types/rivalcaleg";

// Modul backend `rivalcaleg` (src/rivalcaleg/) sekarang ADA — dikonfirmasi
// 2026-08-24 baca rivalcaleg.controller.ts/service.ts/dto/model (cocok 1:1
// dengan spec yang diajukan, tidak ada gap) + live curl ke backend LOKAL
// (semua route balas 401 Unauthorized, BUKAN 404 — route ADA & ter-guard).
// WIRED penuh. Endpoint dipecah 4 resource (caleg/wilayah/aktivitas/summary)
// — dipanggil paralel & digabung jadi 1 RivalDeteksiSnapshot supaya
// RivalCalegScreen.tsx & component turunannya TIDAK PERLU diubah sama sekali.
// 2026-08-24 (lanjutan) — CRUD (tambah/edit/hapus) ditambah: semua role login
// boleh mutasi (keputusan eksplisit user, pola sama Dtdoor/Gotv/Tokoh — field
// intel, bukan kontrol finansial admin-only seperti Budget Plafon/Approval).

type RivalCalegApiRecord = {
  id: number;
  namaLengkap: string;
  partai: string;
  noUrut: number;
  isKita: boolean;
  ancaman: RivalAncamanLevel;
  basis: string | null;
  estimasiSuara: number;
  suara2024: number | null;
  tren: RivalTren | null;
  wilayahBentrok: string | null;
  tokohBerpihak: string | null;
  isuDiangkat: string | null;
  strategi: string | null;
};

type RivalWilayahApiRecord = {
  id: number;
  nama: string;
  rivalPenantang: string | null;
  status: RivalWilayahStatus;
};

type RivalAktivitasApiRecord = {
  id: number;
  rivalCalegId: number;
  jenis: string;
  deskripsi: string;
  wilayah: string;
  tanggal: string;
  userId: number;
  rival?: { id: number; namaLengkap: string } | null;
  pelapor?: { id: number; namaLengkap: string } | null;
};

type RivalSummaryApiRecord = {
  totalTerpetakan: number;
  posisiKita: string;
  ancamanTinggiCount: number;
  wilayahBentrokCount: number;
  selisihKePeringkat1Pct: number;
};

// Field nullable (basis/suara2024/tren/dst.) — semuanya opsional di
// CreateRivalCalegDto, rival yang baru dicatat bisa saja belum diisi lengkap.
// Fallback di sini murni supaya UI tidak menampilkan "undefined"/kosong.
function mapRivalCalegToSummary(record: RivalCalegApiRecord): RivalCalegSummary {
  return {
    id: record.id,
    namaLengkap: record.namaLengkap,
    partai: record.partai,
    noUrut: record.noUrut,
    isKita: record.isKita,
    ancaman: record.ancaman ?? "sedang",
    basis: record.basis ?? "-",
    estimasiSuara: record.estimasiSuara ?? 0,
    wilayahBentrok: record.wilayahBentrok ?? "-",
    suara2024: record.suara2024 ?? 0,
    tren: record.tren ?? "stabil",
    tokohBerpihak: record.tokohBerpihak ?? "-",
    isuDiangkat: record.isuDiangkat ?? "-",
    strategi: record.strategi ?? "Belum ada rekomendasi strategi.",
  };
}

// pct dihitung relatif terhadap estimasiSuara TERTINGGI di list (termasuk
// baris kita) — backend cuma balas angka mentah, tidak ada field pct siap
// pakai (beda dari r.pctStr di canvas yang murni placeholder view-model).
function mapRivalCalegListToKekuatan(records: RivalCalegApiRecord[]): RivalKekuatanItem[] {
  const max = records.reduce((m, r) => Math.max(m, r.estimasiSuara ?? 0), 0);
  return records.map((r) => ({
    ...mapRivalCalegToSummary(r),
    pct: max > 0 ? Math.round(((r.estimasiSuara ?? 0) / max) * 100) : 0,
  }));
}

function mapRivalWilayah(record: RivalWilayahApiRecord): RivalWilayahPeta {
  return { id: record.id, nama: record.nama, rivalPenantang: record.rivalPenantang ?? "-", status: record.status };
}

// pelapor null kalau relasi user putus (harusnya tidak pernah terjadi, userId
// wajib di DTO) — fallback pola sama services/budgeting.ts mapBudgetTransaction.
function mapRivalAktivitas(record: RivalAktivitasApiRecord): RivalAktivitas {
  return {
    id: record.id,
    rivalCalegId: record.rivalCalegId,
    rival: record.rival?.namaLengkap ?? "-",
    jenis: record.jenis,
    deskripsi: record.deskripsi,
    wilayah: record.wilayah,
    tanggal: record.tanggal,
    pelapor: record.pelapor?.namaLengkap ?? `Pengguna #${record.userId}`,
  };
}

async function fetchRivalDeteksiSnapshotReal(): Promise<RivalDeteksiSnapshot> {
  try {
    const [calegRes, wilayahRes, aktivitasRes, summaryRes] = await Promise.all([
      apiClient.get<{ data: RivalCalegApiRecord[] }>("/rivalcaleg"),
      apiClient.get<{ data: RivalWilayahApiRecord[] }>("/rivalcaleg/wilayah"),
      apiClient.get<{ data: RivalAktivitasApiRecord[] }>("/rivalcaleg/aktivitas"),
      apiClient.get<{ data: RivalSummaryApiRecord }>("/rivalcaleg/summary"),
    ]);
    const calegList = calegRes.data.data;
    return {
      ...summaryRes.data.data,
      kekuatan: mapRivalCalegListToKekuatan(calegList),
      wilayah: wilayahRes.data.data.map(mapRivalWilayah),
      daftar: calegList.filter((r) => !r.isKita).map(mapRivalCalegToSummary),
      aktivitas: aktivitasRes.data.data.map(mapRivalAktivitas),
    };
  } catch (error) {
    console.error("[services/rivalcaleg/fetchRivalDeteksiSnapshot]", error);
    throw new Error("Gagal memuat data deteksi rival caleg. Coba lagi.");
  }
}

// --- Dataset demo (EXPO_PUBLIC_USE_MOCK_API=true) ---
// Geografi Cileunyi Kulon/Cinunuk/Cileunyi Wetan/Cimekar konsisten dataset
// demo fitur lain. Nama caleg "kita" (Deni Ramdani) & partai ("Partai
// Nusantara Bersatu") sengaja FIKTIF. `let` (bukan `const`) — sekarang
// mutable, CRUD mock beneran mengubah array in-memory ini, pola sama
// services/dpt.ts § mockDptByKab.
let mockCalegRecords: RivalCalegApiRecord[] = [
  {
    id: 1,
    namaLengkap: "Ahmad Fauzi",
    partai: "Partai Nusantara Bersatu",
    noUrut: 2,
    isKita: false,
    ancaman: "tinggi",
    basis: "Cileunyi Kulon, jaringan RT/RW kuat",
    estimasiSuara: 15200,
    suara2024: 14100,
    tren: "naik",
    wilayahBentrok: "Cileunyi Kulon, Cileunyi Wetan",
    tokohBerpihak: "3 tokoh RW, 1 ketua DKM",
    isuDiangkat: "Perbaikan jalan lingkungan",
    strategi: "Perkuat kunjungan D2D di RW 04-06 Cileunyi Kulon, gandeng tokoh netral sebelum ia klaim dukungan mereka.",
  },
  {
    id: 2,
    namaLengkap: "Deni Ramdani",
    partai: "Partai Nusantara Bersatu",
    noUrut: 3,
    isKita: true,
    ancaman: "sedang",
    basis: "Konsisten di 4 kelurahan, unggul tipis di Cileunyi Wetan",
    estimasiSuara: 13800,
    suara2024: 12000,
    tren: "naik",
    wilayahBentrok: null,
    tokohBerpihak: null,
    isuDiangkat: null,
    strategi: null,
  },
  {
    id: 3,
    namaLengkap: "Hendra Wijaya",
    partai: "Partai Nusantara Bersatu",
    noUrut: 5,
    isKita: false,
    ancaman: "tinggi",
    basis: "Cinunuk, pengajian & UMKM",
    estimasiSuara: 9600,
    suara2024: 8200,
    tren: "naik",
    wilayahBentrok: "Cinunuk",
    tokohBerpihak: "2 ustadz, 1 ketua koperasi",
    isuDiangkat: "Bantuan modal UMKM",
    strategi: "Tawarkan program pendampingan UMKM konkret di Cinunuk sebelum agenda pengajian besar berikutnya.",
  },
  {
    id: 4,
    namaLengkap: "Siti Marlina",
    partai: "Partai Nusantara Bersatu",
    noUrut: 7,
    isKita: false,
    ancaman: "sedang",
    basis: "Cimekar, pemilih perempuan",
    estimasiSuara: 7200,
    suara2024: 6900,
    tren: "stabil",
    wilayahBentrok: "Cimekar",
    tokohBerpihak: "1 ketua PKK",
    isuDiangkat: "Posyandu & kesehatan ibu-anak",
    strategi: "Aktifkan relawan perempuan untuk kunjungan rutin ke kelompok PKK Cimekar, imbangi basis utamanya.",
  },
  {
    id: 5,
    namaLengkap: "Rudi Hartono",
    partai: "Partai Nusantara Bersatu",
    noUrut: 9,
    isKita: false,
    ancaman: "tinggi",
    basis: "Cileunyi Kulon, keluarga besar",
    estimasiSuara: 5100,
    suara2024: 3400,
    tren: "naik",
    wilayahBentrok: "Cileunyi Kulon",
    tokohBerpihak: "Belum terdeteksi",
    isuDiangkat: "Bantuan modal usaha",
    strategi: "Pantau ketat — tren naik tajam dari 2024, kemungkinan janji bantuan modal belum terverifikasi realisasinya.",
  },
  {
    id: 6,
    namaLengkap: "Nining Kartika",
    partai: "Partai Nusantara Bersatu",
    noUrut: 11,
    isKita: false,
    ancaman: "rendah",
    basis: "Cileunyi Wetan, komunitas keagamaan",
    estimasiSuara: 2800,
    suara2024: 2600,
    tren: "stabil",
    wilayahBentrok: "Cileunyi Wetan",
    tokohBerpihak: "Tidak terdeteksi",
    isuDiangkat: "Belum ada isu spesifik",
    strategi: "Belum perlu tindakan khusus — basis terbatas, pantau berkala tiap bulan saja.",
  },
];
let mockCalegNextId = 7;

let mockWilayahList: RivalWilayahApiRecord[] = [
  { id: 1, nama: "Cileunyi Kulon", rivalPenantang: "Ahmad Fauzi", status: "rival-kuat" },
  { id: 2, nama: "Cinunuk", rivalPenantang: "Hendra Wijaya", status: "bentrok" },
  { id: 3, nama: "Cileunyi Wetan", rivalPenantang: "Siti Marlina", status: "unggul" },
  { id: 4, nama: "Cimekar", rivalPenantang: "Rudi Hartono", status: "bentrok" },
];
let mockWilayahNextId = 5;

let mockAktivitasList: RivalAktivitasApiRecord[] = [
  {
    id: 1,
    rivalCalegId: 1,
    jenis: "Bagi Sembako",
    deskripsi: "Membagikan 200 paket sembako di RW 04, diduga menyasar pemilih swing.",
    wilayah: "Cileunyi Kulon",
    tanggal: "2026-08-22",
    userId: 1,
    rival: { id: 1, namaLengkap: "Ahmad Fauzi" },
    pelapor: { id: 1, namaLengkap: "Asep Saepudin" },
  },
  {
    id: 2,
    rivalCalegId: 3,
    jenis: "Pengajian",
    deskripsi: "Mengadakan pengajian akbar mengundang 300 warga, menyisipkan visi-misi di sela acara.",
    wilayah: "Cinunuk",
    tanggal: "2026-08-21",
    userId: 2,
    rival: { id: 3, namaLengkap: "Hendra Wijaya" },
    pelapor: { id: 2, namaLengkap: "Neng Sari" },
  },
  {
    id: 3,
    rivalCalegId: 4,
    jenis: "Baliho Baru",
    deskripsi: "Memasang 15 baliho baru di titik strategis dekat pasar Cimekar.",
    wilayah: "Cimekar",
    tanggal: "2026-08-20",
    userId: 3,
    rival: { id: 4, namaLengkap: "Siti Marlina" },
    pelapor: { id: 3, namaLengkap: "Mira Anggraini" },
  },
  {
    id: 4,
    rivalCalegId: 5,
    jenis: "Kunjungan",
    deskripsi: "Door-to-door intensif ke 40 rumah, menjanjikan bantuan modal usaha.",
    wilayah: "Cileunyi Kulon",
    tanggal: "2026-08-19",
    userId: 4,
    rival: { id: 5, namaLengkap: "Rudi Hartono" },
    pelapor: { id: 4, namaLengkap: "Dedi Kurniawan" },
  },
  {
    id: 5,
    rivalCalegId: 1,
    jenis: "Isu Negatif",
    deskripsi: "Menyebarkan isu negatif soal program bantuan kita lewat grup WhatsApp warga.",
    wilayah: "Cileunyi Wetan",
    tanggal: "2026-08-18",
    userId: 1,
    rival: { id: 1, namaLengkap: "Ahmad Fauzi" },
    pelapor: { id: 1, namaLengkap: "Asep Saepudin" },
  },
];
let mockAktivitasNextId = 6;

async function fetchRivalDeteksiSnapshotMock(): Promise<RivalDeteksiSnapshot> {
  await mockDelay();
  const semuaCaleg = [...mockCalegRecords].sort((a, b) => b.estimasiSuara - a.estimasiSuara);
  const totalTerpetakan = semuaCaleg.filter((r) => !r.isKita).length;
  const ancamanTinggiCount = semuaCaleg.filter((r) => r.ancaman === "tinggi").length;
  const wilayahBentrokCount = mockWilayahList.filter((w) => w.status !== "unggul").length;
  const kitaIndex = semuaCaleg.findIndex((r) => r.isKita);
  const posisiKita = kitaIndex === -1 ? "-" : `Peringkat ${kitaIndex + 1}`;
  let selisihKePeringkat1Pct = 0;
  if (kitaIndex > 0) {
    const suaraTop = semuaCaleg[0].estimasiSuara;
    const suaraKita = semuaCaleg[kitaIndex].estimasiSuara;
    if (suaraTop > 0) selisihKePeringkat1Pct = Math.round(((suaraTop - suaraKita) / suaraTop) * 1000) / 10;
  }

  return {
    totalTerpetakan,
    posisiKita,
    ancamanTinggiCount,
    wilayahBentrokCount,
    selisihKePeringkat1Pct,
    kekuatan: mapRivalCalegListToKekuatan(semuaCaleg),
    wilayah: mockWilayahList.map(mapRivalWilayah),
    daftar: semuaCaleg.filter((r) => !r.isKita).map(mapRivalCalegToSummary),
    aktivitas: [...mockAktivitasList].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1)).map(mapRivalAktivitas),
  };
}

export async function fetchRivalDeteksiSnapshot(): Promise<RivalDeteksiSnapshot> {
  if (isMockApiEnabled()) return fetchRivalDeteksiSnapshotMock();
  return fetchRivalDeteksiSnapshotReal();
}

// --- CRUD RivalCaleg ---

async function createRivalCalegMock(input: CreateRivalCalegInput): Promise<void> {
  await mockDelay();
  if (input.isKita) mockCalegRecords = mockCalegRecords.map((r) => ({ ...r, isKita: false }));
  const created: RivalCalegApiRecord = {
    id: mockCalegNextId++,
    namaLengkap: input.namaLengkap,
    partai: input.partai,
    noUrut: input.noUrut,
    isKita: input.isKita ?? false,
    ancaman: input.ancaman ?? "sedang",
    basis: input.basis ?? null,
    estimasiSuara: input.estimasiSuara ?? 0,
    suara2024: input.suara2024 ?? null,
    tren: input.tren ?? null,
    wilayahBentrok: input.wilayahBentrok ?? null,
    tokohBerpihak: input.tokohBerpihak ?? null,
    isuDiangkat: input.isuDiangkat ?? null,
    strategi: input.strategi ?? null,
  };
  mockCalegRecords = [...mockCalegRecords, created];
}

export async function createRivalCaleg(input: CreateRivalCalegInput): Promise<void> {
  if (isMockApiEnabled()) return createRivalCalegMock(input);
  try {
    await apiClient.post("/rivalcaleg", input);
  } catch (error) {
    console.error("[services/rivalcaleg/createRivalCaleg]", error);
    throw new Error("Gagal menyimpan rival caleg. Coba lagi.");
  }
}

async function updateRivalCalegMock({ id, ...input }: UpdateRivalCalegInput): Promise<void> {
  await mockDelay();
  if (input.isKita) mockCalegRecords = mockCalegRecords.map((r) => (r.id === id ? r : { ...r, isKita: false }));
  mockCalegRecords = mockCalegRecords.map((r) => (r.id === id ? { ...r, ...input } : r));
}

export async function updateRivalCaleg(input: UpdateRivalCalegInput): Promise<void> {
  if (isMockApiEnabled()) return updateRivalCalegMock(input);
  try {
    const { id, ...body } = input;
    await apiClient.patch(`/rivalcaleg/${id}`, body);
  } catch (error) {
    console.error("[services/rivalcaleg/updateRivalCaleg]", error);
    throw new Error("Gagal memperbarui rival caleg. Coba lagi.");
  }
}

async function deleteRivalCalegMock(id: number): Promise<void> {
  await mockDelay();
  mockCalegRecords = mockCalegRecords.filter((r) => r.id !== id);
}

export async function deleteRivalCaleg(id: number): Promise<void> {
  if (isMockApiEnabled()) return deleteRivalCalegMock(id);
  try {
    await apiClient.delete(`/rivalcaleg/${id}`);
  } catch (error) {
    console.error("[services/rivalcaleg/deleteRivalCaleg]", error);
    throw new Error("Gagal menghapus rival caleg. Coba lagi.");
  }
}

// --- CRUD RivalWilayah (backend tidak punya DELETE untuk resource ini) ---

async function createRivalWilayahMock(input: CreateRivalWilayahInput): Promise<void> {
  await mockDelay();
  mockWilayahList = [
    ...mockWilayahList,
    { id: mockWilayahNextId++, nama: input.nama, rivalPenantang: input.rivalPenantang ?? null, status: input.status },
  ];
}

export async function createRivalWilayah(input: CreateRivalWilayahInput): Promise<void> {
  if (isMockApiEnabled()) return createRivalWilayahMock(input);
  try {
    await apiClient.post("/rivalcaleg/wilayah", input);
  } catch (error) {
    console.error("[services/rivalcaleg/createRivalWilayah]", error);
    throw new Error("Gagal menyimpan wilayah. Coba lagi.");
  }
}

async function updateRivalWilayahMock({ id, ...input }: UpdateRivalWilayahInput): Promise<void> {
  await mockDelay();
  mockWilayahList = mockWilayahList.map((w) => (w.id === id ? { ...w, ...input } : w));
}

export async function updateRivalWilayah(input: UpdateRivalWilayahInput): Promise<void> {
  if (isMockApiEnabled()) return updateRivalWilayahMock(input);
  try {
    const { id, ...body } = input;
    await apiClient.patch(`/rivalcaleg/wilayah/${id}`, body);
  } catch (error) {
    console.error("[services/rivalcaleg/updateRivalWilayah]", error);
    throw new Error("Gagal memperbarui wilayah. Coba lagi.");
  }
}

// --- Create RivalAktivitas (backend cuma punya create, tidak ada edit/hapus) ---

// `pelapor` (nama user sesi aktif, dari useAuth()) cuma dipakai mock — real
// branch backend ambil dari JWT via @User(), bukan dari body. Pola sama
// createBudgetTransaction(input, oleh).
async function createRivalAktivitasMock(input: CreateRivalAktivitasInput, pelapor: string): Promise<void> {
  await mockDelay();
  const rival = mockCalegRecords.find((r) => r.id === input.rivalCalegId);
  mockAktivitasList = [
    ...mockAktivitasList,
    {
      id: mockAktivitasNextId++,
      rivalCalegId: input.rivalCalegId,
      jenis: input.jenis,
      deskripsi: input.deskripsi,
      wilayah: input.wilayah,
      tanggal: new Date().toISOString().slice(0, 10),
      userId: 0,
      rival: rival ? { id: rival.id, namaLengkap: rival.namaLengkap } : null,
      pelapor: { id: 0, namaLengkap: pelapor },
    },
  ];
}

export async function createRivalAktivitas(input: CreateRivalAktivitasInput, pelapor: string): Promise<void> {
  if (isMockApiEnabled()) return createRivalAktivitasMock(input, pelapor);
  try {
    await apiClient.post("/rivalcaleg/aktivitas", input);
  } catch (error) {
    console.error("[services/rivalcaleg/createRivalAktivitas]", error);
    throw new Error("Gagal mencatat aktivitas rival. Coba lagi.");
  }
}
