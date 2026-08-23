import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { SAKSI_STATUS_LABEL, SAKSI_STATUS_OPTIONS } from "@/types/saksi";
import type { Saksi, SaksiStatus } from "@/types/saksi";

type Props = {
  item: Saksi;
  onChangeStatus: (status: SaksiStatus) => void;
};

const STATUS_BADGE_VARIANT: Record<SaksiStatus, "warning" | "accent" | "success"> = {
  belum_konfirmasi: "warning",
  terkonfirmasi: "accent",
  hadir_tps: "success",
};

// Tidak ada referensi desain — izin build dari ui-rules.md/ui-tokens.md (fitur
// "cukup UI dulu", permintaan user, lihat progress-tracker.md Decisions). Ganti
// status reuse `Select` apa adanya (tap kartu buka modal pilih status) — bukan
// primitive baru.
export function SaksiCard({ item, onChangeStatus }: Props) {
  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Badge label={SAKSI_STATUS_LABEL[item.status]} variant={STATUS_BADGE_VARIANT[item.status]} />
      </View>
      <Text className="text-caption text-text-muted">{item.noTelpon}</Text>
      <Select label="Ubah Status" value={item.status} onChange={onChangeStatus} options={SAKSI_STATUS_OPTIONS} />
    </View>
  );
}
