import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUpsertBudgetPlafon } from "@/hooks/useBudgeting";
import { formatRupiah } from "@/lib/formatRupiah";
import type { BudgetPosRealisasi, BudgetScope } from "@/types/budgeting";

type Props = {
  scope: BudgetScope;
  item: BudgetPosRealisasi;
};

// 1 row = 1 mutation independen (bukan submit semua pos sekaligus) — tiap pos
// disimpan terpisah lewat POST /budgeting/plafon (upsert per pos), jadi 1
// row gagal tidak menggagalkan pos lain. Screen tanpa referensi desain, izin
// eksplisit user (2026-08-24) — lihat BudgetPlafonScreen.tsx.
export function BudgetPlafonRow({ scope, item }: Props) {
  const [value, setValue] = useState(String(item.plafon));
  const mutation = useUpsertBudgetPlafon();

  // Sinkronkan input kalau `item.plafon` berubah dari luar (refetch setelah
  // ganti scope, atau setelah row lain di-invalidate) — tapi jangan timpa
  // sedang user mengetik nilai baru yang belum disimpan.
  useEffect(() => {
    if (!mutation.isPending) setValue(String(item.plafon));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.plafon]);

  const nominal = Number(value);
  const isValid = value.trim() !== "" && Number.isFinite(nominal) && nominal >= 0;

  function handleSave() {
    if (!isValid) return;
    mutation.mutate({ scope, pos: item.name, nominal });
  }

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="flex-row items-center justify-between">
        <Text className="text-body-md font-semibold text-text-primary">{item.name}</Text>
        <Text className="text-caption text-text-muted">Terpakai {formatRupiah(item.used)}</Text>
      </View>
      <View className="flex-row items-end gap-sm">
        <View className="flex-1">
          <Input
            label="Plafon (Rp)"
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            error={!isValid ? "Nominal tidak valid." : undefined}
          />
        </View>
        <Button label="Simpan" variant="secondary" loading={mutation.isPending} onPress={handleSave} />
      </View>
      {mutation.isError ? (
        <Text className="text-caption text-danger">
          {mutation.error instanceof Error ? mutation.error.message : "Gagal menyimpan plafon."}
        </Text>
      ) : mutation.isSuccess ? (
        <Text className="text-caption text-success">Plafon tersimpan.</Text>
      ) : null}
    </View>
  );
}
