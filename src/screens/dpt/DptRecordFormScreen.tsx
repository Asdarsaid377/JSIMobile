import { useMemo, useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDptKecamatanList } from "@/hooks/useDptKecamatanList";
import { useDptKelurahanList } from "@/hooks/useDptKelurahanList";
import { useCreateDptRecord, useUpdateDptRecord } from "@/hooks/useDptRecordMutations";
import type { DptStackParamList } from "@/navigation/DptStack";

const JENIS_KELAMIN_OPTIONS = [
  { value: "L" as const, label: "Laki-laki" },
  { value: "P" as const, label: "Perempuan" },
];

// ⚠️ 2026-08-23 — field "Usia" DIHAPUS dari form ini (backend tidak punya field
// ini di DTO create/edit sama sekali — kirim apapun tidak tersimpan, selalu
// null untuk record baru, lihat api-standards.md § DPT & types/dpt.ts).
const dptRecordFormSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi."),
  jenisKelamin: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih." }),
  alamat: z.string().min(1, "Alamat wajib diisi."),
  rt: z.string().min(1, "RT wajib diisi."),
  rw: z.string().min(1, "RW wajib diisi."),
  idKec: z.coerce.number({ message: "Kecamatan wajib dipilih." }),
  idKel: z.coerce.number({ message: "Kelurahan/Desa wajib dipilih." }),
  noTps: z.coerce.number().int().min(1, "No. TPS wajib diisi."),
});

type FormValues = {
  nama: string;
  jenisKelamin: "L" | "P" | undefined;
  alamat: string;
  rt: string;
  rw: string;
  idKec: number | undefined;
  idKel: number | undefined;
  noTps: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// Form "+ Tambah Data DPT" / "Edit data pemilih" — dipakai untuk create DAN edit
// (pola sama `RivalAssessmentFormScreen`: route params bawa `record` → mode edit
// pre-filled). CRUD dasar (2026-08-22), mock data saja sesuai permintaan user —
// lihat services/dpt.ts & progress-tracker.md Decisions. Kecamatan/Kelurahan
// WAJIB dipilih dari hierarki DPT kabupaten ini (`useDptKecamatanList`/
// `useDptKelurahanList`, sama data dengan filter DptListScreen) — BUKAN
// free-text — supaya record baru konsisten kefilter benar oleh
// Kecamatan/Kelurahan di DptListScreen (yang match berdasar `idKec`/`idKel`,
// bukan nama). "Tandai partisipasi program" (field `sudahDtdoor`/`sudahGotv`)
// TIDAK ada di form ini — di luar scope sesi ini (permintaan eksplisit user),
// record baru selalu mulai `false`/`false` (lihat `createDptRecordMock`).
export function DptRecordFormScreen() {
  const route = useRoute<RouteProp<DptStackParamList, "DptRecordForm">>();
  const navigation = useNavigation<NativeStackNavigationProp<DptStackParamList>>();
  const { kabWilId, record } = route.params;
  const isEdit = record !== undefined;

  const createMutation = useCreateDptRecord(kabWilId);
  const updateMutation = useUpdateDptRecord(kabWilId);

  const [values, setValues] = useState<FormValues>(
    record
      ? {
          nama: record.nama,
          jenisKelamin: record.jenisKelamin,
          alamat: record.alamat ?? "",
          rt: record.rt,
          rw: record.rw,
          idKec: record.idKec,
          idKel: record.idKel,
          noTps: String(record.noTps),
        }
      : {
          nama: "",
          jenisKelamin: undefined,
          alamat: "",
          rt: "",
          rw: "",
          idKec: undefined,
          idKel: undefined,
          noTps: "",
        },
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const kecamatanQuery = useDptKecamatanList(kabWilId);
  const kelurahanQuery = useDptKelurahanList(kabWilId, values.idKec ?? null);

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

  function handleSubmit() {
    setSubmitError(null);

    const parsed = dptRecordFormSchema.safeParse(values);
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

    const namaKec = kecamatanQuery.data?.find((item) => item.wilId === parsed.data.idKec)?.nama;
    const namaKel = kelurahanQuery.data?.find((item) => item.wilId === parsed.data.idKel)?.nama;
    if (!namaKec || !namaKel) {
      setSubmitError("Kecamatan/Kelurahan tidak valid, coba pilih ulang.");
      return;
    }

    const input = {
      nama: parsed.data.nama,
      jenisKelamin: parsed.data.jenisKelamin,
      alamat: parsed.data.alamat,
      rt: parsed.data.rt,
      rw: parsed.data.rw,
      idKec: parsed.data.idKec,
      namaKec,
      idKel: parsed.data.idKel,
      namaKel,
      noTps: parsed.data.noTps,
      namaTps: String(parsed.data.noTps),
    };

    if (isEdit) {
      updateMutation.mutate(
        { ...input, id: record.id, idDpt: record.idDpt },
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
        <Input label="Nama Lengkap" value={values.nama} onChangeText={(t) => setField("nama", t)} error={errors.nama} />
        <Select
          label="Jenis Kelamin"
          value={values.jenisKelamin}
          onChange={(value) => setField("jenisKelamin", value)}
          options={JENIS_KELAMIN_OPTIONS}
          error={errors.jenisKelamin}
        />
        <Input label="Alamat" value={values.alamat} onChangeText={(t) => setField("alamat", t)} error={errors.alamat} />
        <Input label="RT" value={values.rt} onChangeText={(t) => setField("rt", t)} keyboardType="numeric" error={errors.rt} />
        <Input label="RW" value={values.rw} onChangeText={(t) => setField("rw", t)} keyboardType="numeric" error={errors.rw} />
        <Select
          label="Kecamatan"
          value={values.idKec}
          onChange={(value) => setField("idKec", value)}
          options={kecamatanOptions}
          error={errors.idKec}
        />
        <Select
          label="Kelurahan/Desa"
          value={values.idKel}
          onChange={(value) => setField("idKel", value)}
          options={kelurahanOptions}
          disabled={!values.idKec}
          error={errors.idKel}
        />
        <Input
          label="No. TPS"
          value={values.noTps}
          onChangeText={(t) => setField("noTps", t)}
          keyboardType="numeric"
          error={errors.noTps}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Data DPT"}
          variant="primary"
          loading={isSubmitting}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
