import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { TargetSuaraHeaderCard } from "@/components/targetsuara/TargetSuaraHeaderCard";
import { Button } from "@/components/ui/Button";
import { useDptKelurahanList } from "@/hooks/useDptKelurahanList";
import { useSetTargetSuara, useTargetSuaraMap } from "@/hooks/useTargetSuara";
import { buildTargetSuaraKey, formatTargetSublabel } from "@/lib/targetSuara";
import type { DptStackParamList } from "@/navigation/DptStack";

// Level 2 dari 4 — lihat TargetSuaraKabupatenScreen.tsx untuk konteks penuh
// (referensi desain, sumber hierarki, penyimpanan local-only).
export function TargetSuaraKecamatanScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "TargetSuaraKecamatan">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kecWilId, kecNama, kecTotalDpt, kabWilId } = route.params;

  const kelurahanQuery = useDptKelurahanList(kabWilId, kecWilId);
  const targetMapQuery = useTargetSuaraMap();
  const setTargetMutation = useSetTargetSuara();

  const targetMap = targetMapQuery.data ?? {};
  const ownTarget = targetMap[buildTargetSuaraKey("kec", kecWilId)] ?? null;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={kelurahanQuery.data ?? []}
        keyExtractor={(item) => String(item.wilId)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <TargetSuaraHeaderCard
              nama={kecNama}
              totalDpt={kecTotalDpt}
              currentTarget={ownTarget}
              isSaving={setTargetMutation.isPending}
              onSave={(value) => setTargetMutation.mutate({ level: "kec", wilId: kecWilId, value })}
            />
            <Text className="text-body-lg font-semibold text-text-primary">Pilih Kelurahan/Desa</Text>
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
            sublabel={formatTargetSublabel(item.totalDpt, targetMap[buildTargetSuaraKey("kel", item.wilId)] ?? null)}
            onPress={() =>
              navigation.navigate("TargetSuaraKelurahan", {
                kelWilId: item.wilId,
                kelNama: item.nama,
                kelTotalDpt: item.totalDpt,
                kabWilId,
              })
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
