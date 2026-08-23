import { useEffect, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";

import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRealCountByTps, useSubmitRealCount } from "@/hooks/useRealCount";
import type { DptStackParamList } from "@/navigation/DptStack";

const realCountFormSchema = z.object({
  suaraCalon: z.coerce.number().int().min(0, "Suara calon tidak valid."),
  suaraPartaiLain: z.coerce.number().int().min(0, "Suara partai/calon lain tidak valid."),
  suaraTidakSah: z.coerce.number().int().min(0, "Suara tidak sah tidak valid."),
  suaraSahTotal: z.coerce.number().int().min(0, "Total suara sah tidak valid."),
  catatan: z.string().optional(),
});

type FormValues = {
  suaraCalon: string;
  suaraPartaiLain: string;
  suaraTidakSah: string;
  suaraSahTotal: string;
  catatan: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_FORM: FormValues = {
  suaraCalon: "",
  suaraPartaiLain: "",
  suaraTidakSah: "",
  suaraSahTotal: "",
  catatan: "",
};

function handleUploadNotImplemented(): void {
  Alert.alert("Segera hadir", "Upload foto formulir C1 belum tersedia.");
}

// Real Count C1 — fitur baru di luar build-plan awal (permintaan user, "cukup UI
// dulu, API dikembangkan belakangan" — lihat services/realcount.ts &
// progress-tracker.md Decisions). Tidak ada referensi desain (izin build dari
// ui-rules.md/ui-tokens.md). Di-push dari TargetSuaraTpsScreen, route ATTACH ke
// DptStack yang sama (pola sama SaksiTpsScreen/Target Suara). 1 TPS = 1 hasil
// C1 (upsert, bukan riwayat versi — submit ulang dianggap koreksi input).
export function RealCountC1Screen() {
  const route = useRoute<RouteProp<DptStackParamList, "RealCountC1">>();
  const { kelWilId, noTps, namaTps } = route.params;

  const realCountQuery = useRealCountByTps(kelWilId, noTps);
  const submitMutation = useSubmitRealCount(kelWilId, noTps);

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const existing = realCountQuery.data;
    if (existing) {
      setValues({
        suaraCalon: String(existing.suaraCalon),
        suaraPartaiLain: String(existing.suaraPartaiLain),
        suaraTidakSah: String(existing.suaraTidakSah),
        suaraSahTotal: String(existing.suaraSahTotal),
        catatan: existing.catatan ?? "",
      });
    }
  }, [realCountQuery.data]);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setSubmitSuccess(false);
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const calonPlusLain = (Number(values.suaraCalon) || 0) + (Number(values.suaraPartaiLain) || 0);
  const sahTotal = Number(values.suaraSahTotal) || 0;
  const showCrossCheck = values.suaraCalon !== "" && values.suaraPartaiLain !== "" && values.suaraSahTotal !== "";
  const crossCheckMatch = calonPlusLain === sahTotal;

  function handleSubmit() {
    setSubmitError(null);
    setSubmitSuccess(false);

    const parsed = realCountFormSchema.safeParse({ ...values, catatan: values.catatan || undefined });
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined;
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    submitMutation.mutate(
      { ...parsed.data, kelWilId, noTps, namaTps },
      {
        onSuccess: () => setSubmitSuccess(true),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Text className="text-caption text-text-muted">TPS {namaTps}</Text>

        <Input
          label="Suara Calon (kita)"
          value={values.suaraCalon}
          onChangeText={(t) => setField("suaraCalon", t)}
          keyboardType="numeric"
          error={errors.suaraCalon}
        />
        <Input
          label="Suara Partai/Calon Lain"
          value={values.suaraPartaiLain}
          onChangeText={(t) => setField("suaraPartaiLain", t)}
          keyboardType="numeric"
          error={errors.suaraPartaiLain}
        />
        <Input
          label="Suara Tidak Sah"
          value={values.suaraTidakSah}
          onChangeText={(t) => setField("suaraTidakSah", t)}
          keyboardType="numeric"
          error={errors.suaraTidakSah}
        />
        <Input
          label="Total Suara Sah (dari formulir C1)"
          value={values.suaraSahTotal}
          onChangeText={(t) => setField("suaraSahTotal", t)}
          keyboardType="numeric"
          error={errors.suaraSahTotal}
        />
        {showCrossCheck ? (
          <Text className={`text-caption ${crossCheckMatch ? "text-success" : "text-danger"}`}>
            {crossCheckMatch
              ? "✓ Suara Calon + Suara Lain cocok dengan Total Suara Sah."
              : `⚠ Suara Calon + Suara Lain = ${calonPlusLain}, tidak cocok dengan Total Suara Sah (${sahTotal}). Cek ulang formulir.`}
          </Text>
        ) : null}

        <Input
          label="Catatan (opsional)"
          value={values.catatan}
          onChangeText={(t) => setField("catatan", t)}
          multiline
        />

        <Button label="Upload Foto Formulir C1" variant="secondary" onPress={handleUploadNotImplemented} />

        {submitSuccess ? <Text className="text-body-md text-success">Hasil C1 tersimpan.</Text> : null}
        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Simpan Real Count" variant="primary" loading={submitMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
