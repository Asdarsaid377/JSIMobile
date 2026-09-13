import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
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
import { useCreateTimsesMember, useDeleteTimsesMember, useUpdateTimsesRole } from "@/hooks/useTimsesMutations";
import { useAuth } from "@/hooks/useAuth";
import { ASSIGNABLE_ROLES, requiredWilayahLevel, ROLE_LABEL } from "@/lib/permissions";
import type { HomeStackParamList } from "@/navigation/HomeStack";
import type { Role } from "@/types/auth";
import type { TimsesMember } from "@/types/timses";

const JENIS_KELAMIN_OPTIONS = [
  { value: "L" as const, label: "Laki-laki" },
  { value: "P" as const, label: "Perempuan" },
];

const ROLE_OPTIONS = ASSIGNABLE_ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] }));

type FormValues = {
  nik: string;
  password: string;
  namaLengkap: string;
  jenisKelamin: "L" | "P" | undefined;
  roles: Role | undefined;
  provinsiWilId: number | undefined;
  kabId: number | undefined;
  kecId: number | undefined;
  kelId: number | undefined;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  nik: "",
  password: "",
  namaLengkap: "",
  jenisKelamin: undefined,
  roles: undefined,
  provinsiWilId: undefined,
  kabId: undefined,
  kecId: undefined,
  kelId: undefined,
};

export type TimsesFormParams = { member?: TimsesMember };

