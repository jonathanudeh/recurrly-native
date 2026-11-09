import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import "../../global.css";
import { posthog } from "../../lib/posthog";

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

function RootErrorFallback() {
  return (
    <View>
      <Text>Something went wrong. Please restart the app.</Text>
    </View>
  );
}

function PostHogIdentity() {
  const { isLoaded, user } = useUser();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !posthog) return;

    if (user) {
      if (previousUserId.current === user.id) return;

      posthog.identify(user.id, {
        $set: {
          ...(user.primaryEmailAddress?.emailAddress
            ? { email: user.primaryEmailAddress.emailAddress }
            : {}),
          ...(user.firstName ? { first_name: user.firstName } : {}),
          ...(user.lastName ? { last_name: user.lastName } : {}),
        },
      });
      previousUserId.current = user.id;
      return;
    }

    if (previousUserId.current) {
      posthog.reset();
      previousUserId.current = null;
    }
  }, [isLoaded, user]);

  return null;
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

  const app = <Stack screenOptions={{ headerShown: false }} />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <PostHogIdentity />
          <PostHogErrorBoundary fallback={RootErrorFallback}>
            {app}
          </PostHogErrorBoundary>
        </PostHogProvider>
      ) : (
        app
      )}
    </ClerkProvider>
  );
}
