import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DtdoorAnalyticsScreen } from "@/screens/program/DtdoorAnalyticsScreen";
import { DtdoorFormScreen } from "@/screens/program/DtdoorFormScreen";
import { GotvFormScreen } from "@/screens/program/GotvFormScreen";
import { KekuatanPemilihScreen } from "@/screens/program/KekuatanPemilihScreen";
import { KekuatanWilayahScreen } from "@/screens/program/KekuatanWilayahScreen";
import { ProgramPemenanganScreen } from "@/screens/program/ProgramPemenanganScreen";
import { SwingVoterFollowUpScreen } from "@/screens/program/SwingVoterFollowUpScreen";

export type ProgramStackParamList = {
  ProgramPemenangan: undefined;
  DtdoorForm: undefined;
  GotvForm: undefined;
  KekuatanWilayah: undefined;
  KekuatanPemilih: undefined;
  SwingVoterFollowUp: undefined;
  DtdoorAnalytics: undefined;
};

const Stack = createNativeStackNavigator<ProgramStackParamList>();

export function ProgramStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProgramPemenangan" component={ProgramPemenanganScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DtdoorForm" component={DtdoorFormScreen} options={{ title: "Input Kunjungan Baru" }} />
      <Stack.Screen name="GotvForm" component={GotvFormScreen} options={{ title: "Input Kegiatan Baru" }} />
      <Stack.Screen name="KekuatanWilayah" component={KekuatanWilayahScreen} options={{ title: "Peta Kekuatan Wilayah" }} />
      <Stack.Screen
        name="KekuatanPemilih"
        component={KekuatanPemilihScreen}
        options={{ title: "Skoring Kekuatan Pemilih" }}
      />
      <Stack.Screen
        name="SwingVoterFollowUp"
        component={SwingVoterFollowUpScreen}
        options={{ title: "Prioritas Follow-up Swing" }}
      />
      <Stack.Screen name="DtdoorAnalytics" component={DtdoorAnalyticsScreen} options={{ title: "Ringkasan Data" }} />
    </Stack.Navigator>
  );
}
