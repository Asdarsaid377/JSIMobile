// Beberapa endpoint backend (dtdoor, gotv) melakukan lookup upsert-style
// berdasar `idDpt` SEBELUM insert (lihat api-standards.md § dtdoor & § gotv).
// Kalau `idDpt` kosong, lookup itu berisiko match row lain yang sudah ada —
// silently overwrite (dtdoor) atau block create dengan error palsu (gotv).
// Dipakai di service manapun yang bikin entry standalone tanpa linkage DPT
// asli, supaya lookup itu tidak pernah match row lain.
export function generateSyntheticIdDpt(): string {
  return `standalone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// dtdoor (schema baru, 2026-08-23) mewajibkan idDpt berupa NUMBER (beda dari
// gotv yang masih string) — lihat api-standards.md § dtdoor. Timestamp ms
// (13 digit) + 3 digit acak tetap jauh di bawah Number.MAX_SAFE_INTEGER dan
// tidak akan bertabrakan dengan idDpt asli (integer kecil bersambung).
export function generateSyntheticIdDptNumber(): number {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000);
}
