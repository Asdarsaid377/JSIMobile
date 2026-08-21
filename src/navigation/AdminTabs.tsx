import { Text, View } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

export type AdminTabParamList = {
  Home: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

// Placeholder tab — real admin screens (Home/Dashboard, DPT, Hasil Rekap, Timses,
// Program Pemenangan, Lacak Relawan, Broadcast, Profile) are built one at a time
// per context/build-plan.md.
function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-body-md text-text-primary">Admin Home (belum diimplementasi)</Text>
    </View>
  );
}

export function AdminTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}
