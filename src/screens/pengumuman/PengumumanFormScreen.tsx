import { useMemo, useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDptKabupatenList } from "@/hooks/useDptKabupatenList";
import { useDptKecamatanList } from "@/hooks/useDptKecamatanList";
import { useDptKelurahanList } from "@/hooks/useDptKelurahanList";
import { useDptProvinsiList } from "@/hooks/useDptProvinsiList";
import { useCreatePengumuman } from "@/hooks/usePengumuman";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { PENGUMUMAN_PRIORITAS_OPTIONS, PENGUMUMAN_TARGET_LEVEL_OPTIONS } from "@/types/pengumuman";
import type { PengumumanPrioritas, PengumumanTargetLevel } from "@/types/pengumuman";

const PRIORITAS_OPTIONS = PENGUMUMAN_PRIORITAS_OPTIONS.map((value) => ({ value, label: value }));

type FormValues = {
  judul: string;
  isi: string;
  prioritas: PengumumanPrioritas;
  targetLevel: PengumumanTargetLevel | undefined;
  provinsiWilId: number | undefined;
  kabId: number | undefined;
  kecId: number | undefined;
  kelId: number | undefined;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  judul: "",
  isi: "",
  prioritas: "Normal",
  targetLevel: undefined,
  provinsiWilId: undefined,
  kabId: undefined,
  kecId: undefined,
  kelId: undefined,
};

