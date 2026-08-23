import { Text, View } from "react-native";

type Props = {
  nama: string;
  jumlahKasus: number;
  percentOfMax: number;
  severity: "tinggi" | "sedang";
};

// Referensi artboard "14 · VERIFIKASI KUNJUNGAN" § "Jenis Anomali Terdeteksi" —
// bar horizontal, lebar proporsional count/maxCount (di-derive, bukan angka
// pct statis kayak mockup). 2 tingkat warna (tinggi=danger, sedang=warning)
// persis mockup.
export function AntiFraudJenisRow({ nama, jumlahKasus, percentOfMax, severity }: Props) {
  const colorClass = severity === "tinggi" ? "text-danger" : "text-warning";
  const barClass = severity === "tinggi" ? "bg-danger" : "bg-warning";

  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between">
        <Text className="text-label-md font-semibold text-text-secondary">{nama}</Text>
        <Text className={`text-label-md font-bold ${colorClass}`}>{jumlahKasus} kasus</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-full rounded-full ${barClass}`} style={{ width: `${percentOfMax}%` }} />
      </View>
    </View>
  );
}
