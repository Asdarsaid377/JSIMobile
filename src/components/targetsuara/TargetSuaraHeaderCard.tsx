import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  nama: string;
  totalDpt: number;
  currentTarget: number | null;
  onSave: (value: number) => void;
  isSaving: boolean;
};

// Kartu "wilayah saat ini" — dipakai di 4 screen Target Suara (Kab/Kec/Kel/TPS),
// satu-satunya bagian yang bentuknya identik persis di semua level (beda cuma
// data & aksi drill-down di bawahnya, yang di-render masing-masing screen
// sendiri karena tipe child-nya beda-beda). Tidak ada referensi desain — izin
// build dari ui-rules.md/ui-tokens.md (pola sama Kekuatan Pemilih/Aktivitas
// Terbaru), lihat progress-tracker.md Decisions.
export function TargetSuaraHeaderCard({ nama, totalDpt, currentTarget, onSave, isSaving }: Props) {
  const [draft, setDraft] = useState(currentTarget !== null ? String(currentTarget) : "");

  useEffect(() => {
    setDraft(currentTarget !== null ? String(currentTarget) : "");
  }, [currentTarget]);

  const parsed = Number(draft);
  const isValid = draft.trim().length > 0 && Number.isFinite(parsed) && parsed >= 0;
  const percent = isValid && totalDpt > 0 ? Math.round((parsed / totalDpt) * 100) : null;

  return (
    <View className="gap-sm rounded-lg border border-border bg-surface p-md">
      <View className="gap-xs">
        <Text className="text-body-lg font-semibold text-text-primary">{nama}</Text>
        <Text className="text-caption text-text-muted">{totalDpt.toLocaleString("id-ID")} DPT</Text>
      </View>
      <Input
        label="Target Suara"
        value={draft}
        onChangeText={setDraft}
        keyboardType="numeric"
        placeholder="Mis. 5000"
      />
      {percent !== null ? (
        <Text className="text-caption text-text-muted">≈ {percent}% dari total DPT wilayah ini</Text>
      ) : null}
      <Button label="Simpan Target" variant="primary" loading={isSaving} disabled={!isValid} onPress={() => onSave(parsed)} />
    </View>
  );
}
