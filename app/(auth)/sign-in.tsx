import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function SignInScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(username);
    } catch (error) {
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome to Chat
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Username
          </Text>
          <TextInput
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          className={`w-full py-3 rounded-lg ${
            isLoading ? "bg-gray-400" : "bg-blue-600"
          }`}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {isLoading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
