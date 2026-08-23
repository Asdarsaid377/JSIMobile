import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { useDptKabupatenList } from "@/hooks/useDptKabupatenList";
import type { DptStackParamList } from "@/navigation/DptStack";
import type { RouteProp } from "@react-navigation/native";

// Tahap 2 dari 3 (Feature 08) — belum ada file desain khusus untuk screen ini,
// pola visual (search + DptRegionCard) diturunkan langsung dari
// context/designs/dptlistdaerah.png (tahap 1, "Pilih Provinsi") karena struktur
// datanya identik (nama wilayah + total pemilih + jumlah sub-wilayah). Native
// header (title + back chevron) karena ini pushed screen — beda dari tahap 1
// yang jadi root tab.
export function DptKabupatenScreen() {
	const [search, setSearch] = useState("");
	const route = useRoute<RouteProp<DptStackParamList, "DptKabupaten">>();
	const navigation =
		useNavigation<NativeStackNavigationProp<DptStackParamList>>();
	const { provinsiWilId, provinsiNama } = route.params;
	const kabupatenQuery = useDptKabupatenList(provinsiWilId);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		const data = kabupatenQuery.data ?? [];
		if (!query) return data;
		return data.filter((item) => item.nama.toLowerCase().includes(query));
	}, [kabupatenQuery.data, search]);

	return (
		// edges={[]} eksplisit — sama alasan dengan DptListScreen.tsx (SafeAreaView
		// default ke "semua edge additive" kalau prop `edges` tidak diisi sama
		// sekali). Native header sudah urus top, tab bar "DPT" sudah urus bottom.
		<SafeAreaView edges={[]} className="flex-1 bg-background">
			<View className="gap-sm px-margin-mobile pt-sm">
				<Text className="text-caption text-text-muted">
					Provinsi {provinsiNama}
				</Text>
				<View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
					<Ionicons name="search" size={18} color="#64748b" />
					<TextInput
						value={search}
						onChangeText={setSearch}
						placeholder="Cari kabupaten/kota..."
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
				contentContainerStyle={{ padding: 16, gap: 12 }}
				renderItem={({ item }) => (
					<DptRegionCard
						nama={item.nama}
						sublabel={`${item.totalDpt.toLocaleString("id-ID")} pemilih · ${item.totalKec} kecamatan`}
						onPress={() =>
							navigation.navigate("DptList", { kabWilId: item.wilId })
						}
					/>
				)}
				ListEmptyComponent={
					kabupatenQuery.isLoading ? (
						<View className="gap-xs">
							<DptRegionCardSkeleton />
							<DptRegionCardSkeleton />
							<DptRegionCardSkeleton />
						</View>
					) : kabupatenQuery.isError ? (
						<View className="gap-xs">
							<Text className="text-body-md text-danger">
								Gagal memuat daftar kabupaten/kota.
							</Text>
							<Button
								label="Coba Lagi"
								variant="secondary"
								onPress={() => void kabupatenQuery.refetch()}
							/>
						</View>
					) : (
						<Text className="text-center text-body-md text-text-muted">
							Kabupaten/kota tidak ditemukan.
						</Text>
					)
				}
			/>
		</SafeAreaView>
	);
}
