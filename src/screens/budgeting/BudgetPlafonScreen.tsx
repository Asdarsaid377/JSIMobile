import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { BudgetPlafonRow } from "@/components/budgeting/BudgetPlafonRow";
import { BudgetScopeToggle } from "@/components/budgeting/BudgetScopeToggle";
import { Button } from "@/components/ui/Button";
import { useBudgetPos } from "@/hooks/useBudgeting";
import type { BudgetScope } from "@/types/budgeting";

// Set Plafon Anggaran (admin-only) — TIDAK ada di
// context/designs/budgeting-kampanye.dc.html (canvas asli cuma menampilkan
// realisasi, read-only), dibangun tanpa referensi visual atas izin eksplisit
// user (2026-08-24, lihat progress-tracker.md Decisions) — cuma pola form
// generik dari ui-rules.md/ui-tokens.md + primitive yang sudah ada
// (BudgetScopeToggle, Input, Button), bukan replikasi dari mockup manapun.
// Tidak pasang useHideTabBar() — screen ini di-push dari BudgetingKampanyeScreen
// yang sudah menyembunyikan tab bar & tetap mounted di bawahnya (pola sama
// BudgetTransactionFormScreen, lihat ui-registry.md § Budgeting).
export function BudgetPlafonScreen() {
  const [scope, setScope] = useState<BudgetScope>("bulan");
  const posQuery = useBudgetPos(scope);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} className="flex-1">
        <Text className="text-body-md text-text-muted">
          Atur batas anggaran (plafon) per pos untuk {scope === "bulan" ? "bulan berjalan" : "keseluruhan kampanye"}.
        </Text>

        <BudgetScopeToggle scope={scope} onChange={setScope} />

        {posQuery.isError ? (
          <Text className="text-body-md text-danger">Gagal memuat plafon saat ini.</Text>
        ) : null}
        {posQuery.isError ? (
          <Button label="Coba Lagi" variant="secondary" onPress={() => posQuery.refetch()} />
        ) : null}

        {posQuery.isLoading ? <Text className="text-body-md text-text-muted">Memuat...</Text> : null}

        {(posQuery.data ?? []).map((item) => (
          <BudgetPlafonRow key={item.name} scope={scope} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
