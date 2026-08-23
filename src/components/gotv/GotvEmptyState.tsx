import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";

type Props = {
  onAdd: () => void;
};

export function GotvEmptyState({ onAdd }: Props) {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="calendar-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">Belum ada kegiatan Social Event tercatat.</Text>
      <Button label="+ Input Kegiatan Baru" variant="primary" onPress={onAdd} />
    </View>
  );
}
