import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { DptSummaryCards } from "@/components/dpt/DptSummaryCards";
import { Button } from "@/components/ui/Button";
import { KekuatanDistribusiRow } from "@/components/kekuatan/KekuatanDistribusiRow";
import { KekuatanEmptyState } from "@/components/kekuatan/KekuatanEmptyState";
import { KekuatanPemilihCard } from "@/components/kekuatan/KekuatanPemilihCard";
import { KekuatanRankingRow } from "@/components/kekuatan/KekuatanRankingRow";
import { KekuatanWilayahCardSkeleton } from "@/components/kekuatan/KekuatanWilayahCardSkeleton";
import { KekuatanWilayahSelector } from "@/components/kekuatan/KekuatanWilayahSelector";
import { useDtdoorAll } from "@/hooks/useDtdoorAll";
import { getDtdoorScore, getStrengthTier } from "@/lib/dtdoorScore";
import type { Dtdoor } from "@/types/dtdoor";

// "Daftar pemilih skor tertinggi" (build-plan.md) dibatasi top 10 — bukan full
// 245 pemilih, konsisten dengan makna widget "ranking" (bukan list utama
// screen ini, beda dari DptListScreen/KekuatanWilayahScreen yang FlatList-nya
// memang daftar utama). Keputusan mandiri (bukan pertanyaan ke user), sama
// kategori dengan preseden "45%"→hitungan sederhana di Feature 04/05.
const TOP_PEMILIH_LIMIT = 10;

// Referensi context/designs/kekuatanpemilih.png ("Skoring Kekuatan Pemilih").
// Skor per-pemilih (bukan agregat per-kelurahan seperti KekuatanWilayahScreen) —
// reuse penuh model skor & threshold dari lib/dtdoorScore.ts. Entry point:
// tombol baru di ProgramPemenanganScreen tab Door To Door (dikonfirmasi user).
// Filter wilayah eksplisit ("Wilayah: Kec. X") — awalnya admin bebas pilih,
// role lain terkunci ke kecamatan sendiri (disabled). **2026-08-23: scoping
// role lain SEMENTARA dimatikan** (data kecamatan profil sudah tidak ada di
// backend, lihat types/profile.ts) — semua role sekarang bebas pilih
// kecamatan manapun, sama seperti admin dulu, sampai ada sumber data pengganti.
export function KekuatanPemilihScreen() {
  const dtdoorQuery = useDtdoorAll();
  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null);

  const allRecords = dtdoorQuery.data ?? [];

  const kecamatanOptions = useMemo(() => {
    const set = new Set<string>();
    for (const record of allRecords) {
      if (record.kecamatan) set.add(record.kecamatan);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allRecords]);

  const scopedRecords = useMemo(() => {
    if (!selectedKecamatan) return allRecords;
    return allRecords.filter((record) => record.kecamatan === selectedKecamatan);
  }, [allRecords, selectedKecamatan]);

  // Record tanpa kategori dikecualikan dari skoring (bukan skor 0) — pola sama
  // persis dengan KekuatanWilayahScreen.
  const scoredRecords = useMemo(() => {
    const result: { record: Dtdoor; score: number }[] = [];
    for (const record of scopedRecords) {
      const score = getDtdoorScore(record.kategoriId);
      if (score !== null) result.push({ record, score });
    }
    return result;
  }, [scopedRecords]);

  const skorRata = scoredRecords.length
    ? Math.round(scoredRecords.reduce((sum, entry) => sum + entry.score, 0) / scoredRecords.length)
    : 0;

  const distribution = useMemo(() => {
    const counts = { kuat: 0, sedang: 0, lemah: 0 };
    for (const entry of scoredRecords) counts[getStrengthTier(entry.score)] += 1;
    return counts;
  }, [scoredRecords]);

  const kelurahanRanking = useMemo(() => {
    const groups = new Map<string, number[]>();
    for (const entry of scoredRecords) {
      if (!entry.record.desa) continue;
      const scores = groups.get(entry.record.desa) ?? [];
      scores.push(entry.score);
      groups.set(entry.record.desa, scores);
    }
    return Array.from(groups.entries())
      .map(([desa, scores]) => {
        const skorRataKelurahan = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
        return { desa, skorRata: skorRataKelurahan, tier: getStrengthTier(skorRataKelurahan) };
      })
      .sort((a, b) => b.skorRata - a.skorRata);
  }, [scoredRecords]);

  const topPemilih = useMemo(
    () =>
      [...scoredRecords]
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_PEMILIH_LIMIT)
        .map((entry) => ({ ...entry, tier: getStrengthTier(entry.score) })),
    [scoredRecords],
  );

  const isLoading = dtdoorQuery.isLoading;
  const isError = dtdoorQuery.isError;

  function handleRetry(): void {
    void dtdoorQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} className="flex-1">
        <Text className="text-caption text-text-muted">Dihitung dari hasil kunjungan Door To Door</Text>

        <KekuatanWilayahSelector value={selectedKecamatan} onChange={setSelectedKecamatan} options={kecamatanOptions} />

        {isError ? (
          <View className="gap-sm">
            <Text className="text-body-md text-danger">Gagal memuat data kekuatan pemilih.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={handleRetry} />
          </View>
        ) : null}

        {isLoading ? (
          <View className="gap-sm">
            <KekuatanWilayahCardSkeleton />
            <KekuatanWilayahCardSkeleton />
            <KekuatanWilayahCardSkeleton />
          </View>
        ) : null}

        {!isLoading && !isError && scoredRecords.length === 0 ? <KekuatanEmptyState /> : null}

        {!isLoading && !isError && scoredRecords.length > 0 ? (
          <>
            <DptSummaryCards
              items={[
                { key: "skor", value: skorRata, label: "Skor Rata-rata" },
                { key: "total", value: scopedRecords.length, label: "Total Dikunjungi" },
              ]}
            />

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Distribusi Kekuatan Dukungan</Text>
              <View className="gap-sm rounded-lg border border-border bg-surface p-md">
                <KekuatanDistribusiRow
                  tier="kuat"
                  count={distribution.kuat}
                  percent={(distribution.kuat / scoredRecords.length) * 100}
                />
                <KekuatanDistribusiRow
                  tier="sedang"
                  count={distribution.sedang}
                  percent={(distribution.sedang / scoredRecords.length) * 100}
                />
                <KekuatanDistribusiRow
                  tier="lemah"
                  count={distribution.lemah}
                  percent={(distribution.lemah / scoredRecords.length) * 100}
                />
              </View>
            </View>

            {kelurahanRanking.length > 0 ? (
              <View className="gap-sm">
                <Text className="text-body-lg font-semibold text-text-primary">Ranking Kelurahan</Text>
                <View className="gap-xs">
                  {kelurahanRanking.map((item) => (
                    <KekuatanRankingRow
                      key={item.desa}
                      namaKelurahan={item.desa}
                      skorRata={item.skorRata}
                      tier={item.tier}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Pemilih Skor Tertinggi</Text>
              <View className="gap-xs">
                {topPemilih.map((entry) => (
                  <KekuatanPemilihCard key={entry.record.id} item={entry.record} score={entry.score} tier={entry.tier} />
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
