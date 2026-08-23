import { Pressable, Text, View } from "react-native";

export type ProgramTab = "doorToDoor" | "socialEvent";

type Props = {
  active: ProgramTab;
  onChange: (tab: ProgramTab) => void;
};

const TABS: { key: ProgramTab; label: string }[] = [
  { key: "doorToDoor", label: "Door To Door" },
  { key: "socialEvent", label: "Social Event" },
];

export function DtdoorSegmentedControl({ active, onChange }: Props) {
  return (
    <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              isActive ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${isActive ? "text-text-inverse" : "text-text-muted"}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
