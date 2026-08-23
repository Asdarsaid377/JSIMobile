import { Pressable, Text, View } from "react-native";

export type KekuatanViewMode = "peta" | "list";

type Props = {
  mode: KekuatanViewMode;
  onChange: (mode: KekuatanViewMode) => void;
};

const OPTIONS: { key: KekuatanViewMode; label: string }[] = [
  { key: "peta", label: "Peta" },
  { key: "list", label: "List" },
];

// Beda visual dari DtdoorSegmentedControl (dark-pill track) — di kekuatanwilayah.png
// toggle-nya pakai outline accent untuk state aktif, bukan pill gelap. Component
// baru, bukan reuse, karena bahasa visualnya beda (lihat ui-registry.md).
export function KekuatanToggle({ mode, onChange }: Props) {
  return (
    <View className="flex-row gap-sm">
      {OPTIONS.map((option) => {
        const isActive = option.key === mode;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-lg border active:opacity-80 ${
              isActive ? "border-accent bg-accent-soft" : "border-border bg-surface"
            }`}
          >
            <Text className={`text-body-md font-semibold ${isActive ? "text-accent" : "text-text-primary"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
