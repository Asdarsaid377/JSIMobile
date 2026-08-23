import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeActivityRow } from "@/components/home/HomeActivityRow";
import { HomeQuickAccessItem } from "@/components/home/HomeQuickAccessItem";
import { KekuatanWilayahCardSkeleton } from "@/components/kekuatan/KekuatanWilayahCardSkeleton";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useDptListAll } from "@/hooks/useDptListAll";
import { useDtdoorCount } from "@/hooks/useDtdoorCount";
import { useDtdoorList } from "@/hooks/useDtdoorList";
import { useGotvCount } from "@/hooks/useGotvCount";
import { useGotvList } from "@/hooks/useGotvList";
import { useProfile } from "@/hooks/useProfile";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { Role } from "@/types/auth";

const RECENT_ACTIVITY_LIMIT = 5;

type HomeActivity = {
	key: string;
	type: "dtdoor" | "gotv";
	title: string;
	subtitle: string;
	createdAt: string;
};

// Kabupaten 7303 (BANTAENG) hardcode SENGAJA — satu-satunya kabupaten yang punya
// data DPT mock lengkap (lihat services/dpt.ts), TIDAK terkait wilayah tugas user
// manapun (Timse tidak punya kolom kabupaten, lihat progress-tracker.md Decisions
// Feature 06). Blok ini murni "contoh data (demo)", bukan klaim wilayah user asli
// — keputusan eksplisit user saat diminta menghidupkan tampilan Home.
const DPT_DEMO_KAB_WIL_ID = 7303;

const ADMIN_ROLES: readonly Role[] = ["admin", "adminsekret"];

// Duplikat kecil dari ProfileScreen.tsx (konteks beda: welcome banner vs field
// profil) — pola sama dengan ROLE_LABEL di TimsesMemberCard.tsx, sengaja tidak
// digabung jadi shared util (lihat ui-registry.md).
const ROLE_LABEL: Record<Role, string> = {
	admin: "Admin",
	adminsekret: "Adminsekret",
	timses: "Timses",
	relawankabupaten: "Relawan Kabupaten",
	relawankecamatan: "Relawan Kecamatan",
	relawandesa: "Relawan Desa",
	relawantps: "Relawan TPS",
};

function handleNotImplemented(): void {
	Alert.alert("Segera hadir", "Fitur ini akan datang.");
}

