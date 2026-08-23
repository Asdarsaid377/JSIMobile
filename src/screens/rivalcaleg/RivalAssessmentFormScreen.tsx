import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useUpsertRivalAssessment } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { ANCAMAN_LEVEL_OPTIONS } from "@/types/rivalcaleg";
import type { AncamanLevel } from "@/types/rivalcaleg";

const assessmentFormSchema = z.object({
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  desa: z.string().optional(),
  catatan: z.string().optional(),
});

type FormErrors = { kecamatan?: string };

// Form tambah/ubah assessment wilayah rival caleg — upsert (kalau route params
// bawa kecamatan, berarti mode edit pre-filled; kalau tidak, mode tambah baru).
// Kecamatan/Desa FREE TEXT (bukan picker) — lihat types/rivalcaleg.ts kenapa.
export function RivalAssessmentFormScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, "RivalAssessmentForm">>();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { rivalCalegId, kecamatan, desa, levelAncaman, catatan } = route.params;

  const upsertMutation = useUpsertRivalAssessment(rivalCalegId);

  const [kecamatanValue, setKecamatanValue] = useState(kecamatan ?? "");
  const [desaValue, setDesaValue] = useState(desa ?? "");
  const [levelValue, setLevelValue] = useState<AncamanLevel>(levelAncaman ?? "sedang");
  const [catatanValue, setCatatanValue] = useState(catatan ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit() {
    setSubmitError(null);

    const parsed = assessmentFormSchema.safeParse({
      kecamatan: kecamatanValue,
      desa: desaValue || undefined,
      catatan: catatanValue || undefined,
    });
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "kecamatan") fieldErrors.kecamatan = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    upsertMutation.mutate(
      { rivalCalegId, ...parsed.data, levelAncaman: levelValue },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input label="Kecamatan" value={kecamatanValue} onChangeText={setKecamatanValue} error={errors.kecamatan} />
        <Input label="Kelurahan/Desa (opsional)" value={desaValue} onChangeText={setDesaValue} />
        <Select label="Level Ancaman" value={levelValue} onChange={setLevelValue} options={ANCAMAN_LEVEL_OPTIONS} />
        <Input label="Catatan (opsional)" value={catatanValue} onChangeText={setCatatanValue} multiline />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label="Simpan Assessment"
          variant="primary"
          loading={upsertMutation.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
