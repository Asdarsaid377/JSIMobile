import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Badge } from "@/components/ui/Badge";
import type { DptRecord } from "@/types/dpt";

type Props = {
  item: DptRecord;
  onMorePress: (item: DptRecord) => void;
  onStarPress: (item: DptRecord) => void;
};

// Tombol "..." dulu cuma Alert generik "Segera hadir" (belum ada kontrak endpoint
// write untuk DPT) — sekarang buka `DptVoterActionSheet` (CRUD dasar, 2026-08-22,
// permintaan user pakai mock data). Lihat DptListScreen.tsx untuk handler
// edit/hapus sesungguhnya. Icon bintang (2026-08-22, fitur "Identifikasi Tokoh
// Baru dari DPT", permintaan eksplisit user "pake icon bintang saja di card
// list dpt") — tap → push TokohFormScreen ter-prefill dari record ini. Terisi
// (`star`, warna `warning` — reuse token, bukan hex baru) kalau `sudahTokoh`,
// outline (`star-outline`, `text-muted`) kalau belum — tetap tappable di kedua
// state (submit ulang dianggap update, sama pola "Tandai ikut Door To Door").
export function DptCard({ item, onMorePress, onStarPress }: Props) {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-xs">
          <Text className="text-body-md font-semibold text-text-primary">{item.nama}</Text>
          <Text className="text-caption text-text-muted">
            {item.usia !== null ? `${item.usia} th · ` : ""}
            {item.jenisKelamin}
          </Text>
        </View>
        <View className="flex-row gap-xs">
          <Pressable
            onPress={() => onStarPress(item)}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-lg bg-surface-secondary active:opacity-80"
          >
            <Ionicons name={item.sudahTokoh ? "star" : "star-outline"} size={18} color={item.sudahTokoh ? "#b45309" : "#64748b"} />
          </Pressable>
          <Pressable
            onPress={() => onMorePress(item)}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-lg bg-surface-secondary active:opacity-80"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#64748b" />
          </Pressable>
        </View>
      </View>

      <Text className="text-body-md text-text-primary">
        {item.alamat ?? "-"} · RT {item.rt}/RW {item.rw}
      </Text>
      <Text className="text-caption text-text-muted">
        Kec. {item.namaKec} · Kel. {item.namaKel} · TPS {item.namaTps}
      </Text>

      <View className="flex-row flex-wrap gap-xs pt-xs">
        <Badge label={item.sudahDtdoor ? "Door To Door ✓" : "Belum D2D"} variant={item.sudahDtdoor ? "success" : "muted"} />
        <Badge label={item.sudahGotv ? "Social Event ✓" : "Belum SE"} variant={item.sudahGotv ? "accent" : "muted"} />
      </View>
    </View>
  );
}
