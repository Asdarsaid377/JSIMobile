import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { QUICK_COUNT_STATUS_VARIANT } from "@/types/quickcount";
import type { QuickCountTps } from "@/types/quickcount";

type Props = {
  item: QuickCountTps;
  onPress: (item: QuickCountTps) => void;
};

// Label aksi kanan-bawah murni turunan status (persis mockup: Terverifikasi→
// "Lihat detail", Selisih→"Verifikasi", Belum masuk→"Input sekarang",
// Menunggu→"Review", Tanpa saksi→"Tugaskan") — TAPI perilaku tap SAMA untuk
// semua (buka QuickCountInputSheet), persis kode asli mockup (`t.openSheet`
// identik di semua row, tidak dibedakan per status) — belum ada alur
// penugasan saksi/review korwil terpisah di scope sesi ini.
const ACTION_LABEL: Record<QuickCountTps["status"], string> = {
  Terverifikasi: "Lihat detail",
  Selisih: "Verifikasi",
  "Belum masuk": "Input sekarang",
  Menunggu: "Review",
  "Tanpa saksi": "Tugaskan",
};

// Referensi context/designs (artboard "12 · SAKSI & QUICK COUNT", DesignSync).
export function QuickCountTpsCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="gap-xs rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 gap-xs">
          <Text className="text-body-md font-semibold text-text-primary">
            {item.noTps} — {item.kelurahan}
          </Text>
          <Text className="text-caption text-text-muted">
            Kab. {item.kabupaten}, Kec. {item.kecamatan} · Saksi: {item.namaSaksi ?? "Belum ditugaskan"} ·{" "}
            {item.totalDpt} DPT
          </Text>
        </View>
        <Badge label={item.status} variant={QUICK_COUNT_STATUS_VARIANT[item.status]} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-caption text-text-muted" numberOfLines={1}>
          {item.meta}
        </Text>
        <Text className="text-label-md font-semibold text-accent">{ACTION_LABEL[item.status]}</Text>
      </View>
    </Pressable>
  );
}
