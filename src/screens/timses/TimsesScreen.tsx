import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	Text,
	TextInput,
	View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { TimsesEmptyState } from "@/components/timses/TimsesEmptyState";
import { TimsesMemberCard } from "@/components/timses/TimsesMemberCard";
import { TimsesMemberCardSkeleton } from "@/components/timses/TimsesMemberCardSkeleton";
import { TimsesSummaryCards } from "@/components/timses/TimsesSummaryCards";
import { useAuth } from "@/hooks/useAuth";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useTimsesList } from "@/hooks/useTimsesList";
import { isAdmin } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// 2026-08-25 — RBAC: breadcrumb drill-down Kecamatan→Desa (TimsesBreadcrumb +
// TimsesRegionPickerModal) DIHAPUS dari screen ini — dulu di-grouping dari
// string `kecamatan`/`desa` di tiap member, data itu sudah tidak ada sama
// sekali di backend baru (diganti kabId/kecId/kelId numerik, belum ada
// resolusi ke nama wilayah). Grouping-by-angka-mentah cuma akan tampilkan
// "Kecamatan #730301" yang tidak berguna, jadi disederhanakan jadi list
// datar + search sampai ada cara resolve nama wilayah (lihat
// progress-tracker.md Decisions). Scoping wilayah SEKARANG sungguhan
// ditegakkan SERVER-SIDE (GET /user/list otomatis terbatas sesuai role+
// wilayah requester, lihat api-standards.md § RBAC) — jadi list yang
// diterima screen ini sudah benar tanpa perlu filter tambahan di client.
export function TimsesScreen() {
	const { session } = useAuth();
	const navigation =
		useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
	const listQuery = useTimsesList();
	useHideTabBar();

	const [search, setSearch] = useState("");

	useFocusEffect(
		useCallback(() => {
			void listQuery.refetch();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []),
	);

	const members = listQuery.data ?? [];

	const searchedMembers = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return members;
		return members.filter((member) =>
			member.namaLengkap.toLowerCase().includes(query),
		);
	}, [members, search]);

	const total = members.length;
	const online = members.filter(
		(member) => member.statusOnline === "online",
	).length;
	const isLoading = listQuery.isLoading;
	const isError = listQuery.isError;

	function handleRetry() {
		void listQuery.refetch();
	}

	function handleAdd() {
		navigation.navigate("TimsesForm");
	}

	// "+" cuma render untuk admin/adminsekret — POST /user (backend) di-guard
	// @Roles('admin','adminsekret'), jadi role lain akan selalu 403 kalau
	// dipaksa tampil (lihat api-standards.md § RBAC).
	const canAddMember = session ? isAdmin(session.user.roles) : false;

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: canAddMember
				? () => (
						<Pressable
							onPress={handleAdd}
							hitSlop={8}
							className="h-11 w-11 items-center justify-center rounded-lg bg-accent active:opacity-80">
							<Ionicons name="add" size={22} color="#ffffff" />
						</Pressable>
					)
				: undefined,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [navigation, canAddMember]);

	if (!session) {
		return null;
	}

	return (
		<SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
			<FlatList
				data={searchedMembers}
				keyExtractor={(item) => String(item.id)}
				contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
				ListHeaderComponent={
					<View className="gap-md pb-md">
						<View className="flex-row items-center gap-sm rounded-md border border-border bg-surface px-md py-sm">
							<Ionicons name="search" size={18} color="#64748b" />
							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder="Cari anggota timses..."
								placeholderTextColor="#64748b"
								className="flex-1 text-body-md text-text-primary"
							/>
						</View>
						<TimsesSummaryCards
							total={total}
							online={online}
							isLoading={isLoading}
						/>
						{isError ? (
							<View className="gap-sm">
								<Text className="text-body-md text-danger">
									Gagal memuat daftar anggota timses.
								</Text>
								<Button
									label="Coba Lagi"
									variant="secondary"
									onPress={handleRetry}
								/>
							</View>
						) : null}
						{isLoading ? (
							<View className="gap-sm">
								<TimsesMemberCardSkeleton />
								<TimsesMemberCardSkeleton />
								<TimsesMemberCardSkeleton />
							</View>
						) : null}
					</View>
				}
				renderItem={({ item }) => (
					<TimsesMemberCard
						item={item}
						onPress={
							canAddMember
								? () => navigation.navigate("TimsesForm", { member: item })
								: undefined
						}
					/>
				)}
				ItemSeparatorComponent={() => <View className="h-xs" />}
				ListEmptyComponent={
					!isLoading && !isError ? (
						<TimsesEmptyState hasSearch={search.trim().length > 0} />
					) : null
				}
				refreshControl={
					<RefreshControl
						refreshing={listQuery.isRefetching}
						onRefresh={() => void listQuery.refetch()}
					/>
				}
			/>
		</SafeAreaView>
	);
}