// "+ Tambah Anggota" (admin bikin akun relawan baru, POST /user) — 2026-08-25,
// DIBANGUN TANPA REFERENSI DESAIN (izin eksplisit user, Aturan #1 CLAUDE.md —
// tidak ada file di context/designs/ untuk form ini, pola sama beberapa form
// admin-only lain: BudgetPlafonScreen/RivalCalegFormScreen/
// QuickCountKandidatFormScreen). Ikut ui-rules.md + ui-tokens.md + struktur
// Input/Select/Button yang sudah ada, gaya visual konsisten dengan
// DptRecordFormScreen (form CRUD paling mirip: cascading wilayah Provinsi→
// Kabupaten→Kecamatan→Kelurahan reuse LANGSUNG hook `useDpt*List` yang sama
// dipakai DPT — supaya admin pilih wilayah dari NAMA asli, bukan ketik wilId
// mentah).
//
// 2026-08-26 — MODE EDIT ditambahkan (dipicu tap `TimsesMemberCard`, params
// `{ member }`, pola sama QuickCountKandidatFormScreen dual create/edit).
// Scope edit CUMA Role + Wilayah — `PATCH /user/:id` (`UpdateUserRoleDto`,
// verifikasi ulang backend 2026-08-26) memang cuma terima `roles`/`kabId`/
// `kecId`/`kelId`, TIDAK ADA `namaLengkap`/nik/password untuk admin mengubah
// akun ORANG LAIN (beda dari `POST /user/profile` yang self-edit) — field itu
// disembunyikan total di mode edit, bukan dibuat read-only, supaya tidak
// menjanjikan sesuatu yang tidak akan tersimpan.
//
// Blocker reverse-lookup wilId→nama TERKONFIRMASI ULANG masih ada (2026-08-26):
// `GET /kabupaten/details/:kabId` cuma dukung skema 2019 (`RdppKab`, tidak
// ada param `tahun`), dan `GET /kabupaten?tahun=2024` tidak expose `proKode`
// di attributes-nya — jadi TIDAK BISA prefill Provinsi/Kabupaten dari
// kabId/kecId/kelId tersimpan. Keputusan eksplisit user (2026-08-26): Select
// wilayah di mode edit mulai KOSONG (admin pilih ulang penuh dari Provinsi
// kalau mau GANTI wilayah); wilId lama ditampilkan mentah sebagai caption
// referensi di bawah Select "Posisi". Kalau admin tidak sentuh Select wilayah
// sama sekali, field itu TIDAK dikirim ke PATCH — backend mempertahankan
// kabId/kecId/kelId lama (`TimsesModel.update` cuma set field yang ada di
// body). Validasi submit pakai id EFEKTIF (nilai baru kalau dipilih, kalau
// tidak fallback ke id lama) supaya ganti role ke level yang SAMA (mis.
// timses→relawandesa, dua-duanya butuh kelId) tidak dipaksa pilih ulang
// wilayah padahal kelId lama sudah valid — tapi ganti ke level yang BUTUH id
// yang belum pernah ada (mis. relawankecamatan tanpa kelId → relawandesa)
// tetap wajib pilih wilayah baru.
//
// Field wilayah (kabId/kecId/kelId) muncul BERTAHAP sesuai
// `requiredWilayahLevel(role)` dari lib/permissions.ts — admin/adminsekret
// TIDAK butuh wilayah sama sekali (langsung disembunyikan begitu role itu
// dipilih), relawankabupaten cuma sampai Kabupaten, dst. — konsisten dengan
// scoping.helper.ts backend (kelId paling spesifik menang → kecId → kabId).
export function TimsesFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<RouteProp<HomeStackParamList, "TimsesForm">>();
  const { session } = useAuth();
  const { member } = route.params ?? {};
  const isEdit = member !== undefined;
  const isSelf = isEdit && session?.user.id === member.id;

  const createMutation = useCreateTimsesMember();
  const updateMutation = useUpdateTimsesRole();
  const deleteMutation = useDeleteTimsesMember();

  const [values, setValues] = useState<FormValues>(
    member ? { ...INITIAL_VALUES, roles: member.roles } : INITIAL_VALUES,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Anggota" : "Tambah Anggota" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const wilayahLevel = values.roles ? requiredWilayahLevel(values.roles) : null;
  const needsProvinsiKab = wilayahLevel !== null;
  const needsKecamatan = wilayahLevel === "kecamatan" || wilayahLevel === "desa";
  const needsKelurahan = wilayahLevel === "desa";

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

  function handleRoleChange(role: Role) {
    // Ganti role bisa mengubah level wilayah yang dibutuhkan — reset field
    // wilayah supaya tidak ada pilihan lama yang nyangkut tapi tersembunyi.
    setValues((prev) => ({
      ...prev,
      roles: role,
      provinsiWilId: undefined,
      kabId: undefined,
      kecId: undefined,
      kelId: undefined,
    }));
  }

  function handleSubmitCreate() {
    const schema = z
      .object({
        nik: z.string().min(1, "NIK wajib diisi."),
        password: z.string().min(6, "Password minimal 6 karakter."),
        namaLengkap: z.string().min(1, "Nama lengkap wajib diisi."),
        jenisKelamin: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih." }),
        roles: z.enum(ASSIGNABLE_ROLES as [Role, ...Role[]], { message: "Posisi wajib dipilih." }),
        kabId: z.number().optional(),
        kecId: z.number().optional(),
        kelId: z.number().optional(),
      })
      .superRefine((val, ctx) => {
        const level = requiredWilayahLevel(val.roles);
        if (level === "kabupaten" && !val.kabId) {
          ctx.addIssue({ code: "custom", path: ["kabId"], message: "Kabupaten wajib dipilih." });
        }
        if (level === "kecamatan" && !val.kecId) {
          ctx.addIssue({ code: "custom", path: ["kecId"], message: "Kecamatan wajib dipilih." });
        }
        if (level === "desa" && !val.kelId) {
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

    const level = requiredWilayahLevel(parsed.data.roles);
    createMutation.mutate(
      {
        nik: parsed.data.nik,
        password: parsed.data.password,
        namaLengkap: parsed.data.namaLengkap,
        jenisKelamin: parsed.data.jenisKelamin,
        roles: parsed.data.roles,
        kabId: level ? parsed.data.kabId : undefined,
        kecId: level === "kecamatan" || level === "desa" ? parsed.data.kecId : undefined,
        kelId: level === "desa" ? parsed.data.kelId : undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  // Mode edit: wilayah opsional — kalau admin tidak sentuh Select-nya (semua
  // undefined), kirim `undefined` supaya PATCH tidak mengubah kabId/kecId/
  // kelId lama. Validasi pakai id EFEKTIF (baru ?? lama) supaya ganti role ke
  // level yang SUDAH punya id lama valid tidak dipaksa pilih ulang. Lihat
  // catatan panjang di atas komponen ini untuk alasan lengkap.
  function handleSubmitEdit(current: TimsesMember) {
    const schema = z
      .object({
        roles: z.enum(ASSIGNABLE_ROLES as [Role, ...Role[]], { message: "Posisi wajib dipilih." }),
        kabId: z.number().optional(),
        kecId: z.number().optional(),
        kelId: z.number().optional(),
      })
      .superRefine((val, ctx) => {
        const level = requiredWilayahLevel(val.roles);
        const effectiveKabId = val.kabId ?? current.kabId ?? undefined;
        const effectiveKecId = val.kecId ?? current.kecId ?? undefined;
        const effectiveKelId = val.kelId ?? current.kelId ?? undefined;
        if (level === "kabupaten" && !effectiveKabId) {
          ctx.addIssue({ code: "custom", path: ["kabId"], message: "Kabupaten wajib dipilih." });
        }
        if (level === "kecamatan" && !effectiveKecId) {
          ctx.addIssue({ code: "custom", path: ["kecId"], message: "Kecamatan wajib dipilih." });
        }
        if (level === "desa" && !effectiveKelId) {
          ctx.addIssue({ code: "custom", path: ["kelId"], message: "Kelurahan/Desa wajib dipilih." });
        }
      });

    const parsed = schema.safeParse({ roles: values.roles, kabId: values.kabId, kecId: values.kecId, kelId: values.kelId });
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

    updateMutation.mutate(
      {
        id: current.id,
        input: {
          roles: parsed.data.roles,
          kabId: parsed.data.kabId,
          kecId: parsed.data.kecId,
          kelId: parsed.data.kelId,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  function handleSubmit() {
    setSubmitError(null);
    if (isEdit && member) {
      handleSubmitEdit(member);
    } else {
      handleSubmitCreate();
    }
  }

  // Backend (DELETE /user/:id) juga menolak (422) hapus akun sendiri —
  // `isSelf` di sini cuma UX preventif (sembunyikan tombol) supaya admin
  // tidak perlu menabrak error itu dulu.
  function handleDelete() {
    if (!member) return;
    Alert.alert("Hapus anggota?", `"${member.namaLengkap}" akan dihapus permanen dari daftar timses.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(member.id, {
            onSuccess: () => navigation.goBack(),
            onError: (error) => Alert.alert("Gagal menghapus", error.message),
          });
        },
      },
    ]);
  }

  const wilayahRefParts: string[] = [];
  if (member?.kabId) wilayahRefParts.push(`Kabupaten #${member.kabId}`);
  if (member?.kecId) wilayahRefParts.push(`Kecamatan #${member.kecId}`);
  if (member?.kelId) wilayahRefParts.push(`Kelurahan #${member.kelId}`);

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {isEdit ? (
          <Text className="text-body-md font-semibold text-text-primary">
            Ubah role & wilayah untuk {member?.namaLengkap}
          </Text>
        ) : null}
        {isEdit ? (
          <Text className="text-caption text-text-muted">
            Nama, NIK, dan password tidak bisa diubah dari sini — hanya posisi & wilayah tugas.
          </Text>
        ) : null}

        {!isEdit ? (
          <>
            <Input label="NIK" value={values.nik} onChangeText={(t) => setField("nik", t)} error={errors.nik} />
            <Input
              label="Password"
              value={values.password}
              onChangeText={(t) => setField("password", t)}
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Nama Lengkap"
              value={values.namaLengkap}
              onChangeText={(t) => setField("namaLengkap", t)}
              error={errors.namaLengkap}
            />
            <Select
              label="Jenis Kelamin"
              value={values.jenisKelamin}
              onChange={(value) => setField("jenisKelamin", value)}
              options={JENIS_KELAMIN_OPTIONS}
              error={errors.jenisKelamin}
            />
          </>
        ) : null}
        <Select
          label="Posisi"
          value={values.roles}
          onChange={handleRoleChange}
          options={ROLE_OPTIONS}
          error={errors.roles}
        />

        {isEdit && needsProvinsiKab ? (
          <Text className="text-caption text-text-muted">
            {wilayahRefParts.length > 0
              ? `Wilayah saat ini (ID mentah, nama belum bisa ditampilkan): ${wilayahRefParts.join(", ")}. Biarkan kosong di bawah untuk mempertahankan wilayah ini, atau pilih ulang untuk mengganti.`
              : "Belum ada wilayah tersimpan untuk akun ini — wajib dipilih di bawah."}
          </Text>
        ) : null}

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

        <Button
          label={isEdit ? "Simpan Perubahan" : "Simpan Anggota"}
          variant="primary"
          loading={isEdit ? updateMutation.isPending : createMutation.isPending}
          onPress={handleSubmit}
        />

        {isEdit && !isSelf ? (
          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="min-h-[44px] items-center justify-center rounded-lg border border-danger px-lg py-sm active:opacity-80"
          >
            <Text className="text-body-md font-bold text-danger">Hapus Anggota</Text>
          </Pressable>
        ) : null}
        {isSelf ? (
          <Text className="text-caption text-text-muted">Tidak bisa menghapus akun sendiri.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
