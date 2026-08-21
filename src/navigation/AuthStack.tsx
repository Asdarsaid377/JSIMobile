import { Text, View } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Placeholder — real Login screen (with GPS requirement, per client/src/pages/Login.jsx)
// is built in a later /new-feature session per context/build-plan.md.
function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-body-md text-text-primary">Login (belum diimplementasi)</Text>
    </View>
  );
}

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
