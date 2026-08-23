import { Alert, Pressable, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RekapStackParamList } from "@/navigation/RekapStack";

function handleNotImplemented(): void {
  Alert.alert("Segera hadir", "Alur DPRD Provinsi & DPRD Kabupaten menyusul sesi berikutnya.");
}

// Referensi: artboard "4 · HASIL REKAP" di project Claude Design user +
// hierarki navigasi 2024 diobservasi langsung dari
// `client/src/pages/hasilrekap2024/HasilRekap2024Routes.jsx` (permintaan
// eksplisit user "ikuti tahapan yang ada di web", lalu "tiru yang 2024
// saja"). Toggle tahun 2019/2024 di desain SENGAJA DIHAPUS — scope sesi ini
// cuma 2024 (bukan toggle ke state kosong). Dari 3 chip tipe di desain, cuma
// **DPR RI** yang fungsional sesi ini (user pilih "1 tipe dulu — DPR RI" saat
// ditanya) — DPRD Provinsi/DPRD Kabupaten `Alert` "Segera hadir", menyusul
// sesi berikutnya (lihat progress-tracker.md Decisions).
export function HasilRekapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RekapStackParamList>>();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="gap-md px-margin-mobile pt-sm">
        <Text className="text-headline-md font-semibold text-text-primary">Hasil Rekap</Text>
        <Text className="text-caption text-text-muted">Data resmi hasil rekapitulasi Pemilu 2024</Text>

        <View className="gap-sm">
          <Pressable
            onPress={() => navigation.navigate("HasilRekapDapil")}
            className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
          >
            <View className="gap-xs">
              <Text className="text-body-md font-semibold text-text-primary">DPR RI</Text>
              <Text className="text-caption text-text-muted">Rekap per Dapil → Kabupaten → Kecamatan → Kelurahan</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleNotImplemented}
            className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
          >
            <View className="gap-xs">
              <Text className="text-body-md font-semibold text-text-primary">DPRD Provinsi</Text>
              <Text className="text-caption text-text-muted">Segera hadir</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleNotImplemented}
            className="flex-row items-center justify-between gap-sm rounded-lg border border-border bg-surface p-md active:opacity-80"
          >
            <View className="gap-xs">
              <Text className="text-body-md font-semibold text-text-primary">DPRD Kabupaten</Text>
              <Text className="text-caption text-text-muted">Segera hadir</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
