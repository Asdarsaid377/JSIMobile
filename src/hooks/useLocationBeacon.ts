import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";

import * as Location from "expo-location";

import { updateOwnLocation } from "@/services/timses";
import { useAuth } from "@/hooks/useAuth";

const BEACON_INTERVAL_MS = 30000;

// Feature 07 (Lacak Relawan): mengirim GPS device sendiri secara berkala ke
// backend selama app di foreground, untuk SEMUA role yang login — bukan cuma
// admin, karena admin cuma satu-satunya yang MELIHAT peta (lihat AdminTabs.tsx),
// tapi anggota timses/relawan lapangan-lah yang perlu terlihat DI peta itu.
// Dipasang sekali di RootNavigator.tsx (bukan di dalam screen manapun) supaya
// tetap jalan terlepas dari tab yang sedang aktif. Tidak minta izin ulang —
// login (Feature 02) sudah mewajibkan GPS granted; di sini cuma cek status
// tanpa prompt (`getForegroundPermissionsAsync`), diam kalau dicabut belakangan.
export function useLocationBeacon(): void {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function sendOnce(): Promise<void> {
      if (appState.current !== "active") return;
      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== Location.PermissionStatus.GRANTED) return;
        const position = await Location.getCurrentPositionAsync();
        if (cancelled || !userId) return;
        await updateOwnLocation(userId, { lat: position.coords.latitude, long: position.coords.longitude });
      } catch (error) {
        console.error("[hooks/useLocationBeacon/sendOnce]", error);
      }
    }

    void sendOnce();
    const interval = setInterval(() => void sendOnce(), BEACON_INTERVAL_MS);
    const subscription = AppState.addEventListener("change", (nextState) => {
      appState.current = nextState;
      if (nextState === "active") void sendOnce();
    });

    return () => {
      cancelled = true;
      clearInterval(interval);
      subscription.remove();
    };
  }, [userId]);
}
