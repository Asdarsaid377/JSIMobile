import { useLayoutEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { BudgetHeroCard } from "@/components/budgeting/BudgetHeroCard";
import { BudgetPosRow } from "@/components/budgeting/BudgetPosRow";
import { BudgetScopeToggle } from "@/components/budgeting/BudgetScopeToggle";
import { BudgetTransactionRow } from "@/components/budgeting/BudgetTransactionRow";
import { BudgetTrendChart } from "@/components/budgeting/BudgetTrendChart";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  useBudgetPos,
  useBudgetSummary,
  useBudgetTransactions,
  useBudgetTrend,
  useUpdateBudgetTransactionStatus,
} from "@/hooks/useBudgeting";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { exportTableAsPdf } from "@/lib/exportPdf";
import { ADMIN_ROLES } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { BudgetScope, BudgetTransaction } from "@/types/budgeting";

// Ekspor daftar transaksi (level paling detail, bukan cuma ringkasan per pos)
// — sesuai data yang sudah ke-fetch untuk scope aktif ("Bulan Ini"/"Total
// Kampanye"), bukan re-fetch terpisah.
async function handleDownload(transactions: BudgetTransaction[]) {
  try {
    await exportTableAsPdf(
      "Budgeting Kampanye — Daftar Transaksi",
      "budgeting-kampanye-transaksi.pdf",
      ["Tanggal", "Judul", "Pos Anggaran", "Nominal", "Oleh", "Status"],
      transactions.map((tx) => [tx.createdAt, tx.title, tx.pos, tx.nominal, tx.oleh, tx.status]),
    );
  } catch (error) {
    Alert.alert("Gagal ekspor", error instanceof Error ? error.message : "Terjadi kesalahan saat ekspor data.");
  }
}

