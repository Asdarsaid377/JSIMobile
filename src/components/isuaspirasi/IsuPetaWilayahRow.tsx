import { Text, View } from "react-native";

import type { IsuWilayahLevel } from "@/types/isuaspirasi";

type Props = {
  nama: string;
  totalAspirasi: number;
  isuDominan: string;
  level: IsuWilayahLevel;
};

const LEVEL_DOT_CLASS: Record<IsuWilayahLevel, string> = {
  tinggi: "bg-danger",
  sedang: "bg-warning",
  rendah: "bg-accent",
};
const LEVEL_BADGE_BG_CLASS: Record<IsuWilayahLevel, string> = {
  tinggi: "bg-danger-soft",
  sedang: "bg-warning-soft",
  rendah: "bg-accent-soft",
};
const LEVEL_BADGE_TEXT_CLASS: Record<IsuWilayahLevel, string> = {
  tinggi: "text-danger",
  sedang: "text-warning",
  rendah: "text-accent",
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § "Peta Isu" — mockup punya
// overlay warna dekoratif di atas tekstur peta (garis diagonal + blok warna
// per kelurahan). Disederhanakan jadi list row berwarna (dot + nama + total +
// badge isu dominan) — TIDAK ADA library map/asset di project ini, pola sama
// simplifikasi elemen peta dekoratif yang sudah dipakai AntiFraudEvidenceSheet
// (lihat ui-registry.md § AntiFraudSummaryCard.../Catatan). `level` (tinggi/
// sedang/rendah, berdasar volume aspirasi relatif) dipakai untuk warna dot &
// badge — bukan replikasi warna arbitrer per isu di mockup.
export function IsuPetaWilayahRow({ nama, totalAspirasi, isuDominan, level }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-center gap-sm">
        <View className={`h-2.5 w-2.5 rounded-sm ${LEVEL_DOT_CLASS[level]}`} />
        <View className="gap-xs">
          <Text className="text-body-md font-semibold text-text-primary">{nama}</Text>
          <Text className="text-caption text-text-muted">{totalAspirasi} aspirasi tercatat</Text>
        </View>
      </View>
      <View className={`rounded-full px-sm py-xs ${LEVEL_BADGE_BG_CLASS[level]}`}>
        <Text className={`text-caption font-bold ${LEVEL_BADGE_TEXT_CLASS[level]}`}>{isuDominan}</Text>
      </View>
    </View>
  );
}
