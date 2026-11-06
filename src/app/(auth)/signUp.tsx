import { Link } from "expo-router";
import { Text, View } from "react-native";

function signUp() {
  return (
    <View>
      <Text>Signup</Text>
      <Link href="/signUp">Sign In</Link>
    </View>
  );
}

export default signUp;
