import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

function subscriptions() {
  return (
    <SafeAreaView>
      <Text>Subscriptions</Text>
    </SafeAreaView>
  );
}

export default subscriptions;
