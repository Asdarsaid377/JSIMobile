import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	TextInput,
	View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { Button } from "@/components/ui/Button";
import { DptCard } from "@/components/dpt/DptCard";
import { DptCardSkeleton } from "@/components/dpt/DptCardSkeleton";
import { DptEmptyState } from "@/components/dpt/DptEmptyState";
import { DptSummaryCards } from "@/components/dpt/DptSummaryCards";
import { DptVoterActionSheet } from "@/components/dpt/DptVoterActionSheet";
import { TimsesRegionPickerModal } from "@/components/timses/TimsesRegionPickerModal";
import type { TimsesRegionOption } from "@/components/timses/TimsesRegionPickerModal";
import { useDptKecamatanList } from "@/hooks/useDptKecamatanList";
import { useDptKelurahanList } from "@/hooks/useDptKelurahanList";
import { useDptList } from "@/hooks/useDptList";
import { useDptTotal } from "@/hooks/useDptTotal";
import { useDptTpsList } from "@/hooks/useDptTpsList";
import { useDeleteDptRecord } from "@/hooks/useDptRecordMutations";
import type { DptStackParamList } from "@/navigation/DptStack";
import type { DptRecord } from "@/types/dpt";

// Tahap 3 dari 3 (Feature 08) — referensi context/designs/dpt.png. Provinsi &
// Kabupaten datang dari route params (dipilih di DptProvinsiScreen /
// DptKabupatenScreen, screen asli — lihat progress-tracker.md Decisions).
// Kecamatan/Kelurahan/TPS TETAP modal (TimsesRegionPickerModal reuse) — itu filter
// dalam satu scope kabupaten, bukan tahap navigasi terpisah, dan belum ada desain
// khusus untuk itu ("modal interim").
//
// ⚠️ 2026-08-23 — WIRED ke backend real (`api-standards.md` § DPT). List &
// filter sekarang SERVER-SIDE (page/limit/nama/kecId/kelId/tps dikirim ke
// GET /dpt/2024/:wilId, bukan lagi fetch-penuh-lalu-filter-di-memori) —
// wajib begitu untuk dataset asli yang bisa >100rb baris per kabupaten.
export function DptListScreen() {
	const route = useRoute<RouteProp<DptStackParamList, "DptList">>();
	const navigation =
		useNavigation<NativeStackNavigationProp<DptStackParamList>>();
	const { kabWilId } = route.params;

	const [kecWilId, setKecWilId] = useState<number | null>(null);
	const [kelWilId, setKelWilId] = useState<number | null>(null);
	const [tps, setTps] = useState<number | null>(null);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");

	const [kecamatanPickerOpen, setKecamatanPickerOpen] = useState(false);
	const [kelurahanPickerOpen, setKelurahanPickerOpen] = useState(false);
	const [tpsPickerOpen, setTpsPickerOpen] = useState(false);
	const [actionRecord, setActionRecord] = useState<DptRecord | null>(null);

	// Debounce 400ms — search sekarang hit server-side tiap ganti (bukan filter
	// client-side dari data yang sudah termuat), jangan panggil tiap keystroke.
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
		return () => clearTimeout(timer);
	}, [search]);

	const dptQuery = useDptList(kabWilId, {
		nama: debouncedSearch || undefined,
		kecId: kecWilId ?? undefined,
		kelId: kelWilId ?? undefined,
		tps: tps ?? undefined,
	});
	const kecamatanQuery = useDptKecamatanList(kabWilId);
	const kelurahanQuery = useDptKelurahanList(kabWilId, kecWilId);
	const tpsQuery = useDptTpsList(kabWilId, kecWilId, kelWilId);
	const totalQuery = useDptTotal(kabWilId, {
		nama: debouncedSearch || undefined,
		kecId: kecWilId ?? undefined,
		kelId: kelWilId ?? undefined,
		tps: tps ?? undefined,
	});
	const deleteMutation = useDeleteDptRecord(kabWilId);

	const firstPage = dptQuery.data?.pages[0];
	const records = useMemo(() => dptQuery.data?.pages.flatMap((page) => page.records) ?? [], [dptQuery.data]);

	function handleDtdoor(record: DptRecord): void {
		setActionRecord(null);
		navigation.navigate("DtdoorForm", {
			dptRecord: record,
			kabWilId,
			kabNama: firstPage?.kab.nama,
		});
	}

	function handleTokoh(record: DptRecord): void {
		navigation.navigate("TokohForm", { dptRecord: record, kabWilId });
	}

	function handleEdit(record: DptRecord): void {
		setActionRecord(null);
		navigation.navigate("DptRecordForm", { kabWilId, record });
	}

	function handleDelete(record: DptRecord): void {
		setActionRecord(null);
		Alert.alert("Hapus data pemilih?", `Data "${record.nama}" akan dihapus dari daftar DPT.`, [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: () => {
					deleteMutation.mutate(
						{ id: record.id, idDpt: record.idDpt },
						{ onError: (error) => Alert.alert("Gagal menghapus", error.message) },
					);
				},
			},
		]);
	}

	const kecamatanOptions: TimsesRegionOption[] = useMemo(
		() =>
			(kecamatanQuery.data ?? []).map((item) => ({
				value: String(item.wilId),
				label: item.nama,
				sublabel: `${item.totalDpt.toLocaleString("id-ID")} DPT`,
			})),
		[kecamatanQuery.data],
	);
	const kelurahanOptions: TimsesRegionOption[] = useMemo(
		() =>
			(kelurahanQuery.data ?? []).map((item) => ({
				value: String(item.wilId),
				label: item.nama,
				sublabel: `${item.totalDpt.toLocaleString("id-ID")} DPT`,
			})),
		[kelurahanQuery.data],
	);
	const tpsOptions: TimsesRegionOption[] = useMemo(
		() =>
			(tpsQuery.data ?? []).map((item) => ({
				value: String(item.noTps),
				label: `TPS ${item.namaTps}`,
			})),
		[tpsQuery.data],
	);

	const summaryItems = useMemo(() => {
		const items: { key: string; value: number; label: string }[] = [];
		if (totalQuery.data === undefined) return items;
		const kec = kecWilId !== null ? kecamatanQuery.data?.find((item) => item.wilId === kecWilId) : undefined;
		const kel = kelWilId !== null ? kelurahanQuery.data?.find((item) => item.wilId === kelWilId) : undefined;
		const tpsOption = tps !== null ? tpsOptions.find((option) => option.value === String(tps)) : undefined;
		// Filter terdalam yang aktif (TPS > Kelurahan > Kecamatan > Kabupaten)
		// pakai useDptTotal (GET /dpt/2024/total/:wilId) — sudah merefleksikan
		// SEMUA filter aktif sekaligus (termasuk pencarian nama), bukan cuma 1
		// dimensi. List endpoint sendiri TIDAK balas total (lihat types/dpt.ts).
		if (tpsOption) {
			items.push({ key: "tps", value: totalQuery.data, label: tpsOption.label });
		} else if (kel) {
			items.push({ key: "kel", value: totalQuery.data, label: kel.nama });
		} else if (kec) {
			items.push({ key: "kec", value: totalQuery.data, label: `Kec. ${kec.nama}` });
		} else if (firstPage) {
			items.push({ key: "kab", value: totalQuery.data, label: firstPage.kab.nama });
		}
		return items;
	}, [kecWilId, kecamatanQuery.data, kelWilId, kelurahanQuery.data, tps, tpsOptions, firstPage, totalQuery.data]);

	const isLoading = dptQuery.isLoading;
	const isError = dptQuery.isError;

	// Breadcrumb "Filter Wilayah Aktif" — gabungan Provinsi/Kabupaten (scope, selalu
	// ada) + Kecamatan/Kelurahan/TPS (filter, kalau dipilih). Ganti seluruh baris
	// chip lama (Provinsi/Kabupaten/Kecamatan/Kelurahan/TPS terpisah-pisah) jadi 1
	// card, permintaan eksplisit user 2026-08-22 (lihat progress-tracker.md Decisions
	// untuk mockup yang diberikan user).
	const kecamatanLabel =
		kecWilId !== null
			? kecamatanQuery.data?.find((item) => item.wilId === kecWilId)?.nama
			: undefined;
	const kelurahanLabel =
		kelWilId !== null
			? kelurahanQuery.data?.find((item) => item.wilId === kelWilId)?.nama
			: undefined;
	const tpsLabel =
		tps !== null
			? tpsOptions.find((option) => option.value === String(tps))?.label
			: undefined;
	// Provinsi & Kabupaten/Kota sengaja tidak ditampilkan (permintaan user) — card
	// ini murni soal filter Kecamatan/Kelurahan/TPS, scope kabupaten sudah jelas dari
	// konteks screen (native header + summary cards). Kalau belum ada filter aktif
	// sama sekali, tampilkan "Tidak ada filter" alih-alih breadcrumb kosong.
	const wilayahBreadcrumb =
		[kecamatanLabel, kelurahanLabel, tpsLabel]
			.filter((part): part is string => Boolean(part))
			.join(" › ") || "Tidak ada filter";

	// Ikon Tambah + download (dpt.png) jadi headerRight native — screen ini di-push,
	// native header sudah kasih judul "DPT" + back chevron dari DptStack.tsx. Ikon
	// filter DIPINDAH ke body sebagai card putih (lihat di bawah, permintaan user
	// 2026-08-22) — tidak lagi duplikat di header. Ikon "flag" (Target Suara) &
	// "calculator" (Real Count C1 — icon "clipboard" awalnya bentrok makna dengan
	// "Survey" di HomeScreen, diganti "calculator" biar lebih relevan ke
	// "menghitung suara", permintaan user) TIDAK ada di dpt.png — fitur baru di luar
	// build-plan awal, permintaan user langsung (lihat progress-tracker.md Decisions).
	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<View className="flex-row gap-sm">
					<Pressable
						onPress={() => {
							if (!firstPage) return;
							navigation.navigate("TargetSuaraKabupaten", {
								kabWilId,
								kabNama: firstPage.kab.nama,
								kabTotalDpt: firstPage.kab.totalDpt,
							});
						}}
						hitSlop={8}
						className="h-9 w-9 items-center justify-center active:opacity-80">
						<Ionicons name="flag-outline" size={20} color="#3b82f6" />
					</Pressable>
					<Pressable
						onPress={() => {
							if (!firstPage) return;
							navigation.navigate("RealCountKabupaten", {
								kabWilId,
								kabNama: firstPage.kab.nama,
							});
						}}
						hitSlop={8}
						className="h-9 w-9 items-center justify-center active:opacity-80">
						<Ionicons name="calculator-outline" size={20} color="#3b82f6" />
					</Pressable>
					<Pressable
						onPress={() => navigation.navigate("DptRecordForm", { kabWilId })}
						hitSlop={8}
						className="h-9 w-9 items-center justify-center active:opacity-80">
						<Ionicons name="add" size={22} color="#3b82f6" />
					</Pressable>
				</View>
			),
		});
	}, [navigation, firstPage, kabWilId]);

	return (
		// edges={[]} eksplisit (BUKAN edges dihilangkan) — SafeAreaView dari
		// react-native-safe-area-context default-nya "semua edge additive" kalau prop
		// `edges` tidak diisi sama sekali (lihat source-nya), bukan "tidak ada edge".
		// Screen ini tidak butuh inset apapun sendiri: native header (DptStack.tsx)
		// sudah urus top, tab bar "DPT" sudah urus bottom.
		<SafeAreaView edges={[]} className="flex-1 bg-background">
			<View className="px-margin-mobile pt-sm">
				<View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
					<Ionicons name="search" size={18} color="#64748b" />
					<TextInput
						value={search}
						onChangeText={setSearch}
						placeholder="Cari nama pemilih..."
						placeholderTextColor="#64748b"
						className="flex-1 text-body-md text-text-primary"
						textAlignVertical="center"
						style={{
							includeFontPadding: false,
							paddingVertical: 0,
							lineHeight: 20,
						}}
					/>
				</View>
			</View>

			<FlatList
				className="flex-1"
				data={records}
				keyExtractor={(item) => String(item.id)}
				contentContainerStyle={{ padding: 16, flexGrow: 1 }}
				onEndReachedThreshold={0.4}
				onEndReached={() => {
					if (dptQuery.hasNextPage && !dptQuery.isFetchingNextPage) void dptQuery.fetchNextPage();
				}}
				ListHeaderComponent={
					<View className="gap-sm pb-sm">
						<DptSummaryCards items={summaryItems} />
						{firstPage ? (
							<Pressable
								onPress={() => setKecamatanPickerOpen(true)}
								className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80">
								<View className="h-10 w-10 items-center justify-center rounded-lg bg-accent-soft">
									<Ionicons name="filter" size={18} color="#3b82f6" />
								</View>
								<View className="flex-1 gap-xs">
									<Text className="text-caption text-text-muted">
										Filter Wilayah Aktif
									</Text>
									<Text
										numberOfLines={1}
										ellipsizeMode="tail"
										className="text-body-md font-semibold text-text-primary">
										{wilayahBreadcrumb}
									</Text>
								</View>
								<Text className="text-label-md font-semibold text-accent">
									Ubah
								</Text>
							</Pressable>
						) : null}
						{isError ? (
							<View className="gap-xs">
								<Text className="text-body-md text-danger">
									Gagal memuat data DPT.
								</Text>
								<Button
									label="Coba Lagi"
									variant="secondary"
									onPress={() => void dptQuery.refetch()}
								/>
							</View>
						) : null}
						{isLoading ? (
							<View className="gap-xs">
								<DptCardSkeleton />
								<DptCardSkeleton />
								<DptCardSkeleton />
							</View>
						) : null}
					</View>
				}
				renderItem={({ item }) => <DptCard item={item} onMorePress={setActionRecord} onStarPress={handleTokoh} />}
				ItemSeparatorComponent={() => <View className="h-xs" />}
				ListFooterComponent={
					dptQuery.isFetchingNextPage ? (
						<View className="items-center py-md">
							<ActivityIndicator color="#3b82f6" />
						</View>
					) : null
				}
				ListEmptyComponent={
					!isLoading && !isError ? (
						<DptEmptyState hasSearch={search.trim().length > 0} />
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={dptQuery.isRefetching && !dptQuery.isFetchingNextPage}
						onRefresh={() => void dptQuery.refetch()}
					/>
				}
			/>

			<TimsesRegionPickerModal
				visible={kecamatanPickerOpen}
				title="Pilih Kecamatan"
				options={kecamatanOptions}
				selectedValue={kecWilId !== null ? String(kecWilId) : null}
				onSelect={(value) => {
					const nextKec = value !== null ? Number(value) : null;
					setKecWilId(nextKec);
					setKelWilId(null);
					setTps(null);
					// Cascade ke Kelurahan cuma kalau user pilih kecamatan spesifik (bukan
					// "Semua Kecamatan") — kalau "Semua", alur filter berhenti di sini.
					if (nextKec !== null) setKelurahanPickerOpen(true);
				}}
				onClose={() => setKecamatanPickerOpen(false)}
				allLabel="Semua Kecamatan"
			/>
			<TimsesRegionPickerModal
				visible={kelurahanPickerOpen}
				title="Pilih Kelurahan/Desa"
				options={kelurahanOptions}
				selectedValue={kelWilId !== null ? String(kelWilId) : null}
				onSelect={(value) => {
					const nextKel = value !== null ? Number(value) : null;
					setKelWilId(nextKel);
					setTps(null);
					if (nextKel !== null) setTpsPickerOpen(true);
				}}
				onClose={() => setKelurahanPickerOpen(false)}
				allLabel="Semua Kelurahan/Desa"
			/>
			<TimsesRegionPickerModal
				visible={tpsPickerOpen}
				title="Pilih TPS"
				options={tpsOptions}
				selectedValue={tps !== null ? String(tps) : null}
				onSelect={(value) => setTps(value !== null ? Number(value) : null)}
				onClose={() => setTpsPickerOpen(false)}
				allLabel="Semua TPS"
			/>

			<DptVoterActionSheet
				record={actionRecord}
				onClose={() => setActionRecord(null)}
				onDtdoor={handleDtdoor}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</SafeAreaView>
	);
}
