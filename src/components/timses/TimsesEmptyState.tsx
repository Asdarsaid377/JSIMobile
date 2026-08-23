import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  hasSearch: boolean;
};

export function TimsesEmptyState({ hasSearch }: Props) {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="people-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">
        {hasSearch ? "Tidak ada anggota yang cocok dengan pencarian." : "Belum ada anggota timses di wilayah ini."}
      </Text>
    </View>
  );
}
