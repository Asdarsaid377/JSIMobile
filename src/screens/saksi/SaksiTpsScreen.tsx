import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { SaksiCard } from "@/components/saksi/SaksiCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useSaksiByTps, useUpdateSaksiStatus } from "@/hooks/useSaksi";
import type { DptStackParamList } from "@/navigation/DptStack";

// Saksi TPS — fitur baru di luar build-plan awal (permintaan user langsung,
// "cukup UI dulu, API dikembangkan belakangan" — lihat services/saksi.ts &
// progress-tracker.md Decisions). Tidak ada referensi desain (izin build dari
// ui-rules.md/ui-tokens.md). Di-push dari TargetSuaraTpsScreen (reuse TPS yang
// sama, sudah punya kelWilId/noTps/namaTps di tangan) — route ATTACH ke
// DptStack yang sama, bukan stack terpisah, konsisten pola Target Suara.
export function SaksiTpsScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "SaksiTps">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kelWilId, noTps, namaTps } = route.params;

  const saksiQuery = useSaksiByTps(kelWilId, noTps);
  const updateStatusMutation = useUpdateSaksiStatus(kelWilId, noTps);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={saksiQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">TPS {namaTps}</Text>
            <Button
              label="+ Tambah Saksi"
              variant="primary"
              onPress={() => navigation.navigate("SaksiForm", { kelWilId, noTps, namaTps })}
            />
            {saksiQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar saksi.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void saksiQuery.refetch()} />
              </View>
            ) : null}
            {saksiQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <SaksiCard
            item={item}
            onChangeStatus={(status) => updateStatusMutation.mutate({ id: item.id, status })}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !saksiQuery.isLoading && !saksiQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Belum ada saksi untuk TPS ini.</Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={saksiQuery.isRefetching} onRefresh={() => void saksiQuery.refetch()} />
        }
      />
    </SafeAreaView>
  );
}
