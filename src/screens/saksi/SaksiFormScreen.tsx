import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RouteProp } from "@react-navigation/native";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateSaksi } from "@/hooks/useSaksi";
import type { DptStackParamList } from "@/navigation/DptStack";

const saksiFormSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi."),
  noTelpon: z.string().min(1, "No. telpon wajib diisi."),
});

type FormValues = { namaLengkap: string; noTelpon: string };
type FormErrors = Partial<FormValues>;

// Form tambah Saksi TPS — pola sama persis DtdoorFormScreen/GotvFormScreen
// (zod schema + Input + Button). Lihat SaksiTpsScreen.tsx untuk konteks fitur.
export function SaksiFormScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "SaksiForm">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kelWilId, noTps, namaTps } = route.params;

  const createMutation = useCreateSaksi(kelWilId, noTps);

  const [values, setValues] = useState<FormValues>({ namaLengkap: "", noTelpon: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = saksiFormSchema.safeParse(values);
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

    createMutation.mutate(
      { ...parsed.data, kelWilId, noTps, namaTps },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Text className="text-caption text-text-muted">TPS {namaTps}</Text>
        <Input
          label="Nama Lengkap"
          value={values.namaLengkap}
          onChangeText={(t) => setField("namaLengkap", t)}
          error={errors.namaLengkap}
        />
        <Input
          label="No. Telpon"
          value={values.noTelpon}
          onChangeText={(t) => setField("noTelpon", t)}
          keyboardType="phone-pad"
          error={errors.noTelpon}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Simpan Saksi" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
