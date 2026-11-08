import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

function settings() {
  return (
    <SafeAreaView>
      <Text>settings</Text>
    </SafeAreaView>
  );
}

export default settings;
