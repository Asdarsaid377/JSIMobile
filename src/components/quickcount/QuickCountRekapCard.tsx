import { Text, View } from "react-native";

import { QuickCountKandidatRow } from "@/components/quickcount/QuickCountKandidatRow";
import type { QuickCountRekapGroup } from "@/types/quickcount";

type Props = {
  group: QuickCountRekapGroup;
};

// Referensi: TIDAK ADA mockup untuk card ini (artboard 12 cuma versi single-
// wilayah, tidak ada perbandingan antar wilayah) — dibangun tanpa referensi
// visual atas izin eksplisit user (2026-08-24, Aturan #1, bagian dari fitur
// "filtering dan summary" yang diminta setelah backend dapat GET
// /quickcount/rekap). Reuse `QuickCountKandidatRow` apa adanya untuk daftar
// kandidat per wilayah — sudah teraudit overflow-safe (lihat progress-tracker
// Decisions "overflow" 2026-08-24).
export function QuickCountRekapCard({ group }: Props) {
  const kandidatSorted = [...group.suaraPerKandidat].sort((a, b) => b.totalSuara - a.totalSuara);

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-center justify-between gap-sm">
        <Text className="flex-1 text-body-md font-bold text-text-primary" numberOfLines={1}>
          {group.wilayah}
        </Text>
        <Text className="shrink-0 text-label-md font-semibold text-accent">
          {group.tpsMasuk}/{group.totalTps} TPS
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
        <View className="h-full rounded-full bg-accent" style={{ width: `${group.persentaseTpsMasuk}%` }} />
      </View>
      <Text className="text-caption text-text-muted">
        {group.totalSuaraSah.toLocaleString("id-ID")} suara sah · {group.totalDpt.toLocaleString("id-ID")} DPT
      </Text>

      <View className="gap-md border-t border-surface-secondary pt-sm">
        {kandidatSorted.map((k, index) => (
          <QuickCountKandidatRow
            key={k.kandidatId}
            nama={k.nama}
            partai={k.partai}
            votes={k.totalSuara}
            percent={group.totalSuaraSah > 0 ? (k.totalSuara / group.totalSuaraSah) * 100 : 0}
            leading={index === 0 && k.totalSuara > 0}
          />
        ))}
      </View>
    </View>
  );
}
