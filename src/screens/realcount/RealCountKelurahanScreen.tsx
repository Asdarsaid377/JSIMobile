import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useDptListAll } from "@/hooks/useDptListAll";
import { useRealCountByKelurahan } from "@/hooks/useRealCount";
import type { DptStackParamList } from "@/navigation/DptStack";

type TpsGroup = { noTps: number; namaTps: string; totalPemilih: number };

// Level 3 dari 3 (leaf sebelum RealCountC1Screen) — lihat RealCountKabupatenScreen.tsx
// untuk konteks penuh. TPS diturunkan dari record DPT (sama pola
// TargetSuaraKelurahanScreen), sublabel tiap baris menandai "✓ Sudah ada C1" kalau
// sudah pernah disubmit — 1 query per kelurahan (`useRealCountByKelurahan`), bukan
// N query per TPS.
export function RealCountKelurahanScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "RealCountKelurahan">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kelWilId, kelNama, kabWilId } = route.params;

  const dptQuery = useDptListAll(kabWilId, { kelId: kelWilId });
  const realCountQuery = useRealCountByKelurahan(kelWilId);

  const submittedByNoTps = useMemo(() => {
    const map = new Map<number, number>();
    for (const record of realCountQuery.data ?? []) {
      map.set(record.noTps, record.suaraCalon);
    }
    return map;
  }, [realCountQuery.data]);

  const tpsGroups = useMemo<TpsGroup[]>(() => {
    const records = dptQuery.data ?? [];
    const map = new Map<number, { namaTps: string; count: number }>();
    for (const record of records) {
      const existing = map.get(record.noTps);
      map.set(record.noTps, { namaTps: record.namaTps, count: (existing?.count ?? 0) + 1 });
    }
    return Array.from(map.entries())
      .map(([noTps, value]) => ({ noTps, namaTps: value.namaTps, totalPemilih: value.count }))
      .sort((a, b) => a.noTps - b.noTps);
  }, [dptQuery.data, kelWilId]);

  const isLoading = dptQuery.isLoading || realCountQuery.isLoading;
  const isError = dptQuery.isError || realCountQuery.isError;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={tpsGroups}
        keyExtractor={(item) => String(item.noTps)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">Kelurahan {kelNama} · pilih TPS</Text>
            {isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar TPS.</Text>
                <Button
                  label="Coba Lagi"
                  variant="secondary"
                  onPress={() => {
                    void dptQuery.refetch();
                    void realCountQuery.refetch();
                  }}
                />
              </View>
            ) : null}
            {isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const suaraCalon = submittedByNoTps.get(item.noTps);
          return (
            <DptRegionCard
              nama={`TPS ${item.namaTps}`}
              sublabel={
                suaraCalon !== undefined
                  ? `✓ Sudah ada C1 · ${suaraCalon.toLocaleString("id-ID")} suara calon`
                  : `${item.totalPemilih.toLocaleString("id-ID")} DPT · Belum ada C1`
              }
              onPress={() =>
                navigation.navigate("RealCountC1", { kelWilId, noTps: item.noTps, namaTps: item.namaTps })
              }
            />
          );
        }}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !isLoading && !isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Belum ada data DPT per-TPS untuk kelurahan ini.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
