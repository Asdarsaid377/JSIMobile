import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

import { GpsStatusBanner } from "@/components/auth/GpsStatusBanner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocationPermission } from "@/hooks/useLocationPermission";
import { useLogin } from "@/hooks/useLogin";
import { isMockApiEnabled } from "@/lib/api/mock";

const loginSchema = z.object({
  nik: z.string().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

type FormErrors = Partial<Record<"nik" | "password", string>>;

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { status: locationStatus, coords } = useLocationPermission();
  const loginMutation = useLogin();

  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit() {
    setSubmitError(null);

    const parsed = loginSchema.safeParse({ nik, password });
    if (!parsed.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "nik" || key === "password") {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (locationStatus !== "granted" || !coords) {
      setSubmitError("Mohon aktifkan GPS anda terlebih dahulu untuk login");
      return;
    }

    loginMutation.mutate(
      { nik: parsed.data.nik, password: parsed.data.password, location: coords },
      { onError: (error) => setSubmitError(error.message) },
    );
  }

  return (
    <View className="flex-1 bg-surface-inverse">
      <StatusBar style="light" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingTop: insets.top + 64 }} className="items-center gap-xs px-margin-mobile pb-xl">
            <Text className="text-headline-lg font-bold text-text-inverse">JSI</Text>
            <Text className="text-center text-body-md text-text-inverse-muted">
              Aplikasi Kampanye & Pemenangan Pemilu
            </Text>
          </View>

          <View
            className="flex-1 gap-md rounded-t-xl bg-background px-margin-mobile pt-lg"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <Text className="text-headline-md font-semibold text-text-primary">Masuk ke akun</Text>

            {isMockApiEnabled() ? (
              <View className="gap-xs rounded-lg bg-accent-soft p-md">
                <Text className="text-label-md font-semibold text-accent">Mode demo aktif</Text>
                <Text className="text-caption text-text-secondary">
                  Backend production belum bisa diakses (lihat api-standards.md § Mock Mode). Pakai salah satu akun
                  demo: {"\n"}• admin.jsi / admin123 (role admin){"\n"}• yayat.hidayat / timses123 (role timses)
                </Text>
              </View>
            ) : null}

            <Input
              label="Username"
              placeholder="yayat.hidayat"
              autoCapitalize="none"
              autoCorrect={false}
              value={nik}
              onChangeText={setNik}
              error={errors.nik}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              rightElement={
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <Text className="text-label-md font-medium text-accent">{showPassword ? "Sembunyikan" : "Lihat"}</Text>
                </Pressable>
              }
            />

            <View className="flex-row items-center justify-between">
              <Pressable
                className="flex-row items-center gap-xs"
                onPress={() => setRememberMe((v) => !v)}
                hitSlop={8}
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded border ${
                    rememberMe ? "border-accent bg-accent" : "border-border bg-surface"
                  }`}
                >
                  {rememberMe ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
                </View>
                <Text className="text-body-md text-text-primary">Ingat saya</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Segera hadir", "Fitur lupa password belum tersedia.")}
                hitSlop={8}
              >
                <Text className="text-label-md font-medium text-accent">Lupa password?</Text>
              </Pressable>
            </View>

            <GpsStatusBanner status={locationStatus} />

            {submitError ? <Text className="text-body-md text-danger">{submitError}</Text> : null}

            <Button
              label="Masuk"
              variant="brand"
              loading={loginMutation.isPending}
              disabled={locationStatus !== "granted"}
              onPress={handleSubmit}
            />

            <Text className="text-center text-caption text-text-muted">v1.0.0 · JSI Mobile</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
