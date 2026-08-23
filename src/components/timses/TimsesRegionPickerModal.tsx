import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";

export type TimsesRegionOption = {
  value: string;
  label: string;
  sublabel?: string;
};

type Props = {
  visible: boolean;
  title: string;
  options: readonly TimsesRegionOption[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
  allLabel?: string;
};

// Pola modal bottom-sheet sama dengan src/components/ui/Select.tsx (rounded-t-xl
// bg-surface, row min-h-[44px], checkmark accent) — dibuat terpisah (bukan reuse
// Select) karena trigger-nya teks breadcrumb (bukan field bordered) dan butuh opsi
// "Semua" bernilai null yang tidak didukung generic Select<T extends string|number>.
export function TimsesRegionPickerModal({ visible, title, options, selectedValue, onSelect, onClose, allLabel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
        onPress={onClose}
      >
        <Pressable className="max-h-[70%] rounded-t-xl bg-surface p-md" onPress={(e) => e.stopPropagation()}>
          <Text className="pb-sm text-body-lg font-semibold text-text-primary">{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            ListHeaderComponent={
              allLabel ? (
                <Pressable
                  className="min-h-[44px] flex-row items-center justify-between px-xs py-sm active:opacity-80"
                  onPress={() => {
                    onSelect(null);
                    onClose();
                  }}
                >
                  <Text className="text-body-md text-text-primary">{allLabel}</Text>
                  {selectedValue === null ? <Ionicons name="checkmark" size={20} color="#3b82f6" /> : null}
                </Pressable>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                className="min-h-[44px] flex-row items-center justify-between px-xs py-sm active:opacity-80"
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <View>
                  <Text className="text-body-md text-text-primary">{item.label}</Text>
                  {item.sublabel ? <Text className="text-caption text-text-muted">{item.sublabel}</Text> : null}
                </View>
                {item.value === selectedValue ? <Ionicons name="checkmark" size={20} color="#3b82f6" /> : null}
              </Pressable>
            )}
          />
          <Button label="Batal" variant="secondary" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
