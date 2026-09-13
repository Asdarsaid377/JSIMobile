import { FlatList, RefreshControl, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useDptKecamatanList } from "@/hooks/useDptKecamatanList";
import type { DptStackParamList } from "@/navigation/DptStack";

// Level 1 dari 3 (Kabupaten → Kecamatan → Kelurahan → pilih TPS → RealCountC1Screen).
// Real Count C1 SEKARANG FITUR TERSENDIRI (dipisah dari Target Suara, permintaan
// user 2026-08-22) — punya alur drill-down wilayahnya sendiri, TIDAK lagi cuma
// bisa diakses lewat TargetSuaraTpsScreen. Reuse hierarki DPT yang sama (konsekuensi
// sama: cuma Kabupaten Bantaeng yang datanya lengkap). Tidak ada referensi desain
// (izin build dari ui-rules.md/ui-tokens.md). Beda dari TargetSuaraKabupatenScreen —
// screen ini TIDAK ada header card "level saat ini" karena C1 murni konsep TPS,
// tidak ada nilai di level Kabupaten/Kecamatan/Kelurahan.
export function RealCountKabupatenScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "RealCountKabupaten">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kabWilId, kabNama } = route.params;

  const kecamatanQuery = useDptKecamatanList(kabWilId);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={kecamatanQuery.data ?? []}
        keyExtractor={(item) => String(item.wilId)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">Kabupaten {kabNama} · pilih kecamatan</Text>
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
            sublabel={`${item.totalDpt.toLocaleString("id-ID")} DPT · ${item.totalKel} kelurahan`}
            onPress={() =>
              navigation.navigate("RealCountKecamatan", { kecWilId: item.wilId, kecNama: item.nama, kabWilId })
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
          <RefreshControl refreshing={kecamatanQuery.isRefetching} onRefresh={() => void kecamatanQuery.refetch()} />
        }
      />
    </SafeAreaView>
  );
}
