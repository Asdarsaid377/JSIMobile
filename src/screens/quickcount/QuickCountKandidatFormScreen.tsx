import { useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateQuickCountKandidat, useDeleteQuickCountKandidat, useUpdateQuickCountKandidat } from "@/hooks/useQuickCount";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { QuickCountKandidat } from "@/types/quickcount";

const quickCountKandidatFormSchema = z.object({
  nama: z.string().min(1, "Nama kandidat wajib diisi."),
  partai: z.string(),
});

type FormValues = z.infer<typeof quickCountKandidatFormSchema>;

type FormErrors = Partial<Record<keyof FormValues, string>>;

export type QuickCountKandidatFormParams = { record?: QuickCountKandidat };

// Referensi: TIDAK ADA mockup untuk screen ini (artboard 12 cuma versi input
// hasil C1, tidak ada manajemen kandidat) — dibangun tanpa referensi visual
// atas izin eksplisit user (2026-08-24, Aturan #1), pola generik Input/Button
// sama IsuJanjiFormScreen (dual create/edit + tombol Hapus inline, backend
// mock ini "punya" delete jadi tidak lewat sheet terpisah).
export function QuickCountKandidatFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "QuickCountKandidatForm">>();
  const { record } = route.params ?? {};
  const isEdit = record !== undefined;

  const createMutation = useCreateQuickCountKandidat();
  const updateMutation = useUpdateQuickCountKandidat();
  const deleteMutation = useDeleteQuickCountKandidat();

  const [values, setValues] = useState<FormValues>(
    record ? { nama: record.nama, partai: record.partai } : { nama: "", partai: "" },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = quickCountKandidatFormSchema.safeParse(values);
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
    Alert.alert("Hapus kandidat?", `"${record.nama}" akan dihapus dari daftar input hasil C1.`, [
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
          label="Nama Kandidat"
          value={values.nama}
          onChangeText={(t) => setField("nama", t)}
          placeholder="mis. H. Rahmat Wijaya"
          error={errors.nama}
        />
        <Input
          label="Partai"
          value={values.partai}
          onChangeText={(t) => setField("partai", t)}
          placeholder="Kosongkan kalau independen/tanpa partai"
          error={errors.partai}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Kandidat"}
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
            <Text className="text-body-md font-bold text-danger">Hapus Kandidat</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
