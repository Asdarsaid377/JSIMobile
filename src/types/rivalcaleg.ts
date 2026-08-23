export type AncamanLevel = "rendah" | "sedang" | "tinggi";

export const ANCAMAN_LEVEL_OPTIONS: readonly { value: AncamanLevel; label: string }[] = [
  { value: "rendah", label: "Rendah" },
  { value: "sedang", label: "Sedang" },
  { value: "tinggi", label: "Tinggi" },
];

export const ANCAMAN_LEVEL_LABEL: Record<AncamanLevel, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export type RivalCaleg = {
  id: number;
  namaLengkap: string;
  noUrut: number | null;
  catatan: string | null;
  createdAt: string;
};

export type CreateRivalCalegInput = {
  namaLengkap: string;
  noUrut?: number;
  catatan?: string;
};

// Assessment ("intel") per wilayah — kecamatan/desa FREE TEXT (bukan picker dari
// data Dtdoor kita sendiri) karena justru poinnya mencatat wilayah KUAT LAWAN,
// yang bisa saja area yang belum pernah kita kunjungi sama sekali. Konsisten pola
// field wilayah free-text yang sudah dipakai GotvFormScreen.
export type RivalAssessment = {
  id: number;
  rivalCalegId: number;
  kecamatan: string;
  desa: string | null;
  levelAncaman: AncamanLevel;
  catatan: string | null;
  updatedAt: string;
};

export type UpsertRivalAssessmentInput = {
  rivalCalegId: number;
  kecamatan: string;
  desa?: string;
  levelAncaman: AncamanLevel;
  catatan?: string;
};
