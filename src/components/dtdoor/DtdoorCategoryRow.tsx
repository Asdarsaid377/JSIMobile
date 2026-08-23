import { Text, View } from "react-native";

import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  label: string;
  count: number;
  percent: number;
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

// Baris "Distribusi Kategori" di DtdoorAnalyticsScreen — warna bar REUSE tier
// kekuatan yang sama dengan skor kategori (lib/dtdoorScore.ts, getStrengthTier),
// bukan palet kategorikal baru — 1 kategori (Relawan/Saksi/dst.) sudah punya
// "tier"-nya sendiri lewat skor, jadi konsisten dengan Kekuatan Wilayah/Pemilih
// alih-alih mengarang 7 warna baru (yang juga akan butuh validasi CVD terpisah).
export function DtdoorCategoryRow({ label, count, percent, tier }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="flex-1 text-body-md text-text-primary">{label}</Text>
        <Text className={`text-body-md font-semibold ${TIER_TEXT_CLASS[tier]}`}>
          {count} ({percent}%)
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-2 rounded-full ${TIER_BAR_CLASS[tier]}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </View>
    </View>
  );
}
