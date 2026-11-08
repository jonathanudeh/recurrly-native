import { styled } from "nativewind";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLoadingScreen() {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="auth-loading">
        <ActivityIndicator color="#ea7a53" size="large" />
        <Text className="auth-helper">Getting your account ready...</Text>
      </View>
    </SafeAreaView>
  );
}

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-scroll-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>
              <Text accessibilityRole="header" className="auth-title">
                {title}
              </Text>
              <Text className="auth-subtitle">{subtitle}</Text>
            </View>

            <View className="auth-card">{children}</View>
            {footer ? <View className="auth-link-row">{footer}</View> : null}
            <Text className="auth-trust-copy">
              Your subscriptions, all in one secure place.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
