import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/formatRupiah";
import type { BudgetTransaction } from "@/types/budgeting";

type Props = {
  item: BudgetTransaction;
};

const STATUS_VARIANT: Record<BudgetTransaction["status"], "success" | "warning" | "danger"> = {
  Disetujui: "success",
  Menunggu: "warning",
  Ditolak: "danger",
};

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "-";
  }
}

export function BudgetTransactionRow({ item }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-1 gap-xs">
        <Text numberOfLines={1} className="text-body-md font-semibold text-text-primary">
          {item.title}
        </Text>
        <Text className="text-caption text-text-muted">
          {item.pos} · {formatTanggal(item.createdAt)} · {item.oleh}
        </Text>
      </View>
      <View className="items-end gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{formatRupiah(item.nominal)}</Text>
        <Badge label={item.status} variant={STATUS_VARIANT[item.status]} />
      </View>
    </View>
  );
}
