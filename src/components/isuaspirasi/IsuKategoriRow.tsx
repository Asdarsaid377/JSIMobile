import { Text, View } from "react-native";

type Tier = "tinggi" | "sedang" | "rendah";

type Props = {
  nama: string;
  jumlah: number;
  percentOfMax: number;
  wilayahTerkuat: string;
  tier: Tier;
};

const TIER_TEXT_CLASS: Record<Tier, string> = {
  tinggi: "text-danger",
  sedang: "text-warning",
  rendah: "text-accent",
};
const TIER_BAR_CLASS: Record<Tier, string> = {
  tinggi: "bg-danger",
  sedang: "bg-warning",
  rendah: "bg-accent",
};

// Referensi artboard "15 · ISU & ASPIRASI WARGA" § "Isu Terbanyak Disebut
// Warga" — bar horizontal, lebar proporsional jumlah/maxJumlah (di-derive,
// bukan pctStr statis kayak mockup). Warna tier (2 tertinggi=danger, 2
// berikutnya=warning, sisanya=accent) — reuse pola severity AntiFraudJenisRow,
// bukan mengarang warna kategorikal baru per isu (lihat DtdoorCategoryRow di
// ui-registry.md untuk preseden yang sama).
export function IsuKategoriRow({ nama, jumlah, percentOfMax, wilayahTerkuat, tier }: Props) {
  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between">
        <Text className="text-label-md font-semibold text-text-secondary">{nama}</Text>
        <Text className={`text-label-md font-bold ${TIER_TEXT_CLASS[tier]}`}>{jumlah}</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className={`h-full rounded-full ${TIER_BAR_CLASS[tier]}`} style={{ width: `${percentOfMax}%` }} />
      </View>
      <Text className="text-caption text-text-muted">Terkuat di {wilayahTerkuat}</Text>
    </View>
  );
}
