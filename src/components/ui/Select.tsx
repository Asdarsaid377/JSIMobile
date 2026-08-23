import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";

type SelectOption<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function Select<T extends string | number>({
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih",
  error,
  disabled = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="gap-xs">
      <Text className="text-label-md font-medium text-text-primary">{label}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`min-h-[44px] flex-row items-center justify-between gap-sm rounded-md border border-border px-md py-sm ${
          disabled ? "bg-surface-secondary" : "bg-surface"
        }`}
      >
        <Text className={`flex-1 text-body-md ${selected ? "text-text-primary" : "text-text-muted"}`}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#64748b" />
      </Pressable>
      {error ? <Text className="text-caption text-danger">{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          // Tidak ada token project untuk scrim overlay modal — hex di-hardcode
          // (primary #0f172a @ 60% alpha), sama alasan dengan placeholderTextColor
          // di Input.tsx dan track color di Switch.tsx (prop native, bukan className).
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          onPress={() => setOpen(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-xl bg-surface p-md" onPress={(e) => e.stopPropagation()}>
            <Text className="pb-sm text-body-lg font-semibold text-text-primary">{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <Pressable
                  className="min-h-[44px] flex-row items-center justify-between px-xs py-sm active:opacity-80"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className="text-body-md text-text-primary">{item.label}</Text>
                  {item.value === value ? <Ionicons name="checkmark" size={20} color="#3b82f6" /> : null}
                </Pressable>
              )}
            />
            <Button label="Batal" variant="secondary" onPress={() => setOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
