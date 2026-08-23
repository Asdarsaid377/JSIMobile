import { Text, View } from "react-native";

import { formatRupiah } from "@/lib/formatRupiah";
import type { BudgetSummary } from "@/types/budgeting";

type Props = {
  summary: BudgetSummary;
};

export function BudgetHeroCard({ summary }: Props) {
  return (
    <View className="gap-sm rounded-lg bg-primary p-md">
      <View className="gap-xs">
        <Text className="text-caption text-text-inverse-muted">Total Anggaran {summary.scopeLabel}</Text>
        <Text className="text-headline-md font-bold text-text-inverse">{formatRupiah(summary.total)}</Text>
      </View>
      {/* Track putih transparan di atas bg-primary — tidak ada token project untuk
          overlay putih semi-transparan (sama alasan dengan scrim rgba di
          Select.tsx), hex di-hardcode lewat style, bukan className. */}
      <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
        <View className="h-full rounded-full bg-accent" style={{ width: `${summary.usedPct}%` }} />
      </View>
      <View className="flex-row justify-between">
        <View className="gap-xs">
          <Text className="text-caption text-text-inverse-muted">Terpakai</Text>
          {/* text-accent (bukan text-inverse) untuk beda visual dari "Sisa" —
              deviasi kecil dari #93C5FD di canvas asli, token terdekat yang ada
              (tidak menambah hex baru, pola sama dengan deviasi kecil lain di
              ui-registry.md). */}
          <Text className="text-body-md font-bold text-accent">
            {formatRupiah(summary.used)} · {summary.usedPct}%
          </Text>
        </View>
        <View className="items-end gap-xs">
          <Text className="text-caption text-text-inverse-muted">Sisa</Text>
          <Text className="text-body-md font-bold text-text-inverse">{formatRupiah(summary.left)}</Text>
        </View>
      </View>
    </View>
  );
}
