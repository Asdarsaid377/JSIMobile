import { Text, View } from "react-native";

type Props = {
  roleLabel: string;
  // Level scope paling spesifik yang di-assign admin ke akun ini (dari
  // kabId/kecId/kelId di TimsesProfile) — null kalau belum di-assign sama
  // sekali (lihat commons/helpers/scope.helper.ts backend: requester tanpa
  // wilayah sengaja TIDAK dibatasi, bukan berarti scope-nya "kabupaten").
  scopeLevel: "kelurahan" | "kecamatan" | "kabupaten" | null;
};

const SCOPE_LABEL: Record<NonNullable<Props["scopeLevel"]>, string> = {
  kelurahan: "1 kelurahan/desa",
  kecamatan: "1 kecamatan",
  kabupaten: "1 kabupaten",
};

// 2026-08-25 — RBAC: scoping wilayah SEKARANG sungguhan ditegakkan
// server-side (lihat api-standards.md § RBAC) — pesan di sini jujur soal
// levelnya, TAPI tidak menyebut nama wilayah (kabId/kecId/kelId numerik,
// belum ada cara resolve ke nama tanpa endpoint tambahan, lihat
// progress-tracker.md Decisions).
export function AccessScopeNotice({ roleLabel, scopeLevel }: Props) {
  return (
    <View className="rounded-lg border border-border bg-surface p-md">
      <Text className="text-body-md text-text-secondary">
        Akses Anda sebagai <Text className="font-semibold text-text-primary">{roleLabel}</Text>{" "}
        {scopeLevel ? (
          <>
            dibatasi ke <Text className="font-semibold text-text-primary">{SCOPE_LABEL[scopeLevel]}</Text> yang
            ditugaskan admin.
          </>
        ) : (
          "belum dibatasi per wilayah (admin belum menugaskan wilayah ke akun ini)."
        )}
      </Text>
    </View>
  );
}
