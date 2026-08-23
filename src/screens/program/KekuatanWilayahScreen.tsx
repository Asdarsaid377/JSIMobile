import { useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { KekuatanEmptyState } from "@/components/kekuatan/KekuatanEmptyState";
import { KekuatanSummaryCards } from "@/components/kekuatan/KekuatanSummaryCards";
import type { KekuatanViewMode } from "@/components/kekuatan/KekuatanToggle";
import { KekuatanToggle } from "@/components/kekuatan/KekuatanToggle";
import { KekuatanWilayahCard } from "@/components/kekuatan/KekuatanWilayahCard";
import { KekuatanWilayahCardSkeleton } from "@/components/kekuatan/KekuatanWilayahCardSkeleton";
import { KekuatanZoneStackedBar } from "@/components/kekuatan/KekuatanZoneStackedBar";
import { useDtdoorAll } from "@/hooks/useDtdoorAll";
import { getDtdoorScore, getStrengthTier } from "@/lib/dtdoorScore";
import type { StrengthTier } from "@/lib/dtdoorScore";

type KelurahanStat = {
  desa: string;
  jumlahKunjungan: number;
  skorRata: number;
  tier: StrengthTier;
};

// Referensi context/designs/kekuatanwilayah.png. Skor & scoping wilayah:
// lihat lib/dtdoorScore.ts & progress-tracker.md Decisions untuk detail keputusan
// (skor dihitung client-side dari kategoriId, belum ada endpoint agregat asli).
// "List" toggle: BELUM ada mockup kedua untuk state ini — diasumsikan cuma
// menyembunyikan chart "Peta" (list "Detail per Kelurahan" di bawahnya sudah
// selalu ada terlepas dari toggle). Koreksi kalau asumsi ini salah.
// 2026-08-22 — grid kotak-kotak polos (1 kotak/kelurahan, KekuatanZoneCard)
// DIGANTI stacked bar (KekuatanZoneStackedBar) atas permintaan user "chart yang
// keren" — dikerjakan pakai dataviz skill (part-to-whole → stacked bar, bukan
// pie/donut), lihat komentar di KekuatanZoneStackedBar.tsx untuk detail validasi
// warna & kenapa gap+legend wajib ada. `KekuatanZoneCard.tsx` DIHAPUS (orphan).
export function KekuatanWilayahScreen() {
  const [mode, setMode] = useState<KekuatanViewMode>("peta");
  const dtdoorQuery = useDtdoorAll();

  // 2026-08-23: scoping wilayah SEMENTARA dimatikan — data kecamatan profil
  // sudah tidak ada di backend (lihat types/profile.ts). Semua role lihat
  // semua data untuk sekarang, sampai ada sumber data pengganti.
  const scopedRecords = dtdoorQuery.data ?? [];

  const kelurahanStats = useMemo<KelurahanStat[]>(() => {
    const groups = new Map<string, { count: number; scores: number[] }>();
    for (const record of scopedRecords) {
      if (!record.desa) continue;
      const existing = groups.get(record.desa) ?? { count: 0, scores: [] };
      existing.count += 1;
      const score = getDtdoorScore(record.kategoriId);
      if (score !== null) existing.scores.push(score);
      groups.set(record.desa, existing);
    }
    const result: KelurahanStat[] = [];
    for (const [desa, { count, scores }] of groups) {
      // Kelurahan tanpa satupun kunjungan berkategori tidak bisa dikasih tier —
      // dikecualikan, bukan ditampilkan dengan skor palsu.
      if (scores.length === 0) continue;
      const skorRata = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
      result.push({ desa, jumlahKunjungan: count, skorRata, tier: getStrengthTier(skorRata) });
    }
    return result.sort((a, b) => b.skorRata - a.skorRata);
  }, [scopedRecords]);

  const zoneCounts = useMemo(() => {
    const counts = { kuat: 0, sedang: 0, lemah: 0 };
    for (const stat of kelurahanStats) counts[stat.tier] += 1;
    return counts;
  }, [kelurahanStats]);

  const isLoading = dtdoorQuery.isLoading;
  const isError = dtdoorQuery.isError;

  function handleRetry(): void {
    void dtdoorQuery.refetch();
  }

  return (
    // edges={[]} eksplisit — screen ini di-push di dalam tab "Program", yang tab
    // bar-nya sendiri sudah mengurus ruang aman bawah. Lihat DptListScreen.tsx
    // untuk penjelasan lengkap kenapa ini harus eksplisit array kosong, bukan
    // dihilangkan (SafeAreaView default ke semua edge kalau prop tidak diisi).
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={kelurahanStats}
        keyExtractor={(item) => item.desa}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">Berdasarkan hasil kunjungan Door To Door per kelurahan</Text>
            <KekuatanToggle mode={mode} onChange={setMode} />
            {mode === "peta" ? (
              <KekuatanZoneStackedBar kuat={zoneCounts.kuat} sedang={zoneCounts.sedang} lemah={zoneCounts.lemah} />
            ) : null}
            <KekuatanSummaryCards kuat={zoneCounts.kuat} sedang={zoneCounts.sedang} lemah={zoneCounts.lemah} />
            <Text className="text-body-lg font-semibold text-text-primary">Detail per Kelurahan</Text>
            {isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat data kekuatan wilayah.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
              </View>
            ) : null}
            {isLoading ? (
              <View className="gap-xs">
                <KekuatanWilayahCardSkeleton />
                <KekuatanWilayahCardSkeleton />
                <KekuatanWilayahCardSkeleton />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <KekuatanWilayahCard
            namaKelurahan={item.desa}
            jumlahKunjungan={item.jumlahKunjungan}
            skorRata={item.skorRata}
            tier={item.tier}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={!isLoading && !isError ? <KekuatanEmptyState /> : null}
        refreshControl={<RefreshControl refreshing={dtdoorQuery.isRefetching} onRefresh={handleRetry} />}
      />
    </SafeAreaView>
  );
}
