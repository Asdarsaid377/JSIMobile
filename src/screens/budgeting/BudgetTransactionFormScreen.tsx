import { useState } from "react";
import { ScrollView, Text } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBudgetTransaction } from "@/hooks/useBudgeting";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import { BUDGET_POS_OPTIONS, BUDGET_POS_VALUES } from "@/types/budgeting";
import type { BudgetPosName } from "@/types/budgeting";

const budgetTransactionFormSchema = z.object({
  pos: z.enum(BUDGET_POS_VALUES, { message: "Pos anggaran wajib dipilih." }),
  nominal: z.coerce.number().int().min(1, "Nominal wajib diisi."),
  keterangan: z.string().min(1, "Keterangan wajib diisi."),
});

type FormValues = { pos: BudgetPosName | undefined; nominal: string; keterangan: string };
type FormErrors = Partial<Record<"pos" | "nominal" | "keterangan", string>>;

// Form "Catat Pengeluaran" — pola sama persis RivalCalegFormScreen/SaksiFormScreen
// (zod schema + Input/Select + Button), PUSHED SCREEN dengan native header
// (bukan bottom sheet seperti context/designs/budgeting-kampanye.dc.html) —
// lihat komentar di BudgetingKampanyeScreen.tsx untuk alasan deviasi ini.
// Field "Lampirkan bukti/nota" di canvas SENGAJA di-skip — upload file asli di
// luar scope sesi ini, belum ada keputusan storage untuk lampiran.
export function BudgetTransactionFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { session } = useAuth();
  const createMutation = useCreateBudgetTransaction(session?.user.namaLengkap ?? "-");

  const [values, setValues] = useState<FormValues>({ pos: undefined, nominal: "", keterangan: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    setSubmitError(null);

    const parsed = budgetTransactionFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormErrors | undefined;
        if (key) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    createMutation.mutate(
      { pos: parsed.data.pos, nominal: parsed.data.nominal, keterangan: parsed.data.keterangan },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Select
          label="Pos Anggaran"
          value={values.pos}
          onChange={(value) => setField("pos", value)}
          options={BUDGET_POS_OPTIONS}
          error={errors.pos}
        />
        <Input
          label="Nominal (Rp)"
          value={values.nominal}
          onChangeText={(t) => setField("nominal", t)}
          keyboardType="numeric"
          error={errors.nominal}
        />
        <Input
          label="Keterangan"
          value={values.keterangan}
          onChangeText={(t) => setField("keterangan", t)}
          multiline
          error={errors.keterangan}
        />

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label="Simpan Pengeluaran"
          variant="primary"
          loading={createMutation.isPending}
          onPress={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
