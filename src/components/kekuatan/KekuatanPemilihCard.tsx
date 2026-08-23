import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { StrengthTier } from "@/lib/dtdoorScore";
import type { Dtdoor } from "@/types/dtdoor";

type Props = {
  item: Dtdoor;
  score: number;
  tier: StrengthTier;
};

const TIER_BADGE_VARIANT: Record<StrengthTier, "success" | "warning" | "danger"> = {
  kuat: "success",
  sedang: "warning",
  lemah: "danger",
};

// Sama formatTanggal lokal dengan DtdoorCard.tsx/GotvCard.tsx — sengaja tidak
// diabstraksi jadi util bersama (preseden Feature 04/05, cuma 2-3 pemakaian &
// folder-per-fitur, lihat ui-registry.md).
function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "-";
  }
}

// Baris "Pemilih Skor Tertinggi" — nama + wilayah·tanggal kunjungan di kiri,
// badge skor (warna sesuai tier, reuse Badge success/warning/danger) di kanan.
export function KekuatanPemilihCard({ item, score, tier }: Props) {
  const wilayah = item.desa ?? item.kecamatan ?? "Wilayah tidak diisi";

  return (
    <View className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Text className="text-caption text-text-muted">
          {wilayah} · kunjungan {formatTanggal(item.createdAt)}
        </Text>
      </View>
      <Badge label={String(score)} variant={TIER_BADGE_VARIANT[tier]} />
    </View>
  );
}
