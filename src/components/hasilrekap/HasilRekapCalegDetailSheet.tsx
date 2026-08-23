import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import type { HasilRekapCaleg } from "@/types/hasilrekap";

type Props = {
  item: HasilRekapCaleg | null;
  levelLabel: string;
  onClose: () => void;
};

// Referensi web `DprRiProvinsi.jsx` dst. § kolom pivot caleg × sub-wilayah —
// tap `HasilRekapCalegRow` buka sheet ini untuk lihat breakdown PENUH suara
// caleg itu di SETIAP sub-wilayah (bukan cuma `daerahUnggul`), persis
// kelengkapan data web — TAPI list vertikal (dibaca dari atas ke bawah),
// bukan tabel/kolom horizontal. Permintaan eksplisit user: "ikuti pola web
// tapi jangan dibuat table di mobile, buat senyaman mungkin".
export function HasilRekapCalegDetailSheet({ item, levelLabel, onClose }: Props) {
  const max = item?.breakdown[0]?.suara ?? 0;

  return (
    <Modal visible={item !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
        onPress={onClose}
      >
        <Pressable className="gap-sm rounded-t-xl bg-surface p-md pb-lg" onPress={(e) => e.stopPropagation()} style={{ maxHeight: "80%" }}>
          <View className="mx-auto h-1 w-9 rounded-full bg-border" />
          {item ? (
            <View className="gap-xs">
              <Text className="text-body-lg font-semibold text-text-primary">{item.nama}</Text>
              <Text className="text-caption text-text-muted">
                {item.partai} · {item.suara.toLocaleString("id-ID")} suara
              </Text>
            </View>
          ) : null}

          <Text className="text-label-md font-semibold text-text-secondary">Sebaran suara per {levelLabel}</Text>

          <ScrollView className="gap-sm">
            <View className="gap-sm pb-xs">
              {item?.breakdown.map((row) => (
                <View key={row.nama} className="gap-xs">
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 text-label-md text-text-secondary">{row.nama}</Text>
                    <Text className="text-label-md font-bold text-text-primary">{row.suara.toLocaleString("id-ID")}</Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                    <View className="h-full rounded-full bg-accent" style={{ width: `${max > 0 ? (row.suara / max) * 100 : 0}%` }} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
