import { Text, View } from "react-native";

import { formatRupiahJuta } from "@/lib/formatRupiah";
import type { BudgetTrendPoint } from "@/types/budgeting";

type Props = {
  points: readonly BudgetTrendPoint[];
};

export function BudgetTrendChart({ points }: Props) {
  if (points.length === 0) return null;
  const avg = points.reduce((sum, point) => sum + point.heightPct, 0) / points.length;

  return (
    <View className="gap-sm">
      <View className="h-[110px] flex-row items-end gap-sm">
        {points.map((point) => {
          // Batang navy (bg-primary) kalau di atas rata-rata periode yang
          // ditampilkan, selain itu biru (bg-accent) — persis logika canvas asli.
          const isAboveAvg = point.heightPct > avg;
          return (
            <View key={point.label} className="h-full flex-1 items-center gap-xs">
              <Text className="text-caption font-semibold text-text-muted">{formatRupiahJuta(point.amount)}</Text>
              <View className="w-full flex-1 justify-end">
                <View
                  className={`w-full rounded-t-sm ${isAboveAvg ? "bg-primary" : "bg-accent"}`}
                  style={{ height: `${point.heightPct}%` }}
                />
              </View>
              <Text className="text-caption text-text-muted">{point.label}</Text>
            </View>
          );
        })}
      </View>
      <Text className="text-caption text-text-muted">Batang biru tua = melewati rata-rata periode ini</Text>
    </View>
  );
}
