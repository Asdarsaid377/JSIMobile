import { Text, View } from "react-native";

type Props = {
  label: string;
  count: number;
  percent: number;
};

// Baris magnitude netral (warna `accent` tunggal, BUKAN warna tier
// success/warning/danger) — dipakai untuk "Distribusi Gender" & "Program
// Bantuan Terpopuler" di DtdoorAnalyticsScreen, beda dari `DtdoorCategoryRow`
// yang warnanya ikut tier kekuatan kategori. Gender/program bantuan tidak
// punya makna status baik/buruk, jadi 1 hue sequential (aturan dataviz: "one
// hue, more-is-darker" untuk job magnitude) lebih jujur daripada dipaksa warna
// status yang tidak relevan.
export function DtdoorMagnitudeRow({ label, count, percent }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="flex-1 text-body-md text-text-primary">{label}</Text>
        <Text className="text-body-md font-semibold text-accent">
          {count} ({percent}%)
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(percent, 100)}%` }} />
      </View>
    </View>
  );
}
