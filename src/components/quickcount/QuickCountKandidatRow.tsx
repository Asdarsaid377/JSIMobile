import { Text, View } from "react-native";

type Props = {
  nama: string;
  partai: string;
  votes: number;
  percent: number;
  leading: boolean;
};

// Referensi mockup "Perolehan Suara Kandidat" — bar horizontal, kandidat
// TERATAS (leading) biru accent, sisanya abu (text-muted) — versi
// disederhanakan dari 3-tier warna mockup asli (`lead`/`pct>=20`/`else`,
// masing-masing hex sendiri), 2-tier sudah cukup jelas bedanya & tetap pakai
// token yang ada (bukan hex baru).
export function QuickCountKandidatRow({ nama, partai, votes, percent, leading }: Props) {
  const colorClass = leading ? "text-accent" : "text-text-muted";
  const barClass = leading ? "bg-accent" : "bg-text-muted";

  return (
    <View className="gap-xs">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-label-md font-semibold text-text-primary">
          {nama}
          {partai ? ` (${partai})` : ""}
        </Text>
        <Text className={`text-label-md font-bold ${colorClass}`}>
          {votes.toLocaleString("id-ID")} · {Math.round(percent)}%
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
