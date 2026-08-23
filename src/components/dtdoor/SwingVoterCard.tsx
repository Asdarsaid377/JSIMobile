import { Alert, Linking, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Badge } from "@/components/ui/Badge";
import type { Dtdoor } from "@/types/dtdoor";

type Props = {
  item: Dtdoor;
};

type Urgency = "urgent" | "perlu" | "baru";

const URGENCY_BADGE_VARIANT: Record<Urgency, "danger" | "warning" | "muted"> = {
  urgent: "danger",
  perlu: "warning",
  baru: "muted",
};

const URGENCY_LABEL: Record<Urgency, string> = {
  urgent: "Urgent",
  perlu: "Perlu Follow-up",
  baru: "Baru Dikunjungi",
};

function daysSince(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}

function getUrgency(days: number): Urgency {
  if (days >= 7) return "urgent";
  if (days >= 3) return "perlu";
  return "baru";
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "-";
  }
}

function handleCall(noTelpon: string): void {
  Linking.openURL(`tel:${noTelpon}`).catch(() => {
    Alert.alert("Gagal membuka telepon", "Perangkat tidak bisa membuka aplikasi telepon.");
  });
}

// Kartu pemilih "Belum Menentukan" untuk follow-up — lihat SwingVoterFollowUpScreen.tsx
// untuk konteks fitur penuh. Tombol "Hubungi" BENERAN fungsional (Linking tel:,
// bukan placeholder) — murni kemampuan device, tidak butuh backend apapun.
export function SwingVoterCard({ item }: Props) {
  const days = daysSince(item.createdAt);
  const urgency = getUrgency(days);
  const wilayah = [item.desa, item.kecamatan].filter(Boolean).join(", ") || "Wilayah tidak diisi";

  return (
    <View className="gap-xs rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{item.namaLengkap}</Text>
        <Badge label={URGENCY_LABEL[urgency]} variant={URGENCY_BADGE_VARIANT[urgency]} />
      </View>
      <Text className="text-caption text-text-muted">{wilayah}</Text>
      <Text className="text-caption text-text-muted">
        Terakhir dikunjungi {formatTanggal(item.createdAt)} · {days} hari lalu
      </Text>
      {item.noTelpon ? (
        <Pressable
          onPress={() => handleCall(item.noTelpon as string)}
          hitSlop={8}
          className="mt-xs flex-row items-center gap-xs self-start rounded-md bg-accent-soft px-sm py-xs active:opacity-80"
        >
          <Ionicons name="call-outline" size={14} color="#3b82f6" />
          <Text className="text-caption font-semibold text-accent">Hubungi {item.noTelpon}</Text>
        </Pressable>
      ) : (
        <Text className="text-caption text-text-muted">No. telpon tidak tersedia</Text>
      )}
    </View>
  );
}
