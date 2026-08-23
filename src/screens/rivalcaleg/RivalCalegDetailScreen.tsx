import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { RivalAssessmentCard } from "@/components/rivalcaleg/RivalAssessmentCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useRivalAssessments } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// Daftar assessment wilayah per rival caleg — lihat RivalCalegListScreen.tsx
// untuk konteks fitur penuh. Tap kartu assessment → buka form dalam mode edit
// (pre-filled dari data yang sudah ada).
export function RivalCalegDetailScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, "RivalCalegDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { rivalCalegId, namaLengkap } = route.params;

  const assessmentsQuery = useRivalAssessments(rivalCalegId);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={assessmentsQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">{namaLengkap}</Text>
            <Button
              label="+ Tambah Assessment Wilayah"
              variant="primary"
              onPress={() => navigation.navigate("RivalAssessmentForm", { rivalCalegId })}
            />
            {assessmentsQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat assessment wilayah.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void assessmentsQuery.refetch()} />
              </View>
            ) : null}
            {assessmentsQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RivalAssessmentCard
            item={item}
            onPress={() =>
              navigation.navigate("RivalAssessmentForm", {
                rivalCalegId,
                kecamatan: item.kecamatan,
                desa: item.desa ?? undefined,
                levelAncaman: item.levelAncaman,
                catatan: item.catatan ?? undefined,
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !assessmentsQuery.isLoading && !assessmentsQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Belum ada assessment wilayah untuk rival ini.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
