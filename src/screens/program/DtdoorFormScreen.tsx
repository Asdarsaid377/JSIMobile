import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { useCreateDtdoor } from "@/hooks/useCreateDtdoor";
import { useDtdoorLookups } from "@/hooks/useDtdoorLookups";
import { useMarkDptDtdoor } from "@/hooks/useDptRecordMutations";
import { JENIS_KELAMIN_OPTIONS } from "@/types/dtdoor";
import type { JenisKelamin } from "@/types/dtdoor";
import type { DptRecord } from "@/types/dpt";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

// Verifikasi kunjungan / anti-fraud (backend modul `antifraud`, 2026-08-25):
// GPS diambil diam-diam saat submit (best-effort, TIDAK memblokir simpan kalau
// izin ditolak/GPS mati — backend menandai "GPS nonaktif" otomatis, itu SINYAL
// yang memang ingin ditangkap, bukan error), foto WAJIB diambil langsung dari
// kamera in-app (bukan galeri — enforcement di titik input, konsisten dengan
// teks "wajib GPS-stamp, foto" di AntiFraudScreen).
async function ambilGpsSaatIni(): Promise<{ lat: number; long: number } | undefined> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) return undefined;
    const position = await Location.getCurrentPositionAsync();
    return { lat: position.coords.latitude, long: position.coords.longitude };
  } catch (error) {
    console.error("[DtdoorFormScreen/ambilGpsSaatIni]", error);
    return undefined;
  }
}

// Screen ini di-mount dari 2 stack berbeda: ProgramStack (entri standalone,
// route params undefined) DAN DptStack (fitur "Form Door To Door terintegrasi
// DPT", 2026-08-22 — route params bawa dptRecord terpilih). Param list lokal
// minimal supaya component tidak terikat ke salah satu stack (lihat
// DptStack.tsx & ProgramStack.tsx — nama route "DtdoorForm" didaftarkan di
// keduanya, component yang sama persis di-reuse, bukan duplikat).
export type DtdoorFormParams = {
  dptRecord?: DptRecord;
  kabWilId?: number;
  kabNama?: string;
};
type DtdoorFormRouteParamList = { DtdoorForm: DtdoorFormParams | undefined };

// 2026-08-23: schema form ditulis ulang total mengikuti kontrak backend baru
// (lihat services/dtdoor.ts & api-standards.md § dtdoor) — hampir semua field
// top-level sekarang WAJIB (dikonfirmasi live via curl POST /dtdoor body
// kosong), dan kategori/program bantuan pindah jadi 1 "Kunjungan" nested
// (bukan lagi field top-level bebas). Field yang dipakai persis mengikuti
// FormDataKunjungan2024.jsx (modal Input Door To Door di halaman DPT list
// web) — cuma 1 kunjungan per submit (bukan multi seperti web) untuk
// menyederhanakan, sesuai instruksi user "form add dtd di halaman dtd itu
// sendiri dulu" (linkage DPT penuh masih menyusul, lihat progress-tracker.md).
const dtdoorFormSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi."),
  nik: z.string().min(1, "NIK wajib diisi."),
  jenisKelamin: z.enum(["L", "P"], { message: "Jenis kelamin wajib dipilih." }),
  jumlahWajibPilih: z.coerce.number().int().min(0, "Jumlah wajib pilih tidak valid."),
  noTelpon: z.string().optional(),
  tps: z.string().min(1, "TPS wajib diisi."),
  rt: z.string().min(1, "RT wajib diisi."),
  rw: z.string().min(1, "RW wajib diisi."),
  desa: z.string().min(1, "Desa wajib diisi."),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi."),
  kabupaten: z.string().min(1, "Kabupaten wajib diisi."),
  tipePemilihId: z.number({ message: "Tipe pemilih wajib dipilih." }).min(1, "Tipe pemilih wajib dipilih."),
  pilihanPilegId: z.number({ message: "Pilihan pileg wajib dipilih." }).min(1, "Pilihan pileg wajib dipilih."),
  programBantuanId: z
    .number({ message: "Program bantuan wajib dipilih." })
    .min(1, "Program bantuan wajib dipilih."),
  merchendise: z.string().min(1, "Merchandise wajib diisi."),
  namaRelawan: z.string().min(1, "Nama relawan wajib diisi."),
  kontakRelawan: z.string().optional(),
});

