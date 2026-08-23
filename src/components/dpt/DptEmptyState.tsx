import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  hasSearch: boolean;
};

export function DptEmptyState({ hasSearch }: Props) {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="document-text-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">
        {hasSearch ? "Tidak ada pemilih yang cocok dengan pencarian." : "Belum ada data DPT di cakupan filter ini."}
      </Text>
    </View>
  );
}
