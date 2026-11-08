import { useAuth } from "@clerk/expo";
import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { AuthLoadingScreen } from "../../../components/AuthScreen";

function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <AuthLoadingScreen />;
  if (!isSignedIn) return <Redirect href="/(auth)/signIn" />;

  return (
    <View>
      <Text>Subscription Details: {id} </Text>
      <Link href="/">Go back</Link>
    </View>
  );
}

export default SubscriptionDetails;
