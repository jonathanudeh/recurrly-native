import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <Text className="text-success text-xl font-bold">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="bg-primary mt-4 rounded p-4 text-white"
      >
        On board
      </Link>
      <Link href="/signIn" className="bg-primary mt-4 rounded p-4 text-white">
        Go to sign in
      </Link>
      <Link href="/signUp" className="bg-primary mt-4 rounded p-4 text-white">
        Go to sign up
      </Link>

      {/* <Link
        href="/subcription/spotify"
        className="bg-primary mt-4 rounded p-4 text-white"
      >
        Spotify subscription
      </Link> */}
      <Link
        href={{
          pathname: "/subscriptions/[id]",
          params: { id: "claude" },
        }}
        className="bg-primary mt-4 rounded p-4 text-white"
      >
        Claude max subscription
      </Link>
    </SafeAreaView>
  );
}
