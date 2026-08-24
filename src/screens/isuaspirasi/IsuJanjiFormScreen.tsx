import { useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCreateIsuJanji, useDeleteIsuJanji, useUpdateIsuJanji } from "@/hooks/useIsuAspirasi";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { ISU_JANJI_DAMPAK_OPTIONS } from "@/types/isuaspirasi";
import type { IsuJanji, IsuJanjiDampak } from "@/types/isuaspirasi";

const isuJanjiFormSchema = z.object({
  janji: z.string().min(1, "Nama usulan wajib diisi."),
  dampak: z.enum(["Prioritas Tinggi", "Prioritas Sedang", "Prioritas Rendah"], {
    message: "Prioritas dampak wajib dipilih.",
  }),
  dasar: z.string().min(1, "Basis data/rasional wajib diisi."),
  wilayah: z.string().min(1, "Wilayah wajib diisi."),
});

type FormValues = {
  janji: string;
  dampak: IsuJanjiDampak | undefined;
  dasar: string;
  wilayah: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

export type IsuJanjiFormParams = { record?: IsuJanji };

// Referensi: TIDAK ADA mockup untuk form ini (artboard 15 cuma versi
// read-only, "Usulan Materi Kampanye" murni tampilan hasil kurasi) —
// dibangun tanpa referensi visual atas izin eksplisit user (2026-08-24,
// Aturan #1), pola generik Input/Select/Button sama RivalWilayahFormScreen.
// Beda dari RivalWilayahFormScreen: backend PUNYA DELETE untuk resource ini
// (`DELETE /isuaspirasi/janji/:id`) — tombol Hapus ditaruh di form ini
// sendiri (bukan sheet terpisah, tidak ada detail sheet untuk Janji karena
// IsuJanjiCard sudah menampilkan semua field-nya, pola sama alasan
// RivalWilayahRow langsung ke form tanpa lewat sheet).
export function IsuJanjiFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "IsuJanjiForm">>();
  const { record } = route.params ?? {};
  const isEdit = record !== undefined;

  const createMutation = useCreateIsuJanji();
  const updateMutation = useUpdateIsuJanji();
  const deleteMutation = useDeleteIsuJanji();

  const [values, setValues] = useState<FormValues>(
    record
      ? { janji: record.janji, dampak: record.dampak, dasar: record.dasar, wilayah: record.wilayah }
      : { janji: "", dampak: undefined, dasar: "", wilayah: "" },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = isuJanjiFormSchema.safeParse(values);
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
    Alert.alert("Hapus usulan materi?", `"${record.janji}" akan dihapus dari daftar.`, [
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
          label="Nama Usulan"
          value={values.janji}
          onChangeText={(t) => setField("janji", t)}
          placeholder="mis. Program Perbaikan Jalan Lingkungan Bertahap"
          error={errors.janji}
        />
        <Select
          label="Prioritas Dampak"
          value={values.dampak}
          onChange={(value) => setField("dampak", value)}
          options={ISU_JANJI_DAMPAK_OPTIONS}
          error={errors.dampak}
        />
        <Input
          label="Basis Data/Rasional"
          value={values.dasar}
          onChangeText={(t) => setField("dasar", t)}
          multiline
          placeholder="mis. 412 aspirasi menyebut kondisi jalan rusak..."
          error={errors.dasar}
        />
        <Input
          label="Wilayah"
          value={values.wilayah}
          onChangeText={(t) => setField("wilayah", t)}
          error={errors.wilayah}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Usulan"}
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
            <Text className="text-body-md font-bold text-danger">Hapus Usulan</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
