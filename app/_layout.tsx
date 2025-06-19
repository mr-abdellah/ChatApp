// _layout.tsx (COMPLETE UPDATE)
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../contexts/AuthContext";
import { ChatProvider } from "../contexts/ChatContext";
import { FriendProvider } from "../contexts/FriendContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <FriendProvider>
        <ChatProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
          <Toast />
        </ChatProvider>
      </FriendProvider>
    </AuthProvider>
  );
}
