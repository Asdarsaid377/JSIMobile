import { ActivityIndicator, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import { AdminTabs } from "@/navigation/AdminTabs";
import { AuthStack } from "@/navigation/AuthStack";
import { TimsesTabs } from "@/navigation/TimsesTabs";
import { useAuth } from "@/hooks/useAuth";
import { useLocationBeacon } from "@/hooks/useLocationBeacon";
import type { Role } from "@/types/auth";

const ADMIN_ROLES: readonly Role[] = ["admin", "adminsekret"];

export function RootNavigator() {
  const { status, session } = useAuth();
  // Feature 07 — dipasang di sini (bukan di dalam AdminTabs/TimsesTabs) supaya
  // jalan untuk semua role terlepas dari tab yang aktif. Lihat useLocationBeacon.ts.
  useLocationBeacon();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {status === "unauthenticated" && <AuthStack />}
      {status === "authenticated" && session ? (
        ADMIN_ROLES.includes(session.user.roles) ? <AdminTabs /> : <TimsesTabs />
      ) : null}
    </NavigationContainer>
  );
}
