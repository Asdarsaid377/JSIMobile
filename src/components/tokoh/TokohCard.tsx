import { Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import type { Tokoh, TokohDukungan } from "@/types/tokoh";

type Props = {
  item: Tokoh;
};

const DUKUNGAN_VARIANT: Record<TokohDukungan, "success" | "warning" | "danger"> = {
  Mendukung: "success",
  Netral: "warning",
  Lawan: "danger",
};

function getInitials(nama: string): string {
  const words = nama.replace(/[.,]/g, "").split(/\s+/).filter(Boolean);
  // Ambil huruf pertama dari kata PERTAMA & TERAKHIR (pola sama ProfileAvatar) —
  // kalau cuma 1 kata (mis. "Somad" tanpa gelar), fallback ke 1 huruf saja,
  // persis contoh "K" untuk "Abah Karna" di tokohlist.png.
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return (words[0].slice(0, 1) + words[words.length - 1].slice(0, 1)).toUpperCase();
}

// Referensi context/designs/tokohlist.png — avatar inisial + nama + badge
// dukungan (kanan atas) + "{kategori} · pengaruh {level}" (biru) + alamat +
// "{desa} · est. ±{massa} basis massa" (muted).
export function TokohCard({ item }: Props) {
  return (
    <View className="flex-row gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-accent-soft">
        <Text className="text-body-md font-bold text-accent">{getInitials(item.nama)}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <View className="flex-row items-start justify-between gap-sm">
          <Text className="flex-1 text-body-md font-semibold text-text-primary">{item.nama}</Text>
          <Badge label={item.dukungan} variant={DUKUNGAN_VARIANT[item.dukungan]} />
        </View>
        <Text className="text-label-md font-medium text-accent">
          {item.kategoriLabel} · pengaruh {item.pengaruh}
        </Text>
        <Text className="text-body-md text-text-primary">{item.alamat}</Text>
        <Text className="text-caption text-text-muted">
          {item.desa} · est. ±{item.estimasiBasisMassa.toLocaleString("id-ID")} basis massa
        </Text>
      </View>
    </View>
  );
}
