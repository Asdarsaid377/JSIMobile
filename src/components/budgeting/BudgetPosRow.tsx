import { Text, View } from "react-native";

import { formatRupiah } from "@/lib/formatRupiah";
import type { BudgetPosRealisasi } from "@/types/budgeting";

type Props = {
  item: BudgetPosRealisasi;
};

// Ambang warna PERSIS canvas asli: >100% merah (melebihi plafon), >=85% kuning
// (mendekati plafon), selain itu biru netral — BUKAN skema tier kekuatan
// (success/warning/danger) yang dipakai Kekuatan Wilayah/Pemilih, karena makna
// di sini murni "seberapa dekat ke batas plafon", bukan "seberapa kuat".
function posColorClass(pct: number): { bar: string; text: string } {
  if (pct > 100) return { bar: "bg-danger", text: "text-danger" };
  if (pct >= 85) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-accent", text: "text-accent" };
}

export function BudgetPosRow({ item }: Props) {
  const color = posColorClass(item.pct);
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between">
        <Text className="text-label-md font-semibold text-text-secondary">{item.name}</Text>
        <Text className={`text-label-md font-semibold ${color.text}`}>{item.pct}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-2 rounded-full ${color.bar}`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
      </View>
      <Text className="text-caption text-text-muted">
        {formatRupiah(item.used)} dari plafon {formatRupiah(item.plafon)}
      </Text>
    </View>
  );
}
