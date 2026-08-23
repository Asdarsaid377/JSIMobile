import { View } from "react-native";

export function DptCardSkeleton() {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="h-4 w-2/5 rounded-sm bg-surface-secondary" />
      <View className="h-3 w-1/4 rounded-sm bg-surface-secondary" />
      <View className="h-4 w-3/5 rounded-sm bg-surface-secondary" />
      <View className="h-3 w-2/5 rounded-sm bg-surface-secondary" />
    </View>
  );
}
