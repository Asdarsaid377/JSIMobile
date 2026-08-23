import { useMemo } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { SwingVoterCard } from "@/components/dtdoor/SwingVoterCard";
import { KekuatanWilayahCardSkeleton } from "@/components/kekuatan/KekuatanWilayahCardSkeleton";
import { Button } from "@/components/ui/Button";
import { useDtdoorAll } from "@/hooks/useDtdoorAll";

// kategoriId 7 = "Belum Menentukan" (lib/dtdoorScore.ts) — SATU-SATUNYA kategori
// yang benar-benar "swing" (persuadable). Sengaja TIDAK termasuk "Pemilih
// Kompetitor" (kategoriId 6) — itu sudah condong ke lawan, follow-up ke situ ROI
// rendah, beda konteks dari "belum menentukan" yang genuinely masih bisa digiring.
const SWING_KATEGORI_ID = 7;

// "Prioritas Follow-up Pemilih Swing" — saran konsultan politik (2026-08-22, di
// luar build-plan awal, permintaan user). Tidak ada referensi desain (izin build
// dari ui-rules.md/ui-tokens.md). MURNI derive dari data Dtdoor yang sudah ada
// (tidak ada data/schema baru sama sekali, beda dari Rival Caleg/Target Suara) —
// reuse `useDtdoorAll()` yang sama dengan KekuatanWilayahScreen. Prioritas
// diurutkan by `createdAt` ASCENDING (paling lama belum di-follow-up duluan)
// — satu-satunya sinyal urgensi yang tersedia dari data yang ada, tanpa
// mengarang field baru. **2026-08-23: scoping wilayah (admin lihat semua,
// role lain cuma kecamatan sendiri) SEMENTARA dimatikan** — data kecamatan
// profil sudah tidak ada di backend (lihat types/profile.ts), semua role
// lihat semua data untuk sekarang.
export function SwingVoterFollowUpScreen() {
  const dtdoorQuery = useDtdoorAll();

  const swingVoters = useMemo(() => {
    const all = dtdoorQuery.data ?? [];
    return all
      .filter((record) => record.kategoriId === SWING_KATEGORI_ID)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [dtdoorQuery.data]);

  const isLoading = dtdoorQuery.isLoading;
  const isError = dtdoorQuery.isError;

  function handleRetry(): void {
    void dtdoorQuery.refetch();
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={swingVoters}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">
              Pemilih kategori "Belum Menentukan" dari hasil kunjungan Door To Door, diurutkan dari yang paling
              lama belum di-follow-up ulang
            </Text>
            {isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat data pemilih swing.</Text>
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
        renderItem={({ item }) => <SwingVoterCard item={item} />}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !isLoading && !isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Tidak ada pemilih "Belum Menentukan" di wilayah ini.
            </Text>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={dtdoorQuery.isRefetching} onRefresh={handleRetry} />}
      />
    </SafeAreaView>
  );
}
