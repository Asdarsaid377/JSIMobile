import { Text, View } from "react-native";

import type { Role } from "@/types/auth";
import type { TimsesMember } from "@/types/timses";

type Props = {
  item: TimsesMember;
};

// Sama seperti TimsesMemberCard.tsx (Feature 06) — belum diabstraksi jadi shared
// util karena baru 2 pemakaian, pola duplikasi kecil ini konsisten dengan
// GotvSummaryCard/DtdoorSummaryCard (lihat ui-registry.md).
const KECAMATAN_LEVEL_ROLES: readonly Role[] = ["admin", "adminsekret", "relawankabupaten", "relawankecamatan"];

export function TrackingMemberRow({ item }: Props) {
  const isOnline = item.statusOnline === "online";
  const wilayahLabel = KECAMATAN_LEVEL_ROLES.includes(item.roles) ? `Kec. ${item.kecamatan}` : `Ds. ${item.desa}`;

  return (
    <View className="flex-row items-center justify-between gap-sm py-xs">
      <View className="flex-row items-center gap-sm">
        <View className={`h-2 w-2 rounded-full ${isOnline ? "bg-success" : "bg-text-muted"}`} />
        <Text className="text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
      </View>
      <Text className="text-caption text-text-muted">{wilayahLabel}</Text>
    </View>
  );
}
