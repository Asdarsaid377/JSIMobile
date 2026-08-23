import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { ANCAMAN_LEVEL_LABEL } from "@/types/rivalcaleg";
import type { AncamanLevel, RivalAssessment } from "@/types/rivalcaleg";

type Props = {
  item: RivalAssessment;
  onPress: () => void;
};

const ANCAMAN_BADGE_VARIANT: Record<AncamanLevel, "success" | "warning" | "danger"> = {
  rendah: "success",
  sedang: "warning",
  tinggi: "danger",
};

// Tap kartu → buka RivalAssessmentFormScreen dalam mode edit (pre-filled) —
// lihat RivalCalegDetailScreen.tsx. Tidak ada referensi desain (izin build dari
// ui-rules.md/ui-tokens.md).
export function RivalAssessmentCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="gap-xs rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">
          {item.desa ? `${item.desa}, Kec. ${item.kecamatan}` : `Kec. ${item.kecamatan}`}
        </Text>
        <Badge label={`Ancaman ${ANCAMAN_LEVEL_LABEL[item.levelAncaman]}`} variant={ANCAMAN_BADGE_VARIANT[item.levelAncaman]} />
      </View>
      {item.catatan ? <Text className="text-caption text-text-muted">{item.catatan}</Text> : null}
    </Pressable>
  );
}
