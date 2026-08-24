// Referensi: artboard "15 · ISU & ASPIRASI WARGA" di project Claude Design
// user ("Desain Mobile JSI Dashboard", 160ea937-2f8a-4ff4-9977-f8bc398c90a0),
// dibaca via DesignSync 2026-08-22. Awalnya SENGAJA read-only ("Generate UI
// nya saja dulu ... nanti saya buatkan API nya") — modul backend `isuaspirasi`
// sekarang ADA & WIRED (2026-08-24, spec diturunkan dari types/services ini,
// pola sama tokoh/rivalcaleg, lihat api-standards.md § Isu & Aspirasi Warga).
// 2 mutation SEKARANG NYATA (Tandai Ditindak/Jadikan Materi via
// IsuAspirasiDetailSheet). "+ Catat Aspirasi Warga" (IsuAspirasiFormScreen)
// & CRUD usulan materi (IsuJanjiFormScreen) SEKARANG JUGA ADA — dibangun
// TANPA referensi visual (izin eksplisit user 2026-08-24, Aturan #1 tidak
// ada pengecualian di repo ini, pola generik Input/Select/Button sama
// RivalAktivitasFormScreen/RivalWilayahFormScreen).

export type IsuKategori = {
  nama: string;
  jumlah: number;
  wilayahTerkuat: string;
};

export type IsuJanjiDampak = "Prioritas Tinggi" | "Prioritas Sedang" | "Prioritas Rendah";

export const ISU_JANJI_DAMPAK_OPTIONS: readonly { value: IsuJanjiDampak; label: string }[] = [
  { value: "Prioritas Tinggi", label: "Prioritas Tinggi" },
  { value: "Prioritas Sedang", label: "Prioritas Sedang" },
  { value: "Prioritas Rendah", label: "Prioritas Rendah" },
];

export type IsuJanji = {
  id: number;
  janji: string;
  dampak: IsuJanjiDampak;
  dasar: string;
  wilayah: string;
};

export type IsuWilayahLevel = "tinggi" | "sedang" | "rendah";

export type IsuPetaWilayah = {
  nama: string;
  totalAspirasi: number;
  isuDominan: string;
  level: IsuWilayahLevel;
};

export type IsuAspirasiStatus = "Baru" | "Ditindak" | "Selesai";

export type IsuAspirasi = {
  id: number;
  warga: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  kategori: string;
  keluhan: string;
  relawan: string;
  // ISO date (dari `createdAt` backend) — diformat saat render, pola sama
  // formatTanggal lokal di RivalAktivitasCard/GotvCard/DtdoorCard (sengaja
  // tidak diabstraksi jadi util bersama, preseden yang sudah ada di project).
  tanggal: string;
  status: IsuAspirasiStatus;
  dijadikanMateri: boolean;
  // Backend TIDAK balas field ini — dihitung client-side dari jumlah record
  // lain dengan kategori+desa yang sama, lihat mapIsuAspirasiList()
  // di services/isuaspirasi.ts.
  laporanSerupa: number;
};

export type IsuAspirasiSnapshot = {
  totalAspirasi: number;
  isuDominan: string;
  ringkasanSumber: string;
  kategori: IsuKategori[];
  janji: IsuJanji[];
  petaWilayah: IsuPetaWilayah[];
  aspirasi: IsuAspirasi[];
};

// Backing 2 tombol di IsuAspirasiDetailSheet ("Tandai Ditindak"/"Jadikan
// Materi") — partial update, cocok `UpdateIsuAspirasiDto` backend.
export type UpdateIsuAspirasiInput = {
  id: number;
  status?: IsuAspirasiStatus;
  dijadikanMateri?: boolean;
};

// Backing IsuAspirasiFormScreen ("+ Catat Aspirasi Warga") — userId (relawan)
// TIDAK di sini, diambil dari JWT backend (real) / param terpisah (mock),
// pola sama CreateRivalAktivitasInput.
export type CreateIsuAspirasiInput = {
  warga: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  kategori: string;
  keluhan: string;
};

// Backing IsuJanjiFormScreen (create/edit/hapus usulan materi kampanye).
export type CreateIsuJanjiInput = {
  janji: string;
  dampak: IsuJanjiDampak;
  dasar: string;
  wilayah: string;
};

export type UpdateIsuJanjiInput = Partial<CreateIsuJanjiInput> & { id: number };
