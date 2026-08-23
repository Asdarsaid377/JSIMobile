import { FlatList, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { DptRegionCard } from "@/components/dpt/DptRegionCard";
import { DptRegionCardSkeleton } from "@/components/dpt/DptRegionCardSkeleton";
import { TargetSuaraCompletionRow } from "@/components/targetsuara/TargetSuaraCompletionRow";
import { Button } from "@/components/ui/Button";
import { TARGET_SUARA_LEVEL_LABEL, useTargetSuaraReport } from "@/hooks/useTargetSuaraReport";
import type { TargetSuaraReportEntry } from "@/hooks/useTargetSuaraReport";
import type { DptStackParamList } from "@/navigation/DptStack";

// Laporan/analitik lintas-wilayah untuk Target Suara — diminta user SETELAH
// drill-down 4-level dikonfirmasi bekerja di device. Tidak ada referensi desain
// (izin build dari ui-rules.md/ui-tokens.md, pola sama Kekuatan Pemilih). Scope
// laporan = 1 kabupaten (sama kabupaten yang lagi dibuka user, route params dari
// TargetSuaraKabupatenScreen — BUKAN hardcode), scan semua Kecamatan→Kelurahan
// (fetch paralel) + TPS (diturunkan dari record DPT). SENGAJA TIDAK ada 1 angka
// "grand total suara" — kab/kec/kel/tps diisi independen (bukan hierarkis
// auto-sum), menjumlahkan lintas-level akan double-count. Ditampilkan sebagai
// completion rate per level + daftar entry individual (tap → drill ke screen
// input aslinya). Lihat progress-tracker.md Decisions.
export function TargetSuaraReportScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "TargetSuaraReport">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kabWilId, kabNama, kabTotalDpt } = route.params;

  const reportQuery = useTargetSuaraReport(kabWilId, kabNama, kabTotalDpt);

  function handlePressEntry(entry: TargetSuaraReportEntry): void {
    switch (entry.level) {
      case "kab":
        navigation.navigate("TargetSuaraKabupaten", { kabWilId, kabNama: entry.nama, kabTotalDpt: entry.totalDpt });
        return;
      case "kec":
        navigation.navigate("TargetSuaraKecamatan", {
          kecWilId: entry.kecWilId,
          kecNama: entry.nama,
          kecTotalDpt: entry.totalDpt,
          kabWilId,
        });
        return;
      case "kel":
        navigation.navigate("TargetSuaraKelurahan", {
          kelWilId: entry.kelWilId,
          kelNama: entry.nama,
          kelTotalDpt: entry.totalDpt,
          kabWilId,
        });
        return;
      case "tps":
        navigation.navigate("TargetSuaraTps", {
          kelWilId: entry.kelWilId,
          noTps: entry.noTps,
          namaTps: entry.namaTps,
          totalPemilihTps: entry.totalDpt,
        });
    }
  }

  const completion = reportQuery.data?.completion;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        data={reportQuery.data?.entries ?? []}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="gap-sm pb-sm">
            <Text className="text-caption text-text-muted">
              Kabupaten {kabNama} · data demo, belum sinkron antar anggota tim
            </Text>

            {reportQuery.isError ? (
              <View className="gap-xs">
                <Text className="text-body-md text-danger">Gagal memuat laporan target suara.</Text>
                <Button label="Coba Lagi" variant="secondary" onPress={() => void reportQuery.refetch()} />
              </View>
            ) : null}

            {reportQuery.isLoading ? (
              <View className="gap-xs">
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
                <DptRegionCardSkeleton />
              </View>
            ) : null}

            {completion ? (
              <View className="gap-sm rounded-lg border border-border bg-surface p-md">
                <Text className="text-body-lg font-semibold text-text-primary">Target Terisi per Level</Text>
                <TargetSuaraCompletionRow label="Kabupaten" filled={completion.kab.filled} total={completion.kab.total} />
                <TargetSuaraCompletionRow label="Kecamatan" filled={completion.kec.filled} total={completion.kec.total} />
                <TargetSuaraCompletionRow label="Kelurahan/Desa" filled={completion.kel.filled} total={completion.kel.total} />
                <TargetSuaraCompletionRow label="TPS" filled={completion.tps.filled} total={completion.tps.total} />
              </View>
            ) : null}

            {completion ? <Text className="text-body-lg font-semibold text-text-primary">Daftar Target Terisi</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <DptRegionCard
            nama={item.nama}
            sublabel={`${TARGET_SUARA_LEVEL_LABEL[item.level]} · ${item.totalDpt.toLocaleString("id-ID")} DPT · Target ${item.target.toLocaleString("id-ID")} (${item.percent}%)`}
            onPress={() => handlePressEntry(item)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-xs" />}
        ListEmptyComponent={
          !reportQuery.isLoading && !reportQuery.isError ? (
            <Text className="text-center text-body-md text-text-muted">
              Belum ada target suara yang diisi di kabupaten ini.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
