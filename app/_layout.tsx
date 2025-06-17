import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../contexts/AuthContext";
import { ChatProvider } from "../contexts/ChatContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <Toast />
      </ChatProvider>
    </AuthProvider>
  );
}
