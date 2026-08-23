import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateRivalCaleg } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";

const rivalCalegFormSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi."),
  noUrut: z.coerce.number().int().min(1, "No. urut tidak valid.").optional().or(z.literal("")),
  catatan: z.string().optional(),
});

type FormValues = { namaLengkap: string; noUrut: string; catatan: string };
type FormErrors = Partial<Record<keyof FormValues, string>>;

// Form tambah Rival Caleg — pola sama persis SaksiFormScreen/GotvFormScreen (zod
// schema + Input + Button). Lihat RivalCalegListScreen.tsx untuk konteks fitur.
export function RivalCalegFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const createMutation = useCreateRivalCaleg();

  const [values, setValues] = useState<FormValues>({ namaLengkap: "", noUrut: "", catatan: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = rivalCalegFormSchema.safeParse({
      ...values,
      noUrut: values.noUrut || undefined,
      catatan: values.catatan || undefined,
    });
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
      {
        namaLengkap: parsed.data.namaLengkap,
        noUrut: parsed.data.noUrut === "" || parsed.data.noUrut === undefined ? undefined : Number(parsed.data.noUrut),
        catatan: parsed.data.catatan,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Nama Lengkap"
          value={values.namaLengkap}
          onChangeText={(t) => setField("namaLengkap", t)}
          error={errors.namaLengkap}
        />
        <Input
          label="No. Urut (opsional)"
          value={values.noUrut}
          onChangeText={(t) => setField("noUrut", t)}
          keyboardType="numeric"
          error={errors.noUrut}
        />
        <Input
          label="Catatan (opsional)"
          value={values.catatan}
          onChangeText={(t) => setField("catatan", t)}
          multiline
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Simpan Rival Caleg" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
