import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";

type Props = {
  onAdd: () => void;
};

export function DtdoorEmptyState({ onAdd }: Props) {
  return (
    <View className="items-center gap-md px-margin-mobile py-xl">
      <Ionicons name="walk-outline" size={40} color="#64748b" />
      <Text className="text-center text-body-md text-text-muted">Belum ada kunjungan Door To Door tercatat.</Text>
      <Button label="+ Input Kunjungan Baru" variant="primary" onPress={onAdd} />
    </View>
  );
}
