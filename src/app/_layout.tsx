import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { posthog, PostHogRootProvider } from "../../lib/posthog";
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

function PostHogIdentity() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      if (identifiedUserId.current) {
        posthog?.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    if (identifiedUserId.current) {
      posthog?.reset();
    }

    posthog?.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { name: user.fullName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isAuthLoaded, isSignedIn, isUserLoaded, user]);

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

  return (
    <PostHogRootProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <PostHogIdentity />
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </PostHogRootProvider>
  );
}
