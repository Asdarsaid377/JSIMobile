import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { AccessScopeNotice } from "@/components/profile/AccessScopeNotice";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { useAuth } from "@/hooks/useAuth";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { ROLE_LABEL } from "@/lib/permissions";
import type { TimsesProfile } from "@/types/profile";

function scopeLevelOf(profile: TimsesProfile): "kelurahan" | "kecamatan" | "kabupaten" | null {
  if (profile.kelId) return "kelurahan";
  if (profile.kecId) return "kecamatan";
  if (profile.kabId) return "kabupaten";
  return null;
}

const profileSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi."),
});

type FormErrors = Partial<Record<"namaLengkap", string>>;

// 2026-08-23: field "No. HP" & "Wilayah Tugas" DIHAPUS dari screen ini —
// backend baru (`user` module, lihat services/profile.ts) tidak punya kolom
// no_telpon/kecamatan/desa/dusun sama sekali (bukan cuma belum di-map).
// Badge role sekarang cuma tampilkan role, tanpa wilayah (dulu
// "TIMSES · KEC. CILEUNYI", sekarang "TIMSES" saja).
export function ProfileScreen() {
  const { session, logout } = useAuth();
  const { data: profile, isLoading, isError, isRefetching, refetch } = useProfile();
  const updateMutation = useUpdateProfile(session?.user.id ?? -1);
  const { status: locationStatus } = useLocationPermission();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [notifikasiAktif, setNotifikasiAktif] = useState(true);

  useEffect(() => {
    if (profile && !initialized) {
      setNamaLengkap(profile.namaLengkap);
      setInitialized(true);
    }
  }, [profile, initialized]);

  if (!session) {
    return null;
  }

  const roleLabel = ROLE_LABEL[session.user.roles];

  function handleSave() {
    setSubmitError(null);
    setSubmitSuccess(false);

    const parsed = profileSchema.safeParse({ namaLengkap });
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "namaLengkap") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    updateMutation.mutate(parsed.data, {
      onError: (error) => setSubmitError(error.message),
      onSuccess: () => setSubmitSuccess(true),
    });
  }

  function handleLogout() {
    Alert.alert("Keluar dari akun?", "Anda perlu login kembali untuk mengakses aplikasi.", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: () => void logout() },
    ]);
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 items-center justify-center gap-md bg-background px-margin-mobile">
        <Text className="text-center text-body-md text-text-secondary">Gagal memuat data profil.</Text>
        <Button label="Coba Lagi" variant="secondary" onPress={() => void refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      >
        <View className="gap-md px-margin-mobile pt-sm">
          <Text className="text-headline-md font-semibold text-text-primary">Profil Saya</Text>

          <View className="items-center gap-sm">
            <ProfileAvatar namaLengkap={profile.namaLengkap} />
            <Text className="text-body-lg font-semibold text-text-primary">{profile.namaLengkap}</Text>
            <Badge label={roleLabel.toUpperCase()} variant="accent" />
          </View>

          <Input label="Nama Lengkap" value={namaLengkap} onChangeText={setNamaLengkap} error={errors.namaLengkap} />

          <Input label="Email" value="" editable={false} placeholder="Belum didukung backend" />

          {submitSuccess ? <Text className="text-body-md text-success">Perubahan tersimpan.</Text> : null}
          {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

          <Button label="Simpan Perubahan" variant="primary" loading={updateMutation.isPending} onPress={handleSave} />

          <View className="rounded-lg border border-border bg-surface">
            <View className="flex-row items-center justify-between p-md">
              <Text className="text-body-md text-text-primary">Notifikasi</Text>
              <Switch value={notifikasiAktif} onValueChange={setNotifikasiAktif} />
            </View>
            <View className="h-px bg-border" />
            <View className="gap-xs p-md">
              <View className="flex-row items-center justify-between">
                <Text className="text-body-md text-text-primary">Lokasi GPS Aktif</Text>
                <Switch value={locationStatus === "granted"} disabled />
              </View>
              <Text className="text-caption text-text-muted">
                GPS wajib aktif selama menggunakan aplikasi, tidak dapat dimatikan.
              </Text>
            </View>
          </View>

          <AccessScopeNotice roleLabel={roleLabel} scopeLevel={scopeLevelOf(profile)} />

          <Button label="Keluar" variant="secondary" onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
