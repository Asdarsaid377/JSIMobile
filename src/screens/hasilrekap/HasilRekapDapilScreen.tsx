import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useHasilRekapDapilList } from "@/hooks/useHasilRekap";
import type { RekapStackParamList } from "@/navigation/RekapStack";

// Level 1 dari 5 (Dapil → Kabupaten → Kecamatan → Kelurahan, terminal di
// Kelurahan) — referensi web `DprRiDapil.jsx` (route `/hrdprri2024`, tabel
// flat semua Dapil). Reuse `DptRegionCard`/`DptRegionCardSkeleton` (pola
// list-wilayah yang sama dengan TargetSuara/RealCount) — sublabel "N kursi ·
// N suara" menggantikan kolom tabel per-partai web (tidak muat di layar
// mobile, lihat types/hasilrekap.ts).
export function HasilRekapDapilScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RekapStackParamList>>();
  const dapilQuery = useHasilRekapDapilList();

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={dapilQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Dapil</Text>
            {dapilQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar Dapil.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void dapilQuery.refetch()} />
              </View>
            ) : null}
            {dapilQuery.isLoading ? (
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
            sublabel={`${item.jumlahKursi} kursi · ${item.totalSuara.toLocaleString("id-ID")} suara · Unggul ${item.partaiUnggul}`}
            onPress={() => navigation.navigate("HasilRekapKabupaten", { dapilId: item.id, dapilNama: item.nama })}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !dapilQuery.isLoading && !dapilQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Dapil tidak ditemukan.</Text>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={dapilQuery.isRefetching} onRefresh={() => void dapilQuery.refetch()} />}
      />
    </SafeAreaView>
  );
}