// Referensi desain: context/designs/budgeting-kampanye.dc.html (artboard 12
// project Claude Design user, ditarik via DesignSync 2026-08-22). 2 keputusan
// skema final (progress-tracker.md Decisions):
// 1. 5 pos anggaran OPERASIONAL ikut mockup apa adanya (types/budgeting.ts) —
//    BUKAN kategori resmi LPSDK/LPPDK, keputusan sebelumnya SUPERSEDED.
// 2. Entry point: shortcut baru grid Akses Cepat HomeScreen (bukan drawer
//    seperti di mockup — app ini sudah tidak pakai drawer, lihat "TEMUAN
//    NAVIGASI BESAR" di progress-tracker.md).
// Bottom sheet "Catat Pengeluaran" di canvas asli DIJADIKAN pushed screen
// (BudgetTransactionFormScreen) — mengikuti konvensi SELURUH form lain di app
// ini (Dtdoor/Gotv/RivalCaleg/Saksi, semua native header, tidak ada satupun
// bottom sheet untuk form multi-field), bukan modal seperti canvas.
// Seluruh 4 section (summary/pos/trend/transaksi) WIRED ke backend real
// (2026-08-24, modul `budgeting` — lihat api-standards.md § Budgeting
// Kampanye). Loading/error state transaksi (txQuery) tetap dipisah dari 3
// section di atas (bukan lagi karena endpoint belum lengkap, tapi supaya
// kegagalan salah satu section — mis. network blip di tengah scroll — tidak
// menyembunyikan section lain yang masih berhasil).
// Icon "options-outline" (headerRight, admin/adminsekret-only via ADMIN_ROLES)
// buka BudgetPlafonScreen — screen BARU tanpa referensi desain, izin
// eksplisit user (2026-08-24) karena canvas asli tidak punya form "set
// plafon" sama sekali, cuma tampilan realisasi read-only.
// Tombol "Setujui"/"Tolak" di section "Pengeluaran Terbaru" (khusus transaksi
// "Menunggu", admin/adminsekret-only) — JUGA tidak ada di canvas (pill status
// di sana read-only), izin eksplisit user (2026-08-24, pertanyaan "dimana
// proses approval budgeting").
export function BudgetingKampanyeScreen() {
  const [scope, setScope] = useState<BudgetScope>("bulan");
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const isAdmin = session ? ADMIN_ROLES.includes(session.user.roles) : false;

  const summaryQuery = useBudgetSummary(scope);
  const posQuery = useBudgetPos(scope);
  const trendQuery = useBudgetTrend(scope);
  const txQuery = useBudgetTransactions();
  const statusMutation = useUpdateBudgetTransactionStatus();

  useHideTabBar();

  function handleModerate(id: number, status: "Disetujui" | "Ditolak"): void {
    statusMutation.mutate(
      { id, status },
      {
        onError: (error) =>
          Alert.alert("Gagal", error instanceof Error ? error.message : "Gagal memperbarui status transaksi."),
      },
    );
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row gap-xs">
          {isAdmin ? (
            <Pressable
              onPress={() => navigation.navigate("BudgetPlafon")}
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
            >
              <Ionicons name="options-outline" size={20} color="#334155" />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => void handleDownload(txQuery.data ?? [])}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
          >
            <Ionicons name="download-outline" size={20} color="#334155" />
          </Pressable>
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, isAdmin, txQuery.data]);

  const isLoading = summaryQuery.isLoading || posQuery.isLoading || trendQuery.isLoading;
  const isError = summaryQuery.isError || posQuery.isError || trendQuery.isError;
  const isRefreshing = summaryQuery.isRefetching || posQuery.isRefetching || trendQuery.isRefetching || txQuery.isRefetching;

  function handleRetry(): void {
    void summaryQuery.refetch();
    void posQuery.refetch();
    void trendQuery.refetch();
    void txQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRetry} />}
      >
        <BudgetScopeToggle scope={scope} onChange={setScope} />

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data anggaran.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {!isLoading && !isError && summaryQuery.data ? (
          <>
            <BudgetHeroCard summary={summaryQuery.data} />

            <View className="flex-row gap-sm">
              <View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
                <Text className="text-headline-md font-semibold text-text-primary">{summaryQuery.data.txCount}</Text>
                <Text className="text-caption text-text-muted">Transaksi tercatat</Text>
              </View>
              <View className="flex-1 gap-xs rounded-lg border border-border bg-surface p-md">
                <Text className="text-headline-md font-semibold text-danger">{summaryQuery.data.overCount}</Text>
                <Text className="text-caption text-text-muted">Pos melebihi plafon</Text>
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Realisasi per Pos Anggaran</Text>
              <View className="gap-md rounded-lg border border-border bg-surface p-md">
                {(posQuery.data ?? []).map((pos) => (
                  <BudgetPosRow key={pos.name} item={pos} />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">
                Tren Pengeluaran {scope === "bulan" ? "Mingguan" : "Bulanan"}
              </Text>
              <View className="rounded-lg border border-border bg-surface p-md">
                <BudgetTrendChart points={trendQuery.data ?? []} />
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Pengeluaran Terbaru</Text>
              {txQuery.isError ? (
                <Text className="text-body-md text-danger">
                  {txQuery.error instanceof Error ? txQuery.error.message : "Gagal memuat daftar transaksi."}
                </Text>
              ) : txQuery.isLoading ? (
                <Text className="text-body-md text-text-muted">Memuat transaksi...</Text>
              ) : (
                <View className="gap-sm">
                  {(txQuery.data ?? []).map((tx) => (
                    <BudgetTransactionRow
                      key={tx.id}
                      item={tx}
                      canModerate={isAdmin}
                      isModerating={statusMutation.isPending && statusMutation.variables?.id === tx.id}
                      onApprove={() => handleModerate(tx.id, "Disetujui")}
                      onReject={() => handleModerate(tx.id, "Ditolak")}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View className="gap-sm border-t border-border bg-surface p-md">
        <Button label="+ Catat Pengeluaran" variant="primary" onPress={() => navigation.navigate("BudgetTransactionForm")} />
      </View>
    </SafeAreaView>
  );
}
