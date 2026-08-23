import { Text, View } from "react-native";

type Props = {
  label: string;
  count: number;
  percentOfMax: number;
  highlight: boolean;
};

// Referensi context/designs/tokoh1.png § "Tokoh per Kategori" — bar horizontal,
// lebar proporsional ke count/maxCount. Cuma kategori PALING BANYAK yang gelap
// (bg-primary), sisanya biru (bg-accent) — persis pola highlight di
// BudgetTrendChart, cuma threshold-nya "rank #1" bukan "di atas rata-rata".
export function TokohKategoriRow({ label, count, percentOfMax, highlight }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between">
        <Text className="text-body-md font-semibold text-text-primary">{label}</Text>
        <Text className="text-body-md font-semibold text-accent">{count} tokoh</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-full rounded-full ${highlight ? "bg-primary" : "bg-accent"}`} style={{ width: `${percentOfMax}%` }} />
      </View>
    </View>
  );
}
