import { Text, View } from "react-native";

import { STRENGTH_TIER_LABEL } from "@/lib/dtdoorScore";
import type { StrengthTier } from "@/lib/dtdoorScore";

type Props = {
  kuat: number;
  sedang: number;
  lemah: number;
};

const TIER_ORDER: readonly StrengthTier[] = ["kuat", "sedang", "lemah"];

const TIER_BAR_CLASS: Record<StrengthTier, string> = {
  kuat: "bg-success",
  sedang: "bg-warning",
  lemah: "bg-danger",
};

// Stacked bar horizontal — ganti grid kotak-kotak polos (1 kotak per kelurahan,
// KekuatanZoneCard, sekarang dihapus) dengan chart "part-to-whole" yang lebih
// standar (dataviz skill: distribusi 3 kategori → stacked bar, BUKAN pie/donut —
// lihat choosing-a-form.md). Warna reuse token status yang SUDAH dipakai di
// seluruh app (success/warning/danger, sama dengan Badge/KekuatanSummaryCards),
// BUKAN palet baru. `validate_palette.js` nandain pasangan warning↔danger di
// bawah ambang batas normal-vision (ΔE 9.9 < 15) kalau cuma mengandalkan warna —
// makanya 2 secondary encoding WAJIB ada & tidak boleh dihilangkan: (1) gap 2px
// antar segmen, (2) legend berlabel teks+angka di bawah (bukan cuma swatch
// warna) — identitas tiap tier tidak pernah bergantung ke warna doang.
export function KekuatanZoneStackedBar({ kuat, sedang, lemah }: Props) {
  const counts: Record<StrengthTier, number> = { kuat, sedang, lemah };
  const total = kuat + sedang + lemah;
  const segments = TIER_ORDER.filter((tier) => counts[tier] > 0);

  if (total === 0) return null;

  return (
    <View className="gap-sm rounded-lg bg-surface-secondary p-sm">
      <View className="h-6 flex-row overflow-hidden rounded-full bg-background">
        {segments.map((tier, index) => (
          <View
            key={tier}
            className={`h-full ${TIER_BAR_CLASS[tier]} ${index < segments.length - 1 ? "mr-[2px]" : ""}`}
            style={{ flexGrow: counts[tier], flexBasis: 0 }}
          />
        ))}
      </View>
      <View className="flex-row flex-wrap gap-sm">
        {TIER_ORDER.map((tier) => {
          const count = counts[tier];
          const percent = Math.round((count / total) * 100);
          return (
            <View key={tier} className="flex-row items-center gap-xs">
              <View className={`h-2 w-2 rounded-full ${TIER_BAR_CLASS[tier]}`} />
              <Text className="text-caption font-medium text-text-primary">
                {STRENGTH_TIER_LABEL[tier]} {count} ({percent}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
