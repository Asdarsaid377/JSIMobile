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
import { useDtdoorAnalytics } from "@/hooks/useDtdoorAnalytics";
import { useProfile } from "@/hooks/useProfile";
import { getDtdoorScore, getStrengthTier } from "@/lib/dtdoorScore";
import { ADMIN_ROLES } from "@/lib/permissions";
import { JENIS_KELAMIN_OPTIONS } from "@/types/dtdoor";

const PROGRAM_BANTUAN_TOP_LIMIT = 5;

// "Ringkasan Data" — analisa deskriptif dari seluruh kunjungan Door To Door yang
// sudah tercatat (permintaan user, di luar build-plan awal, contoh yang diminta
// "pilihan pileg ada berapa orang"). PENTING: Dtdoor TIDAK PUNYA field "pilihan
// pileg"/preferensi kandidat sama sekali — proxy paling dekat yang benar-benar
// ada di data adalah kategori/tipePemilih (klasifikasi dukungan internal:
// Simpatisan/Relawan/Saksi/dst., lib/dtdoorScore.ts), BUKAN pilihan per-kandidat/
// partai. Tidak ada referensi desain (izin build dari ui-rules.md/ui-tokens.md).
// 2026-08-25 — sumber data ganti dari useDtdoorAll() (SELALU throw di real mode,
// agregasi client-side) ke useDtdoorAnalytics() (gabungan 4 endpoint backend: 3
// SUDAH ADA sebelumnya di-reuse + 1 baru dibuat user untuk breakdown gender —
// lihat api-standards.md § Ringkasan Data). Reuse endpoint rekap-group yang sudah
// ada TERNYATA sekaligus MEMPERBAIKI bug lama: "Program Bantuan Terpopuler" dulu
// baca kolom `programBantuan1/2/3` yang sudah tidak diisi sejak skema 2024
// (selalu kosong/salah) — sekarang dari relasi kunjungan.programBantuanId yang
// benar. Scoping wilayah masih SEMENTARA dimatikan (lihat catatan lama di
// KekuatanWilayahScreen) — endpoint agregat ini juga belum difilter wilayah.
export function DtdoorAnalyticsScreen() {
  const { session } = useAuth();
  const isAdmin = session ? ADMIN_ROLES.includes(session.user.roles) : false;
  const profileQuery = useProfile();
  const analyticsQuery = useDtdoorAnalytics();

  const totalKunjungan = analyticsQuery.data?.totalKunjungan ?? 0;
  const totalWajibPilih = analyticsQuery.data?.totalWajibPilih ?? 0;
  const totalKelurahan = analyticsQuery.data?.totalKelurahan ?? 0;

  // Backend (rekap-group/tipePemilihId) zero-filled untuk SEMUA kategori & setiap
  // kunjungan WAJIB py tipePemilihId — jadi "belum dikategorikan" akan selalu 0
  // dengan sumber data ini (beda dari skema lama yang punya kategoriId nullable).
  // Field tetap dipertahankan (bukan dihapus) supaya JSX-nya tidak berubah &
  // tetap benar kalau nanti ada sumber data lama bercampur.
  const kategoriBreakdown = useMemo(() => {
    const rows = (analyticsQuery.data?.kategori ?? [])
      .map((item) => {
        const percent = totalKunjungan > 0 ? Math.round((item.jumlah / totalKunjungan) * 100) : 0;
        const score = getDtdoorScore(item.id);
        const tier = score !== null ? getStrengthTier(score) : ("lemah" as const);
        return { id: item.id, label: item.label, count: item.jumlah, percent, tier };
      })
      .sort((a, b) => b.count - a.count);
    const totalKategori = rows.reduce((sum, row) => sum + row.count, 0);
    return { rows, belumDikategorikan: totalKunjungan - totalKategori };
  }, [analyticsQuery.data, totalKunjungan]);

  const genderBreakdown = useMemo(() => {
    const rows = analyticsQuery.data?.jenisKelamin ?? [];
    const total = rows.reduce((sum, row) => sum + row.jumlah, 0);
    return JENIS_KELAMIN_OPTIONS.map((option) => {
      const count = rows.find((row) => row.value === option.value)?.jumlah ?? 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return { value: option.value, label: option.label, count, percent };
    });
  }, [analyticsQuery.data]);

  // Filter jumlah=0 dulu (backend zero-fill semua opsi program bantuan) supaya
  // "top 5" tidak ikut menampilkan program yang belum pernah dipakai — pola sama
  // seperti perilaku lama (Map cuma diisi program yang benar-benar terjadi).
  const programBantuanRanking = useMemo(() => {
    return (analyticsQuery.data?.programBantuan ?? [])
      .filter((item) => item.jumlah > 0)
      .map((item) => ({
        label: item.label,
        count: item.jumlah,
        percent: totalKunjungan > 0 ? Math.round((item.jumlah / totalKunjungan) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, PROGRAM_BANTUAN_TOP_LIMIT);
  }, [analyticsQuery.data, totalKunjungan]);

  const isLoading = analyticsQuery.isLoading || (!isAdmin && profileQuery.isLoading);
  const isError = analyticsQuery.isError || (!isAdmin && profileQuery.isError);

  function handleRetry(): void {
    void analyticsQuery.refetch();
    if (!isAdmin) void profileQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={analyticsQuery.isRefetching} onRefresh={handleRetry} />}
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
