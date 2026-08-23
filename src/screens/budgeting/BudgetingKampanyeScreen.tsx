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
import { useBudgetPos, useBudgetSummary, useBudgetTransactions, useBudgetTrend } from "@/hooks/useBudgeting";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { BudgetScope } from "@/types/budgeting";

function handleDownload(): void {
  Alert.alert("Segera hadir", "Ekspor laporan anggaran akan datang.");
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
// Ringkasan/realisasi-pos/tren adalah mock STATIS per scope (lihat
// services/budgeting.ts) — cuma daftar transaksi yang benar-benar bertambah
// saat submit form, sama pola disconnect dengan canvas sumbernya sendiri.
export function BudgetingKampanyeScreen() {
  const [scope, setScope] = useState<BudgetScope>("bulan");
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const summaryQuery = useBudgetSummary(scope);
  const posQuery = useBudgetPos(scope);
  const trendQuery = useBudgetTrend(scope);
  const txQuery = useBudgetTransactions();

  useHideTabBar();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleDownload}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface active:opacity-80"
        >
          <Ionicons name="download-outline" size={20} color="#334155" />
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const isLoading = summaryQuery.isLoading || posQuery.isLoading || trendQuery.isLoading || txQuery.isLoading;
  const isError = summaryQuery.isError || posQuery.isError || trendQuery.isError || txQuery.isError;

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
        refreshControl={<RefreshControl refreshing={txQuery.isRefetching} onRefresh={handleRetry} />}
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
              <View className="gap-sm">
                {(txQuery.data ?? []).map((tx) => (
                  <BudgetTransactionRow key={tx.id} item={tx} />
                ))}
              </View>
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
