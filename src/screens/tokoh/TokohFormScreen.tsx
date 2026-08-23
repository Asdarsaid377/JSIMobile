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
import { useCreateTokoh } from "@/hooks/useCreateTokoh";
import { useMarkDptTokoh } from "@/hooks/useDptRecordMutations";
import type { DptRecord } from "@/types/dpt";
import { TOKOH_DUKUNGAN_OPTIONS, TOKOH_KATEGORI_OPTIONS, TOKOH_PENGARUH_OPTIONS } from "@/types/tokoh";
import type { TokohDukungan, TokohPengaruh } from "@/types/tokoh";

// Screen ini di-mount dari 2 stack, pola sama persis DtdoorFormScreen: HomeStack
// (tombol "+ Identifikasi Tokoh Baru" di TokohMasyarakatScreen, params kosong)
// DAN DptStack (icon bintang di DptCard, params bawa dptRecord terpilih). Param
// list lokal supaya component tidak terikat ke satu stack.
export type TokohFormParams = {
  dptRecord?: DptRecord;
  kabWilId?: number;
};
type TokohFormRouteParamList = { TokohForm: TokohFormParams | undefined };

const tokohFormSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi."),
  kategoriId: z.number({ message: "Kategori wajib dipilih." }).min(1, "Kategori wajib dipilih."),
  pengaruh: z.enum(["Rendah", "Sedang", "Tinggi"], { message: "Tingkat pengaruh wajib dipilih." }),
  dukungan: z.enum(["Mendukung", "Netral", "Lawan"], { message: "Status dukungan wajib dipilih." }),
  estimasiBasisMassa: z.coerce.number().int().min(0, "Estimasi basis massa tidak valid."),
  alamat: z.string().min(1, "Alamat wajib diisi."),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  desa: z.string().min(1, "Kelurahan/Desa wajib diisi."),
  pekerjaan: z.string().optional(),
  noTelpon: z.string().optional(),
});

type FormValues = {
  nama: string;
  kategoriId: number | undefined;
  pengaruh: TokohPengaruh | undefined;
  dukungan: TokohDukungan | undefined;
  estimasiBasisMassa: string;
  alamat: string;
  kecamatan: string;
  desa: string;
  pekerjaan: string;
  noTelpon: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const KATEGORI_SELECT_OPTIONS = TOKOH_KATEGORI_OPTIONS.map((option) => ({ value: option.id, label: option.label }));
const PENGARUH_SELECT_OPTIONS = TOKOH_PENGARUH_OPTIONS.map((value) => ({ value, label: value }));
const DUKUNGAN_SELECT_OPTIONS = TOKOH_DUKUNGAN_OPTIONS.map((value) => ({ value, label: value }));

// Tidak ada mockup untuk form "Identifikasi Tokoh Baru" itu sendiri (tokoh1.png
// & tokohlist.png cuma tunjukkan tombolnya) — field diturunkan dari model data
// yang SUDAH terbukti dari kedua desain itu (types/tokoh.ts), pola generik
// Input/Select/Button sama persis RivalCalegFormScreen/GotvFormScreen.
export function TokohFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TokohFormRouteParamList, "TokohForm">>();
  const route = useRoute<RouteProp<TokohFormRouteParamList, "TokohForm">>();
  const { dptRecord, kabWilId } = route.params ?? {};
  const createMutation = useCreateTokoh();
  // kabWilId cuma ada kalau dibuka dari DptStack (bareng dptRecord) — hook
  // dipanggil unconditional (Rules of Hooks), mutation-nya cuma dipakai kalau
  // dptRecord ada. Lihat DtdoorFormScreen.tsx untuk pola identik.
  const markTokohMutation = useMarkDptTokoh(kabWilId ?? -1);

  const [values, setValues] = useState<FormValues>({
    nama: dptRecord?.nama ?? "",
    kategoriId: undefined,
    pengaruh: undefined,
    dukungan: undefined,
    estimasiBasisMassa: "",
    alamat: dptRecord?.alamat ?? "",
    kecamatan: dptRecord?.namaKec ?? "",
    desa: dptRecord?.namaKel ?? "",
    pekerjaan: "",
    noTelpon: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = tokohFormSchema.safeParse({
      ...values,
      pekerjaan: values.pekerjaan || undefined,
      noTelpon: values.noTelpon || undefined,
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

    createMutation.mutate(parsed.data, {
      onSuccess: () => {
        // Terhubung ke DPT → tandai sudahTokoh=true di record itu juga (lihat
        // services/dpt.ts § markDptTokoh). Gagal-tandai tidak menghalangi
        // navigasi balik — tokoh-nya sendiri sudah tersimpan.
        if (dptRecord && kabWilId !== undefined) {
          markTokohMutation.mutate(dptRecord.id);
        }
        navigation.goBack();
      },
      onError: (error) => setSubmitError(error.message),
    });
  }

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input label="Nama Lengkap" value={values.nama} onChangeText={(t) => setField("nama", t)} error={errors.nama} />
        <Select
          label="Kategori Tokoh"
          value={values.kategoriId}
          onChange={(v) => setField("kategoriId", v)}
          options={KATEGORI_SELECT_OPTIONS}
        />
        {errors.kategoriId ? <Text className="text-body-md text-danger">{errors.kategoriId}</Text> : null}
        <Select
          label="Tingkat Pengaruh"
          value={values.pengaruh}
          onChange={(v) => setField("pengaruh", v)}
          options={PENGARUH_SELECT_OPTIONS}
        />
        {errors.pengaruh ? <Text className="text-body-md text-danger">{errors.pengaruh}</Text> : null}
        <Select
          label="Status Dukungan"
          value={values.dukungan}
          onChange={(v) => setField("dukungan", v)}
          options={DUKUNGAN_SELECT_OPTIONS}
        />
        {errors.dukungan ? <Text className="text-body-md text-danger">{errors.dukungan}</Text> : null}
        <Input
          label="Estimasi Basis Massa"
          value={values.estimasiBasisMassa}
          onChangeText={(t) => setField("estimasiBasisMassa", t)}
          keyboardType="numeric"
          error={errors.estimasiBasisMassa}
        />
        <Input label="Alamat" value={values.alamat} onChangeText={(t) => setField("alamat", t)} error={errors.alamat} />
        <Input label="Kecamatan" value={values.kecamatan} onChangeText={(t) => setField("kecamatan", t)} error={errors.kecamatan} />
        <Input label="Kelurahan/Desa" value={values.desa} onChangeText={(t) => setField("desa", t)} error={errors.desa} />
        <Input label="Pekerjaan (opsional)" value={values.pekerjaan} onChangeText={(t) => setField("pekerjaan", t)} />
        <Input
          label="No. Telpon (opsional)"
          value={values.noTelpon}
          onChangeText={(t) => setField("noTelpon", t)}
          keyboardType="phone-pad"
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Simpan Tokoh" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
