import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { Dtdoor } from "@/types/dtdoor";

type Props = {
  item: Dtdoor;
};

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return "-";
  }
}

export function DtdoorCard({ item }: Props) {
  const alamat = [item.desa, item.kecamatan, item.kabupaten].filter(Boolean).join(", ") || "Alamat tidak diisi";

  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-lg font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Badge label={item.kategoriLabel ?? "Belum Dikategorikan"} variant="accent" />
      </View>
      <Text className="text-caption text-text-muted">{alamat}</Text>
      <Text className="text-caption text-text-muted">
        PIC: {item.namaRelawan ?? "-"} · {formatTanggal(item.createdAt)}
      </Text>
    </View>
  );
}
