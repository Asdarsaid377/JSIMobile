import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useCreateRivalCaleg, useUpdateRivalCaleg } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { RIVAL_ANCAMAN_OPTIONS, RIVAL_TREN_OPTIONS } from "@/types/rivalcaleg";
import type { RivalCalegSummary } from "@/types/rivalcaleg";

const rivalCalegFormSchema = z.object({
  namaLengkap: z.string().min(1, "Nama wajib diisi."),
  partai: z.string().min(1, "Partai wajib diisi."),
  noUrut: z.coerce.number().int().min(1, "No. urut wajib diisi."),
  ancaman: z.enum(["rendah", "sedang", "tinggi"], { message: "Tingkat ancaman wajib dipilih." }),
});

type FormValues = {
  namaLengkap: string;
  partai: string;
  noUrut: string;
  isKita: boolean;
  ancaman: "rendah" | "sedang" | "tinggi" | undefined;
  basis: string;
  estimasiSuara: string;
  suara2024: string;
  tren: "naik" | "turun" | "stabil" | undefined;
  wilayahBentrok: string;
  tokohBerpihak: string;
  isuDiangkat: string;
  strategi: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// Referensi: TIDAK ADA mockup untuk form ini (canvas artboard 16 cuma versi
// read-only) — dibangun tanpa referensi visual atas izin eksplisit user
// (2026-08-24, Aturan #1, pola sama Budget Plafon/Approval sebelumnya), pola
// generik Input/Select/Switch/Button sama persis DptRecordFormScreen (dual
// create+edit lewat route params `record?`). Semua role login boleh
// tambah/edit/hapus (keputusan eksplisit user — field intel, bukan kontrol
// admin-only).
export function RivalCalegFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "RivalCalegForm">>();
  const { record } = route.params ?? {};
  const isEdit = record !== undefined;

  const createMutation = useCreateRivalCaleg();
  const updateMutation = useUpdateRivalCaleg();

  const [values, setValues] = useState<FormValues>(
    record
      ? {
          namaLengkap: record.namaLengkap,
          partai: record.partai,
          noUrut: String(record.noUrut),
          isKita: record.isKita,
          ancaman: record.ancaman,
          basis: record.basis,
          estimasiSuara: String(record.estimasiSuara),
          suara2024: String(record.suara2024),
          tren: record.tren,
          wilayahBentrok: record.wilayahBentrok,
          tokohBerpihak: record.tokohBerpihak,
          isuDiangkat: record.isuDiangkat,
          strategi: record.strategi,
        }
      : {
          namaLengkap: "",
          partai: "",
          noUrut: "",
          isKita: false,
          ancaman: "sedang",
          basis: "",
          estimasiSuara: "",
          suara2024: "",
          tren: undefined,
          wilayahBentrok: "",
          tokohBerpihak: "",
          isuDiangkat: "",
          strategi: "",
        },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = rivalCalegFormSchema.safeParse(values);
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

    const input = {
      namaLengkap: parsed.data.namaLengkap,
      partai: parsed.data.partai,
      noUrut: parsed.data.noUrut,
      isKita: values.isKita,
      ancaman: parsed.data.ancaman,
      basis: values.basis,
      estimasiSuara: Number(values.estimasiSuara) || 0,
      suara2024: Number(values.suara2024) || 0,
      tren: values.tren,
      wilayahBentrok: values.wilayahBentrok,
      tokohBerpihak: values.tokohBerpihak,
      isuDiangkat: values.isuDiangkat,
      strategi: values.strategi,
    };

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
          label="Nama Lengkap"
          value={values.namaLengkap}
          onChangeText={(t) => setField("namaLengkap", t)}
          error={errors.namaLengkap}
        />
        <Input label="Partai" value={values.partai} onChangeText={(t) => setField("partai", t)} error={errors.partai} />
        <Input
          label="No. Urut"
          value={values.noUrut}
          onChangeText={(t) => setField("noUrut", t)}
          keyboardType="numeric"
          error={errors.noUrut}
        />

        <View className="flex-row items-center justify-between rounded-md border border-border bg-surface p-md">
          <Text className="flex-1 text-body-md text-text-primary">Ini kandidat kita sendiri</Text>
          <Switch value={values.isKita} onValueChange={(v) => setField("isKita", v)} />
        </View>

        <Select
          label="Tingkat Ancaman"
          value={values.ancaman}
          onChange={(value) => setField("ancaman", value)}
          options={RIVAL_ANCAMAN_OPTIONS}
          error={errors.ancaman}
        />
        <Input
          label="Basis Kekuatan"
          value={values.basis}
          onChangeText={(t) => setField("basis", t)}
          multiline
        />
        <Input
          label="Estimasi Suara"
          value={values.estimasiSuara}
          onChangeText={(t) => setField("estimasiSuara", t)}
          keyboardType="numeric"
        />
        <Input
          label="Suara 2024"
          value={values.suara2024}
          onChangeText={(t) => setField("suara2024", t)}
          keyboardType="numeric"
        />
        <Select
          label="Tren"
          value={values.tren}
          onChange={(value) => setField("tren", value)}
          options={RIVAL_TREN_OPTIONS}
          placeholder="Belum diketahui"
        />
        <Input
          label="Wilayah Bentrok"
          value={values.wilayahBentrok}
          onChangeText={(t) => setField("wilayahBentrok", t)}
        />
        <Input
          label="Tokoh yang Berpihak"
          value={values.tokohBerpihak}
          onChangeText={(t) => setField("tokohBerpihak", t)}
        />
        <Input label="Isu yang Diangkat" value={values.isuDiangkat} onChangeText={(t) => setField("isuDiangkat", t)} />
        <Input
          label="Rekomendasi Strategi"
          value={values.strategi}
          onChangeText={(t) => setField("strategi", t)}
          multiline
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Rival Caleg"}
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export type RivalCalegFormParams = { record?: RivalCalegSummary };
