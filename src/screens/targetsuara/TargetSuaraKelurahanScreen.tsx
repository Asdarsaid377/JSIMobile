import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { TargetSuaraHeaderCard } from "@/components/targetsuara/TargetSuaraHeaderCard";
import { Button } from "@/components/ui/Button";
import { useDptListAll } from "@/hooks/useDptListAll";
import { useSetTargetSuara, useTargetSuaraMap } from "@/hooks/useTargetSuara";
import { buildTargetSuaraKey, formatTargetSublabel } from "@/lib/targetSuara";
import type { DptStackParamList } from "@/navigation/DptStack";

type TpsGroup = { noTps: number; namaTps: string; totalPemilih: number };

// Level 3 dari 4 — lihat TargetSuaraKabupatenScreen.tsx untuk konteks penuh.
// TPS tidak ada endpoint list tersendiri (sama seperti DptListScreen) — diturunkan
// dari record DPT kabupaten ini (`useDptList`), difilter by idKel, dikelompokkan
// by noTps. `totalPemilih` per TPS = COUNT record (bukan field asli), pola sama
// `DptListScreen.tpsOptions`.
export function TargetSuaraKelurahanScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "TargetSuaraKelurahan">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kelWilId, kelNama, kelTotalDpt, kabWilId } = route.params;

  const dptQuery = useDptListAll(kabWilId, { kelId: kelWilId });
  const targetMapQuery = useTargetSuaraMap();
  const setTargetMutation = useSetTargetSuara();

  const targetMap = targetMapQuery.data ?? {};
  const ownTarget = targetMap[buildTargetSuaraKey("kel", kelWilId)] ?? null;

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

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={tpsGroups}
        keyExtractor={(item) => String(item.noTps)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <TargetSuaraHeaderCard
              nama={kelNama}
              totalDpt={kelTotalDpt}
              currentTarget={ownTarget}
              isSaving={setTargetMutation.isPending}
              onSave={(value) => setTargetMutation.mutate({ level: "kel", wilId: kelWilId, value })}
            />
            <Text className="text-body-lg font-semibold text-text-primary">Pilih TPS</Text>
            {dptQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar TPS.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void dptQuery.refetch()} />
              </View>
            ) : null}
            {dptQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <DptRegionCard
            nama={`TPS ${item.namaTps}`}
            sublabel={formatTargetSublabel(
              item.totalPemilih,
              targetMap[buildTargetSuaraKey("tps", kelWilId, item.noTps)] ?? null,
            )}
            onPress={() =>
              navigation.navigate("TargetSuaraTps", {
                kelWilId,
                noTps: item.noTps,
                namaTps: item.namaTps,
                totalPemilihTps: item.totalPemilih,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !dptQuery.isLoading && !dptQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Belum ada data DPT per-TPS untuk kelurahan ini.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
