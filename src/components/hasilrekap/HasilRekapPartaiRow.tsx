import { Text, View } from "react-native";

type Props = {
  partai: string;
  suaraTotal: number;
  percentOfMax: number;
  isTop: boolean;
};

// Reuse bahasa visual "Suara Sah" chart dari artboard "4 · HASIL REKAP" —
// bar horizontal per partai. Tidak ada makna baik/buruk per partai (bukan
// severity/tier), jadi SEMUA bar 1 warna netral (`bg-accent`), pola sama
// `DtdoorMagnitudeRow` (magnitude tanpa polaritas). Partai peringkat 1
// (`isTop`) dibedakan lewat teks bold + badge "Unggul", bukan warna bar
// berbeda.
export function HasilRekapPartaiRow({ partai, suaraTotal, percentOfMax, isTop }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-xs">
          <Text className={`text-label-md text-text-secondary ${isTop ? "font-bold" : "font-semibold"}`}>{partai}</Text>
          {isTop ? (
            <View className="rounded-full bg-accent-soft px-sm py-xs">
              <Text className="text-caption font-bold text-accent">Unggul</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-label-md font-bold text-text-primary">{suaraTotal.toLocaleString("id-ID")}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className="h-full rounded-full bg-accent" style={{ width: `${percentOfMax}%` }} />
      </View>
    </View>
  );
}
