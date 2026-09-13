import { useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateQuickCountTps, useDeleteQuickCountTps, useUpdateQuickCountTps } from "@/hooks/useQuickCount";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { QuickCountTps } from "@/types/quickcount";

const quickCountTpsFormSchema = z.object({
  noTps: z.string().min(1, "Nomor TPS wajib diisi."),
  kabupaten: z.string().min(1, "Kabupaten/Kota wajib diisi."),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  kelurahan: z.string().min(1, "Kelurahan wajib diisi."),
  namaSaksi: z.string(),
  totalDpt: z.coerce.number().int().min(0, "Total DPT tidak valid."),
});

type FormValues = {
  noTps: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaSaksi: string;
  totalDpt: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

export type QuickCountTpsFormParams = { record?: QuickCountTps };

// Referensi: TIDAK ADA mockup untuk screen ini (artboard 12 cuma versi input
// hasil C1, tidak ada manajemen TPS) — dibangun tanpa referensi visual atas
// izin eksplisit user (2026-08-24, Aturan #1, izin sama yang sudah dipakai
// untuk QuickCountKandidatFormScreen — kategori screen setup admin yang
// sama). TPS di sini SENGAJA berdiri sendiri, tidak terhubung ke data
// wilayah/DPT manapun (keputusan eksplisit user).
export function QuickCountTpsFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "QuickCountTpsForm">>();
  const { record } = route.params ?? {};
  const isEdit = record !== undefined;

  const createMutation = useCreateQuickCountTps();
  const updateMutation = useUpdateQuickCountTps();
  const deleteMutation = useDeleteQuickCountTps();

  const [values, setValues] = useState<FormValues>(
    record
      ? {
          noTps: record.noTps,
          kabupaten: record.kabupaten,
          kecamatan: record.kecamatan,
          kelurahan: record.kelurahan,
          namaSaksi: record.namaSaksi ?? "",
          totalDpt: String(record.totalDpt),
        }
      : { noTps: "", kabupaten: "", kecamatan: "", kelurahan: "", namaSaksi: "", totalDpt: "0" },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = quickCountTpsFormSchema.safeParse(values);
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

    if (isEdit) {
      updateMutation.mutate(
        { ...parsed.data, id: record.id },
        { onSuccess: () => navigation.goBack(), onError: (error) => setSubmitError(error.message) },
      );
    } else {
      createMutation.mutate(parsed.data, {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      });
    }
  }

  function handleDelete() {
    if (!record) return;
    Alert.alert("Hapus TPS?", `"${record.noTps}" akan dihapus dari daftar.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(record.id, {
            onSuccess: () => navigation.goBack(),
            onError: (error) => Alert.alert("Gagal menghapus", error.message),
          });
        },
      },
    ]);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Nomor TPS"
          value={values.noTps}
          onChangeText={(t) => setField("noTps", t)}
          placeholder="mis. TPS 12"
          error={errors.noTps}
        />
        <Input
          label="Kabupaten/Kota"
          value={values.kabupaten}
          onChangeText={(t) => setField("kabupaten", t)}
          placeholder="mis. Bandung"
          error={errors.kabupaten}
        />
        <Input
          label="Kecamatan"
          value={values.kecamatan}
          onChangeText={(t) => setField("kecamatan", t)}
          error={errors.kecamatan}
        />
        <Input
          label="Kelurahan"
          value={values.kelurahan}
          onChangeText={(t) => setField("kelurahan", t)}
          error={errors.kelurahan}
        />
        <Input
          label="Nama Saksi"
          value={values.namaSaksi}
          onChangeText={(t) => setField("namaSaksi", t)}
          placeholder="Kosongkan kalau belum ada penugasan"
          error={errors.namaSaksi}
        />
        <Input
          label="Total DPT"
          value={values.totalDpt}
          onChangeText={(t) => setField("totalDpt", t.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          error={errors.totalDpt}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan TPS"}
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit}
        />

        {isEdit ? (
          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="min-h-[44px] items-center justify-center rounded-lg border border-danger px-lg py-sm active:opacity-80"
          >
            <Text className="text-body-md font-bold text-danger">Hapus TPS</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
