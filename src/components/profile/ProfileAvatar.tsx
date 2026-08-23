import { Text, View } from "react-native";

type Props = {
  namaLengkap: string;
};

function getInitials(namaLengkap: string): string {
  const words = namaLengkap.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
  return initials.join("") || "?";
}

export function ProfileAvatar({ namaLengkap }: Props) {
  return (
    <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
      <Text className="text-headline-md text-text-inverse">{getInitials(namaLengkap)}</Text>
    </View>
  );
}
