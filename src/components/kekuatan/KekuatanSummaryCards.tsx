import { Text, View } from "react-native";

import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  kuat: number;
  sedang: number;
  lemah: number;
};

const TIER_TEXT_CLASS: Record<StrengthTier, string> = {
  kuat: "text-success",
  sedang: "text-warning",
  lemah: "text-danger",
};

// Beda dari DptSummaryCards (1 kartu gelap + sisanya putih) — di sini SEMUA kartu
// putih, cuma angkanya yang berwarna sesuai tier (dipixel-sample dari
// kekuatanwilayah.png: "4"/"6"/"2" berwarna hijau/oranye/merah, kartu tetap putih).
export function KekuatanSummaryCards({ kuat, sedang, lemah }: Props) {
  const items: { key: StrengthTier; value: number; label: string }[] = [
    { key: "kuat", value: kuat, label: "Zona Kuat" },
    { key: "sedang", value: sedang, label: "Zona Sedang" },
    { key: "lemah", value: lemah, label: "Zona Lemah" },
  ];

  return (
    <View className="flex-row gap-sm">
      {items.map((item) => (
        <View key={item.key} className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
          <Text className={`text-headline-md font-semibold ${TIER_TEXT_CLASS[item.key]}`}>{item.value}</Text>
          <Text className="text-caption text-text-muted">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