// "+ Buat Pengumuman" (admin/adminsekret only, POST /pengumuman) — TIDAK ADA
// referensi desain (izin eksplisit user 2026-08-26, Aturan #1 CLAUDE.md),
// dibangun ikut ui-rules.md + ui-tokens.md, struktur cascading wilayah
// Provinsi→Kabupaten→Kecamatan→Kelurahan REUSE LANGSUNG hook useDpt*List yang
// sama dipakai TimsesFormScreen/DptRecordFormScreen — supaya admin pilih
// wilayah dari NAMA asli, bukan ketik wilId mentah. Field wilayah muncul
// bertahap sesuai targetLevel yang dipilih (bukan dari role seperti
// TimsesFormScreen), konsisten dengan validasi hierarki di backend
// (PengumumanService.validasiHierarkiTarget, lihat api-standards.md § Pengumuman).
export function PengumumanFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const createMutation = useCreatePengumuman();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needsProvinsiKab =
    values.targetLevel === "kabupaten" || values.targetLevel === "kecamatan" || values.targetLevel === "desa";
  const needsKecamatan = values.targetLevel === "kecamatan" || values.targetLevel === "desa";
  const needsKelurahan = values.targetLevel === "desa";

  const provinsiQuery = useDptProvinsiList();
  const kabupatenQuery = useDptKabupatenList(needsProvinsiKab ? values.provinsiWilId ?? null : null);
  const kecamatanQuery = useDptKecamatanList(needsKecamatan ? values.kabId ?? null : null);
  const kelurahanQuery = useDptKelurahanList(
    needsKelurahan ? values.kabId ?? null : null,
    needsKelurahan ? values.kecId ?? null : null,
  );

  const provinsiOptions = useMemo(
    () => (provinsiQuery.data ?? []).map((item) => ({ value: item.wilId, label: item.nama })),
    [provinsiQuery.data],
  );
  const kabupatenOptions = useMemo(
    () => (kabupatenQuery.data ?? []).map((item) => ({ value: item.wilId, label: item.nama })),
    [kabupatenQuery.data],
  );
  const kecamatanOptions = useMemo(
    () => (kecamatanQuery.data ?? []).map((item) => ({ value: item.wilId, label: item.nama })),
    [kecamatanQuery.data],
  );
  const kelurahanOptions = useMemo(
    () => (kelurahanQuery.data ?? []).map((item) => ({ value: item.wilId, label: item.nama })),
    [kelurahanQuery.data],
  );

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleTargetLevelChange(targetLevel: PengumumanTargetLevel) {
    // Ganti target level bisa mengubah wilayah yang dibutuhkan — reset field
    // wilayah supaya tidak ada pilihan lama yang nyangkut tapi tersembunyi
    // (pola sama handleRoleChange di TimsesFormScreen.tsx).
    setValues((prev) => ({
      ...prev,
      targetLevel,
      provinsiWilId: undefined,
      kabId: undefined,
      kecId: undefined,
      kelId: undefined,
    }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const schema = z
      .object({
        judul: z.string().min(1, "Judul wajib diisi."),
        isi: z.string().min(1, "Isi pengumuman wajib diisi."),
        prioritas: z.enum(PENGUMUMAN_PRIORITAS_OPTIONS as [PengumumanPrioritas, ...PengumumanPrioritas[]]),
        targetLevel: z.enum(
          PENGUMUMAN_TARGET_LEVEL_OPTIONS.map((o) => o.value) as [PengumumanTargetLevel, ...PengumumanTargetLevel[]],
          { message: "Target penerima wajib dipilih." },
        ),
        kabId: z.number().optional(),
        kecId: z.number().optional(),
        kelId: z.number().optional(),
      })
      .superRefine((val, ctx) => {
        if (val.targetLevel === "kabupaten" && !val.kabId) {
          ctx.addIssue({ code: "custom", path: ["kabId"], message: "Kabupaten wajib dipilih." });
        }
        if (val.targetLevel === "kecamatan" && !val.kecId) {
          ctx.addIssue({ code: "custom", path: ["kecId"], message: "Kecamatan wajib dipilih." });
        }
        if (val.targetLevel === "desa" && !val.kelId) {
          ctx.addIssue({ code: "custom", path: ["kelId"], message: "Kelurahan/Desa wajib dipilih." });
        }
      });

    const parsed = schema.safeParse(values);
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

    const { targetLevel } = parsed.data;
    const needsKab = targetLevel === "kabupaten" || targetLevel === "kecamatan" || targetLevel === "desa";
    createMutation.mutate(
      {
        judul: parsed.data.judul,
        isi: parsed.data.isi,
        prioritas: parsed.data.prioritas,
        targetLevel,
        targetKabId: needsKab ? parsed.data.kabId : undefined,
        targetKecId: targetLevel === "kecamatan" || targetLevel === "desa" ? parsed.data.kecId : undefined,
        targetKelId: targetLevel === "desa" ? parsed.data.kelId : undefined,
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
        <Input label="Judul" value={values.judul} onChangeText={(t) => setField("judul", t)} error={errors.judul} />
        <Input
          label="Isi Pengumuman"
          value={values.isi}
          onChangeText={(t) => setField("isi", t)}
          multiline
          error={errors.isi}
        />
        <Select
          label="Prioritas"
          value={values.prioritas}
          onChange={(value) => setField("prioritas", value)}
          options={PRIORITAS_OPTIONS}
        />
        <Select
          label="Target Penerima"
          value={values.targetLevel}
          onChange={handleTargetLevelChange}
          options={PENGUMUMAN_TARGET_LEVEL_OPTIONS}
          error={errors.targetLevel}
        />

        {needsProvinsiKab ? (
          <>
            <Select
              label="Provinsi"
              value={values.provinsiWilId}
              onChange={(value) => setField("provinsiWilId", value)}
              options={provinsiOptions}
            />
            <Select
              label="Kabupaten/Kota"
              value={values.kabId}
              onChange={(value) => setField("kabId", value)}
              options={kabupatenOptions}
              disabled={!values.provinsiWilId}
              error={errors.kabId}
            />
          </>
        ) : null}

        {needsKecamatan ? (
          <Select
            label="Kecamatan"
            value={values.kecId}
            onChange={(value) => setField("kecId", value)}
            options={kecamatanOptions}
            disabled={!values.kabId}
            error={errors.kecId}
          />
        ) : null}

        {needsKelurahan ? (
          <Select
            label="Kelurahan/Desa"
            value={values.kelId}
            onChange={(value) => setField("kelId", value)}
            options={kelurahanOptions}
            disabled={!values.kecId}
            error={errors.kelId}
          />
        ) : null}

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button label="Kirim Pengumuman" variant="primary" loading={createMutation.isPending} onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}
