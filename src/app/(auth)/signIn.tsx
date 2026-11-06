import { Link } from "expo-router";
import { Text, View } from "react-native";

function signIn() {
  return (
    <View>
      <Text>Sign in</Text>
      <Link href="/signIn">Create Account</Link>
    </View>
  );
}

export default signIn;
