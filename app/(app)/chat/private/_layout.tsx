import { Stack } from "expo-router";

export default function PrivateChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
