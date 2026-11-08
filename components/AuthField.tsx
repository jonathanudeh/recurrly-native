import clsx from "clsx";
import { forwardRef, useState, type ComponentRef } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type AuthFieldProps = Omit<TextInputProps, "secureTextEntry"> & {
  label: string;
  error?: string;
  secure?: boolean;
};

const AuthField = forwardRef<ComponentRef<typeof TextInput>, AuthFieldProps>(
  function AuthField({ label, error, secure = false, ...inputProps }, ref) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
      <View className="auth-field">
        <Text className="auth-label">{label}</Text>
        <View className={clsx("auth-input-wrap", error && "auth-input-error")}>
          <TextInput
            {...inputProps}
            accessibilityLabel={label}
            className="auth-input"
            placeholderTextColor="#77715f"
            ref={ref}
            selectionColor="#ea7a53"
            secureTextEntry={secure && !passwordVisible}
          />
          {secure && (
            <Pressable
              accessibilityLabel={
                passwordVisible ? "Hide password" : "Show password"
              }
              accessibilityRole="button"
              className="auth-password-toggle"
              onPress={() => setPasswordVisible((visible) => !visible)}
            >
              <Text className="auth-password-toggle-text">
                {passwordVisible ? "Hide" : "Show"}
              </Text>
            </Pressable>
          )}
        </View>
        {error ? (
          <Text accessibilityLiveRegion="polite" className="auth-error">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

export default AuthField;
