import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DptStack } from "@/navigation/DptStack";
import { HomeStack } from "@/navigation/HomeStack";
import { ProgramStack } from "@/navigation/ProgramStack";
import { RekapStack } from "@/navigation/RekapStack";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";

export type TimsesTabParamList = {
  // Nama tab beda dari nama Stack.Screen root di dalamnya ("Home" di
  // HomeStack.tsx) — React Navigation warning "Found screens with the same
  // name nested inside one another" kalau nama tab & screen di dalamnya
  // sama persis (2026-08-23, laporan user, sama fix dengan AdminTabs.tsx).
  HomeTab: undefined;
  DPT: undefined;
  Rekap: undefined;
  Program: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<TimsesTabParamList>();

// Sama struktur dengan AdminTabs.tsx (5 tab sesuai desain) — lihat catatan di sana.
// Timses (Feature 06) tetap dijangkau lewat HomeStack (Akses Cepat), scoped ke
// kecamatan sendiri oleh screen itu sendiri (client-side, lihat TimsesScreen.tsx).
// Lacak Relawan TIDAK ada di HomeStack varian role ini — HomeScreen.tsx yang
// menyembunyikan shortcut itu untuk role non-admin (mirror hard-redirect web,
// lihat progress-tracker.md Decisions Feature 07 & 08). Rekap kini RekapStack,
// sama seperti AdminTabs (tidak ada scoping wilayah khusus role — hierarki DPR RI
// mock ini terpisah dari data Timses/DPT, lihat RekapStack.tsx).

export function TimsesTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#cbd5e1" },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="DPT"
        component={DptStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Rekap"
        component={RekapStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Program"
        component={ProgramStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
