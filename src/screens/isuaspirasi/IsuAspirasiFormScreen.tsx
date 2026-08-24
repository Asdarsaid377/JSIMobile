import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useCreateIsuAspirasi } from "@/hooks/useIsuAspirasi";
import type { HomeStackParamList } from "@/navigation/HomeStack";

const isuAspirasiFormSchema = z.object({
  warga: z.string().min(1, "Nama/keterangan pelapor wajib diisi."),
  alamat: z.string().min(1, "Alamat wajib diisi."),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  desa: z.string().min(1, "Desa/kelurahan wajib diisi."),
  kategori: z.string().min(1, "Kategori wajib diisi."),
  keluhan: z.string().min(1, "Keluhan wajib diisi."),
});

type FormValues = z.infer<typeof isuAspirasiFormSchema>;

type FormErrors = Partial<Record<keyof FormValues, string>>;

// Referensi: TIDAK ADA mockup untuk form ini (artboard 15 cuma versi
// read-only, tombol "+ Catat Aspirasi Warga" murni Alert placeholder) —
// dibangun tanpa referensi visual atas izin eksplisit user (2026-08-24,
// Aturan #1), pola generik Input/Button sama RivalAktivitasFormScreen.
// Backend cuma punya create untuk resource ini (edit/hapus dilakukan lewat
// PATCH status/dijadikanMateri di IsuAspirasiDetailSheet, bukan di form ini).
export function IsuAspirasiFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const createMutation = useCreateIsuAspirasi(session?.user.namaLengkap ?? "-");

  const [values, setValues] = useState<FormValues>({
    warga: "",
    alamat: "",
    kecamatan: "",
    desa: "",
    kategori: "",
    keluhan: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = isuAspirasiFormSchema.safeParse(values);
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

    createMutation.mutate(parsed.data, {
      onSuccess: () => navigation.goBack(),
      onError: (error) => setSubmitError(error.message),
    });
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Nama/Keterangan Pelapor"
          value={values.warga}
          onChangeText={(t) => setField("warga", t)}
          placeholder="mis. Warga RT 03, Ibu Yayah"
          error={errors.warga}
        />
        <Input
          label="Alamat"
          value={values.alamat}
          onChangeText={(t) => setField("alamat", t)}
          placeholder="mis. Jl. Cikuda, Cileunyi Kulon"
          error={errors.alamat}
        />
        <Input
          label="Kecamatan"
          value={values.kecamatan}
          onChangeText={(t) => setField("kecamatan", t)}
          error={errors.kecamatan}
        />
        <Input
          label="Desa/Kelurahan"
          value={values.desa}
          onChangeText={(t) => setField("desa", t)}
          error={errors.desa}
        />
        <Input
          label="Kategori"
          value={values.kategori}
          onChangeText={(t) => setField("kategori", t)}
          placeholder="mis. Jalan, Air, Kesehatan, Pendidikan"
          error={errors.kategori}
        />
        <Input
          label="Keluhan"
          value={values.keluhan}
          onChangeText={(t) => setField("keluhan", t)}
          multiline
          error={errors.keluhan}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label="Catat Aspirasi"
          variant="primary"
          loading={createMutation.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
