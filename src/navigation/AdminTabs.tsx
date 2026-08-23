import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DptStack } from "@/navigation/DptStack";
import { HomeStack } from "@/navigation/HomeStack";
import { ProgramStack } from "@/navigation/ProgramStack";
import { RekapStack } from "@/navigation/RekapStack";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";

export type AdminTabParamList = {
  // Nama tab beda dari nama Stack.Screen root di dalamnya ("Home" di
  // HomeStack.tsx) — React Navigation warning "Found screens with the same
  // name nested inside one another" kalau nama tab & screen di dalamnya
  // sama persis (2026-08-23, laporan user).
  HomeTab: undefined;
  DPT: undefined;
  Rekap: undefined;
  Program: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

// 5 tab ini SEKARANG persis sesuai semua desain yang ada tab bar-nya (profile.png,
// program-pemenangan.png, dpt.png) — Home/DPT/Rekap/Program/Profil. Timses & Lacak
// Relawan (Feature 06/07) TIDAK lagi jadi tab, dipindah ke HomeStack (lihat
// progress-tracker.md Decisions, Feature 08). Rekap (Feature 09 — Hasil Rekap) kini
// RekapStack — SCOPE: cuma tipe DPR RI 2024 (lihat RekapStack.tsx untuk alasan
// lengkap), DPRD Provinsi/Kabupaten & tahun 2019 menyusul sesi berikutnya.

export function AdminTabs() {
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
