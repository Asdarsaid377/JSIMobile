import { Text, View } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export type TimsesTabParamList = {
  Home: undefined;
};

const Tab = createBottomTabNavigator<TimsesTabParamList>();

// Placeholder tab — real timses screens (DPT, Program Pemenangan, Lacak Relawan,
// Broadcast, Profile) are built one at a time per context/build-plan.md.
function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-body-md text-text-primary">Timses Home (belum diimplementasi)</Text>
    </View>
  );
}

export function TimsesTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}
