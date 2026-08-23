// Referensi: alur navigasi web `client/src/pages/hasilrekap2024/dprri2024/*`
// (route tree persis di `HasilRekap2024Routes.jsx`). Scope sesi ini SENGAJA
// cuma tipe **DPR RI 2024** ("1 tipe dulu — DPR RI" saat ditanya) — DPRD
// Provinsi/DPRD Kabupaten menyusul sesi berikutnya, lihat progress-tracker.md
// Decisions. **2026-08-23: WIRED ke backend real** `/Users/asdarsaid/JSI/api/src/dpr`
// (`GET /dpr/hasil-rekap...`, host TANPA prefix /api, lihat api-standards.md
// § Hasil Rekap & services/hasilrekap.ts) — field-field di bawah cocok
// persis dengan response asli (diverifikasi live via curl), BUKAN lagi
// tebakan dari observasi web. `kursiTerakhir` yang sempat ada di versi mock
// DIHAPUS — field itu tidak pernah ada di response backend asli.
//
// Hierarki web (route params) untuk DPR RI 2024: Dapil → (ringkasan per
// Dapil, halaman ini SUDAH termasuk drill Kabupaten) → Kabupaten →
// Kecamatan → Kelurahan (TERMINAL — TPS ditampilkan inline di halaman
// Kelurahan, tidak ada route TPS terpisah, lihat `DprRiKelurahan.jsx`).
// Halaman web di level Kabupaten/Kecamatan/Kelurahan sebenarnya render
// pivot table caleg × sub-wilayah yang sangat padat (desktop-only) — di
// mobile diadaptasi jadi: kartu ringkasan partai (bar per partai) + list
// drill wilayah, mengikuti bahasa visual yang SUDAH ada di artboard "4 ·
// HASIL REKAP" (Claude Design canvas user), bukan replikasi tabel pivot.

export type HasilRekapTipe = "dprri" | "dprprovinsi" | "dprkabupaten";

export type HasilRekapPartaiSuara = {
  partai: string;
  suaraPartai: number;
  suaraCaleg: number;
  suaraTotal: number;
};

export type HasilRekapRegion = {
  id: number;
  nama: string;
  totalSuara: number;
  partaiUnggul: string;
};

export type HasilRekapDapil = HasilRekapRegion & {
  jumlahKursi: number;
};

export type HasilRekapCalegDaerahSuara = {
  nama: string;
  suara: number;
};

export type HasilRekapCaleg = {
  nama: string;
  partai: string;
  suara: number;
  // Nama sub-wilayah (dalam scope layar ini) tempat caleg ini raih suara
  // TERBANYAK — sama dengan `breakdown[0].nama`, disimpan terpisah supaya
  // `HasilRekapCalegRow` (list ringkas) tidak perlu tahu bentuk `breakdown`.
  daerahUnggul: string;
  // Breakdown PENUH suara caleg ini di SETIAP sub-wilayah dalam scope layar
  // ini (Kabupaten/Kecamatan/Kelurahan/TPS, tergantung layar) — persis
  // kelengkapan data kolom pivot caleg × sub-wilayah di web
  // (`DprRiProvinsi.jsx` dst.), TAPI ditampilkan sebagai list vertikal di
  // `HasilRekapCalegDetailSheet` (tap-to-detail), bukan tabel/kolom —
  // permintaan eksplisit user "ikuti pola web tapi jangan dibuat table".
  // Terurut desc by suara. Lihat services/hasilrekap.ts § generateCalegList.
  breakdown: HasilRekapCalegDaerahSuara[];
};

export type HasilRekapTps = {
  noTps: number;
  totalSuara: number;
};

export type HasilRekapScopeSummary = {
  totalSuaraSah: number;
  partaiSuara: HasilRekapPartaiSuara[];
};

export type HasilRekapKabupatenSnapshot = HasilRekapScopeSummary & {
  kabupaten: HasilRekapRegion[];
  calegList: HasilRekapCaleg[];
};

export type HasilRekapKecamatanSnapshot = HasilRekapScopeSummary & {
  kecamatan: HasilRekapRegion[];
  calegList: HasilRekapCaleg[];
};

export type HasilRekapKelurahanSnapshot = HasilRekapScopeSummary & {
  kelurahan: HasilRekapRegion[];
  calegList: HasilRekapCaleg[];
};

export type HasilRekapDetailSnapshot = HasilRekapScopeSummary & {
  calegList: HasilRekapCaleg[];
  tps: HasilRekapTps[];
};
