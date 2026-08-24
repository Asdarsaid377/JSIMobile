import { Pressable, Text, View } from "react-native";

type Props = {
  namaLengkap: string;
  estimasiSuara: number;
  pct: number;
  basis: string;
  isKita: boolean;
  onPress?: () => void;
};

// Referensi artboard "16 · DETEKSI RIVAL CALEG" § "Estimasi Kekuatan Suara" —
// bar horizontal per caleg, pola sama KekuatanRankingRow/IsuKategoriRow. Baris
// kandidat KITA ditebalkan + warna accent (persis r.weight/r.nameColor
// per-item di canvas), rival lain teks/bar netral (text-text-primary/
// bg-text-muted) — TIDAK dikategorikan tinggi/sedang/rendah seperti
// KekuatanRankingRow karena semantiknya beda (ranking suara, bukan tier
// ancaman). Suffix "(Kita)" dirender di sini (bukan di-bake ke `namaLengkap`
// oleh service) — presentasi murni, `namaLengkap` mentah dipakai apa adanya
// kalau row ini dibuka untuk edit.
// 2026-08-24 (lanjutan) — Pressable (tadinya View statis) — tap buka
// RivalDetailSheet yang sama dengan tab Daftar Rival (termasuk kandidat KITA
// sendiri), dari situ user bisa Edit/Hapus — izin build tanpa referensi.
export function RivalKekuatanRow({ namaLengkap, estimasiSuara, pct, basis, isKita, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="gap-xs active:opacity-70">
      <View className="flex-row items-baseline justify-between gap-sm">
        <Text
          className={`flex-1 text-label-md ${isKita ? "font-bold text-accent" : "font-medium text-text-secondary"}`}
        >
          {namaLengkap}
          {isKita ? " (Kita)" : ""}
        </Text>
        <Text className={`text-label-md font-bold ${isKita ? "text-accent" : "text-text-primary"}`}>
          {estimasiSuara.toLocaleString("id-ID")} suara
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View
          className={`h-full rounded-full ${isKita ? "bg-accent" : "bg-text-muted"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </View>
      <Text className="text-caption text-text-muted">{basis}</Text>
    </Pressable>
  );
}
