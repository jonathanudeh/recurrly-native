import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { AuthLoadingScreen } from "../../../components/AuthScreen";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
