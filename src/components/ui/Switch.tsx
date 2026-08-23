import { Switch as RNSwitch, View } from "react-native";
import type { SwitchProps } from "react-native";

type Props = Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">;

// RN Switch tidak bisa di-style lewat NativeWind className (native prop, sama
// alasan dengan placeholderTextColor di ui/Input.tsx) — hex di bawah cocok persis
// dengan token accent (#3b82f6) dan text-inverse-muted (#94a3b8), diverifikasi
// lewat pixel-sampling context/designs/profile.png.
const TRACK_ON = "#3b82f6";
const TRACK_OFF = "#94a3b8";
const THUMB = "#ffffff";

export function Switch({ disabled, ...props }: Props) {
  return (
    <View className={disabled ? "opacity-60" : ""}>
      <RNSwitch
        disabled={disabled}
        trackColor={{ false: TRACK_OFF, true: TRACK_ON }}
        thumbColor={THUMB}
        ios_backgroundColor={TRACK_OFF}
        {...props}
      />
    </View>
  );
}
