import { Text, View } from "react-native";

type Props = {
  noTps: number;
  totalSuara: number;
};

// Referensi web `DprRiKelurahan.jsx` — TPS ditampilkan inline di halaman
// Kelurahan (tidak ada route TPS terpisah untuk DPR RI, beda dari DPRD
// Provinsi/Kabupaten yang punya route TPS sendiri, lihat types/hasilrekap.ts).
export function HasilRekapTpsRow({ noTps, totalSuara }: Props) {
  return (
    <View className="flex-row items-center justify-between rounded-lg border border-border bg-surface p-md">
      <Text className="text-body-md font-semibold text-text-primary">TPS {String(noTps).padStart(2, "0")}</Text>
      <Text className="text-label-md font-bold text-text-primary">{totalSuara.toLocaleString("id-ID")} suara</Text>
    </View>
  );
}
