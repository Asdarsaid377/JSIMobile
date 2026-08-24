import { Pressable, Text, View } from "react-native";

type Props = {
  janji: string;
  dampak: string;
  dasar: string;
  wilayah: string;
  onPress?: () => void;
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § "Usulan Materi Kampanye" —
// card dengan pill dampak/prioritas di kanan atas, teks dasar data, dan baris
// wilayah prioritas berwarna accent. `onPress` (2026-08-24, tidak dari canvas,
// Aturan #1) — tap langsung ke IsuJanjiFormScreen mode edit, TIDAK lewat
// detail sheet terpisah (card sudah menampilkan semua field-nya, pola sama
// alasan RivalWilayahRow).
export function IsuJanjiCard({ janji, dampak, dasar, wilayah, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="gap-xs rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{janji}</Text>
        <View className="rounded-full bg-accent-soft px-sm py-xs">
          <Text className="text-caption font-bold text-accent">{dampak}</Text>
        </View>
      </View>
      <Text className="text-caption text-text-muted">{dasar}</Text>
      <Text className="text-label-md font-semibold text-accent">Prioritaskan di {wilayah}</Text>
    </Pressable>
  );
}
