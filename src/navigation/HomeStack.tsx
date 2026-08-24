import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BudgetPlafonScreen } from "@/screens/budgeting/BudgetPlafonScreen";
import { BudgetTransactionFormScreen } from "@/screens/budgeting/BudgetTransactionFormScreen";
import { BudgetingKampanyeScreen } from "@/screens/budgeting/BudgetingKampanyeScreen";
import { CustomerServiceScreen } from "@/screens/home/CustomerServiceScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { RivalAssessmentFormScreen } from "@/screens/rivalcaleg/RivalAssessmentFormScreen";
import { RivalCalegDetailScreen } from "@/screens/rivalcaleg/RivalCalegDetailScreen";
import { RivalCalegFormScreen } from "@/screens/rivalcaleg/RivalCalegFormScreen";
import { RivalCalegListScreen } from "@/screens/rivalcaleg/RivalCalegListScreen";
import { AntiFraudScreen } from "@/screens/antifraud/AntiFraudScreen";
import { IsuAspirasiScreen } from "@/screens/isuaspirasi/IsuAspirasiScreen";
import { QuickCountScreen } from "@/screens/quickcount/QuickCountScreen";
import { LacakRelawanScreen } from "@/screens/tracking/LacakRelawanScreen";
import { TimsesScreen } from "@/screens/timses/TimsesScreen";
import { TokohFormScreen } from "@/screens/tokoh/TokohFormScreen";
import type { TokohFormParams } from "@/screens/tokoh/TokohFormScreen";
import { TokohMasyarakatScreen } from "@/screens/tokoh/TokohMasyarakatScreen";
import type { AncamanLevel } from "@/types/rivalcaleg";

export type HomeStackParamList = {
  Home: undefined;
  Timses: undefined;
  LacakRelawan: undefined;
  CustomerService: undefined;
  RivalCalegList: undefined;
  RivalCalegForm: undefined;
  RivalCalegDetail: { rivalCalegId: number; namaLengkap: string };
  RivalAssessmentForm: {
    rivalCalegId: number;
    kecamatan?: string;
    desa?: string;
    levelAncaman?: AncamanLevel;
    catatan?: string;
  };
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
      <Stack.Screen name="RivalCalegList" component={RivalCalegListScreen} options={{ title: "Rival Caleg" }} />
      <Stack.Screen name="RivalCalegForm" component={RivalCalegFormScreen} options={{ title: "Tambah Rival Caleg" }} />
      <Stack.Screen name="RivalCalegDetail" component={RivalCalegDetailScreen} options={{ title: "Rival Caleg" }} />
      <Stack.Screen
        name="RivalAssessmentForm"
        component={RivalAssessmentFormScreen}
        options={{ title: "Assessment Wilayah" }}
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
    </Stack.Navigator>
  );
}
