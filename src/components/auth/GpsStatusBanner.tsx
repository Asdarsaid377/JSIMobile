import { Text, View } from "react-native";

import type { LocationGateStatus } from "@/hooks/useLocationPermission";

type Props = {
  status: LocationGateStatus;
};

const COPY: Record<LocationGateStatus, { title: string; description: string }> = {
  requesting: {
    title: "Menunggu izin lokasi...",
    description: "Aplikasi mewajibkan GPS aktif saat login untuk verifikasi wilayah tugas.",
  },
  granted: {
    title: "Lokasi diizinkan",
    description: "GPS aktif — siap untuk verifikasi wilayah tugas.",
  },
  denied: {
    title: "Lokasi ditolak",
    description: "Mohon aktifkan GPS anda terlebih dahulu untuk login",
  },
};

const STYLE: Record<LocationGateStatus, { bg: string; dot: string; text: string }> = {
  requesting: { bg: "bg-warning-soft", dot: "bg-warning", text: "text-warning" },
  granted: { bg: "bg-success-soft", dot: "bg-success", text: "text-success" },
  denied: { bg: "bg-danger-soft", dot: "bg-danger", text: "text-danger" },
};

export function GpsStatusBanner({ status }: Props) {
  const copy = COPY[status];
  const style = STYLE[status];

  return (
    <View className={`flex-row gap-sm rounded-lg p-md ${style.bg}`}>
      <View className={`mt-1 h-2 w-2 rounded-full ${style.dot}`} />
      <View className="flex-1 gap-xs">
        <Text className={`text-label-md font-semibold ${style.text}`}>{copy.title}</Text>
        <Text className={`text-caption ${style.text}`}>{copy.description}</Text>
      </View>
    </View>
  );
}
