import { Pressable, Text, View } from "react-native";

import { BUDGET_SCOPE_OPTIONS } from "@/types/budgeting";
import type { BudgetScope } from "@/types/budgeting";

type Props = {
  scope: BudgetScope;
  onChange: (scope: BudgetScope) => void;
};

// Pola visual sama persis DtdoorSegmentedControl (pill gelap bg-primary untuk
// state aktif) — cocok dengan bulanTabBg/totalTabBg #1E293B di canvas asli
// (context/designs/budgeting-kampanye.dc.html). Component terpisah, bukan reuse
// langsung, karena tipe data beda (BudgetScope) — pola sama dengan KekuatanToggle
// vs DtdoorSegmentedControl (ui-registry.md).
export function BudgetScopeToggle({ scope, onChange }: Props) {
  return (
    <View className="flex-row gap-xs rounded-lg bg-surface-secondary p-xs">
      {BUDGET_SCOPE_OPTIONS.map((option) => {
        const isActive = option.value === scope;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`min-h-[44px] flex-1 items-center justify-center rounded-md active:opacity-80 ${
              isActive ? "bg-primary" : "bg-transparent"
            }`}
          >
            <Text className={`text-body-md font-semibold ${isActive ? "text-text-inverse" : "text-text-muted"}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
