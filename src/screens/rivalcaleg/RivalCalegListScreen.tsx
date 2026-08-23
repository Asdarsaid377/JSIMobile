import { FlatList, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RivalCalegCard } from "@/components/rivalcaleg/RivalCalegCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRivalCalegList } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// Rival Internal Separtai — fitur baru di luar build-plan awal (saran konsultan
// politik, permintaan user langsung: khas pileg Indonesia sistem proporsional
// terbuka, caleg bersaing suara dengan caleg LAIN DARI PARTAI SENDIRI di dapil
// yang sama, bukan cuma lawan partai lain). Tidak ada referensi desain (izin
// build dari ui-rules.md/ui-tokens.md). Data lewat services/rivalcaleg.ts — pola
// mock service STANDAR (sama Saksi TPS/Real Count), belum ada endpoint backend.
// Entry point: grid "Akses Cepat" HomeScreen + route baru di HomeStack.
export function RivalCalegListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const rivalListQuery = useRivalCalegList();

  useHideTabBar();

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={rivalListQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">
              Pantau kekuatan caleg lain dari partai yang sama di dapil ini
            </Text>
            <Button
              label="+ Tambah Rival Caleg"
              variant="primary"
              onPress={() => navigation.navigate("RivalCalegForm")}
            />
            {rivalListQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat daftar rival caleg.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void rivalListQuery.refetch()} />
              </View>
            ) : null}
            {rivalListQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RivalCalegCard item={item} onPress={() => navigation.navigate("RivalCalegDetail", { rivalCalegId: item.id, namaLengkap: item.namaLengkap })} />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !rivalListQuery.isLoading && !rivalListQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Belum ada rival caleg yang dicatat.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
