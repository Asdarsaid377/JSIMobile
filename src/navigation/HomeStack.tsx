import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BudgetPlafonScreen } from "@/screens/budgeting/BudgetPlafonScreen";
import { BudgetTransactionFormScreen } from "@/screens/budgeting/BudgetTransactionFormScreen";
import { BudgetingKampanyeScreen } from "@/screens/budgeting/BudgetingKampanyeScreen";
import { CustomerServiceScreen } from "@/screens/home/CustomerServiceScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { RivalAktivitasFormScreen } from "@/screens/rivalcaleg/RivalAktivitasFormScreen";
import { RivalCalegFormScreen } from "@/screens/rivalcaleg/RivalCalegFormScreen";
import type { RivalCalegFormParams } from "@/screens/rivalcaleg/RivalCalegFormScreen";
import { RivalCalegScreen } from "@/screens/rivalcaleg/RivalCalegScreen";
import { RivalWilayahFormScreen } from "@/screens/rivalcaleg/RivalWilayahFormScreen";
import type { RivalWilayahFormParams } from "@/screens/rivalcaleg/RivalWilayahFormScreen";
import { AntiFraudScreen } from "@/screens/antifraud/AntiFraudScreen";
import { IsuAspirasiFormScreen } from "@/screens/isuaspirasi/IsuAspirasiFormScreen";
import { IsuAspirasiScreen } from "@/screens/isuaspirasi/IsuAspirasiScreen";
import { IsuJanjiFormScreen } from "@/screens/isuaspirasi/IsuJanjiFormScreen";
import type { IsuJanjiFormParams } from "@/screens/isuaspirasi/IsuJanjiFormScreen";
import { QuickCountScreen } from "@/screens/quickcount/QuickCountScreen";
import { LacakRelawanScreen } from "@/screens/tracking/LacakRelawanScreen";
import { TimsesScreen } from "@/screens/timses/TimsesScreen";
import { TokohFormScreen } from "@/screens/tokoh/TokohFormScreen";
import type { TokohFormParams } from "@/screens/tokoh/TokohFormScreen";
import { TokohMasyarakatScreen } from "@/screens/tokoh/TokohMasyarakatScreen";

export type HomeStackParamList = {
  Home: undefined;
  Timses: undefined;
  LacakRelawan: undefined;
  CustomerService: undefined;
  RivalCaleg: undefined;
  RivalCalegForm: RivalCalegFormParams | undefined;
  RivalWilayahForm: RivalWilayahFormParams | undefined;
  RivalAktivitasForm: undefined;
  BudgetingKampanye: undefined;
  BudgetTransactionForm: undefined;
  BudgetPlafon: undefined;
  TokohMasyarakat: undefined;
  // Component sama persis dipakai di DptStack.TokohForm (dari icon bintang
  // DptCard, params bawa dptRecord) — lihat TokohFormScreen.tsx.
  TokohForm: TokohFormParams | undefined;
  QuickCount: undefined;
  AntiFraud: undefined;
  IsuAspirasi: undefined;
  IsuAspirasiForm: undefined;
  IsuJanjiForm: IsuJanjiFormParams | undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

// Timses & Lacak Relawan (Feature 06/07) dipindah ke sini dari tab tersendiri —
// SEMUA desain (profile.png, program-pemenangan.png, dpt.png) konsisten cuma
// punya 5 tab (Home/DPT/Rekap/Program/Profil), dan home-dashboard.png konfirmasi
// keduanya diakses lewat grid "Akses Cepat" di Home. Dipakai bersama oleh
// AdminTabs & TimsesTabs (pola sama dengan ProgramStack) — HomeScreen sendiri yang
// menyembunyikan shortcut "Tracking" untuk role non-admin (lihat HomeScreen.tsx).
export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Timses" component={TimsesScreen} options={{ title: "Timses" }} />
      <Stack.Screen name="LacakRelawan" component={LacakRelawanScreen} options={{ title: "Lacak Relawan" }} />
      <Stack.Screen name="CustomerService" component={CustomerServiceScreen} options={{ title: "Customer Service" }} />
      <Stack.Screen name="RivalCaleg" component={RivalCalegScreen} options={{ title: "Deteksi Rival Caleg" }} />
      <Stack.Screen
        name="RivalCalegForm"
        component={RivalCalegFormScreen}
        options={{ title: "Rival Caleg" }}
      />
      <Stack.Screen
        name="RivalWilayahForm"
        component={RivalWilayahFormScreen}
        options={{ title: "Penguasaan Wilayah" }}
      />
      <Stack.Screen
        name="RivalAktivitasForm"
        component={RivalAktivitasFormScreen}
        options={{ title: "Lapor Aktivitas Rival" }}
      />
      <Stack.Screen
        name="BudgetingKampanye"
        component={BudgetingKampanyeScreen}
        options={{ title: "Budgeting Kampanye" }}
      />
      <Stack.Screen
        name="BudgetTransactionForm"
        component={BudgetTransactionFormScreen}
        options={{ title: "Catat Pengeluaran" }}
      />
      <Stack.Screen
        name="BudgetPlafon"
        component={BudgetPlafonScreen}
        options={{ title: "Set Plafon Anggaran" }}
      />
      <Stack.Screen
        name="TokohMasyarakat"
        component={TokohMasyarakatScreen}
        options={{ title: "Tokoh Masyarakat" }}
      />
      <Stack.Screen
        name="TokohForm"
        component={TokohFormScreen}
        options={{ title: "Identifikasi Tokoh Baru" }}
      />
      <Stack.Screen name="QuickCount" component={QuickCountScreen} options={{ title: "Quick Count" }} />
      <Stack.Screen name="AntiFraud" component={AntiFraudScreen} options={{ title: "Verifikasi Kunjungan" }} />
      <Stack.Screen
        name="IsuAspirasi"
        component={IsuAspirasiScreen}
        options={{ title: "Isu & Aspirasi Warga" }}
      />
      <Stack.Screen
        name="IsuAspirasiForm"
        component={IsuAspirasiFormScreen}
        options={{ title: "Catat Aspirasi Warga" }}
      />
      <Stack.Screen
        name="IsuJanjiForm"
        component={IsuJanjiFormScreen}
        options={{ title: "Usulan Materi Kampanye" }}
      />
    </Stack.Navigator>
  );
}
