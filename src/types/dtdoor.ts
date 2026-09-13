export type JenisKelamin = "L" | "P";

export type KategoriDtDoorOption = { id: number; label: string };

// ⚠️ ASUMSI BELUM DIVERIFIKASI: tidak ada endpoint backend untuk baca daftar
// KategoriDtDoor asli (lihat api-standards.md § dtdoor) — id di bawah diasumsikan
// berurutan sesuai urutan tampil di screenshot dropdown yang diberikan user,
// BUKAN hasil query ke tabel `kategori_dt_door`. Kalau salah, record baru akan
// ke-tag relasi kategori yang salah di backend, TAPI bug ini tidak akan terlihat
// dari mobile app (list render label dari daftar lokal ini berdasar id yang
// dipilih user, bukan hasil round-trip ke server) — wajib diverifikasi ke DB
// sebelum production.
export const KATEGORI_DTDOOR_OPTIONS: readonly KategoriDtDoorOption[] = [
  { id: 1, label: "Simpatisan" },
  { id: 2, label: "Simpatisan Aktif" },
  { id: 3, label: "Relawan" },
  { id: 4, label: "Saksi" },
  { id: 5, label: "Tim Lain" },
  { id: 6, label: "Pemilih Kompetitor" },
  { id: 7, label: "Belum Menentukan" },
];

// program_bantuan1/2/3 di entity Dtdoor adalah string bebas (BUKAN relasi FK ke
// BantuanDtDoor — entity itu tidak pernah direferensikan dari Dtdoor, lihat
// api-standards.md § dtdoor), jadi cukup daftar label, tidak perlu id.
export const PROGRAM_BANTUAN_OPTIONS: readonly string[] = [
  "Kesehatan",
  "Olahraga",
  "Pendidikan",
  "Pertanian",
  "Rutilahu",
  "Sembako",
  "UMKM",
  "Lainnya",
];

export const JENIS_KELAMIN_OPTIONS: readonly { value: JenisKelamin; label: string }[] = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export type Dtdoor = {
  id: number;
  nik: string | null;
  namaLengkap: string;
  tps: string | null;
  rt: string | null;
  rw: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  jenisKelamin: JenisKelamin | null;
  noTelpon: string | null;
  merchandise: string | null;
  kategoriId: number | null;
  kategoriLabel: string | null;
  jumlahWajibPilih: number;
  programBantuan1: string | null;
  programBantuan2: string | null;
  programBantuan3: string | null;
  namaRelawan: string | null;
  kontakRelawan: string | null;
  createdAt: string;
};

export type DtdoorListResponse = {
  data: Dtdoor[];
  total: number;
  page: number;
  totalPage: number;
  limit: number;
};

// ⚠️ 2026-08-23 — SCHEMA BARU, koreksi total dari CreateDtdoorInput lama di
// bawah (dipertahankan sesaat sebagai referensi historis sebelum dihapus).
// Modul dtdoor backend ternyata sudah di-desain ulang: field kategori/program
// bantuan yang dulu di top-level record (string bebas) sekarang jadi array
// nested `kunjungans` dengan 3 FK id (tipePemilih/pilihanPileg/programBantuan)
// per entri, dan hampir semua field jadi WAJIB (dikonfirmasi live via curl
// POST /dtdoor body kosong — lihat api-standards.md § dtdoor). Dipakai HANYA
// untuk create — tipe `Dtdoor` (list/display) di atas TIDAK diubah, kolom
// lama (kategoriId dst.) tetap ada di DB tapi TIDAK diisi lagi oleh create
// baru (entri baru akan tampil "tanpa kategori" di Kekuatan Wilayah/Pemilih —
// gap yang diterima sengaja, lihat progress-tracker.md Decisions).
export type DtdoorLookupOption = { id: number; nama: string };
export type PilihanPilegOption = { id: number; nameKategori: string };

export type KunjunganInput = {
  tipePemilihId: number;
  pilihanPilegId: number;
  programBantuanId: number;
  merchendise: string;
  namaRelawan: string;
  kontakRelawan?: string;
  // Anti-fraud (backend modul `antifraud`, 2026-08-25): timsesId dari relawan
  // yang login (bukan namaRelawan bebas) supaya burst detection & skor
  // relawan akurat. lat/long dari GPS device saat submit — kosong (permission
  // ditolak/GPS mati) tetap valid, backend menandainya "GPS nonaktif" secara
  // otomatis (AntiFraudService.checkGpsForKunjungan), bukan alasan gagal submit.
  timsesId?: number;
  lat?: number;
  long?: number;
};

