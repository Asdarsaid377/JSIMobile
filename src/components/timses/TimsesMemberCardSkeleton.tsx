import { View } from "react-native";

export function TimsesMemberCardSkeleton() {
  return (
    <View className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="h-12 w-12 rounded-lg bg-surface-secondary" />
      <View className="flex-1 gap-xs">
        <View className="h-4 w-2/5 rounded-sm bg-surface-secondary" />
        <View className="h-3 w-3/5 rounded-sm bg-surface-secondary" />
        <View className="h-3 w-1/4 rounded-sm bg-surface-secondary" />
      </View>
    </View>
  );
}
