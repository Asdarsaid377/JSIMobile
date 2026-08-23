import { Text, View } from "react-native";

import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  namaKelurahan: string;
  skorRata: number;
  tier: StrengthTier;
};

const TIER_TEXT_CLASS: Record<StrengthTier, string> = {
  kuat: "text-success",
  sedang: "text-warning",
  lemah: "text-danger",
};

const TIER_BAR_CLASS: Record<StrengthTier, string> = {
  kuat: "bg-success",
  sedang: "bg-warning",
  lemah: "bg-danger",
};

// Baris "Ranking Kelurahan" — nama + skor di atas, progress bar di bawah (persen
// bar = skor langsung, karena skala skor sudah 0-100).
export function KekuatanRankingRow({ namaKelurahan, skorRata, tier }: Props) {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{namaKelurahan}</Text>
        <Text className={`text-headline-md font-semibold ${TIER_TEXT_CLASS[tier]}`}>{skorRata}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-2 rounded-full ${TIER_BAR_CLASS[tier]}`} style={{ width: `${Math.min(skorRata, 100)}%` }} />
      </View>
    </View>
  );
}
