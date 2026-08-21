import { useState } from "react";

import { NavigationContainer } from "@react-navigation/native";

import { AdminTabs } from "@/navigation/AdminTabs";
import { AuthStack } from "@/navigation/AuthStack";
import { TimsesTabs } from "@/navigation/TimsesTabs";

type Role = "admin" | "adminsekret" | "timses";

type Session = {
  token: string;
  role: Role;
} | null;

// Placeholder session state — no real login wiring yet (see context/build-plan.md,
// Phase 2 "Auth"). Once /backend-api/auth/login is wired, this becomes a real
// auth state read from secure-store + a profile fetch, mirroring
// client/src/pages/dpt/layout-hook.js's useLayoutHook pattern.
export function RootNavigator() {
  const [session] = useState<Session>(null);

  return (
    <NavigationContainer>
      {!session && <AuthStack />}
      {session && (session.role === "admin" || session.role === "adminsekret") && <AdminTabs />}
      {session && session.role === "timses" && <TimsesTabs />}
    </NavigationContainer>
  );
}
