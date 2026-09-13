import { Text, View } from "react-native";

import { ROLE_LABEL } from "@/lib/permissions";
import type { TimsesMember } from "@/types/timses";

type Props = {
  item: TimsesMember;
};

export function TrackingMemberRow({ item }: Props) {
  const isOnline = item.statusOnline === "online";

  return (
    <View className="flex-row items-center justify-between gap-sm py-xs">
      <View className="flex-1 flex-row items-center gap-sm">
        <View className={`h-2 w-2 shrink-0 rounded-full ${isOnline ? "bg-success" : "bg-text-muted"}`} />
        <Text className="flex-1 text-body-md font-semibold text-text-primary" numberOfLines={1}>
          {item.namaLengkap}
        </Text>
      </View>
      <Text className="shrink-0 text-caption text-text-muted">{ROLE_LABEL[item.roles]}</Text>
    </View>
  );
}
