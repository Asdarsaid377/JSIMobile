import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useDptKelurahanList } from "@/hooks/useDptKelurahanList";
import type { DptStackParamList } from "@/navigation/DptStack";

// Level 2 dari 3 — lihat RealCountKabupatenScreen.tsx untuk konteks penuh.
export function RealCountKecamatanScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "RealCountKecamatan">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kecWilId, kecNama, kabWilId } = route.params;

  const kelurahanQuery = useDptKelurahanList(kabWilId, kecWilId);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={kelurahanQuery.data ?? []}
        keyExtractor={(item) => String(item.wilId)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">Kecamatan {kecNama} · pilih kelurahan/desa</Text>
            {kelurahanQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar kelurahan.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void kelurahanQuery.refetch()} />
              </View>
            ) : null}
            {kelurahanQuery.isLoading ? (
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
            sublabel={`${item.totalDpt.toLocaleString("id-ID")} DPT`}
            onPress={() =>
              navigation.navigate("RealCountKelurahan", { kelWilId: item.wilId, kelNama: item.nama, kabWilId })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !kelurahanQuery.isLoading && !kelurahanQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">Kelurahan/desa tidak ditemukan.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
