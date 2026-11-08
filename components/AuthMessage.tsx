import { Text, View } from "react-native";

type AuthMessageProps = {
  message?: string | null;
  tone?: "error" | "success";
};

export default function AuthMessage({
  message,
  tone = "error",
}: AuthMessageProps) {
  if (!message) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      className={
        tone === "error" ? "auth-message-error" : "auth-message-success"
      }
    >
      <Text
        className={
          tone === "error"
            ? "auth-message-error-text"
            : "auth-message-success-text"
        }
      >
        {message}
      </Text>
    </View>
  );
}