// Foto kunjungan diunggah TERPISAH setelah Dtdoor+kunjungan tersimpan (backend
// butuh kunjunganId yang baru dibuat, lihat createDtdoor() § upload foto).
// Kamera-only (bukan galeri) — enforcement di titik input, konsisten dengan
// kebijakan "wajib foto in-app" yang sudah dinyatakan di AntiFraudScreen.
export type FotoKunjunganInput = {
  uri: string;
  fotoSumber: "kamera";
};

// GET /dtdoor/rekap-kekuatan-wilayah (backend modul dtdoor, 2026-08-25) — agregasi
// server-side untuk fitur "Kekuatan Wilayah", menggantikan fetchDtdoorAll() yang
// SELALU throw di mode API real (tidak ada endpoint dump-semua-record). Cuma
// kategori dengan kunjungan >0 yang muncul (tidak diisi nol) — konsisten dengan
// lib/dtdoorScore.ts yang mengecualikan (bukan skor 0) kategori tak termapping.
export type KekuatanWilayahKategoriRekap = { tipePemilihId: number; jumlah: number };
export type KekuatanWilayahRekap = { desa: string; totalKunjungan: number; kategori: KekuatanWilayahKategoriRekap[] };
export type KekuatanWilayahFilter = { kabId?: number; kecamatan?: string };

// GET /dtdoor/kekuatan-pemilih (backend modul dtdoor, 2026-08-25) — daftar
// individual RINGKAS (bukan agregat, beda dari KekuatanWilayahRekap di atas) untuk
// fitur "Kekuatan Pemilih" (ranking top-N pemilih per skor). `id` = id row
// DtdoorKunjungan (BUKAN Dtdoor.id), `createdAt` = tanggal kunjungan itu sendiri.
// `tipePemilihId` selalu terisi (backend sudah filter IS NOT NULL) — beda dari
// `Dtdoor.kategoriId` yang bisa null.
export type KekuatanPemilihRecord = {
  id: number;
  namaLengkap: string;
  desa: string | null;
  kecamatan: string | null;
  tipePemilihId: number;
  createdAt: string;
};
export type KekuatanPemilihFilter = { kecamatan?: string };

// GET /dtdoor/rekap-group/:groupBy (backend, existing — dipakai ulang untuk
// "Ringkasan Data", bukan endpoint baru). Zero-filled untuk semua opsi kategori/
// program bantuan (dikonfirmasi live), beda dari KekuatanWilayahKategoriRekap
// yang cuma menyertakan kategori dengan kunjungan >0.
export type DtdoorRekapGroupRow = { id: number; nama: string; key: string; jumlahDtdoor: number; jumlahWajibPilih: number };

// GET /dtdoor/kelurahans (backend, existing).
export type DtdoorKelurahanRekap = { desa: string; total: number };

// GET /dtdoor/jenis-kelamin (backend, baru 2026-08-25) — null TIDAK difilter di
// backend (representasi "belum diisi"), difilter di mobile saat mapping ke
// DtdoorAnalyticsSnapshot (lihat services/dtdoor.ts).
export type DtdoorJenisKelaminRekap = { jenisKelamin: JenisKelamin | null; total: number };

// Snapshot gabungan 4 endpoint (3 existing + 1 baru) untuk DtdoorAnalyticsScreen
// ("Ringkasan Data") — digabung client-side, pola sama isuaspirasi/quickcount.
export type DtdoorAnalyticsSnapshot = {
  totalKunjungan: number;
  totalWajibPilih: number;
  totalKelurahan: number;
  kategori: { id: number; label: string; jumlah: number }[];
  jenisKelamin: { value: JenisKelamin; jumlah: number }[];
  programBantuan: { label: string; jumlah: number }[];
};

export type CreateDtdoorInput = {
  nik: string;
  namaLengkap: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  tps: string;
  rt: string;
  rw: string;
  jenisKelamin: JenisKelamin;
  jumlahWajibPilih: number;
  noTelpon?: string;
  kunjungans: [KunjunganInput, ...KunjunganInput[]];
  // Linkage ke record DPT (fitur "Form Door To Door terintegrasi DPT") —
  // kalau diisi, dipakai apa adanya (dpt.idDpt, BUKAN dpt.id). Kalau kosong
  // (entri standalone), createDtdoor() fallback ke
  // generateSyntheticIdDptNumber() + kabId default (lihat services/dtdoor.ts).
  idDpt?: number;
  kabId?: number;
  kelId?: number;
};
