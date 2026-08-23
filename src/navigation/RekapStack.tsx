import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HasilRekapDapilScreen } from "@/screens/hasilrekap/HasilRekapDapilScreen";
import { HasilRekapDetailScreen } from "@/screens/hasilrekap/HasilRekapDetailScreen";
import { HasilRekapKabupatenScreen } from "@/screens/hasilrekap/HasilRekapKabupatenScreen";
import { HasilRekapKecamatanScreen } from "@/screens/hasilrekap/HasilRekapKecamatanScreen";
import { HasilRekapKelurahanScreen } from "@/screens/hasilrekap/HasilRekapKelurahanScreen";
import { HasilRekapScreen } from "@/screens/hasilrekap/HasilRekapScreen";

export type RekapStackParamList = {
  HasilRekap: undefined;
  HasilRekapDapil: undefined;
  HasilRekapKabupaten: { dapilId: number; dapilNama: string };
  HasilRekapKecamatan: { dapilId: number; dapilNama: string; kabupatenId: number; kabupatenNama: string };
  HasilRekapKelurahan: {
    dapilId: number;
    dapilNama: string;
    kabupatenId: number;
    kabupatenNama: string;
    kecamatanId: number;
    kecamatanNama: string;
  };
  HasilRekapDetail: {
    dapilId: number;
    dapilNama: string;
    kabupatenId: number;
    kabupatenNama: string;
    kecamatanId: number;
    kecamatanNama: string;
    kelurahanId: number;
    kelurahanNama: string;
  };
};

const Stack = createNativeStackNavigator<RekapStackParamList>();

// Feature 09 (Hasil Rekap) — root tab "Rekap" (dipakai bersama AdminTabs &
// TimsesTabs, pola sama DptStack/ProgramStack). SCOPE SESI INI: cuma tipe
// **DPR RI 2024** (permintaan eksplisit user "ikuti tahapan yang ada di
// web", lalu "tiru yang 2024 saja", lalu "1 tipe dulu — DPR RI" saat
// ditanya scope) — DPRD Provinsi/DPRD Kabupaten dipilih user dari
// `HasilRekapScreen` tapi `Alert` "Segera hadir", menyusul sesi berikutnya.
// 5 level drill DPR RI (Dapil→Kabupaten→Kecamatan→Kelurahan, terminal di
// Kelurahan) sesuai route param DPR RI 2024 di web (`HasilRekap2024Routes.jsx`)
// — lihat types/hasilrekap.ts & ui-registry.md untuk detail lengkap adaptasi
// tiap screen. Nama field param mengikuti gaya screen serupa (TargetSuara*/
// RealCount* di DptStack.tsx) — nama wilayah dibawa lewat route params
// (bukan re-fetch) supaya breadcrumb/title tiap level bisa langsung dipakai.
export function RekapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HasilRekap" component={HasilRekapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HasilRekapDapil" component={HasilRekapDapilScreen} options={{ title: "Pilih Dapil" }} />
      <Stack.Screen
        name="HasilRekapKabupaten"
        component={HasilRekapKabupatenScreen}
        options={({ route }) => ({ title: route.params.dapilNama })}
      />
      <Stack.Screen
        name="HasilRekapKecamatan"
        component={HasilRekapKecamatanScreen}
        options={({ route }) => ({ title: route.params.kabupatenNama })}
      />
      <Stack.Screen
        name="HasilRekapKelurahan"
        component={HasilRekapKelurahanScreen}
        options={({ route }) => ({ title: route.params.kecamatanNama })}
      />
      <Stack.Screen
        name="HasilRekapDetail"
        component={HasilRekapDetailScreen}
        options={({ route }) => ({ title: route.params.kelurahanNama })}
      />
    </Stack.Navigator>
  );
}
