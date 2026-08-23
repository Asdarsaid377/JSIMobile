import { Text, View } from "react-native";

import { STRENGTH_THRESHOLDS } from "@/lib/dtdoorScore";
import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  tier: StrengthTier;
  count: number;
  percent: number;
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

const TIER_RANGE_LABEL: Record<StrengthTier, string> = {
  kuat: `Kuat (skor ≥ ${STRENGTH_THRESHOLDS.kuat})`,
  sedang: `Sedang (skor ${STRENGTH_THRESHOLDS.sedang}–${STRENGTH_THRESHOLDS.kuat - 1})`,
  lemah: `Lemah (skor < ${STRENGTH_THRESHOLDS.sedang})`,
};

// Baris "Distribusi Kekuatan Dukungan" — label+range di kiri, "N pemilih · P%" di
// kanan, progress bar tipis di bawah. Threshold teks diturunkan dari
// STRENGTH_THRESHOLDS (dtdoorScore.ts), bukan string hardcode terpisah, supaya
// tetap sinkron kalau ambang batasnya berubah.
export function KekuatanDistribusiRow({ tier, count, percent }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className={`text-body-md font-semibold ${TIER_TEXT_CLASS[tier]}`}>{TIER_RANGE_LABEL[tier]}</Text>
        <Text className={`text-body-md font-semibold ${TIER_TEXT_CLASS[tier]}`}>
          {count} pemilih · {Math.round(percent)}%
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-2 rounded-full ${TIER_BAR_CLASS[tier]}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </View>
    </View>
  );
}
