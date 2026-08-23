import { Text, View } from "react-native";

type ActivityType = "dtdoor" | "gotv";

type Props = {
  type: ActivityType;
  title: string;
  subtitle: string;
  createdAt: string;
};

const TYPE_BADGE_LABEL: Record<ActivityType, string> = {
  dtdoor: "DD",
  gotv: "SE",
};

// Badge "DD"/"SE" reuse persis visual language kartu statistik "Program
// Pemenangan" di HomeScreen.tsx (h-8 w-8 rounded-md bg-accent-soft) — bukan
// bahasa visual baru, cuma dipakai ulang di konteks baris list. Tidak ada file
// desain untuk section "Aktivitas Terbaru" (izin eksplisit user, build dari
// ui-rules.md/ui-tokens.md — lihat progress-tracker.md Decisions).
function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(iso));
  } catch {
    return "-";
  }
}

export function HomeActivityRow({ type, title, subtitle, createdAt }: Props) {
  return (
    <View className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="h-8 w-8 items-center justify-center rounded-md bg-accent-soft">
        <Text className="text-caption font-semibold text-accent">{TYPE_BADGE_LABEL[type]}</Text>
      </View>
      <View className="flex-1 gap-xs">
        <Text numberOfLines={1} className="text-body-md font-semibold text-text-primary">
          {title}
        </Text>
        <Text numberOfLines={1} className="text-caption text-text-muted">
          {subtitle} · {formatTanggal(createdAt)}
        </Text>
      </View>
    </View>
  );
}
