import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import AvatarPicker from "../../components/auth/AvatarPicker";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Here you would typically call an API to update the profile
      // For now, we'll just show a success message
      Toast.show({
        type: "success",
        text1: "Profile Updated",
        text2: "Your profile has been updated successfully",
      });

      setIsEditing(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-900">Profile</Text>

        <TouchableOpacity
          onPress={isEditing ? handleCancel : () => setIsEditing(true)}
          className="p-2 rounded-full bg-blue-100"
        >
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color="#3B82F6"
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Avatar Section */}
          <View className="items-center mb-8">
            {isEditing ? (
              <AvatarPicker
                onAvatarSelected={(uri) => updateFormData("avatar", uri)}
                currentAvatar={formData.avatar}
              />
            ) : (
              <View className="items-center">
                <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center border-2 border-gray-300">
                  {user?.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <Ionicons name="person" size={40} color="#9CA3AF" />
                  )}
                </View>
                <Text className="text-xl font-semibold text-gray-900 mt-3">
                  {user?.username}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Member since{" "}
                  {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
                </Text>
              </View>
            )}
          </View>

          {/* Profile Information */}
          <View className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Username"
                  value={formData.username}
                  onChangeText={(text) => updateFormData("username", text)}
                  icon="person-outline"
                  placeholder="Enter your username"
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => updateFormData("email", text)}
                  icon="mail-outline"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Bio"
                  value={formData.bio}
                  onChangeText={(text) => updateFormData("bio", text)}
                  icon="document-text-outline"
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />

                <View className="flex-row space-x-3 mt-6">
                  <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={isLoading}
                    className="flex-1"
                  />
                  <Button
                    title="Cancel"
                    onPress={handleCancel}
                    variant="outline"
                    className="flex-1"
                  />
                </View>
              </>
            ) : (
              <>
                {/* Profile Info Cards */}
                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="person-outline" size={20} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-600 ml-2">
                      Username
                    </Text>
                  </View>
                  <Text className="text-base text-gray-900">
                    {user?.username}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="mail-outline" size={20} color="#6B7280" />
                    <Text className="text-sm font-medium text-gray-600 ml-2">
                      Email
                    </Text>
                  </View>
                  <Text className="text-base text-gray-900">{user?.email}</Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4 mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text className="text-sm font-medium text-gray-600 ml-2">
                      Bio
                    </Text>
                  </View>
                  <Text className="text-base text-gray-900">
                    {user?.bio || "No bio added yet"}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-lg p-4 mb-6">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#6B7280"
                    />
                    <Text className="text-sm font-medium text-gray-600 ml-2">
                      Member Since
                    </Text>
                  </View>
                  <Text className="text-base text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : "Unknown"}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons */}
          {!isEditing && (
            <View className="space-y-3 mt-8">
              <Button
                title="Back to Chat"
                onPress={() => router.push("/(app)/chat")}
                variant="secondary"
                className="w-full"
              />

              <Button
                title="Sign Out"
                onPress={handleLogout}
                variant="outline"
                className="w-full border-red-500"
              />
            </View>
          )}

          {/* App Info */}
          <View className="mt-12 pt-6 border-t border-gray-200">
            <Text className="text-center text-gray-500 text-sm">
              Chat App v1.0.0
            </Text>
            <Text className="text-center text-gray-400 text-xs mt-1">
              Built with React Native & Expo
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
