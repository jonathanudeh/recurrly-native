import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { posthog } from "../../lib/posthog";
import "../../global.css";

export const unstable_settings = {
  anchor: "(tabs)",
};

function getPublishableKey(): string {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add the selected Clerk application's publishable key to your local environment.",
    );
  }
  return key;
}

const publishableKey = getPublishableKey();

SplashScreen.preventAutoHideAsync();

function AuthenticatedStack() {
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      identifiedUserId.current = null;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    posthog?.identify(
      user.id,
      email
        ? {
            $set: { email },
          }
        : undefined,
    );
    identifiedUserId.current = user.id;
  }, [user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // if (!fontsLoaded) return null;

  const app = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthenticatedStack />
    </ClerkProvider>
  );

  return posthog ? (
    <PostHogProvider client={posthog}>{app}</PostHogProvider>
  ) : (
    app
  );
}
