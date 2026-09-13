import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useQuickCountTpsList } from "@/hooks/useQuickCount";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// Referensi: TIDAK ADA mockup untuk screen ini (artboard 12 cuma versi input
// hasil C1, tidak ada manajemen TPS) — dibangun tanpa referensi visual atas
// izin eksplisit user (2026-08-24, Aturan #1, izin sama yang sudah dipakai
// untuk QuickCountKandidatScreen). Admin-only, entry point icon
// "location-outline" di headerRight QuickCountScreen, di samping icon
// "people-outline" (Kelola Kandidat).
export function QuickCountTpsManageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const tpsQuery = useQuickCountTpsList();

  const tpsList = tpsQuery.data ?? [];
  const isLoading = tpsQuery.isLoading;
  const isError = tpsQuery.isError;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={tpsQuery.isRefetching} onRefresh={() => void tpsQuery.refetch()} />}
      >
        <Text className="text-caption text-text-muted">
          TPS di bawah dipakai sebagai daftar utama di tab "Status TPS" dan tombol "+ Input Hasil C1".
        </Text>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat daftar TPS.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void tpsQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError ? (
          <View className="gap-sm">
            {tpsList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate("QuickCountTpsForm", { record: item })}
                className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
                    {item.noTps}
                  </Text>
                  <Text className="text-caption text-text-muted" numberOfLines={1}>
                    {item.kelurahan}, Kec. {item.kecamatan}, Kab. {item.kabupaten} · {item.namaSaksi ?? "Belum ada saksi"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="border-t border-border bg-surface p-md">
        <Button
          label="+ Tambah TPS"
          variant="primary"
          onPress={() => navigation.navigate("QuickCountTpsForm", {})}
        />
      </View>
    </SafeAreaView>
  );
}
