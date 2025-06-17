import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarPicker from "../../components/auth/AvatarPicker";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    avatar: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        bio: formData.bio.trim() || undefined,
        avatar: formData.avatar || undefined,
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
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-8">
            <Text className="text-3xl font-bold text-center text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-center text-gray-600 mb-8">
              Join the conversation today
            </Text>

            <AvatarPicker
              onAvatarSelected={(uri) => updateFormData("avatar", uri)}
              currentAvatar={formData.avatar}
            />

            <Input
              label="Username"
              placeholder="Enter your username"
              value={formData.username}
              onChangeText={(text) => updateFormData("username", text)}
              error={errors.username}
              icon="person-outline"
              autoCapitalize="none"
            />

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

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData("confirmPassword", text)}
              error={errors.confirmPassword}
              icon="lock-closed-outline"
              secureTextEntry
            />

            <Input
              label="Bio (Optional)"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChangeText={(text) => updateFormData("bio", text)}
              icon="document-text-outline"
              multiline
              numberOfLines={3}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              className="mt-6"
            />

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Text className="text-blue-500 font-semibold">Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
