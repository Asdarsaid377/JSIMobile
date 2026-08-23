import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type Props = {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  widthClass?: string;
};

// Icon menggantikan singkatan teks ("DD"/"RK"/dst.) yang tampil literal di
// home-dashboard.png — deviasi disengaja atas permintaan eksplisit user (lebih
// konsisten dengan pola icon berwarna kontekstual di ui-rules.md & seluruh tab
// bar/tombol lain yang sudah pakai Ionicons, bukan teks). Warna icon `accent`
// (aksi/navigasi), sama token dengan icon tab aktif. Prop `widthClass` (default
// `w-1/4`, cocok grid 8-item Home) ditambah 2026-08-22 supaya component ini bisa
// dipakai ulang di grid dengan jumlah kolom beda (mis. 3 kolom di
// ProgramPemenanganScreen) — reuse pola visual yang sama, bukan component baru.
export function HomeQuickAccessItem({ icon, label, onPress, widthClass = "w-1/4" }: Props) {
  return (
    <Pressable onPress={onPress} className={`${widthClass} items-center gap-xs px-xs py-xs active:opacity-80`}>
      <View className="h-14 w-14 items-center justify-center rounded-lg border border-border bg-surface">
        <Ionicons name={icon} size={22} color="#3b82f6" />
      </View>
      <Text className="text-center text-caption text-text-muted">{label}</Text>
    </Pressable>
  );
}
