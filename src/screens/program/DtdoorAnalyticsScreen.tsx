import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { DptSummaryCards } from "@/components/dpt/DptSummaryCards";
import { DtdoorCategoryRow } from "@/components/dtdoor/DtdoorCategoryRow";
import { DtdoorMagnitudeRow } from "@/components/dtdoor/DtdoorMagnitudeRow";
import { KekuatanEmptyState } from "@/components/kekuatan/KekuatanEmptyState";
import { KekuatanWilayahCardSkeleton } from "@/components/kekuatan/KekuatanWilayahCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useDtdoorAll } from "@/hooks/useDtdoorAll";
import { useProfile } from "@/hooks/useProfile";
import { getDtdoorScore, getStrengthTier } from "@/lib/dtdoorScore";
import type { Role } from "@/types/auth";
import { JENIS_KELAMIN_OPTIONS, KATEGORI_DTDOOR_OPTIONS } from "@/types/dtdoor";

const ADMIN_ROLES: readonly Role[] = ["admin", "adminsekret"];
const PROGRAM_BANTUAN_TOP_LIMIT = 5;

// "Ringkasan Data" — analisa deskriptif dari seluruh kunjungan Door To Door yang
// sudah tercatat (permintaan user, di luar build-plan awal, contoh yang diminta
// "pilihan pileg ada berapa orang"). PENTING: Dtdoor TIDAK PUNYA field "pilihan
// pileg"/preferensi kandidat sama sekali — proxy paling dekat yang benar-benar
// ada di data adalah `kategoriId` (klasifikasi dukungan internal: Simpatisan/
// Relawan/Saksi/dst., lib/dtdoorScore.ts), BUKAN pilihan per-kandidat/partai.
// Tidak ada referensi desain (izin build dari ui-rules.md/ui-tokens.md). Murni
// derive client-side dari `useDtdoorAll()` yang sama dengan KekuatanWilayahScreen
// (termasuk pola scoping wilayah yang sama), tidak ada data/service baru.
export function DtdoorAnalyticsScreen() {
  const { session } = useAuth();
  const isAdmin = session ? ADMIN_ROLES.includes(session.user.roles) : false;
  const profileQuery = useProfile();
  const dtdoorQuery = useDtdoorAll();

  // 2026-08-23: scoping wilayah SEMENTARA dimatikan — data kecamatan profil
  // sudah tidak ada di backend (lihat types/profile.ts). Semua role lihat
  // semua data untuk sekarang, sampai ada sumber data pengganti.
  const scopedRecords = dtdoorQuery.data ?? [];

  const totalKunjungan = scopedRecords.length;
  const totalWajibPilih = useMemo(
    () => scopedRecords.reduce((sum, record) => sum + record.jumlahWajibPilih, 0),
    [scopedRecords],
  );
  const totalKelurahan = useMemo(
    () => new Set(scopedRecords.map((record) => record.desa).filter((desa): desa is string => Boolean(desa))).size,
    [scopedRecords],
  );

  // Persentase dihitung dari kunjungan yang SUDAH berkategori (bukan total
  // kunjungan) — pola sama dengan KekuatanPemilihScreen. Sisa yang belum
  // berkategori dicatat terpisah sebagai catatan transparansi, bukan diam-diam
  // dihilangkan dari hitungan.
  const kategoriBreakdown = useMemo(() => {
    const categorized = scopedRecords.filter((record) => record.kategoriId !== null);
    const total = categorized.length;
    const rows = KATEGORI_DTDOOR_OPTIONS.map((option) => {
      const count = categorized.filter((record) => record.kategoriId === option.id).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      const score = getDtdoorScore(option.id);
      const tier = score !== null ? getStrengthTier(score) : ("lemah" as const);
      return { id: option.id, label: option.label, count, percent, tier };
    }).sort((a, b) => b.count - a.count);
    return { rows, belumDikategorikan: totalKunjungan - total };
  }, [scopedRecords, totalKunjungan]);

  const genderBreakdown = useMemo(() => {
    const withGender = scopedRecords.filter((record) => record.jenisKelamin !== null);
    const total = withGender.length;
    return JENIS_KELAMIN_OPTIONS.map((option) => {
      const count = withGender.filter((record) => record.jenisKelamin === option.value).length;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { value: option.value, label: option.label, count, percent };
    });
  }, [scopedRecords]);

  const programBantuanRanking = useMemo(() => {
    const tally = new Map<string, number>();
    for (const record of scopedRecords) {
      for (const program of [record.programBantuan1, record.programBantuan2, record.programBantuan3]) {
        if (!program) continue;
        tally.set(program, (tally.get(program) ?? 0) + 1);
      }
    }
    return Array.from(tally.entries())
      .map(([label, count]) => ({
        label,
        count,
        percent: totalKunjungan > 0 ? Math.round((count / totalKunjungan) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, PROGRAM_BANTUAN_TOP_LIMIT);
  }, [scopedRecords, totalKunjungan]);

  const isLoading = dtdoorQuery.isLoading || (!isAdmin && profileQuery.isLoading);
  const isError = dtdoorQuery.isError || (!isAdmin && profileQuery.isError);

  function handleRetry(): void {
    void dtdoorQuery.refetch();
    if (!isAdmin) void profileQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={dtdoorQuery.isRefetching} onRefresh={handleRetry} />}
      >
        <Text className="text-caption text-text-muted">Analisa dari seluruh kunjungan Door To Door yang tercatat</Text>

        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data.</Text>
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

        {!isLoading && !isError && totalKunjungan === 0 ? <KekuatanEmptyState /> : null}

        {!isLoading && !isError && totalKunjungan > 0 ? (
          <>
            <DptSummaryCards
              items={[
                { key: "kunjungan", value: totalKunjungan, label: "Total Kunjungan" },
                { key: "wajibpilih", value: totalWajibPilih, label: "Wajib Pilih Tercakup" },
                { key: "kelurahan", value: totalKelurahan, label: "Kelurahan Tercakup" },
              ]}
            />

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Distribusi Kategori</Text>
              <View className="gap-sm rounded-lg border border-border bg-surface p-md">
                {kategoriBreakdown.rows.map((row) => (
                  <DtdoorCategoryRow key={row.id} label={row.label} count={row.count} percent={row.percent} tier={row.tier} />
                ))}
              </View>
              {kategoriBreakdown.belumDikategorikan > 0 ? (
                <Text className="text-caption text-text-muted">
                  + {kategoriBreakdown.belumDikategorikan} kunjungan belum dikategorikan
                </Text>
              ) : null}
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Distribusi Gender</Text>
              <View className="gap-sm rounded-lg border border-border bg-surface p-md">
                {genderBreakdown.map((row) => (
                  <DtdoorMagnitudeRow key={row.value} label={row.label} count={row.count} percent={row.percent} />
                ))}
              </View>
            </View>

            {programBantuanRanking.length > 0 ? (
              <View className="gap-sm">
                <Text className="text-body-lg font-semibold text-text-primary">Program Bantuan Terpopuler</Text>
                <View className="gap-sm rounded-lg border border-border bg-surface p-md">
                  {programBantuanRanking.map((row) => (
                    <DtdoorMagnitudeRow key={row.label} label={row.label} count={row.count} percent={row.percent} />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
