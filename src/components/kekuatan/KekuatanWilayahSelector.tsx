import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

// Pola modal-list sama dengan Select.tsx, tapi trigger-nya 1 baris gabungan
// "Wilayah: {value}" (bukan label terpisah di atas box) — persis kekuatanpemilih.png.
// Non-admin: disabled, terkunci ke kecamatan sendiri (KekuatanPemilihScreen yang
// mengatur value/onChange-nya, komponen ini cuma render sesuai props).
type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  options: readonly string[];
  disabled?: boolean;
};

export function KekuatanWilayahSelector({ value, onChange, options, disabled = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`min-h-[44px] flex-row items-center justify-between gap-sm rounded-md border border-border px-md py-sm ${
          disabled ? "bg-surface-secondary" : "bg-surface active:opacity-80"
        }`}
      >
        <Text className="flex-1 text-body-md text-text-primary">Wilayah: {value ? `Kec. ${value}` : "Semua Kecamatan"}</Text>
        {disabled ? null : <Ionicons name="chevron-down" size={18} color="#64748b" />}
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
          onPress={() => setOpen(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-xl bg-surface p-md" onPress={(e) => e.stopPropagation()}>
            <Text className="pb-sm text-body-lg font-semibold text-text-primary">Pilih Wilayah</Text>
            <FlatList
              data={["__all__", ...options]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const optionValue = item === "__all__" ? null : item;
                const label = optionValue === null ? "Semua Kecamatan" : `Kec. ${optionValue}`;
                return (
                  <Pressable
                    className="min-h-[44px] flex-row items-center justify-between px-xs py-sm active:opacity-80"
                    onPress={() => {
                      onChange(optionValue);
                      setOpen(false);
                    }}
                  >
                    <Text className="text-body-md text-text-primary">{label}</Text>
                    {optionValue === value ? <Ionicons name="checkmark" size={20} color="#3b82f6" /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
