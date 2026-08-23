import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export function TrackingEmptyState() {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="people-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">Belum ada anggota timses.</Text>
    </View>
  );
}
