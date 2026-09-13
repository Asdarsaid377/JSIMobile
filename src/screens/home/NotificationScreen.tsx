import { useCallback } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAntiFraudSnapshot } from "@/hooks/useAntiFraud";
import { useAuth } from "@/hooks/useAuth";
import { useBudgetTransactions } from "@/hooks/useBudgeting";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useMarkNotificationsSeen } from "@/hooks/useNotificationCenter";
import { usePengumumanList } from "@/hooks/usePengumuman";
import { isAdmin } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";

// Notification Center (2026-08-26) — TIDAK ADA referensi desain (izin
// eksplisit user, Aturan #1 CLAUDE.md — home-dashboard.png cuma tunjukkan
// icon lonceng+badge, tidak ada mockup isi layarnya). TIDAK ADA backend
// notifikasi sama sekali (dicek dulu ke /Users/asdarsaid/JSI/api, nihil) —
// murni agregasi CLIENT-SIDE dari 3 sumber yang SUDAH ada datanya:
// Pengumuman (semua role), Anti-Fraud "perlu ditinjau" (semua role, akses
// AntiFraudScreen memang tidak digate role), Budgeting "Menunggu" persetujuan
// (admin/adminsekret-only — cuma mereka yang bisa approve/reject). Ketiganya
// section terpisah (BUKAN 1 feed gabungan diurut waktu) karena `FraudCase.waktu`
// backend berupa string format bebas ("20 Agu, 14:12"), bukan ISO timestamp
// yang bisa dibandingkan reliable dengan `createdAt` Pengumuman/Budgeting —
// memaksakan 1 urutan gabungan cuma akan menghasilkan urutan yang salah/acak.
// Tap baris apapun cuma navigasi ke screen sumbernya (list), TIDAK deep-link
// ke item spesifik (Pengumuman/Anti-Fraud detail sheet-nya state lokal di
// screen masing-masing, bukan route param).
export function NotificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const canSeeBudgeting = session ? isAdmin(session.user.roles) : false;

  useHideTabBar();

  const pengumumanQuery = usePengumumanList();
  const fraudQuery = useAntiFraudSnapshot();
  const txQuery = useBudgetTransactions();
  const markSeenMutation = useMarkNotificationsSeen();

  // Tandai "sudah dibaca" begitu screen ini fokus — bukan nunggu scroll/tap
  // per item (tidak ada status baca per-item, lihat notificationReadState.ts).
  useFocusEffect(
    useCallback(() => {
      markSeenMutation.mutate();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const pengumumanList = pengumumanQuery.data ?? [];
  const fraudCases = fraudQuery.data?.cases ?? [];
  const pendingTx = (txQuery.data ?? []).filter((tx) => tx.status === "Menunggu");

  const isRefreshing = pengumumanQuery.isRefetching || fraudQuery.isRefetching || (canSeeBudgeting && txQuery.isRefetching);

  function handleRefresh(): void {
    void pengumumanQuery.refetch();
    void fraudQuery.refetch();
    if (canSeeBudgeting) void txQuery.refetch();
  }

  const isEmpty =
    !pengumumanQuery.isLoading &&
    !fraudQuery.isLoading &&
    pengumumanList.length === 0 &&
    fraudCases.length === 0 &&
    (!canSeeBudgeting || pendingTx.length === 0);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {isEmpty ? (
          <View className="items-center gap-md px-margin-mobile py-xl">
            <Ionicons name="notifications-off-outline" size={40} color="#94a3b8" />
            <Text className="text-center text-body-md text-text-muted">Tidak ada notifikasi saat ini.</Text>
          </View>
        ) : null}

        <View className="gap-sm">
          <Text className="text-body-lg font-semibold text-text-primary">Pengumuman</Text>
          {pengumumanQuery.isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}
          {pengumumanQuery.isError ? <Text className="text-body-md text-danger">Gagal memuat pengumuman.</Text> : null}
          {!pengumumanQuery.isLoading && !pengumumanQuery.isError && pengumumanList.length === 0 ? (
            <Text className="text-body-md text-text-muted">Belum ada pengumuman.</Text>
          ) : null}
          {pengumumanList.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate("Pengumuman")}
              className="flex-row items-start gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
                <Ionicons name="megaphone-outline" size={18} color="#3b82f6" />
              </View>
              <View className="flex-1 gap-xs">
                <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
                  {item.judul}
                </Text>
                <Text className="text-caption text-text-muted" numberOfLines={2}>
                  {item.isi}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View className="gap-sm">
          <Text className="text-body-lg font-semibold text-text-primary">Verifikasi Kunjungan (Anti-Fraud)</Text>
          {fraudQuery.isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}
          {fraudQuery.isError ? <Text className="text-body-md text-danger">Gagal memuat data anti-fraud.</Text> : null}
          {!fraudQuery.isLoading && !fraudQuery.isError && fraudCases.length === 0 ? (
            <Text className="text-body-md text-text-muted">Tidak ada kasus yang perlu ditinjau.</Text>
          ) : null}
          {fraudCases.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate("AntiFraud")}
              className="flex-row items-start gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
            >
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-danger-soft">
                <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
              </View>
              <View className="flex-1 gap-xs">
                <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
                  Kunjungan {item.relawan} terindikasi anomali ({item.level})
                </Text>
                <Text className="text-caption text-text-muted" numberOfLines={2}>
                  {item.alasan} · {item.waktu}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {canSeeBudgeting ? (
          <View className="gap-sm">
            <Text className="text-body-lg font-semibold text-text-primary">Persetujuan Anggaran</Text>
            {txQuery.isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}
            {txQuery.isError ? <Text className="text-body-md text-danger">Gagal memuat transaksi anggaran.</Text> : null}
            {!txQuery.isLoading && !txQuery.isError && pendingTx.length === 0 ? (
              <Text className="text-body-md text-text-muted">Tidak ada transaksi yang menunggu persetujuan.</Text>
            ) : null}
            {pendingTx.map((tx) => (
              <Pressable
                key={tx.id}
                onPress={() => navigation.navigate("BudgetingKampanye")}
                className="flex-row items-start gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
              >
                <View className="h-9 w-9 items-center justify-center rounded-lg bg-warning-soft">
                  <Ionicons name="cash-outline" size={18} color="#b45309" />
                </View>
                <View className="flex-1 gap-xs">
                  <Text className="text-body-md font-semibold text-text-primary" numberOfLines={1}>
                    {tx.title}
                  </Text>
                  <Text className="text-caption text-text-muted" numberOfLines={1}>
                    {tx.pos} · Rp {tx.nominal.toLocaleString("id-ID")} · oleh {tx.oleh}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
