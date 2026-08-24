import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateRivalWilayah, useUpdateRivalWilayah } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { RIVAL_WILAYAH_STATUS_OPTIONS } from "@/types/rivalcaleg";
import type { RivalWilayahPeta } from "@/types/rivalcaleg";

const rivalWilayahFormSchema = z.object({
  nama: z.string().min(1, "Nama kecamatan/kelurahan wajib diisi."),
  status: z.enum(["unggul", "rival-kuat", "bentrok"], { message: "Status wajib dipilih." }),
});

type FormValues = {
  nama: string;
  rivalPenantang: string;
  status: "unggul" | "rival-kuat" | "bentrok" | undefined;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// Referensi: TIDAK ADA mockup untuk form ini (canvas artboard 16 cuma versi
// read-only, "Peta penguasaan wilayah" dekoratif disederhanakan jadi list —
// lihat ui-registry.md § RivalWilayahRow) — dibangun tanpa referensi visual
// atas izin eksplisit user (2026-08-24, Aturan #1), pola generik Input/Select/
// Button. Backend TIDAK punya endpoint DELETE untuk resource ini — form cuma
// Simpan, tidak ada tombol Hapus (beda dari RivalCalegFormScreen).
export function RivalWilayahFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "RivalWilayahForm">>();
  const { record } = route.params ?? {};
  const isEdit = record !== undefined;

  const createMutation = useCreateRivalWilayah();
  const updateMutation = useUpdateRivalWilayah();

  const [values, setValues] = useState<FormValues>(
    record
      ? { nama: record.nama, rivalPenantang: record.rivalPenantang, status: record.status }
      : { nama: "", rivalPenantang: "", status: undefined },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = rivalWilayahFormSchema.safeParse(values);
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

    const input = { nama: parsed.data.nama, rivalPenantang: values.rivalPenantang, status: parsed.data.status };

    if (isEdit) {
      updateMutation.mutate(
        { ...input, id: record.id },
        { onSuccess: () => navigation.goBack(), onError: (error) => setSubmitError(error.message) },
      );
    } else {
      createMutation.mutate(input, {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      });
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Kecamatan/Kelurahan"
          value={values.nama}
          onChangeText={(t) => setField("nama", t)}
          error={errors.nama}
        />
        <Input
          label="Rival Penantang"
          value={values.rivalPenantang}
          onChangeText={(t) => setField("rivalPenantang", t)}
        />
        <Select
          label="Status Penguasaan"
          value={values.status}
          onChange={(value) => setField("status", value)}
          options={RIVAL_WILAYAH_STATUS_OPTIONS}
          error={errors.status}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Wilayah"}
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export type RivalWilayahFormParams = { record?: RivalWilayahPeta };
