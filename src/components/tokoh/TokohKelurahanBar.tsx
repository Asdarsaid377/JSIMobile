import { Text, View } from "react-native";

type Props = {
  label: string;
  count: number;
  percentOfMax: number;
  highlight: boolean;
};

// Referensi context/designs/tokoh1.png § "Sebaran per Kelurahan" — kolom bar
// vertikal (angka di atas, bar, label di bawah). Sama aturan highlight dengan
// TokohKategoriRow: kelurahan PALING BANYAK gelap, sisanya biru.
export function TokohKelurahanBar({ label, count, percentOfMax, highlight }: Props) {
  return (
    <View className="w-20 items-center gap-xs">
      <Text className="text-body-md font-bold text-text-primary">{count}</Text>
      <View className="h-[90px] w-full justify-end">
        <View className={`w-full rounded-t-sm ${highlight ? "bg-primary" : "bg-accent"}`} style={{ height: `${percentOfMax}%` }} />
      </View>
      <Text numberOfLines={1} ellipsizeMode="tail" className="text-caption text-text-muted">
        {label}
      </Text>
    </View>
  );
}
