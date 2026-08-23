import * as SecureStore from "expo-secure-store";

// Target suara BELUM ada endpoint apapun di backend manapun (bukan cuma DPT/
// Hasil Rekap yang belum punya repo — modul yang SUDAH confirmed pun tidak
// punya konsep ini). Disimpan LOCAL-ONLY di device (SecureStore, pola sama
// dengan src/lib/api/token.ts) — keputusan eksplisit user: BELUM sinkron antar
// device/anggota tim, cuma tersimpan di HP masing-masing sampai backend-nya
// ada. Lihat progress-tracker.md Decisions untuk detail keputusan ini.
const STORAGE_KEY = "target_suara_map";

export type TargetSuaraLevel = "kab" | "kec" | "kel" | "tps";

// TPS butuh `subId` (noTps) karena noTps CUMA unik dalam 1 kelurahan (mis. "TPS 1"
// muncul berkali-kali di kelurahan berbeda) — 3 level lain wilId-nya sendiri sudah
// unik secara global (kode wilayah hierarkis).
export function buildTargetSuaraKey(level: TargetSuaraLevel, wilId: number, subId?: number): string {
  return subId !== undefined ? `${level}:${wilId}:${subId}` : `${level}:${wilId}`;
}

export async function getTargetSuaraMap(): Promise<Record<string, number>> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch (error) {
    console.error("[lib/targetSuara/getTargetSuaraMap]", error);
    return {};
  }
}

export async function setTargetSuara(
  level: TargetSuaraLevel,
  wilId: number,
  value: number,
  subId?: number,
): Promise<void> {
  const map = await getTargetSuaraMap();
  map[buildTargetSuaraKey(level, wilId, subId)] = value;
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(map));
}

// Dipakai di list anak wilayah (mis. daftar Kelurahan di screen Kecamatan) —
// satu format teks konsisten di 3 screen (Kabupaten/Kecamatan/Kelurahan).
export function formatTargetSublabel(totalDpt: number, target: number | null): string {
  const dptText = `${totalDpt.toLocaleString("id-ID")} DPT`;
  if (target === null) return `${dptText} · Target belum diisi`;
  const percent = totalDpt > 0 ? Math.round((target / totalDpt) * 100) : 0;
  return `${dptText} · Target ${target.toLocaleString("id-ID")} (${percent}%)`;
}
