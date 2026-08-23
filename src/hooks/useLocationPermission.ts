import { useCallback, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";

export type LocationGateStatus = "requesting" | "granted" | "denied";

type LocationGateResult = {
  status: LocationGateStatus;
  coords: { lat: number; long: number } | null;
  retry: () => void;
};

export function useLocationPermission(): LocationGateResult {
  const [status, setStatus] = useState<LocationGateStatus>("requesting");
  const [coords, setCoords] = useState<{ lat: number; long: number } | null>(null);

  const check = useCallback(async () => {
    setStatus("requesting");
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setCoords(null);
        setStatus("denied");
        return;
      }
      const position = await Location.getCurrentPositionAsync();
      setCoords({ lat: position.coords.latitude, long: position.coords.longitude });
      setStatus("granted");
    } catch (error) {
      console.error("[hooks/useLocationPermission/check]", error);
      setCoords(null);
      setStatus("denied");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void check();
    }, [check]),
  );

  return { status, coords, retry: check };
}
