import { Link, router } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      router.replace("/(app)/chat");
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-8">
          <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-center text-gray-600">
            Sign in to continue chatting
          </Text>
        </View>

        <View className="mb-6">
          <Input
            label="Email"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
            error={errors.email}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            error={errors.password}
            icon="lock-closed-outline"
            secureTextEntry
          />
        </View>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={isLoading}
          className="mb-6"
        />

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Text className="text-blue-500 font-semibold">Sign Up</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
