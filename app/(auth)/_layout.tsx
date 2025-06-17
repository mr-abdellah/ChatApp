import { Redirect, Stack } from "expo-router";
import { Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(app)/index" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
