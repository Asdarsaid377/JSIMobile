import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/formatRupiah";
import type { BudgetTransaction } from "@/types/budgeting";

type Props = {
  item: BudgetTransaction;
  // Baris "Setujui"/"Tolak" — TIDAK ada di canvas asli (pill status di sana
  // read-only), dibangun tanpa referensi visual atas izin eksplisit user
  // (2026-08-24, lihat progress-tracker.md Decisions). Cuma dirender kalau
  // `canModerate` true (gating admin-only dilakukan di screen pemanggil,
  // pola sama BudgetPlafonScreen) DAN status masih "Menunggu".
  canModerate?: boolean;
  isModerating?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
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

export function BudgetTransactionRow({ item, canModerate = false, isModerating = false, onApprove, onReject }: Props) {
  const showModeration = canModerate && item.status === "Menunggu";

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-center justify-between gap-sm">
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

      {showModeration ? (
        <View className="flex-row gap-sm border-t border-border pt-sm">
          <Pressable
            onPress={onApprove}
            disabled={isModerating}
            className={`min-h-[36px] flex-1 items-center justify-center rounded-md bg-success-soft ${
              isModerating ? "opacity-60" : "active:opacity-80"
            }`}
          >
            {isModerating ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text className="text-label-md font-semibold text-success">Setujui</Text>
            )}
          </Pressable>
          <Pressable
            onPress={onReject}
            disabled={isModerating}
            className={`min-h-[36px] flex-1 items-center justify-center rounded-md bg-danger-soft ${
              isModerating ? "opacity-60" : "active:opacity-80"
            }`}
          >
            {isModerating ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Text className="text-label-md font-semibold text-danger">Tolak</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
