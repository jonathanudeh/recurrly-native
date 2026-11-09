import { useAuth } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { posthog } from "../../../lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

function SettingsScreen() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);

    try {
      posthog?.capture("sign_out_requested");
      await signOut();
      router.replace("/(auth)/signIn");
    } catch {
      setError("We couldn't log you out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView className="settings-screen">
      <View className="settings-content">
        <Text accessibilityRole="header" className="settings-title">
          Settings
        </Text>
        <Text className="settings-subtitle">Manage your Recurrly account.</Text>

        <View className="settings-account-card">
          <Text className="settings-card-title">Account</Text>
          {error ? (
            <Text accessibilityLiveRegion="polite" className="settings-error">
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            className={
              isSigningOut
                ? "settings-sign-out settings-sign-out-disabled"
                : "settings-sign-out"
            }
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#fff9e3" />
            ) : (
              <Text className="settings-sign-out-text">Log out</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default SettingsScreen;
