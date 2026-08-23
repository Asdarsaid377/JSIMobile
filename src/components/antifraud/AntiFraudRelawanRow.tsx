import { Text, View } from "react-native";

import type { FraudRelawanSkor } from "@/types/antifraud";

type Props = {
  item: FraudRelawanSkor;
};

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getScoreClasses(skor: number): { text: string; bar: string } {
  if (skor >= 85) return { text: "text-success", bar: "bg-success" };
  if (skor >= 60) return { text: "text-warning", bar: "bg-warning" };
  return { text: "text-danger", bar: "bg-danger" };
}

// Referensi artboard "14 · VERIFIKASI KUNJUNGAN" § "Skor Kredibilitas Relawan"
// — avatar inisial kotak (pola sama TimsesMemberCard), skor 0-100 berwarna
// tier (>=85 hijau/>=60 kuning/<60 merah, persis threshold mockup), bar tipis
// di bawah nama.
export function AntiFraudRelawanRow({ item }: Props) {
  const colors = getScoreClasses(item.skor);

  return (
    <View className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-accent-soft">
        <Text className="text-label-md font-bold text-accent">{getInitials(item.nama)}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <View className="flex-row items-baseline justify-between">
          <Text className="text-body-md font-semibold text-text-primary">{item.nama}</Text>
          <Text className={`text-body-md font-extrabold ${colors.text}`}>{item.skor}</Text>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-surface-secondary">
          <View className={`h-full rounded-full ${colors.bar}`} style={{ width: `${item.skor}%` }} />
        </View>
        <Text className="text-caption text-text-muted">
          {item.jumlahKunjungan} kunjungan · {item.jumlahDitandai} ditandai anomali
        </Text>
      </View>
    </View>
  );
}
