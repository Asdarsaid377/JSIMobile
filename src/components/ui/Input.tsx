import { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";
import type { ReactNode } from "react";
import type { TextInput as TextInputRef, TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
  rightElement?: ReactNode;
};

export const Input = forwardRef<TextInputRef, Props>(function Input(
  { label, error, rightElement, editable = true, ...props },
  ref,
) {
  return (
    <View className="gap-xs">
      <Text className="text-label-md font-medium text-text-primary">{label}</Text>
      <View
        className={`flex-row items-center gap-sm rounded-md border border-border px-md py-sm ${
          editable ? "bg-surface" : "bg-surface-secondary"
        }`}
      >
        <TextInput
          ref={ref}
          editable={editable}
          className={`flex-1 text-body-md ${editable ? "text-text-primary" : "text-text-muted"}`}
          // NativeWind className tidak bisa styling placeholder color — prop native, bukan hardcode di style konten.
          placeholderTextColor="#64748b"
          textAlignVertical="center"
          {...props}
          style={[{ includeFontPadding: false, paddingVertical: 0, lineHeight: 20 }, props.style]}
        />
        {rightElement}
      </View>
      {error ? <Text className="text-caption text-danger">{error}</Text> : null}
    </View>
  );
});
