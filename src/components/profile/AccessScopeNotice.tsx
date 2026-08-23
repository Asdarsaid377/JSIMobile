import { Text, View } from "react-native";

type Props = {
  roleLabel: string;
};

// 2026-08-23: prop `wilayahLabel`/`isAdmin` DIHAPUS — data kecamatan/wilayah
// tugas sudah tidak ada di backend (lihat types/profile.ts), jadi pembatasan
// akses per-wilayah SEMENTARA tidak bisa ditegakkan untuk role manapun.
// Pesan diubah supaya jujur ("belum dibatasi per wilayah untuk sementara"),
// BUKAN mengklaim non-admin punya akses admin.
export function AccessScopeNotice({ roleLabel }: Props) {
  return (
    <View className="rounded-lg border border-border bg-surface p-md">
      <Text className="text-body-md text-text-secondary">
        Akses Anda sebagai <Text className="font-semibold text-text-primary">{roleLabel}</Text> saat ini belum
        dibatasi per wilayah (data wilayah tugas belum tersedia dari server) — akan diaktifkan kembali begitu
        tersedia.
      </Text>
    </View>
  );
}
