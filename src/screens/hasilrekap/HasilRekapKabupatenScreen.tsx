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
import { useHasilRekapKabupatenSnapshot } from "@/hooks/useHasilRekap";
import type { RekapStackParamList } from "@/navigation/RekapStack";
import type { HasilRekapCaleg } from "@/types/hasilrekap";

// Level 2 dari 5 — lihat HasilRekapDapilScreen.tsx untuk konteks penuh alur.
// Referensi web `DprRiProvinsi.jsx` (route `/hrdprri2024/provinsi/:id`) —
// halaman aslinya pivot caleg × kabupaten yang sangat padat, di mobile
// diadaptasi jadi `HasilRekapPartaiSummaryCard` (rekap partai ter-scope ke
// Dapil ini) + list Kabupaten untuk drill lebih lanjut + "Daftar Caleg"
// (ganti kolom pivot caleg × kabupaten dengan list flat, tiap caleg bawa
// nama Kabupaten tempat suaranya terbanyak — permintaan eksplisit user
// "tampilkan list caleg beserta nama daerahnya... jangan dibuat table").
export function HasilRekapKabupatenScreen() {
  const route = useRoute<RouteProp<RekapStackParamList, "HasilRekapKabupaten">>();
  const navigation = useNavigation<NativeStackNavigationProp<RekapStackParamList>>();
  const { dapilId, dapilNama } = route.params;

  const snapshotQuery = useHasilRekapKabupatenSnapshot(dapilId);
  const [sheetCaleg, setSheetCaleg] = useState<HasilRekapCaleg | null>(null);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={snapshotQuery.data?.kabupaten ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            {snapshotQuery.data ? (
              <HasilRekapPartaiSummaryCard
                nama={dapilNama}
                totalSuaraSah={snapshotQuery.data.totalSuaraSah}
                partaiSuara={snapshotQuery.data.partaiSuara}
              />
            ) : null}
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Kabupaten/Kota</Text>
            {snapshotQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat data Kabupaten.</Text>
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
              navigation.navigate("HasilRekapKecamatan", {
                dapilId,
                dapilNama,
                kabupatenId: item.id,
                kabupatenNama: item.nama,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !snapshotQuery.isLoading && !snapshotQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Kabupaten/kota tidak ditemukan.</Text>
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
      <HasilRekapCalegDetailSheet item={sheetCaleg} levelLabel="Kabupaten/Kota" onClose={() => setSheetCaleg(null)} />
    </SafeAreaView>
  );
}
