import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { TargetSuaraHeaderCard } from "@/components/targetsuara/TargetSuaraHeaderCard";
import { Button } from "@/components/ui/Button";
import { useDptKecamatanList } from "@/hooks/useDptKecamatanList";
import { useSetTargetSuara, useTargetSuaraMap } from "@/hooks/useTargetSuara";
import { buildTargetSuaraKey, formatTargetSublabel } from "@/lib/targetSuara";
import type { DptStackParamList } from "@/navigation/DptStack";

// Level 1 dari 4 (Kabupaten → Kecamatan → Kelurahan → TPS). Tidak ada referensi
// desain — izin build dari ui-rules.md/ui-tokens.md (lihat progress-tracker.md
// Decisions). Hierarki wilayah reuse penuh services/dpt.ts (sama sumber dengan
// DptStack) — keputusan eksplisit user, konsekuensinya cuma kabupaten BANTAENG
// (7303) yang datanya lengkap (pola "contoh data (demo)" yang sama dengan
// HomeScreen). Target suara sendiri LOCAL-ONLY (SecureStore, src/lib/targetSuara.ts)
// — belum ada endpoint backend apapun untuk ini, belum sinkron antar device.
export function TargetSuaraKabupatenScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "TargetSuaraKabupaten">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kabWilId, kabNama, kabTotalDpt } = route.params;

  const kecamatanQuery = useDptKecamatanList(kabWilId);
  const targetMapQuery = useTargetSuaraMap();
  const setTargetMutation = useSetTargetSuara();

  const targetMap = targetMapQuery.data ?? {};
  const ownTarget = targetMap[buildTargetSuaraKey("kab", kabWilId)] ?? null;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={kecamatanQuery.data ?? []}
        keyExtractor={(item) => String(item.wilId)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <TargetSuaraHeaderCard
              nama={kabNama}
              totalDpt={kabTotalDpt}
              currentTarget={ownTarget}
              isSaving={setTargetMutation.isPending}
              onSave={(value) => setTargetMutation.mutate({ level: "kab", wilId: kabWilId, value })}
            />
            <Button
              label="Lihat Laporan Target Suara"
              variant="secondary"
              onPress={() => navigation.navigate("TargetSuaraReport", { kabWilId, kabNama, kabTotalDpt })}
            />
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Kecamatan</Text>
            {kecamatanQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar kecamatan.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void kecamatanQuery.refetch()} />
              </View>
            ) : null}
            {kecamatanQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <DptRegionCard
            nama={item.nama}
            sublabel={formatTargetSublabel(item.totalDpt, targetMap[buildTargetSuaraKey("kec", item.wilId)] ?? null)}
            onPress={() =>
              navigation.navigate("TargetSuaraKecamatan", {
                kecWilId: item.wilId,
                kecNama: item.nama,
                kecTotalDpt: item.totalDpt,
                kabWilId,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !kecamatanQuery.isLoading && !kecamatanQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Kecamatan tidak ditemukan.</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={kecamatanQuery.isRefetching || targetMapQuery.isRefetching}
            onRefresh={() => {
              void kecamatanQuery.refetch();
              void targetMapQuery.refetch();
            }}
          />
        }
      />
    </SafeAreaView>
  );
}
