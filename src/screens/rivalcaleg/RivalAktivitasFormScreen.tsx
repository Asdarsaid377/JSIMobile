import { useMemo, useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRivalAktivitas, useRivalDeteksiSnapshot } from "@/hooks/useRivalCaleg";
import type { HomeStackParamList } from "@/navigation/HomeStack";

const rivalAktivitasFormSchema = z.object({
  rivalCalegId: z.number({ message: "Rival wajib dipilih." }),
  jenis: z.string().min(1, "Jenis aktivitas wajib diisi."),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi."),
  wilayah: z.string().min(1, "Wilayah wajib diisi."),
});

type FormValues = {
  rivalCalegId: number | undefined;
  jenis: string;
  deskripsi: string;
  wilayah: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// Referensi: TIDAK ADA mockup untuk form ini (canvas artboard 16 cuma versi
// read-only, "Aktivitas Rival Terdeteksi" murni tampilan hasil laporan) —
// dibangun tanpa referensi visual atas izin eksplisit user (2026-08-24, Aturan
// #1). Backend cuma punya create untuk resource ini (tidak ada edit/hapus,
// pola sama laporan kunjungan D2D/Gotv — sekali lapor, tidak diubah). `tanggal`
// SENGAJA tidak ada input di form ini — backend default NOW, tidak ada
// date-picker library di project ini untuk override manual.
export function RivalAktivitasFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const snapshotQuery = useRivalDeteksiSnapshot();
  const createMutation = useCreateRivalAktivitas(session?.user.namaLengkap ?? "-");

  const [values, setValues] = useState<FormValues>({
    rivalCalegId: undefined,
    jenis: "",
    deskripsi: "",
    wilayah: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Exclude isKita — tidak masuk akal "lapor aktivitas" terhadap kandidat kita
  // sendiri, list ini murni untuk pilih RIVAL mana yang aktivitasnya dicatat.
  const rivalOptions = useMemo(
    () => (snapshotQuery.data?.daftar ?? []).map((item) => ({ value: item.id, label: item.namaLengkap })),
    [snapshotQuery.data],
  );

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = rivalAktivitasFormSchema.safeParse(values);
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
        <Select
          label="Rival"
          value={values.rivalCalegId}
          onChange={(value) => setField("rivalCalegId", value)}
          options={rivalOptions}
          error={errors.rivalCalegId}
        />
        <Input
          label="Jenis Aktivitas"
          value={values.jenis}
          onChangeText={(t) => setField("jenis", t)}
          placeholder="mis. Bagi Sembako, Pengajian, Isu Negatif"
          error={errors.jenis}
        />
        <Input
          label="Deskripsi"
          value={values.deskripsi}
          onChangeText={(t) => setField("deskripsi", t)}
          multiline
          error={errors.deskripsi}
        />
        <Input
          label="Wilayah"
          value={values.wilayah}
          onChangeText={(t) => setField("wilayah", t)}
          error={errors.wilayah}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Lapor Aktivitas" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
