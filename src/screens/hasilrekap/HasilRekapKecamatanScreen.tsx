import { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { HasilRekapCalegDetailSheet } from "@/components/hasilrekap/HasilRekapCalegDetailSheet";
import { HasilRekapCalegRow } from "@/components/hasilrekap/HasilRekapCalegRow";
import { HasilRekapPartaiSummaryCard } from "@/components/hasilrekap/HasilRekapPartaiSummaryCard";
import { Button } from "@/components/ui/Button";
import { useHasilRekapKecamatanSnapshot } from "@/hooks/useHasilRekap";
import type { RekapStackParamList } from "@/navigation/RekapStack";
import type { HasilRekapCaleg } from "@/types/hasilrekap";

// Level 3 dari 5 — lihat HasilRekapDapilScreen.tsx untuk konteks penuh alur.
// Referensi web `DprRiKabupaten.jsx` (route `.../provinsi/:id/:kabupatenId`).
export function HasilRekapKecamatanScreen() {
  const route = useRoute<RouteProp<RekapStackParamList, "HasilRekapKecamatan">>();
  const navigation = useNavigation<NativeStackNavigationProp<RekapStackParamList>>();
  const { dapilId, dapilNama, kabupatenId, kabupatenNama } = route.params;

  const snapshotQuery = useHasilRekapKecamatanSnapshot(dapilId, kabupatenId);
  const [sheetCaleg, setSheetCaleg] = useState<HasilRekapCaleg | null>(null);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={snapshotQuery.data?.kecamatan ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            {snapshotQuery.data ? (
              <HasilRekapPartaiSummaryCard
                nama={kabupatenNama}
                totalSuaraSah={snapshotQuery.data.totalSuaraSah}
                partaiSuara={snapshotQuery.data.partaiSuara}
              />
            ) : null}
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Kecamatan</Text>
            {snapshotQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat data Kecamatan.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void snapshotQuery.refetch()} />
              </View>
            ) : null}
            {snapshotQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <DptRegionCard
            nama={item.nama}
            sublabel={`${item.totalSuara.toLocaleString("id-ID")} suara · Unggul ${item.partaiUnggul}`}
            onPress={() =>
              navigation.navigate("HasilRekapKelurahan", {
                dapilId,
                dapilNama,
                kabupatenId,
                kabupatenNama,
                kecamatanId: item.id,
                kecamatanNama: item.nama,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !snapshotQuery.isLoading && !snapshotQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Kecamatan tidak ditemukan.</Text>
          ) : null
        }
        ListFooterComponent={
          snapshotQuery.data ? (
            <View className="gap-sm pt-md">
              <Text className="text-body-lg font-semibold text-text-primary">Daftar Caleg</Text>
              <View className="gap-sm">
                {snapshotQuery.data.calegList.map((item, index) => (
                  <HasilRekapCalegRow
                    key={`${item.nama}-${index}`}
                    rank={index + 1}
                    nama={item.nama}
                    partai={item.partai}
                    suara={item.suara}
                    daerahUnggul={item.daerahUnggul}
                    onPress={() => setSheetCaleg(item)}
                  />
                ))}
              </View>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={snapshotQuery.isRefetching} onRefresh={() => void snapshotQuery.refetch()} />
        }
      />
      <HasilRekapCalegDetailSheet item={sheetCaleg} levelLabel="Kecamatan" onClose={() => setSheetCaleg(null)} />
    </SafeAreaView>
  );
}
