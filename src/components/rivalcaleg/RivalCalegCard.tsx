import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import type { RivalCaleg } from "@/types/rivalcaleg";

type Props = {
  item: RivalCaleg;
  onPress: () => void;
};

// Tidak ada referensi desain — izin build dari ui-rules.md/ui-tokens.md (fitur
// baru, permintaan user, lihat progress-tracker.md Decisions).
export function RivalCalegCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Text className="text-caption text-text-muted">
          {item.noUrut !== null ? `No. Urut ${item.noUrut}` : "No. urut belum diisi"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </Pressable>
  );
}
