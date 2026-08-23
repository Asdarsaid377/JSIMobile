// Referensi: artboard "15 · ISU & ASPIRASI WARGA" di project Claude Design
// user ("Desain Mobile JSI Dashboard", 160ea937-2f8a-4ff4-9977-f8bc398c90a0),
// dibaca via DesignSync 2026-08-22. Permintaan eksplisit user: "Generate UI
// nya saja dulu tidak apa apa, nanti saya buatkan API nya" — module ini
// SENGAJA read-only (cuma 1 fungsi fetch, tidak ada mutation, lihat
// services/isuaspirasi.ts & IsuAspirasiDetailSheet.tsx). Fitur baru murni
// mobile — TIDAK ADA modul ini di backend manapun (CLAUDE.md Aturan #6).

export type IsuKategori = {
  nama: string;
  jumlah: number;
  wilayahTerkuat: string;
};

export type IsuJanji = {
  janji: string;
  dampak: string;
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
  kategori: string;
  keluhan: string;
  relawan: string;
  tanggal: string;
  status: IsuAspirasiStatus;
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
