import { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { useDptProvinsiList } from "@/hooks/useDptProvinsiList";
import type { DptStackParamList } from "@/navigation/DptStack";

// Tahap 1 dari 3 (Feature 08) — referensi context/designs/dptlistdaerah.png
// ("DPT — Pilih Provinsi"). Root DptStack, tab bar tetap terlihat (bukan pushed) —
// heading in-content, bukan native header, konsisten pola Home/Program/Timses lama.
export function DptProvinsiScreen() {
  const [search, setSearch] = useState("");
  const provinsiQuery = useDptProvinsiList();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const data = provinsiQuery.data ?? [];
    if (!query) return data;
    return data.filter((item) => item.nama.toLowerCase().includes(query));
  }, [provinsiQuery.data, search]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="gap-sm px-margin-mobile pt-sm">
        <Text className="text-headline-md font-semibold text-text-primary">DPT — Pilih Provinsi</Text>
        <View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari provinsi..."
            placeholderTextColor="#64748b"
            className="flex-1 text-body-md text-text-primary"
            textAlignVertical="center"
            style={{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.wilId)}
        contentContainerStyle={{ padding: 16, gap: 4 }}
        renderItem={({ item }) => (
          <DptRegionCard
            nama={item.nama}
            sublabel={`${item.totalDpt.toLocaleString("id-ID")} pemilih · ${item.totalKab} kabupaten/kota`}
            onPress={() => navigation.navigate("DptKabupaten", { provinsiWilId: item.wilId, provinsiNama: item.nama })}
          />
        )}
        ListEmptyComponent={
          provinsiQuery.isLoading ? (
            <View className="gap-sm">
              <DptRegionCardSkeleton />
              <DptRegionCardSkeleton />
              <DptRegionCardSkeleton />
            </View>
          ) : provinsiQuery.isError ? (
            <View className="gap-sm">
              <Text className="text-body-md text-danger">Gagal memuat daftar provinsi.</Text>
              <Button label="Coba Lagi" variant="secondary" onPress={() => void provinsiQuery.refetch()} />
            </View>
          ) : (
            <Text className="text-center text-body-md text-text-muted">Provinsi tidak ditemukan.</Text>
          )
        }
        refreshControl={
          <RefreshControl refreshing={provinsiQuery.isRefetching} onRefresh={() => void provinsiQuery.refetch()} />
        }
      />
    </SafeAreaView>
  );
}
