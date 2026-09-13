import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { useQuickCountKandidatList } from "@/hooks/useQuickCount";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// Referensi: TIDAK ADA mockup untuk screen ini (artboard 12 cuma versi input
// hasil C1, tidak ada manajemen kandidat) — dibangun tanpa referensi visual
// atas izin eksplisit user (2026-08-24, Aturan #1). Admin-only, entry point
// icon "people-outline" di headerRight QuickCountScreen (pola sama
// "options-outline" → BudgetPlafonScreen di BudgetingKampanyeScreen).
export function QuickCountKandidatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const kandidatQuery = useQuickCountKandidatList();

  const kandidatList = kandidatQuery.data ?? [];
  const isLoading = kandidatQuery.isLoading;
  const isError = kandidatQuery.isError;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={kandidatQuery.isRefetching} onRefresh={() => void kandidatQuery.refetch()} />}
      >
        <Text className="text-caption text-text-muted">
          Kandidat & partai di bawah dipakai sebagai kolom input di form "Kirim Hasil C1" untuk semua TPS.
        </Text>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat daftar kandidat.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void kandidatQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError ? (
          <View className="gap-sm">
            {kandidatList.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate("QuickCountKandidatForm", { record: item })}
                className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
              >
                <View className="flex-1 gap-0.5">
                  <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
                    {item.nama}
                  </Text>
                  <Text className="text-caption text-text-muted">{item.partai || "Tanpa partai"}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="border-t border-border bg-surface p-md">
        <Button
          label="+ Tambah Kandidat"
          variant="primary"
          onPress={() => navigation.navigate("QuickCountKandidatForm", {})}
        />
      </View>
    </SafeAreaView>
  );
}
