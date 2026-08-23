import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  kecamatan: string;
  desaLabel: string;
  isAllDesa: boolean;
  kecamatanTappable: boolean;
  onPressKecamatan: () => void;
  onPressDesa: () => void;
};

// Referensi: context/designs/timses.png. Desain punya 3 segmen breadcrumb
// (Kabupaten > Kecamatan > Desa) — level Kabupaten SENGAJA dihapus (tidak ada
// kolom kabupaten di entity Timse backend, lihat progress-tracker.md Decisions).
// Kecamatan jadi segmen teratas, styling-nya mengambil alih peran visual segmen
// Kabupaten yang lama (accent, tappable untuk role admin).
export function TimsesBreadcrumb({
  kecamatan,
  desaLabel,
  isAllDesa,
  kecamatanTappable,
  onPressKecamatan,
  onPressDesa,
}: Props) {
  return (
    <View className="flex-row flex-wrap items-center gap-xs">
      <Pressable disabled={!kecamatanTappable} onPress={onPressKecamatan} hitSlop={8}>
        <Text className={`text-label-md font-medium ${kecamatanTappable ? "text-accent" : "text-text-primary"}`}>
          Kec. {kecamatan}
        </Text>
      </Pressable>
      <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
      <Pressable onPress={onPressDesa} hitSlop={8}>
        <Text className={`text-label-md font-medium ${isAllDesa ? "text-text-muted" : "text-text-primary"}`}>
          {desaLabel}
        </Text>
      </Pressable>
    </View>
  );
}
