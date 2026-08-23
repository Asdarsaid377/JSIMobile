import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export function KekuatanEmptyState() {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="bar-chart-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">
        Belum ada kunjungan Door To Door dengan kategori terisi di wilayah ini.
      </Text>
    </View>
  );
}
