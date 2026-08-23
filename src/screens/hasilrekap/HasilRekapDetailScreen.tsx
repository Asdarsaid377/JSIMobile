import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";

import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { HasilRekapCalegDetailSheet } from "@/components/hasilrekap/HasilRekapCalegDetailSheet";
import { HasilRekapCalegRow } from "@/components/hasilrekap/HasilRekapCalegRow";
import { HasilRekapPartaiSummaryCard } from "@/components/hasilrekap/HasilRekapPartaiSummaryCard";
import { HasilRekapTpsRow } from "@/components/hasilrekap/HasilRekapTpsRow";
import { Button } from "@/components/ui/Button";
import { useHasilRekapDetailSnapshot } from "@/hooks/useHasilRekap";
import type { RekapStackParamList } from "@/navigation/RekapStack";
import type { HasilRekapCaleg } from "@/types/hasilrekap";

// Level 5 (TERMINAL) dari 5 — lihat HasilRekapDapilScreen.tsx untuk konteks
// penuh alur. Referensi web `DprRiKelurahan.jsx` (route
// `.../:kecamatanId/:kelurahanId`) — halaman aslinya pivot caleg × TPS yang
// sangat padat + doughnut chart suara partai/caleg/total. Di mobile
// disederhanakan jadi: `HasilRekapPartaiSummaryCard` (rekap partai ter-scope
// ke Kelurahan ini) + "Daftar Caleg" (ranking flat top-5, `daerahUnggul`
// tiap caleg di sini merujuk ke salah satu TPS "TPS 0X" — bukan pivot caleg
// × TPS penuh) + "Suara per TPS" (list, TPS ditampilkan inline persis web —
// tidak ada route/level drill setelah ini untuk DPR RI).
export function HasilRekapDetailScreen() {
  const route = useRoute<RouteProp<RekapStackParamList, "HasilRekapDetail">>();
  const { kelurahanNama, dapilId, kabupatenId, kecamatanId, kelurahanId } = route.params;

  const snapshotQuery = useHasilRekapDetailSnapshot(dapilId, kabupatenId, kecamatanId, kelurahanId);
  const [sheetCaleg, setSheetCaleg] = useState<HasilRekapCaleg | null>(null);

  const isLoading = snapshotQuery.isLoading;
  const isError = snapshotQuery.isError;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={snapshotQuery.isRefetching} onRefresh={() => void snapshotQuery.refetch()} />
        }
      >
        {isError ? (
          <View className="gap-xs">
            <Text className="text-body-md text-danger">Gagal memuat data Kelurahan.</Text>
            <Button label="Coba Lagi" variant="secondary" onPress={() => void snapshotQuery.refetch()} />
          </View>
        ) : null}

        {isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {snapshotQuery.data ? (
          <>
            <HasilRekapPartaiSummaryCard
              nama={kelurahanNama}
              totalSuaraSah={snapshotQuery.data.totalSuaraSah}
              partaiSuara={snapshotQuery.data.partaiSuara}
            />

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Daftar Caleg</Text>
              <View className="gap-sm">
                {snapshotQuery.data.calegList.map((item, index) => (
                  <HasilRekapCalegRow
                    key={`${item.nama}-${index}`}
                    rank={index + 1}
                    nama={item.nama}
                    partai={item.partai}
                    suara={item.suara}
                    daerahUnggul={item.daerahUnggul}
                    onPress={() => setSheetCaleg(item)}
                  />
                ))}
              </View>
            </View>

            <View className="gap-sm">
              <Text className="text-body-lg font-semibold text-text-primary">Suara per TPS</Text>
              <View className="gap-sm">
                {snapshotQuery.data.tps.map((item) => (
                  <HasilRekapTpsRow key={item.noTps} noTps={item.noTps} totalSuara={item.totalSuara} />
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
      <HasilRekapCalegDetailSheet item={sheetCaleg} levelLabel="TPS" onClose={() => setSheetCaleg(null)} />
    </SafeAreaView>
  );
}
