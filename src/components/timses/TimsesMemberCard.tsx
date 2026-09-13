import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { ROLE_LABEL } from "@/lib/permissions";
import type { TimsesMember } from "@/types/timses";

type Props = {
  item: TimsesMember;
  onPress?: () => void;
};

function getInitials(namaLengkap: string): string {
  const words = namaLengkap.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

// 2026-08-25 — RBAC: baris "Kec. X"/"Ds. Y" DIHAPUS — data itu (string bebas)
// sudah tidak ada di TimsesMember (diganti kabId/kecId/kelId numerik, belum
// ada resolusi ke nama wilayah, lihat progress-tracker.md Decisions). Cukup
// tampilkan role sampai ada cara resolve nama wilayah.
// 2026-08-26 — Pressable (tadinya View statis) — admin/adminsekret bisa tap
// buat buka `TimsesFormScreen` mode edit (Role + Wilayah, lihat catatan
// lengkap di file itu). Prop `onPress` opsional supaya role lain (card tidak
// bisa diketuk sama sekali) tetap konsisten tanpa perlu component terpisah.
export function TimsesMemberCard({ item, onPress }: Props) {
  const isOnline = item.statusOnline === "online";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-accent-soft">
        <Text className="text-body-md font-semibold text-accent">{getInitials(item.namaLengkap)}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Text className="text-caption text-text-muted">{ROLE_LABEL[item.roles]}</Text>
        <View className="flex-row items-center gap-xs">
          <View className={`h-2 w-2 rounded-full ${isOnline ? "bg-success" : "bg-text-muted"}`} />
          <Text className={`text-caption font-medium ${isOnline ? "text-success" : "text-text-muted"}`}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color="#94a3b8" /> : null}
    </Pressable>
  );
}
