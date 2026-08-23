import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

type Props = {
  rank: number;
  nama: string;
  partai: string;
  suara: number;
  daerahUnggul: string;
  onPress: () => void;
};

// Referensi web `DprRiProvinsi.jsx` dst. § pivot caleg × sub-wilayah —
// disederhanakan jadi ranking flat top-5 caleg (bukan tabel pivot penuh
// caleg × N kolom sub-wilayah), tiap baris tetap bawa 1 nama daerah
// (`daerahUnggul` — sub-wilayah dengan suara caleg ini terbanyak, dalam
// scope layar tempat row ini dirender) supaya info "caleg X kuat di daerah
// mana" tetap tersampaikan tanpa tabel. Pola simplifikasi sama yang dipakai
// AntiFraudEvidenceSheet untuk elemen desktop-only. Sekarang `Pressable`
// (2026-08-22, permintaan user "tetap ikuti pola web tapi jangan table") —
// tap buka `HasilRekapCalegDetailSheet` untuk breakdown suara PENUH per
// sub-wilayah (bukan cuma `daerahUnggul`), persis kelengkapan data web.
export function HasilRekapCalegRow({ rank, nama, partai, suara, daerahUnggul, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="h-8 w-8 items-center justify-center rounded-md bg-accent-soft">
        <Text className="text-label-md font-bold text-accent">{rank}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <Text className="text-body-md font-semibold text-text-primary">{nama}</Text>
        <Text className="text-caption text-text-muted">{partai}</Text>
        <Text className="text-caption text-accent">Unggul di {daerahUnggul}</Text>
      </View>
      <View className="items-end gap-xs">
        <Text className="text-label-md font-bold text-text-primary">{suara.toLocaleString("id-ID")}</Text>
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
      </View>
    </Pressable>
  );
}
