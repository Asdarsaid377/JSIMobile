import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  nama: string;
  sublabel: string;
  onPress: () => void;
};

// Dipakai di DptProvinsiScreen & DptKabupatenScreen (Feature 08 tahap 1 & 2) —
// referensi context/designs/dptlistdaerah.png ("DPT — Pilih Provinsi").
export function DptRegionCard({ nama, sublabel, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{nama}</Text>
        <Text className="text-caption text-text-muted">{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </Pressable>
  );
}
