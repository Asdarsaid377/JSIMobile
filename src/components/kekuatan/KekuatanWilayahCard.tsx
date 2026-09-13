import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { STRENGTH_TIER_LABEL } from "@/lib/dtdoorScore";
import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  namaKelurahan: string;
  jumlahKunjungan: number;
  skorRata: number;
  tier: StrengthTier;
};

const TIER_BADGE_VARIANT: Record<StrengthTier, "success" | "warning" | "danger"> = {
  kuat: "success",
  sedang: "warning",
  lemah: "danger",
};

// Reuse Badge (success/warning/danger sudah ada, tidak perlu varian baru) untuk
// label tier — konsisten dengan pola badge status di seluruh app.
export function KekuatanWilayahCard({ namaKelurahan, jumlahKunjungan, skorRata, tier }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
          {namaKelurahan}
        </Text>
        <Text className="text-caption text-text-muted">
          {jumlahKunjungan} kunjungan · skor rata {skorRata}
        </Text>
      </View>
      <Badge label={STRENGTH_TIER_LABEL[tier]} variant={TIER_BADGE_VARIANT[tier]} />
    </View>
  );
}
