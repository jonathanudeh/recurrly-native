import clsx from "clsx";
import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import { tabs } from "../../../constants/data";

export default function TabLayout() {
  const TabIcon = ({ focused, icon }: TabIconProps) => {
    return (
      <View className="tabs-icon">
        <View className={clsx("tabs-pill", focused && "tabs-active")}>
          <Image source={icon} resizeMode="contain" className="tabs-glyph" />
        </View>
      </View>
    );
  };

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {tabs.map((tab) => {
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} icon={tab.icon} />
              ),
            }}
          ></Tabs.Screen>
        );
      })}
    </Tabs>
  );
}
