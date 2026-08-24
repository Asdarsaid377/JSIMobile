import { Pressable, Text, View } from "react-native";

import { RIVAL_ANCAMAN_LABEL } from "@/types/rivalcaleg";
import type { RivalCalegSummary } from "@/types/rivalcaleg";

type Props = {
  item: RivalCalegSummary;
  onPress: () => void;
};

// success=rendah/warning=sedang/danger=tinggi — mapping ANCAMAN sama persis
// yang sudah dipakai RivalAssessmentCard di fitur lama (preseden yang tetap
// berlaku meski component-nya sendiri sudah diganti total). Teks polos (bukan
// Badge pill) — permintaan user, konsisten dengan perubahan RivalWilayahRow
// ("coba hilangkan warna backgroundnya", lalu diminta diterapkan juga di tab
// Daftar Rival).
const ANCAMAN_TEXT_CLASS: Record<RivalCalegSummary["ancaman"], string> = {
  rendah: "text-success",
  sedang: "text-warning",
  tinggi: "text-danger",
};

function initialsOf(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Referensi artboard "16 · DETEKSI RIVAL CALEG" tab "Daftar Rival" — card
// avatar inisial + nama/badge ancaman + partai·no urut + basis + estimasi
// suara·wilayah bentrok, tap buka bottom sheet detail (RivalDetailSheet).
export function RivalCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="h-11 w-11 items-center justify-center rounded-lg bg-surface-secondary">
        <Text className="text-label-lg font-bold text-text-secondary">{initialsOf(item.namaLengkap)}</Text>
      </View>
      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-sm">
          <Text className="flex-1 text-body-md font-bold text-text-primary">{item.namaLengkap}</Text>
          <Text className={`shrink-0 text-label-md font-bold ${ANCAMAN_TEXT_CLASS[item.ancaman]}`}>
            {RIVAL_ANCAMAN_LABEL[item.ancaman]}
          </Text>
        </View>
        <Text className="text-label-md font-semibold text-accent">
          {item.partai} · nomor urut {item.noUrut}
        </Text>
        <Text className="text-label-md text-text-secondary">Basis: {item.basis}</Text>
        <Text className="text-caption text-text-muted">
          Est. {item.estimasiSuara.toLocaleString("id-ID")} suara · bentrok di {item.wilayahBentrok}
        </Text>
      </View>
    </Pressable>
  );
}
