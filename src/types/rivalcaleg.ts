// Referensi: artboard "16 · DETEKSI RIVAL CALEG (SEKUNDER — DRAWER)" di project
// Claude Design user ("Desain Mobile JSI Dashboard",
// 160ea937-2f8a-4ff4-9977-f8bc398c90a0), dibaca via DesignSync 2026-08-24,
// disimpan di context/designs/rival-caleg.dc.html. Ini MENGGANTIKAN TOTAL fitur
// "Rival Caleg" lama (CRM list+assessment per wilayah, dibangun tanpa referensi
// visual 2026-08-22) — keputusan eksplisit user "ganti total dengan desain baru"
// saat referensi ini ditemukan. Dashboard analitik 3 tab (Kekuatan/Daftar
// Rival/Aktivitas). Modul backend `rivalcaleg` dibuat user & WIRED 2026-08-24
// (lihat api-standards.md § Deteksi Rival Caleg) — form tambah/edit/hapus
// (2026-08-24 lanjutan) dibangun TANPA referensi visual (izin eksplisit user,
// Aturan #1 tidak ada pengecualian di repo ini, canvas cuma versi read-only).

export type RivalAncamanLevel = "rendah" | "sedang" | "tinggi";

export const RIVAL_ANCAMAN_OPTIONS: readonly { value: RivalAncamanLevel; label: string }[] = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
];

export const RIVAL_ANCAMAN_LABEL: Record<RivalAncamanLevel, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export type RivalWilayahStatus = "unggul" | "rival-kuat" | "bentrok";

export const RIVAL_WILAYAH_STATUS_OPTIONS: readonly { value: RivalWilayahStatus; label: string }[] = [
  { value: "unggul", label: "Kita Unggul" },
  { value: "rival-kuat", label: "Rival Kuat" },
  { value: "bentrok", label: "Bentrok" },
];

export const RIVAL_WILAYAH_STATUS_LABEL: Record<RivalWilayahStatus, string> = {
  unggul: "Kita Unggul",
  "rival-kuat": "Rival Kuat",
  bentrok: "Bentrok",
};

// "Peta penguasaan wilayah" dekoratif (tekstur diagonal + kotak zona
// absolute-positioned) di canvas DISEDERHANAKAN jadi list status per wilayah
// saja — tidak ada library/asset map di project ini, pola simplifikasi sama
// dengan "Peta Kekuatan Wilayah" & tab "Peta Isu" IsuAspirasiScreen.
export type RivalWilayahPeta = {
  id: number;
  nama: string;
  rivalPenantang: string;
  status: RivalWilayahStatus;
};

export type RivalTren = "naik" | "turun" | "stabil";

export const RIVAL_TREN_OPTIONS: readonly { value: RivalTren; label: string }[] = [
  { value: "naik", label: "Naik" },
  { value: "turun", label: "Turun" },
  { value: "stabil", label: "Stabil" },
];

export const RIVAL_TREN_LABEL: Record<RivalTren, string> = {
  naik: "Naik",
  turun: "Turun",
  stabil: "Stabil",
};

// SATU shape kanonis untuk 1 record RivalCaleg — dipakai tab "Kekuatan"
// (RivalKekuatanItem = shape ini + pct) & tab "Daftar Rival" (exclude
// isKita:true), supaya tidak ada 2 shape record rival yang bisa diam-diam beda
// field (lihat services/rivalcaleg.ts § mapRivalCalegToSummary).
export type RivalCalegSummary = {
  id: number;
  namaLengkap: string;
  partai: string;
  noUrut: number;
  isKita: boolean;
  ancaman: RivalAncamanLevel;
  basis: string;
  estimasiSuara: number;
  wilayahBentrok: string;
  suara2024: number;
  tren: RivalTren;
  tokohBerpihak: string;
  isuDiangkat: string;
  strategi: string;
};

// Baris "Estimasi Kekuatan Suara" — baris kandidat KITA (isKita: true)
// ditebalkan+warna accent di UI (RivalKekuatanRow), sisanya rival diurut
// estimasi suara desc. `pct` dihitung relatif ke estimasiSuara tertinggi di
// list (lihat mapRivalCalegListToKekuatan).
export type RivalKekuatanItem = RivalCalegSummary & { pct: number };

export type RivalAktivitas = {
  id: number;
  rivalCalegId: number;
  rival: string;
  jenis: string;
  deskripsi: string;
  wilayah: string;
  tanggal: string;
  pelapor: string;
};

export type RivalDeteksiSnapshot = {
  totalTerpetakan: number;
  posisiKita: string;
  ancamanTinggiCount: number;
  wilayahBentrokCount: number;
  selisihKePeringkat1Pct: number;
  kekuatan: RivalKekuatanItem[];
  wilayah: RivalWilayahPeta[];
  daftar: RivalCalegSummary[];
  aktivitas: RivalAktivitas[];
};

// --- Input CRUD (2026-08-24 lanjutan — form tambah/edit/hapus) ---

export type CreateRivalCalegInput = {
  namaLengkap: string;
  partai: string;
  noUrut: number;
  isKita?: boolean;
  ancaman?: RivalAncamanLevel;
  basis?: string;
  estimasiSuara?: number;
  suara2024?: number;
  tren?: RivalTren;
  wilayahBentrok?: string;
  tokohBerpihak?: string;
  isuDiangkat?: string;
  strategi?: string;
};

export type UpdateRivalCalegInput = Partial<CreateRivalCalegInput> & { id: number };

export type CreateRivalWilayahInput = {
  nama: string;
  rivalPenantang?: string;
  status: RivalWilayahStatus;
};

export type UpdateRivalWilayahInput = Partial<CreateRivalWilayahInput> & { id: number };

// userId (pelapor) TIDAK di sini — diambil dari JWT backend (real) / param
// terpisah (mock), pola sama CreateBudgetTransactionInput.
export type CreateRivalAktivitasInput = {
  rivalCalegId: number;
  jenis: string;
  deskripsi: string;
  wilayah: string;
};
