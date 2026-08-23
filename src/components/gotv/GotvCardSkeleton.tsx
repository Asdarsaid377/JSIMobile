import { View } from "react-native";

export function GotvCardSkeleton() {
  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="h-5 w-1/2 rounded-sm bg-surface-secondary" />
      <View className="h-3 w-3/4 rounded-sm bg-surface-secondary" />
      <View className="h-3 w-2/5 rounded-sm bg-surface-secondary" />
    </View>
  );
}
