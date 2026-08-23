import { ScrollView } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";

import { TargetSuaraHeaderCard } from "@/components/targetsuara/TargetSuaraHeaderCard";
import { Button } from "@/components/ui/Button";
import { useSetTargetSuara, useTargetSuaraMap } from "@/hooks/useTargetSuara";
import { buildTargetSuaraKey } from "@/lib/targetSuara";
import type { DptStackParamList } from "@/navigation/DptStack";

// Level 4 dari 4 (leaf, TIDAK ada drill-down lagi) — lihat
// TargetSuaraKabupatenScreen.tsx untuk konteks penuh. Tombol "Kelola Saksi TPS"
// ditambah 2026-08-22 (permintaan user, fitur baru di luar build-plan awal) —
// screen ini sudah TPS-scoped (kelWilId/noTps/namaTps di tangan), jadi hub
// natural buat Saksi TPS. Lihat SaksiTpsScreen.tsx.
// ⚠️ Tombol "Input Real Count C1" yang SEMPAT ada di sini SUDAH DIHAPUS
// (2026-08-22) — Real Count C1 dipisah jadi fitur tersendiri dengan alur
// drill-down wilayahnya sendiri (permintaan eksplisit user, "jangan ikut di
// dalam Target Suara"), lihat src/screens/realcount/RealCountKabupatenScreen.tsx
// & icon headerRight baru di DptListScreen.tsx.
export function TargetSuaraTpsScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "TargetSuaraTps">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kelWilId, noTps, namaTps, totalPemilihTps } = route.params;

  const targetMapQuery = useTargetSuaraMap();
  const setTargetMutation = useSetTargetSuara();

  const targetMap = targetMapQuery.data ?? {};
  const ownTarget = targetMap[buildTargetSuaraKey("tps", kelWilId, noTps)] ?? null;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <TargetSuaraHeaderCard
          nama={`TPS ${namaTps}`}
          totalDpt={totalPemilihTps}
          currentTarget={ownTarget}
          isSaving={setTargetMutation.isPending}
          onSave={(value) => setTargetMutation.mutate({ level: "tps", wilId: kelWilId, subId: noTps, value })}
        />
        <Button
          label="Kelola Saksi TPS"
          variant="secondary"
          onPress={() => navigation.navigate("SaksiTps", { kelWilId, noTps, namaTps })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
