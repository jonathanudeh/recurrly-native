import { Text, Pressable, View } from "react-native";

function ListHeading({ title, onPress }: ListHeadingProps) {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <Pressable
        accessibilityRole="button"
        className="list-action"
        onPress={onPress}
      >
        <Text className="list-action-text">View all</Text>
      </Pressable>
    </View>
  );
}

export default ListHeading;