type FormValues = {
  namaLengkap: string;
  nik: string;
  jenisKelamin: JenisKelamin | undefined;
  jumlahWajibPilih: string;
  noTelpon: string;
  tps: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  tipePemilihId: number | undefined;
  pilihanPilegId: number | undefined;
  programBantuanId: number | undefined;
  merchendise: string;
  namaRelawan: string;
  kontakRelawan: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

export function DtdoorFormScreen() {
  const { session } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<DtdoorFormRouteParamList, "DtdoorForm">>();
  const route = useRoute<RouteProp<DtdoorFormRouteParamList, "DtdoorForm">>();
  const { dptRecord, kabWilId } = route.params ?? {};
  const createMutation = useCreateDtdoor();
  const lookupsQuery = useDtdoorLookups();
  // kabWilId cuma ada kalau screen ini dibuka dari DptStack (dptRecord juga
  // pasti ada bareng — lihat DptListScreen.tsx). Hook dipanggil unconditional
  // (Rules of Hooks) tapi mutation-nya cuma dipakai kalau dptRecord ada.
  const markDtdoorMutation = useMarkDptDtdoor(kabWilId ?? -1);

  const [values, setValues] = useState<FormValues>({
    namaLengkap: dptRecord?.nama ?? "",
    nik: dptRecord?.nik ?? "",
    jenisKelamin: dptRecord?.jenisKelamin,
    jumlahWajibPilih: "2",
    noTelpon: "",
    tps: dptRecord?.namaTps ?? "",
    rt: dptRecord?.rt ?? "",
    rw: dptRecord?.rw ?? "",
    desa: dptRecord?.namaKel ?? "",
    kecamatan: dptRecord?.namaKec ?? "",
    kabupaten: route.params?.kabNama ?? "",
    tipePemilihId: undefined,
    pilihanPilegId: undefined,
    programBantuanId: undefined,
    merchendise: "",
    namaRelawan: session?.user.namaLengkap ?? "",
    kontakRelawan: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState<string | null>(null);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAmbilFoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Izin kamera diperlukan", "Aktifkan izin kamera untuk verifikasi foto kunjungan.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7, allowsEditing: false });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setFotoUri(result.assets[0].uri);
      setFotoError(null);
    }
  }

  async function handleSubmit() {
    setSubmitError(null);

    const parsed = dtdoorFormSchema.safeParse({
      ...values,
      noTelpon: values.noTelpon || undefined,
      kontakRelawan: values.kontakRelawan || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined;
        if (key) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (!fotoUri) {
      setFotoError("Foto kunjungan wajib diambil dari kamera sebelum menyimpan.");
      return;
    }
    setFotoError(null);

    const gps = await ambilGpsSaatIni();

    createMutation.mutate(
      {
        input: {
          namaLengkap: parsed.data.namaLengkap,
          nik: parsed.data.nik,
          jenisKelamin: parsed.data.jenisKelamin,
          jumlahWajibPilih: parsed.data.jumlahWajibPilih,
          noTelpon: parsed.data.noTelpon,
          tps: parsed.data.tps,
          rt: parsed.data.rt,
          rw: parsed.data.rw,
          desa: parsed.data.desa,
          kecamatan: parsed.data.kecamatan,
          kabupaten: parsed.data.kabupaten,
          kunjungans: [
            {
              tipePemilihId: parsed.data.tipePemilihId,
              pilihanPilegId: parsed.data.pilihanPilegId,
              programBantuanId: parsed.data.programBantuanId,
              merchendise: parsed.data.merchendise,
              namaRelawan: parsed.data.namaRelawan,
              kontakRelawan: parsed.data.kontakRelawan,
              timsesId: session?.user.id,
              lat: gps?.lat,
              long: gps?.long,
            },
          ],
          // dptRecord.idDpt bisa null (record DPT yang dibuat lewat app ini,
          // backend tidak pernah mengisi kolom idDpt untuk create — lihat
          // api-standards.md § DPT) — kalau null, fallback ke idDpt sintetis
          // standalone (createDtdoor() sudah handle default itu sendiri).
          ...(dptRecord && dptRecord.idDpt !== null
            ? { idDpt: dptRecord.idDpt, kabId: kabWilId, kelId: dptRecord.idKel }
            : {}),
        },
        foto: { uri: fotoUri, fotoSumber: "kamera" },
      },
      {
        onSuccess: () => {
          // Terhubung ke DPT → tandai sudahDtdoor=true di record itu juga (lihat
          // services/dpt.ts § markDptDtdoor). Gagal-tandai tidak menghalangi
          // navigasi balik — kunjungan Dtdoor-nya sendiri sudah tersimpan.
          if (dptRecord && kabWilId !== undefined) {
            markDtdoorMutation.mutate(dptRecord.id);
          }
          navigation.goBack();
        },
        onError: (error) => setSubmitError(error.message),
      },
    );
  }

  if (lookupsQuery.isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (lookupsQuery.isError || !lookupsQuery.data) {
    return (
      <SafeAreaView edges={["bottom"]} className="flex-1 items-center justify-center gap-md bg-background px-margin-mobile">
        <Text className="text-center text-body-md text-text-secondary">Gagal memuat pilihan kunjungan.</Text>
        <Button label="Coba Lagi" variant="secondary" onPress={() => void lookupsQuery.refetch()} />
      </SafeAreaView>
    );
  }

  const { tipePemilih, pilihanPileg, programBantuan } = lookupsQuery.data;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Input
          label="Nama Lengkap"
          value={values.namaLengkap}
          onChangeText={(t) => setField("namaLengkap", t)}
          error={errors.namaLengkap}
        />
        <Input
          label="NIK"
          value={values.nik}
          onChangeText={(t) => setField("nik", t)}
          keyboardType="numeric"
          error={errors.nik}
        />
        <Select
          label="Jenis Kelamin"
          value={values.jenisKelamin}
          onChange={(v) => setField("jenisKelamin", v)}
          options={JENIS_KELAMIN_OPTIONS}
          error={errors.jenisKelamin}
        />
        <Input
          label="Jumlah Wajib Pilih"
          value={values.jumlahWajibPilih}
          onChangeText={(t) => setField("jumlahWajibPilih", t)}
          keyboardType="numeric"
          error={errors.jumlahWajibPilih}
        />
        <Input
          label="No. Telpon"
          value={values.noTelpon}
          onChangeText={(t) => setField("noTelpon", t)}
          keyboardType="phone-pad"
        />
        <Input label="TPS" value={values.tps} onChangeText={(t) => setField("tps", t)} error={errors.tps} />
        <Input label="RT" value={values.rt} onChangeText={(t) => setField("rt", t)} keyboardType="numeric" error={errors.rt} />
        <Input label="RW" value={values.rw} onChangeText={(t) => setField("rw", t)} keyboardType="numeric" error={errors.rw} />
        <Input label="Desa" value={values.desa} onChangeText={(t) => setField("desa", t)} error={errors.desa} />
        <Input
          label="Kecamatan"
          value={values.kecamatan}
          onChangeText={(t) => setField("kecamatan", t)}
          error={errors.kecamatan}
        />
        <Input
          label="Kabupaten"
          value={values.kabupaten}
          onChangeText={(t) => setField("kabupaten", t)}
          error={errors.kabupaten}
        />

        <View className="gap-xs pt-sm">
          <Text className="text-label-lg font-semibold text-text-primary">Kunjungan</Text>
        </View>
        <Select
          label="Tipe Pemilih"
          value={values.tipePemilihId}
          onChange={(v) => setField("tipePemilihId", v)}
          options={tipePemilih.map((option) => ({ value: option.id, label: option.nama }))}
          error={errors.tipePemilihId}
        />
        <Select
          label="Pilihan Pileg"
          value={values.pilihanPilegId}
          onChange={(v) => setField("pilihanPilegId", v)}
          options={pilihanPileg.map((option) => ({ value: option.id, label: option.nameKategori }))}
          error={errors.pilihanPilegId}
        />
        <Select
          label="Program Bantuan"
          value={values.programBantuanId}
          onChange={(v) => setField("programBantuanId", v)}
          options={programBantuan.map((option) => ({ value: option.id, label: option.nama }))}
          error={errors.programBantuanId}
        />
        <Input
          label="Merchandise"
          value={values.merchendise}
          onChangeText={(t) => setField("merchendise", t)}
          error={errors.merchendise}
        />
        <Input
          label="Nama Relawan"
          value={values.namaRelawan}
          onChangeText={(t) => setField("namaRelawan", t)}
          error={errors.namaRelawan}
        />
        <Input
          label="Kontak Relawan"
          value={values.kontakRelawan}
          onChangeText={(t) => setField("kontakRelawan", t)}
          keyboardType="phone-pad"
        />

        <View className="gap-xs pt-sm">
          <Text className="text-label-lg font-semibold text-text-primary">Foto Kunjungan (Verifikasi)</Text>
          <Text className="text-caption text-text-muted">
            Wajib diambil langsung dari kamera saat kunjungan berlangsung, bukan dari galeri.
          </Text>
        </View>
        {fotoUri ? (
          <View className="gap-xs">
            <Image source={{ uri: fotoUri }} style={{ height: 160, width: "100%", borderRadius: 12 }} />
            <Pressable onPress={() => void handleAmbilFoto()} className="self-start">
              <Text className="text-body-md font-semibold text-accent">Ambil Ulang</Text>
            </Pressable>
          </View>
        ) : (
          <Button label="📷 Ambil Foto Kunjungan" variant="secondary" onPress={() => void handleAmbilFoto()} />
        )}
        {fotoError ? <Text className="text-body-md text-danger">{fotoError}</Text> : null}

        {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

        <Button
          label="Simpan Kunjungan"
          variant="primary"
          loading={createMutation.isPending}
          onPress={() => void handleSubmit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
