// Model skor "Kekuatan Wilayah"/"Kekuatan Pemilih" (context/designs/kekuatanwilayah.png,
// kekuatanpemilih.png) — TIDAK ADA field skor di entity Dtdoor manapun (diverifikasi
// langsung ke /Users/asdarsaid/JSI/api/src/dtdoor + grep "skor"/"score"/"kekuatan" di
// seluruh backend & web client, nihil). Skor dihitung 100% client-side dari
// `kategoriId` yang sudah dikumpulkan form Dtdoor (Feature 04) — keputusan eksplisit
// user (2026-08-22) karena tidak ada sumber lain yang terkonfirmasi.
//
// Nilai mapping di bawah adalah PROPOSAL, bukan angka yang dikonfirmasi
// user/campaign team — mudah diubah di satu tempat ini kalau perlu dikoreksi.
export const KATEGORI_SCORE: Record<number, number> = {
  3: 95, // Relawan
  4: 90, // Saksi
  2: 80, // Simpatisan Aktif
  5: 60, // Tim Lain
  1: 55, // Simpatisan
  7: 40, // Belum Menentukan
  6: 15, // Pemilih Kompetitor
};

// Ambang batas persis sesuai teks di kekuatanpemilih.png ("Kuat (skor ≥ 75)",
// "Sedang (skor 45-74)", "Lemah (skor < 45)") — dipakai bersama oleh Kekuatan
// Wilayah & (nanti) Kekuatan Pemilih, satu sumber kebenaran.
export const STRENGTH_THRESHOLDS = { kuat: 75, sedang: 45 } as const;

export type StrengthTier = "kuat" | "sedang" | "lemah";

export const STRENGTH_TIER_LABEL: Record<StrengthTier, string> = {
  kuat: "Kuat",
  sedang: "Sedang",
  lemah: "Lemah",
};

// null passthrough untuk record tanpa kategori — form Dtdoor tidak mewajibkan
// kategoriId (cuma namaLengkap + jumlahWajibPilih yang wajib), jadi banyak record
// yang tidak punya kategori sama sekali. Record begini dikecualikan dari skoring,
// bukan dianggap skor 0.
export function getDtdoorScore(kategoriId: number | null): number | null {
  if (kategoriId === null) return null;
  return KATEGORI_SCORE[kategoriId] ?? null;
}

export function getStrengthTier(score: number): StrengthTier {
  if (score >= STRENGTH_THRESHOLDS.kuat) return "kuat";
  if (score >= STRENGTH_THRESHOLDS.sedang) return "sedang";
  return "lemah";
}

// Dipakai KekuatanWilayahScreen sejak GET /dtdoor/rekap-kekuatan-wilayah (backend,
// 2026-08-25) — server sudah mengagregasi per kelurahan jadi {tipePemilihId,jumlah}[],
// bukan record mentah. Rata-rata tertimbang di sini SECARA MATEMATIS identik dengan
// rata-rata per-record lama (sum(skor)/count) karena tiap record dalam 1 kategori
// yang sama selalu berkontribusi skor yang sama persis — cuma re-agregasi lokasi
// perhitungan, bukan ganti rumus. Kategori tak termapping (getDtdoorScore null)
// dikecualikan dari pembagi, sama seperti kekecualian "record tanpa kategori" lama.
export function computeWeightedTier(
  kategori: { tipePemilihId: number; jumlah: number }[],
): { skorRata: number; tier: StrengthTier } | null {
  let totalSkor = 0;
  let totalJumlah = 0;
  for (const { tipePemilihId, jumlah } of kategori) {
    const score = getDtdoorScore(tipePemilihId);
    if (score === null) continue;
    totalSkor += score * jumlah;
    totalJumlah += jumlah;
  }
  if (totalJumlah === 0) return null;
  const skorRata = Math.round(totalSkor / totalJumlah);
  return { skorRata, tier: getStrengthTier(skorRata) };
}
