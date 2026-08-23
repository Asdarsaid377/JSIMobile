import { Text, View } from "react-native";

type Props = {
  label: string;
  filled: number;
  total: number;
};

// Baris "X dari Y wilayah sudah diisi target" per level — dipakai 4x
// (Kabupaten/Kecamatan/Kelurahan/TPS) di TargetSuaraReportScreen. Progress bar
// tipis reuse bahasa visual yang sama dengan KekuatanDistribusiRow.
export function TargetSuaraCompletionRow({ label, filled, total }: Props) {
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <View className="gap-xs">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="text-body-md font-semibold text-text-primary">{label}</Text>
        <Text className="text-body-md font-semibold text-accent">
          {filled}/{total} · {percent}%
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className="h-2 rounded-full bg-accent" style={{ width: `${percent}%` }} />
      </View>
    </View>
  );
}
