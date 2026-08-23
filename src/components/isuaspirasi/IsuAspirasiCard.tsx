import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { IsuAspirasi, IsuAspirasiStatus } from "@/types/isuaspirasi";

type Props = {
  item: IsuAspirasi;
  onPress: (item: IsuAspirasi) => void;
};

const STATUS_BG_CLASS: Record<IsuAspirasiStatus, string> = {
  Baru: "bg-accent-soft",
  Ditindak: "bg-warning-soft",
  Selesai: "bg-success-soft",
};
const STATUS_TEXT_CLASS: Record<IsuAspirasiStatus, string> = {
  Baru: "text-accent",
  Ditindak: "text-warning",
  Selesai: "text-success",
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § tab "Aspirasi" — card
// keluhan warga bergaya kutipan, badge kategori reuse `Badge` (semua kategori
// diflatten ke 1 warna `accent` — bukan status alur kerja, pola sama
// `DtdoorCard` di ui-registry.md), pill status kecil di kanan bawah warna
// sesuai tahap tindak lanjut.
export function IsuAspirasiCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 gap-xs">
          <Text className="text-body-md font-semibold text-text-primary">{item.warga}</Text>
          <Text className="text-caption text-text-muted">{item.alamat}</Text>
        </View>
        <Badge label={item.kategori} variant="accent" />
      </View>
      <Text className="text-label-md text-text-secondary">&ldquo;{item.keluhan}&rdquo;</Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-caption text-text-muted">
          {item.relawan} · {item.tanggal}
        </Text>
        <View className={`rounded-md px-sm py-xs ${STATUS_BG_CLASS[item.status]}`}>
          <Text className={`text-caption font-semibold ${STATUS_TEXT_CLASS[item.status]}`}>{item.status}</Text>
        </View>
      </View>
    </Pressable>
  );
}
