import { Pressable, Text, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { PENGUMUMAN_TARGET_LEVEL_OPTIONS } from "@/types/pengumuman";
import type { Pengumuman, PengumumanPrioritas } from "@/types/pengumuman";

type Props = {
  item: Pengumuman;
  onPress: (item: Pengumuman) => void;
};

const PRIORITAS_VARIANT: Record<PengumumanPrioritas, "muted" | "warning" | "danger"> = {
  Normal: "muted",
  Penting: "warning",
  Mendesak: "danger",
};

// Label target level SAJA (bukan nama wilayah) — tidak ada endpoint
// reverse-lookup wilId→nama di backend (gap yang sama dengan
// AccessScopeNotice/TimsesFormScreen, lihat progress-tracker.md Decisions
// 2026-08-25), jadi "Kabupaten"/"Kecamatan"/"Desa" ditampilkan sebagai LEVEL
// saja, bukan nama wilayahnya.
function targetLabel(item: Pengumuman): string {
  return PENGUMUMAN_TARGET_LEVEL_OPTIONS.find((option) => option.value === item.targetLevel)?.label ?? item.targetLevel;
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(iso),
    );
  } catch {
    return "-";
  }
}

// TIDAK ADA referensi desain untuk component ini (izin eksplisit user,
// Aturan #1 — lihat PengumumanScreen.tsx). Gaya kartu disamakan
// IsuAspirasiCard/RivalAktivitasCard (border+padding+badge pojok kanan atas).
export function PengumumanCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
    >
      <View className="flex-row items-start justify-between gap-sm">
        <Text className="flex-1 text-body-md font-semibold text-text-primary">{item.judul}</Text>
        <Badge label={item.prioritas} variant={PRIORITAS_VARIANT[item.prioritas]} />
      </View>
      <Text className="text-label-md text-text-secondary" numberOfLines={2}>
        {item.isi}
      </Text>
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="flex-1 text-caption text-text-muted" numberOfLines={1}>
          {item.pembuat} · {formatTanggal(item.createdAt)}
        </Text>
        <View className="shrink-0 rounded-md bg-surface-secondary px-sm py-xs">
          <Text className="text-caption font-semibold text-text-muted">{targetLabel(item)}</Text>
        </View>
      </View>
    </Pressable>
  );
}
