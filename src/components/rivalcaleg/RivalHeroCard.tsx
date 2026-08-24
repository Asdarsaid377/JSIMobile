import { Text, View } from "react-native";

type Props = {
  totalTerpetakan: number;
  posisiKita: string;
  ancamanTinggiCount: number;
  wilayahBentrokCount: number;
  selisihKePeringkat1Pct: number;
};

// Referensi artboard "16 · DETEKSI RIVAL CALEG" — kartu gelap hero di atas 3
// tab, pola sama BudgetHeroCard/AntiFraudSummaryCard (bg-primary). Beda dari
// keduanya: ada baris ke-2 berisi 3 kotak mini-stat (`rgba(255,255,255,.08)`,
// tidak ada token untuk overlay putih transparan, sama alasan track progress
// bar BudgetHeroCard). 3 warna pastel canvas (#FCA5A5/#FCD34D/#93C5FD)
// dipetakan ke token terdekat (danger/warning/accent) — deviasi kecil yang
// sudah jadi pola standing di project ini (lihat BudgetHeroCard/
// AntiFraudSummaryCard untuk preseden yang sama).
export function RivalHeroCard({
  totalTerpetakan,
  posisiKita,
  ancamanTinggiCount,
  wilayahBentrokCount,
  selisihKePeringkat1Pct,
}: Props) {
  return (
    <View className="gap-sm rounded-lg bg-primary p-md">
      <View className="flex-row items-start justify-between">
        <View className="gap-xs">
          <Text className="text-caption text-text-inverse-muted">Rival terpetakan</Text>
          <Text className="text-headline-md font-bold text-text-inverse">{totalTerpetakan} caleg</Text>
        </View>
        <View className="items-end gap-xs">
          <Text className="text-caption text-text-inverse-muted">Posisi kita</Text>
          <Text className="text-body-lg font-bold text-success">{posisiKita}</Text>
        </View>
      </View>
      <View className="flex-row gap-xs">
        <View className="flex-1 rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <Text className="text-body-md font-bold text-danger">{ancamanTinggiCount}</Text>
          <Text className="text-caption text-text-inverse-muted">Ancaman tinggi</Text>
        </View>
        <View className="flex-1 rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <Text className="text-body-md font-bold text-warning">{wilayahBentrokCount}</Text>
          <Text className="text-caption text-text-inverse-muted">Wilayah bentrok</Text>
        </View>
        <View className="flex-1 rounded-md p-sm" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <Text className="text-body-md font-bold text-accent">{selisihKePeringkat1Pct.toString().replace(".", ",")}%</Text>
          <Text className="text-caption text-text-inverse-muted">Selisih ke #1</Text>
        </View>
      </View>
    </View>
  );
}
