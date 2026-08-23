export type TokohKategoriOption = { id: number; label: string };

// Referensi context/designs/tokoh1.png ("Tokoh per Kategori") — 5 kategori.
// BEDA dari 4 kategori yang sempat disebut user secara verbal SEBELUM desain
// ini di-upload (Agama/Adat/Pemuda & Organisasi/Ahli-Profesi) — begitu ada
// mockup nyata, visual menang atas deskripsi verbal (pola sama Budgeting
// Kampanye, lihat progress-tracker.md Decisions). Kalau ini keliru, mudah
// dikoreksi di satu tempat ini.
export const TOKOH_KATEGORI_OPTIONS: readonly TokohKategoriOption[] = [
  { id: 1, label: "Tokoh Agama" },
  { id: 2, label: "Tokoh Pemuda" },
  { id: 3, label: "Tokoh Adat" },
  { id: 4, label: "Tokoh Pendidikan" },
  { id: 5, label: "Tokoh Perempuan" },
];

export type TokohDukungan = "Mendukung" | "Netral" | "Lawan";

export const TOKOH_DUKUNGAN_OPTIONS: readonly TokohDukungan[] = ["Mendukung", "Netral", "Lawan"];

// Referensi context/designs/tokohlist.png ("Tokoh Agama · pengaruh Tinggi") —
// mockup cuma kasih contoh "Tinggi"/"Sedang", "Rendah" ditambah sendiri supaya
// 3-tier lengkap (pola sama AncamanLevel di types/rivalcaleg.ts).
export type TokohPengaruh = "Rendah" | "Sedang" | "Tinggi";

export const TOKOH_PENGARUH_OPTIONS: readonly TokohPengaruh[] = ["Rendah", "Sedang", "Tinggi"];

// Fitur baru (2026-08-22) — TIDAK ada modul ini di backend manapun (bukan cuma
// belum dikonfirmasi seperti DPT/Hasil Rekap — memang tidak ada sama sekali,
// baik di /Users/asdarsaid/JSI/api maupun observasi web `client/src/pages/
// tokoh/` yang ternyata entitas survei standalone tanpa kategori/dukungan sama
// sekali, beda konsep total). Lihat services/tokoh.ts untuk pola mock service
// standar (CLAUDE.md Aturan #6).
export type Tokoh = {
  id: number;
  nama: string;
  kategoriId: number;
  kategoriLabel: string;
  pengaruh: TokohPengaruh;
  alamat: string;
  kecamatan: string;
  desa: string;
  dukungan: TokohDukungan;
  // Estimasi jumlah warga yang bisa dipengaruhi tokoh ini — angka per-tokoh,
  // dijumlahkan client-side untuk kartu ringkasan "Estimasi basis massa".
  estimasiBasisMassa: number;
  pekerjaan: string | null;
  noTelpon: string | null;
  createdAt: string;
};

// "Identifikasi Tokoh Baru" (context/designs/tokoh1.png & tokohlist.png,
// 2026-08-22) — dipakai baik dari tombol footer TokohMasyarakatScreen (form
// kosong) maupun dari icon bintang di DptCard (form ter-prefill nama/alamat/
// wilayah dari record DPT, lihat TokohFormScreen.tsx).
export type CreateTokohInput = {
  nama: string;
  kategoriId: number;
  pengaruh: TokohPengaruh;
  dukungan: TokohDukungan;
  estimasiBasisMassa: number;
  alamat: string;
  kecamatan: string;
  desa: string;
  pekerjaan?: string;
  noTelpon?: string;
};
