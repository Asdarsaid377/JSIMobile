import { Text, View } from "react-native";

type Props = {
  totalAspirasi: number;
  isuDominan: string;
  ringkasanSumber: string;
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" — kartu gelap hero di atas 3
// tab, pola sama AntiFraudSummaryCard/BudgetHeroCard (bg-primary, 2 angka
// berdampingan + caption sumber data).
export function IsuSummaryCard({ totalAspirasi, isuDominan, ringkasanSumber }: Props) {
  return (
    <View className="gap-sm rounded-lg bg-primary p-md">
      <View className="flex-row items-start justify-between">
        <View className="gap-xs">
          <Text className="text-caption text-text-inverse-muted">Aspirasi terkumpul</Text>
          <Text className="text-headline-md font-bold text-text-inverse">{totalAspirasi.toLocaleString("id-ID")}</Text>
        </View>
        <View className="items-end gap-xs">
          <Text className="text-caption text-text-inverse-muted">Isu dominan</Text>
          <Text className="text-body-lg font-bold text-accent">{isuDominan}</Text>
        </View>
      </View>
      <Text className="text-caption text-text-inverse-muted">{ringkasanSumber}</Text>
    </View>
  );
}
