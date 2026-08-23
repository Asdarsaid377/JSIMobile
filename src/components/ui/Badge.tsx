import { Text, View } from "react-native";

type Variant = "accent" | "success" | "warning" | "danger" | "muted";

type Props = {
  label: string;
  variant?: Variant;
  dot?: boolean;
};

const VARIANT_CLASS: Record<Variant, string> = {
  accent: "bg-accent-soft",
  success: "bg-success-soft",
  warning: "bg-warning-soft",
  danger: "bg-danger-soft",
  muted: "bg-surface-secondary",
};

const VARIANT_TEXT_CLASS: Record<Variant, string> = {
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-text-muted",
};

const VARIANT_DOT_CLASS: Record<Variant, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-text-muted",
};

// Prop `dot` ditambah di Feature 07 (Lacak Relawan) — pill status "Real-time" di
// lacak-relawan.png punya titik di depan teks, tidak ada di pemakaian Badge
// sebelumnya (role badge ProfileScreen). Extend primitive yang ada, bukan bikin
// component baru (lihat ui-workflow.md Step 2).
export function Badge({ label, variant = "accent", dot = false }: Props) {
  return (
    <View className={`flex-row items-center gap-xs self-start rounded-full px-md py-xs ${VARIANT_CLASS[variant]}`}>
      {dot ? <View className={`h-1.5 w-1.5 rounded-full ${VARIANT_DOT_CLASS[variant]}`} /> : null}
      <Text className={`text-label-md font-medium ${VARIANT_TEXT_CLASS[variant]}`}>{label}</Text>
    </View>
  );
}
