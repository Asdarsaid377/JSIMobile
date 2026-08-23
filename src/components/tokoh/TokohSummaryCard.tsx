import { Text, View } from "react-native";

type Props = {
  total: number;
  estimasiBasisMassa: number;
  mendukung: number;
  netral: number;
  lawan: number;
};

// Referensi context/designs/tokoh1.png — kartu gelap "Tokoh teridentifikasi" /
// "Estimasi basis massa" + 3 sub-kartu Mendukung/Netral/Lawan. Sub-kartu pakai
// overlay putih transparan (tidak ada token project untuk itu — hex
// di-hardcode, sama alasan dengan BudgetHeroCard.tsx).
export function TokohSummaryCard({ total, estimasiBasisMassa, mendukung, netral, lawan }: Props) {
  return (
    <View className="gap-sm rounded-lg bg-primary p-md">
      <View className="flex-row justify-between">
        <View className="gap-xs">
          <Text className="text-caption text-text-inverse-muted">Tokoh teridentifikasi</Text>
          <Text className="text-headline-md font-bold text-text-inverse">{total}</Text>
        </View>
        <View className="items-end gap-xs">
          <Text className="text-caption text-text-inverse-muted">Estimasi basis massa</Text>
          <Text className="text-headline-md font-bold text-accent">±{estimasiBasisMassa.toLocaleString("id-ID")}</Text>
        </View>
      </View>
      <View className="flex-row gap-sm">
        <View className="flex-1 items-center gap-xs rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <Text className="text-body-lg font-bold text-success">{mendukung}</Text>
          <Text className="text-caption text-text-inverse-muted">Mendukung</Text>
        </View>
        <View className="flex-1 items-center gap-xs rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <Text className="text-body-lg font-bold text-warning">{netral}</Text>
          <Text className="text-caption text-text-inverse-muted">Netral</Text>
        </View>
        <View className="flex-1 items-center gap-xs rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <Text className="text-body-lg font-bold text-danger">{lawan}</Text>
          <Text className="text-caption text-text-inverse-muted">Lawan</Text>
        </View>
      </View>
    </View>
  );
}
