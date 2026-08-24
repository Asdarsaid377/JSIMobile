import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DptKabupatenScreen } from "@/screens/dpt/DptKabupatenScreen";
import { DptListScreen } from "@/screens/dpt/DptListScreen";
import { DptProvinsiScreen } from "@/screens/dpt/DptProvinsiScreen";
import { DptRecordFormScreen } from "@/screens/dpt/DptRecordFormScreen";
import { DtdoorFormScreen } from "@/screens/program/DtdoorFormScreen";
import type { DtdoorFormParams } from "@/screens/program/DtdoorFormScreen";
import { GotvFormScreen } from "@/screens/program/GotvFormScreen";
import type { GotvFormParams } from "@/screens/program/GotvFormScreen";
import { RealCountC1Screen } from "@/screens/realcount/RealCountC1Screen";
import { TokohFormScreen } from "@/screens/tokoh/TokohFormScreen";
import type { TokohFormParams } from "@/screens/tokoh/TokohFormScreen";
import { RealCountKabupatenScreen } from "@/screens/realcount/RealCountKabupatenScreen";
import { RealCountKecamatanScreen } from "@/screens/realcount/RealCountKecamatanScreen";
import { RealCountKelurahanScreen } from "@/screens/realcount/RealCountKelurahanScreen";
import { SaksiFormScreen } from "@/screens/saksi/SaksiFormScreen";
import { SaksiTpsScreen } from "@/screens/saksi/SaksiTpsScreen";
import { TargetSuaraKabupatenScreen } from "@/screens/targetsuara/TargetSuaraKabupatenScreen";
import { TargetSuaraKecamatanScreen } from "@/screens/targetsuara/TargetSuaraKecamatanScreen";
import { TargetSuaraKelurahanScreen } from "@/screens/targetsuara/TargetSuaraKelurahanScreen";
import { TargetSuaraReportScreen } from "@/screens/targetsuara/TargetSuaraReportScreen";
import { TargetSuaraTpsScreen } from "@/screens/targetsuara/TargetSuaraTpsScreen";
import type { DptRecord } from "@/types/dpt";

export type DptStackParamList = {
  DptProvinsi: undefined;
  DptKabupaten: { provinsiWilId: number; provinsiNama: string };
  DptList: { kabWilId: number };
  DptRecordForm: { kabWilId: number; record?: DptRecord };
  // Reuse langsung DtdoorFormScreen (src/screens/program/) — "Form Door To
  // Door terintegrasi DPT" (2026-08-22), di-push dari DptVoterActionSheet.
  // Component sama persis dipakai di ProgramStack.DtdoorForm (entri
  // standalone, params undefined) — lihat DtdoorFormScreen.tsx untuk kenapa
  // param list-nya lokal & tidak terikat ke salah satu stack.
  DtdoorForm: DtdoorFormParams | undefined;
  // Reuse langsung GotvFormScreen (src/screens/program/) — "Tandai ikut Social
  // Event" (2026-08-24), di-push dari DptVoterActionSheet. Component sama
  // persis dipakai di ProgramStack.GotvForm (entri standalone, params
  // undefined) — pola identik DtdoorForm di atas.
  GotvForm: GotvFormParams | undefined;
  // Reuse langsung TokohFormScreen (src/screens/tokoh/) — "Identifikasi Tokoh
  // Baru dari DPT" (2026-08-22), di-push dari icon bintang di DptCard. Component
  // sama persis dipakai di HomeStack.TokohForm (dari tombol "+ Identifikasi
  // Tokoh Baru" di TokohMasyarakatScreen, params undefined) — pola identik
  // DtdoorForm di atas.
  TokohForm: TokohFormParams | undefined;
  TargetSuaraKabupaten: { kabWilId: number; kabNama: string; kabTotalDpt: number };
  TargetSuaraKecamatan: { kecWilId: number; kecNama: string; kecTotalDpt: number; kabWilId: number };
  TargetSuaraKelurahan: { kelWilId: number; kelNama: string; kelTotalDpt: number; kabWilId: number };
  TargetSuaraTps: { kelWilId: number; noTps: number; namaTps: string; totalPemilihTps: number };
  TargetSuaraReport: { kabWilId: number; kabNama: string; kabTotalDpt: number };
  SaksiTps: { kelWilId: number; noTps: number; namaTps: string };
  SaksiForm: { kelWilId: number; noTps: number; namaTps: string };
  RealCountKabupaten: { kabWilId: number; kabNama: string };
  RealCountKecamatan: { kecWilId: number; kecNama: string; kabWilId: number };
  RealCountKelurahan: { kelWilId: number; kelNama: string; kabWilId: number };
  RealCountC1: { kelWilId: number; noTps: number; namaTps: string };
};

