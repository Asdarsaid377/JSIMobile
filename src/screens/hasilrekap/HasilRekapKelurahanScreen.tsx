import { useState } from "react";
import { FlatList, Text, View } from "react-native";

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
import { useHasilRekapKelurahanSnapshot } from "@/hooks/useHasilRekap";
import type { RekapStackParamList } from "@/navigation/RekapStack";
import type { HasilRekapCaleg } from "@/types/hasilrekap";

// Level 4 dari 5 — lihat HasilRekapDapilScreen.tsx untuk konteks penuh alur.
// Referensi web `DprRiKecamatan.jsx` (route `.../:kabupatenId/:kecamatanId`).
// Tap Kelurahan di sini masuk ke HasilRekapDetailScreen (TERMINAL — TPS
// ditampilkan inline di sana, tidak ada level drill setelah Kelurahan untuk
// DPR RI, lihat types/hasilrekap.ts).
export function HasilRekapKelurahanScreen() {
  const route = useRoute<RouteProp<RekapStackParamList, "HasilRekapKelurahan">>();
  const navigation = useNavigation<NativeStackNavigationProp<RekapStackParamList>>();
  const { dapilId, dapilNama, kabupatenId, kabupatenNama, kecamatanId, kecamatanNama } = route.params;

  const snapshotQuery = useHasilRekapKelurahanSnapshot(dapilId, kabupatenId, kecamatanId);
  const [sheetCaleg, setSheetCaleg] = useState<HasilRekapCaleg | null>(null);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={snapshotQuery.data?.kelurahan ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            {snapshotQuery.data ? (
              <HasilRekapPartaiSummaryCard
                nama={kecamatanNama}
                totalSuaraSah={snapshotQuery.data.totalSuaraSah}
                partaiSuara={snapshotQuery.data.partaiSuara}
              />
            ) : null}
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Kelurahan/Desa</Text>
            {snapshotQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat data Kelurahan.</Text>
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
              navigation.navigate("HasilRekapDetail", {
                dapilId,
                dapilNama,
                kabupatenId,
                kabupatenNama,
                kecamatanId,
                kecamatanNama,
                kelurahanId: item.id,
                kelurahanNama: item.nama,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !snapshotQuery.isLoading && !snapshotQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Kelurahan/desa tidak ditemukan.</Text>
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
      />
      <HasilRekapCalegDetailSheet item={sheetCaleg} levelLabel="Kelurahan/Desa" onClose={() => setSheetCaleg(null)} />
    </SafeAreaView>
  );
}
