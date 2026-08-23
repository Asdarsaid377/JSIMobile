import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { FraudCase, FraudLevel } from "@/types/antifraud";

type Props = {
  item: FraudCase;
  onPress: (item: FraudCase) => void;
};

const LEVEL_VARIANT: Record<FraudLevel, "danger" | "warning" | "muted"> = {
  Tinggi: "danger",
  Sedang: "warning",
  Rendah: "muted",
};
const LEVEL_BORDER_CLASS: Record<FraudLevel, string> = {
  Tinggi: "border-danger",
  Sedang: "border-warning",
  Rendah: "border-border",
};
const LEVEL_NOTE_BG_CLASS: Record<FraudLevel, string> = {
  Tinggi: "bg-danger-soft",
  Sedang: "bg-warning-soft",
  Rendah: "bg-surface-secondary",
};
const LEVEL_NOTE_TEXT_CLASS: Record<FraudLevel, string> = {
  Tinggi: "text-danger",
  Sedang: "text-warning",
  Rendah: "text-text-muted",
};
const LEVEL_DOT_CLASS: Record<FraudLevel, string> = {
  Tinggi: "bg-danger",
  Sedang: "bg-warning",
  Rendah: "bg-text-muted",
};

// Referensi artboard "14 · VERIFIKASI KUNJUNGAN" § "Perlu Ditinjau" — card
// dengan border warna sesuai level, note box alasan, 2 pill kecil status
// GPS/Foto (merah kalau bermasalah, hijau kalau aman), "Tinjau bukti" buka
// AntiFraudEvidenceSheet.
export function AntiFraudCaseCard({ item, onPress }: Props) {
  const gpsBad = item.gpsStatus !== "ada";
  const fotoBad = item.fotoStatus !== "ada";

  return (
    <Pressable
      onPress={() => onPress(item)}
      className={`gap-sm rounded-lg border bg-surface p-md active:opacity-80 ${LEVEL_BORDER_CLASS[item.level]}`}
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 gap-xs">
          <Text className="text-body-md font-semibold text-text-primary">{item.relawan}</Text>
          <Text className="text-caption text-text-muted">
            {item.target} · {item.waktu}
          </Text>
        </View>
        <Badge label={item.level} variant={LEVEL_VARIANT[item.level]} />
      </View>

      <View className={`flex-row gap-sm rounded-md p-sm ${LEVEL_NOTE_BG_CLASS[item.level]}`}>
        <View className={`mt-xs h-1.5 w-1.5 rounded-full ${LEVEL_DOT_CLASS[item.level]}`} />
        <Text className={`flex-1 text-caption ${LEVEL_NOTE_TEXT_CLASS[item.level]}`}>{item.alasan}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-xs">
          <View className={`rounded-md px-sm py-xs ${gpsBad ? "bg-danger-soft" : "bg-success-soft"}`}>
            <Text className={`text-caption font-semibold ${gpsBad ? "text-danger" : "text-success"}`}>
              GPS {item.gpsStatus}
            </Text>
          </View>
          <View className={`rounded-md px-sm py-xs ${fotoBad ? "bg-danger-soft" : "bg-success-soft"}`}>
            <Text className={`text-caption font-semibold ${fotoBad ? "text-danger" : "text-success"}`}>
              Foto {item.fotoStatus}
            </Text>
          </View>
        </View>
        <Text className="text-label-md font-semibold text-accent">Tinjau bukti</Text>
      </View>
    </Pressable>
  );
}