// Scope Home (Feature 08) SENGAJA minimal — cuma cukup untuk jadi tempat berlabuh
// navigasi Timses & Lacak Relawan (Feature 06/07, dipindah dari tab jadi pushed
// screen setelah ditemukan tab bar asli di semua desain cuma Home/DPT/Rekap/
// Program/Profil, lihat progress-tracker.md Decisions), plus 2 kartu statistik
// Program Pemenangan (murah, reuse GET /dtdoor/count & /gotv/count yang sudah ada).
// Notifikasi di home-dashboard.png masih di-skip (Alert "Segera hadir", belum
// ada fitur di baliknya). Progress bar "Persentase Data DPT" & section
// "Aktivitas Terbaru" DITAMBAHKAN belakangan (permintaan user "hidupkan
// tampilan Home") — lihat DPT_DEMO_KAB_WIL_ID di atas untuk kenapa datanya
// "contoh (demo)", bukan wilayah user asli. Icon hamburger menu (desain asli)
// DIGANTI icon "headset" → push ke CustomerServiceScreen (permintaan user,
// reuse referensi context/designs/customer-service.png — lihat komentar di
// CustomerServiceScreen.tsx untuk detail adaptasinya).
// Background root DIGANTI `LinearGradient` (`expo-linear-gradient`, dependency
// baru — SDK 54 compatible via `npx expo install`) — permintaan eksplisit user
// ("gradient biru halus"), pengecualian dari `ui-rules.md` § Larangan ("jangan
// tambah gradient kecuali diminta eksplisit"). Warna 3-stop
// `#dbeafe → #f8fafc → #f8fafc` (locations 0/0.4/1, dinaikkan dari `#eff6ff`/0.35
// atas permintaan user "lebih keras 15% lagi") — `#dbeafe` = token `accent-soft`
// yang sudah ada (bukan hex baru), reach-nya sampai ~40% atas layar, lalu balik
// ke token `background` biasa.
export function HomeScreen() {
	const { session } = useAuth();
	const isAdmin = session ? ADMIN_ROLES.includes(session.user.roles) : false;
	const profileQuery = useProfile();
	const dtdoorCountQuery = useDtdoorCount();
	const gotvCountQuery = useGotvCount();
	const dptDemoQuery = useDptListAll(DPT_DEMO_KAB_WIL_ID);
	const dtdoorListQuery = useDtdoorList();
	const gotvListQuery = useGotvList();
	const navigation =
		useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

	const dptDemoRecords = dptDemoQuery.data ?? [];
	const dptDemoTotal = dptDemoRecords.length;
	const dptDemoVerified = dptDemoRecords.filter(
		(record) => record.sudahDtdoor,
	).length;
	const dptDemoPercent =
		dptDemoTotal > 0 ? Math.round((dptDemoVerified / dptDemoTotal) * 100) : 0;
	const dptDemoKelurahan = dptDemoRecords[0]?.namaKel ?? null;
	const dptDemoKecamatan = dptDemoRecords[0]?.namaKec ?? null;

	// Digabung dari 2 sumber (dtdoor+gotv) yang sudah di-fetch fitur lain (cache
	// TanStack Query SAMA persis, queryKey identik dengan ProgramPemenanganScreen —
	// request ini bukan biaya tambahan kalau user sudah pernah buka tab Program).
	// Diurutkan ulang client-side by createdAt (BUKAN asumsi urutan API/mock sudah
	// terbaru-dulu — mock list-nya sendiri urutan insert, bukan urutan waktu).
	const recentActivities = useMemo<HomeActivity[]>(() => {
		const dtdoorItems: HomeActivity[] = (
			dtdoorListQuery.data?.pages.flatMap((page) => page.data) ?? []
		).map((item) => ({
			key: `dtdoor-${item.id}`,
			type: "dtdoor",
			title: item.namaLengkap,
			subtitle: item.kategoriLabel ?? "Belum Dikategorikan",
			createdAt: item.createdAt,
		}));
		const gotvItems: HomeActivity[] = (
			gotvListQuery.data?.pages.flatMap((page) => page.data) ?? []
		).map((item) => ({
			key: `gotv-${item.id}`,
			type: "gotv",
			title: item.namaLengkap,
			subtitle: item.namaKegiatan,
			createdAt: item.createdAt,
		}));
		return [...dtdoorItems, ...gotvItems]
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)
			.slice(0, RECENT_ACTIVITY_LIMIT);
	}, [dtdoorListQuery.data, gotvListQuery.data]);

	const isActivityLoading =
		dtdoorListQuery.isLoading || gotvListQuery.isLoading;

	function goToTab(routeName: string): void {
		navigation.getParent()?.navigate(routeName);
	}

	if (!session) {
		return null;
	}

	const roleLabel = ROLE_LABEL[session.user.roles];
	// 2026-08-23: data kecamatan/wilayah tugas TIDAK ADA lagi di backend
	// (kolomnya sudah dihapus, lihat types/profile.ts) — scoping wilayah
	// SEMENTARA dimatikan di seluruh app (permintaan eksplisit user) sampai
	// ada sumber data pengganti, bukan cuma di HomeScreen ini.
	const wilayahText = "Akses mencakup seluruh kabupaten.";

	return (
		<LinearGradient
			colors={["#dbeafe", "#f8fafc", "#f8fafc"]}
			locations={[0, 0.4, 1]}
			style={{ flex: 1 }}>
			<SafeAreaView edges={["top"]} className="flex-1">
				<View className="flex-row items-center justify-between px-margin-mobile pt-sm pb-sm">
					<Pressable
						onPress={() => navigation.navigate("CustomerService")}
						hitSlop={8}
						className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80">
						<Ionicons name="headset-outline" size={20} color="#1e293b" />
					</Pressable>
					<Pressable
						onPress={handleNotImplemented}
						hitSlop={8}
						className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80">
						<Ionicons name="notifications-outline" size={20} color="#1e293b" />
						<View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
					</Pressable>
				</View>

				<ScrollView
					contentContainerStyle={{ padding: 16, gap: 12 }}
					className="flex-1">
					<View className="gap-xs rounded-lg bg-primary p-md">
						<View className="flex-row items-start justify-between">
							<View className="gap-xs">
								<Text className="text-body-md text-text-inverse-muted">
									Selamat datang,
								</Text>
								<Text className="text-body-lg font-bold text-text-inverse">
									{session.user.namaLengkap}
								</Text>
							</View>
							<Badge label={roleLabel.toUpperCase()} variant="accent" />
						</View>
						{wilayahText ? (
							<Text className="text-caption text-text-inverse-muted">
								{wilayahText}
							</Text>
						) : null}
					</View>

					{dptDemoTotal > 0 ? (
						<View className="gap-sm rounded-lg border border-border bg-surface p-md">
							<View className="flex-row items-center justify-between">
								<Text className="text-body-lg font-semibold text-text-primary">
									Persentase Data DPT
								</Text>
								<Text className="text-body-lg font-bold text-accent">
									{dptDemoPercent}%
								</Text>
							</View>
							<View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
								<View
									className="h-2 rounded-full bg-accent"
									style={{ width: `${dptDemoPercent}%` }}
								/>
							</View>
							<Text className="text-caption text-text-muted">
								{dptDemoVerified} dari {dptDemoTotal} pemilih terverifikasi Door
								To Door · Contoh data (demo)
								{dptDemoKelurahan ? `, Kel. ${dptDemoKelurahan}` : ""}
								{dptDemoKecamatan ? `, Kec. ${dptDemoKecamatan}` : ""}
							</Text>
						</View>
					) : null}

					<View className="gap-sm">
						<Text className="text-body-lg font-semibold text-text-primary">
							Program Pemenangan
						</Text>
						<View className="flex-row gap-sm">
							<View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
								<Text className="text-headline-md font-semibold text-text-primary">
									{dtdoorCountQuery.data ?? "-"}
								</Text>
								<Text className="text-caption text-text-muted">
									Door To Door
								</Text>
							</View>
							<View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
								<Text className="text-headline-md font-semibold text-text-primary">
									{gotvCountQuery.data ?? "-"}
								</Text>
								<Text className="text-caption text-text-muted">
									Social Event
								</Text>
							</View>
						</View>
					</View>

					<View className="gap-sm">
						<Text className="text-body-lg font-semibold text-text-primary">
							Akses Cepat
						</Text>
						<View className="flex-row flex-wrap rounded-lg border border-border bg-surface p-sm">
							<HomeQuickAccessItem
								icon="document-text"
								label="DPT"
								onPress={() => goToTab("DPT")}
							/>
							<HomeQuickAccessItem
								icon="bar-chart"
								label="Rekap"
								onPress={handleNotImplemented}
							/>
							<HomeQuickAccessItem
								icon="people"
								label="Timses"
								onPress={() => navigation.navigate("Timses")}
							/>
							<HomeQuickAccessItem
								icon="megaphone"
								label="Program"
								onPress={() => goToTab("Program")}
							/>
							<HomeQuickAccessItem
								icon="eye-outline"
								label="Rival Caleg"
								onPress={() => navigation.navigate("RivalCalegList")}
							/>
							<HomeQuickAccessItem
								icon="wallet-outline"
								label="Budgeting"
								onPress={() => navigation.navigate("BudgetingKampanye")}
							/>
							{isAdmin ? (
								<HomeQuickAccessItem
									icon="locate"
									label="Tracking"
									onPress={() => navigation.navigate("LacakRelawan")}
								/>
							) : null}
							<HomeQuickAccessItem
								icon="paper-plane"
								label="Broadcast"
								onPress={handleNotImplemented}
							/>
							<HomeQuickAccessItem
								icon="star"
								label="Tokoh"
								onPress={() => navigation.navigate("TokohMasyarakat")}
							/>
							<HomeQuickAccessItem
								icon="stats-chart-outline"
								label="Quick Count"
								onPress={() => navigation.navigate("QuickCount")}
							/>
							<HomeQuickAccessItem
								icon="shield-checkmark-outline"
								label="Anti-Fraud"
								onPress={() => navigation.navigate("AntiFraud")}
							/>
							<HomeQuickAccessItem
								icon="chatbubble-ellipses-outline"
								label="Isu & Aspirasi"
								onPress={() => navigation.navigate("IsuAspirasi")}
							/>
						</View>
					</View>

					{isActivityLoading ? (
						<View className="gap-sm">
							<Text className="text-body-lg font-semibold text-text-primary">
								Aktivitas Terbaru
							</Text>
							<View className="gap-xs">
								<KekuatanWilayahCardSkeleton />
								<KekuatanWilayahCardSkeleton />
								<KekuatanWilayahCardSkeleton />
							</View>
						</View>
					) : null}

					{!isActivityLoading && recentActivities.length > 0 ? (
						<View className="gap-sm">
							<Text className="text-body-lg font-semibold text-text-primary">
								Aktivitas Terbaru
							</Text>
							<View className="gap-xs">
								{recentActivities.map((activity) => (
									<HomeActivityRow
										key={activity.key}
										type={activity.type}
										title={activity.title}
										subtitle={activity.subtitle}
										createdAt={activity.createdAt}
									/>
								))}
							</View>
						</View>
					) : null}
				</ScrollView>
			</SafeAreaView>
		</LinearGradient>
	);
}
