import { Text, View } from "react-native";

import type { Role } from "@/types/auth";
import type { TimsesMember } from "@/types/timses";

type Props = {
  item: TimsesMember;
};

// Label peran khusus untuk konteks list hierarki (beda copy dari ROLE_LABEL badge
// di ProfileScreen.tsx — konteksnya beda, sesuai desain context/designs/timses.png).
const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  adminsekret: "Admin Sekretariat",
  relawankabupaten: "Korwil Kabupaten",
  relawankecamatan: "Korwil Kecamatan",
  relawandesa: "Koordinator Desa",
  timses: "Anggota Timses",
  relawantps: "Relawan TPS",
};

const KECAMATAN_LEVEL_ROLES: readonly Role[] = ["admin", "adminsekret", "relawankabupaten", "relawankecamatan"];

function getInitials(namaLengkap: string): string {
  const words = namaLengkap.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function TimsesMemberCard({ item }: Props) {
  const isOnline = item.statusOnline === "online";
  const wilayahLabel = KECAMATAN_LEVEL_ROLES.includes(item.roles) ? `Kec. ${item.kecamatan}` : `Ds. ${item.desa}`;

  return (
    <View className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-accent-soft">
        <Text className="text-body-md font-semibold text-accent">{getInitials(item.namaLengkap)}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Text className="text-caption text-text-muted">
          {ROLE_LABEL[item.roles]} · {wilayahLabel}
        </Text>
        <View className="flex-row items-center gap-xs">
          <View className={`h-2 w-2 rounded-full ${isOnline ? "bg-success" : "bg-text-muted"}`} />
          <Text className={`text-caption font-medium ${isOnline ? "text-success" : "text-text-muted"}`}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
    </View>
  );
}
