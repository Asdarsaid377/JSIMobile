import { View } from "react-native";

export function TrackingMemberRowSkeleton() {
  return (
    <View className="flex-row items-center justify-between gap-sm py-xs">
      <View className="flex-row items-center gap-sm">
        <View className="h-2 w-2 rounded-full bg-surface-secondary" />
        <View className="h-4 w-32 rounded-sm bg-surface-secondary" />
      </View>
      <View className="h-3 w-20 rounded-sm bg-surface-secondary" />
    </View>
  );
}
