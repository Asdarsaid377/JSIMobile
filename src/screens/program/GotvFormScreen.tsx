import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateGotv } from "@/hooks/useCreateGotv";
import type { ProgramStackParamList } from "@/navigation/ProgramStack";

const gotvFormSchema = z.object({
  namaLengkap: z.string().min(1, "Nama PIC wajib diisi."),
  namaKegiatan: z.string().min(1, "Nama kegiatan wajib diisi."),
  tps: z.string().min(1, "TPS wajib diisi."),
  desa: z.string().min(1, "Desa wajib diisi."),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  kabupaten: z.string().min(1, "Kabupaten wajib diisi."),
  jumlahWajibPilih: z.coerce.number().int().min(0, "Jumlah peserta tidak valid."),
  // Wajib — kolom nik di database NOT NULL tanpa default (lihat
  // api-standards.md § gotv), meski DTO backend menandainya optional.
  nik: z.string().min(1, "NIK wajib diisi."),
  noTelpon: z.string().optional(),
});

type FormValues = {
  namaLengkap: string;
  namaKegiatan: string;
  tps: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  jumlahWajibPilih: string;
  nik: string;
  noTelpon: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

export function GotvFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProgramStackParamList, "GotvForm">>();
  const createMutation = useCreateGotv();

  const [values, setValues] = useState<FormValues>({
    namaLengkap: "",
    namaKegiatan: "",
    tps: "",
    desa: "",
    kecamatan: "",
    kabupaten: "",
    jumlahWajibPilih: "",
    nik: "",
    noTelpon: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = gotvFormSchema.safeParse({
      ...values,
      noTelpon: values.noTelpon || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined;
        if (key) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    createMutation.mutate(parsed.data, {
      onSuccess: () => navigation.goBack(),
      onError: (error) => setSubmitError(error.message),
    });
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Nama Kegiatan"
          value={values.namaKegiatan}
          onChangeText={(t) => setField("namaKegiatan", t)}
          error={errors.namaKegiatan}
        />
        <Input
          label="Jumlah Peserta"
          value={values.jumlahWajibPilih}
          onChangeText={(t) => setField("jumlahWajibPilih", t)}
          keyboardType="numeric"
          error={errors.jumlahWajibPilih}
        />
        <Input label="TPS" value={values.tps} onChangeText={(t) => setField("tps", t)} error={errors.tps} />
        <Input label="Desa" value={values.desa} onChangeText={(t) => setField("desa", t)} error={errors.desa} />
        <Input
          label="Kecamatan"
          value={values.kecamatan}
          onChangeText={(t) => setField("kecamatan", t)}
          error={errors.kecamatan}
        />
        <Input
          label="Kabupaten"
          value={values.kabupaten}
          onChangeText={(t) => setField("kabupaten", t)}
          error={errors.kabupaten}
        />
        <Input
          label="PIC (Nama Lengkap)"
          value={values.namaLengkap}
          onChangeText={(t) => setField("namaLengkap", t)}
          error={errors.namaLengkap}
        />
        <Input
          label="NIK"
          value={values.nik}
          onChangeText={(t) => setField("nik", t)}
          keyboardType="numeric"
          error={errors.nik}
        />
        <Input
          label="No. Telpon"
          value={values.noTelpon}
          onChangeText={(t) => setField("noTelpon", t)}
          keyboardType="phone-pad"
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Simpan Kegiatan" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
