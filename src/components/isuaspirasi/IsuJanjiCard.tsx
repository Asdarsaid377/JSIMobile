import { Text, View } from "react-native";

type Props = {
  janji: string;
  dampak: string;
  dasar: string;
  wilayah: string;
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § "Usulan Materi Kampanye" —
// card dengan pill dampak/prioritas di kanan atas, teks dasar data, dan baris
// wilayah prioritas berwarna accent.
export function IsuJanjiCard({ janji, dampak, dasar, wilayah }: Props) {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{janji}</Text>
        <View className="rounded-full bg-accent-soft px-sm py-xs">
          <Text className="text-caption font-bold text-accent">{dampak}</Text>
        </View>
      </View>
      <Text className="text-caption text-text-muted">{dasar}</Text>
      <Text className="text-label-md font-semibold text-accent">Prioritaskan di {wilayah}</Text>
    </View>
  );
}
