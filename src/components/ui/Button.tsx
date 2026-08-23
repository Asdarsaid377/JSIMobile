import { ActivityIndicator, Pressable, Text } from "react-native";
import type { PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "brand";

type Props = Omit<PressableProps, "children"> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-surface border border-border",
  brand: "bg-primary",
};

const VARIANT_TEXT_CLASS: Record<Variant, string> = {
  primary: "text-on-accent",
  secondary: "text-text-primary",
  brand: "text-on-accent",
};

const VARIANT_SPINNER_COLOR: Record<Variant, string> = {
  primary: "#ffffff",
  secondary: "#1e293b",
  brand: "#ffffff",
};

export function Button({ label, variant = "primary", loading = false, disabled, ...props }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`min-h-[44px] items-center justify-center rounded-lg px-lg py-sm active:opacity-80 ${VARIANT_CLASS[variant]} ${isDisabled ? "opacity-60" : ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT_SPINNER_COLOR[variant]} />
      ) : (
        <Text className={`text-body-md font-bold ${VARIANT_TEXT_CLASS[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
