import { Text, View } from "react-native";

type Props = {
  tervalidasi: number;
  total: number;
  anomaliCount: number;
};

// Referensi artboard "14 · VERIFIKASI KUNJUNGAN" — kartu gelap dengan progress
// bar 2-segmen (hijau=tervalidasi, merah=anomali), pola sama `BudgetHeroCard`.
// Tingkat kepercayaan dihitung dari tervalidasi/total (bukan field terpisah)
// supaya konsisten dengan lebar bar. Warna teks reuse token `success` (bukan
// hex `#4ADE80` di mockup — deviasi kecil untuk keterbacaan di bg gelap, pola
// sama `text-accent` di BudgetHeroCard).
export function AntiFraudSummaryCard({ tervalidasi, total, anomaliCount }: Props) {
  const pct = total > 0 ? Math.round((tervalidasi / total) * 100) : 0;

  return (
    <View className="gap-sm rounded-lg bg-primary p-md">
      <View className="flex-row items-start justify-between">
        <View className="gap-xs">
          <Text className="text-caption text-text-inverse-muted">Kunjungan tervalidasi</Text>
          <Text className="text-headline-md font-bold text-text-inverse">
            {tervalidasi} / {total}
          </Text>
        </View>
        <View className="items-end gap-xs">
          <Text className="text-caption text-text-inverse-muted">Tingkat kepercayaan</Text>
          <Text className="text-body-lg font-bold text-success">{pct}%</Text>
        </View>
      </View>
      <View
        className="h-2.5 flex-row overflow-hidden rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
      >
        <View className="h-full bg-success" style={{ width: `${pct}%` }} />
        <View className="h-full bg-danger" style={{ width: `${100 - pct}%` }} />
      </View>
      <Text className="text-caption text-text-inverse-muted">
        {anomaliCount} kunjungan ditandai anomali oleh sistem · perlu review korwil
      </Text>
    </View>
  );
}