const Stack = createNativeStackNavigator<DptStackParamList>();

// 3 tahap sesuai alur asli (Feature 08): Provinsi (root, tab bar terlihat) →
// Kabupaten/Kota (pushed) → DPT list (pushed, context/designs/dpt.png — screen ini
// yang punya back chevron + tab bar terlihat bersamaan di desain, karena masih
// bagian dari stack yang sama).
// 4 route "TargetSuara*" (ditambah 2026-08-22, di luar build-plan awal, permintaan
// user) di-attach ke stack yang SAMA (bukan stack terpisah) — reuse penuh hierarki
// wilayah DPT (Kabupaten→Kecamatan→Kelurahan→TPS), di-push dari icon di headerRight
// DptListScreen. Lihat src/screens/targetsuara/TargetSuaraKabupatenScreen.tsx &
// progress-tracker.md Decisions untuk detail (penyimpanan local-only, dll).
// "SaksiTps"/"SaksiForm" di-push dari TargetSuaraTpsScreen (reuse TPS yang sama).
// "RealCount*" (3 level Kabupaten→Kecamatan→Kelurahan + "RealCountC1" leaf) PUNYA
// alur drill-down wilayah SENDIRI, terpisah dari TargetSuara* — permintaan eksplisit
// user 2026-08-22 ("jangan ikut di dalam Target Suara"), reuse hierarki DPT yang
// sama tapi via icon headerRight DptListScreen sendiri. Lihat
// src/screens/realcount/RealCountKabupatenScreen.tsx.
export function DptStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DptProvinsi" component={DptProvinsiScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DptKabupaten" component={DptKabupatenScreen} options={{ title: "Pilih Kabupaten/Kota" }} />
      <Stack.Screen name="DptList" component={DptListScreen} options={{ title: "DPT" }} />
      <Stack.Screen
        name="DptRecordForm"
        component={DptRecordFormScreen}
        options={({ route }) => ({ title: route.params.record ? "Edit Data DPT" : "Tambah Data DPT" })}
      />
      <Stack.Screen
        name="DtdoorForm"
        component={DtdoorFormScreen}
        options={({ route }) => ({
          title: route.params?.dptRecord ? `D2D — ${route.params.dptRecord.nama}` : "Input Kunjungan Baru",
        })}
      />
      <Stack.Screen
        name="GotvForm"
        component={GotvFormScreen}
        options={({ route }) => ({
          title: route.params?.dptRecord ? `SE — ${route.params.dptRecord.nama}` : "Input Kegiatan Baru",
        })}
      />
      <Stack.Screen
        name="TokohForm"
        component={TokohFormScreen}
        options={{ title: "Identifikasi Tokoh Baru" }}
      />
      <Stack.Screen
        name="TargetSuaraKabupaten"
        component={TargetSuaraKabupatenScreen}
        options={{ title: "Target Suara" }}
      />
      <Stack.Screen
        name="TargetSuaraKecamatan"
        component={TargetSuaraKecamatanScreen}
        options={{ title: "Target Suara" }}
      />
      <Stack.Screen
        name="TargetSuaraKelurahan"
        component={TargetSuaraKelurahanScreen}
        options={{ title: "Target Suara" }}
      />
      <Stack.Screen name="TargetSuaraTps" component={TargetSuaraTpsScreen} options={{ title: "Target Suara" }} />
      <Stack.Screen
        name="TargetSuaraReport"
        component={TargetSuaraReportScreen}
        options={{ title: "Laporan Target Suara" }}
      />
      <Stack.Screen name="SaksiTps" component={SaksiTpsScreen} options={{ title: "Saksi TPS" }} />
      <Stack.Screen name="SaksiForm" component={SaksiFormScreen} options={{ title: "Tambah Saksi" }} />
      <Stack.Screen
        name="RealCountKabupaten"
        component={RealCountKabupatenScreen}
        options={{ title: "Real Count C1" }}
      />
      <Stack.Screen
        name="RealCountKecamatan"
        component={RealCountKecamatanScreen}
        options={{ title: "Real Count C1" }}
      />
      <Stack.Screen
        name="RealCountKelurahan"
        component={RealCountKelurahanScreen}
        options={{ title: "Real Count C1" }}
      />
      <Stack.Screen name="RealCountC1" component={RealCountC1Screen} options={{ title: "Real Count C1" }} />
    </Stack.Navigator>
  );
}
