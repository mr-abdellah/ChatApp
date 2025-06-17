import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AvatarPickerProps {
  onAvatarSelected: (uri: string) => void;
  currentAvatar?: string;
}

export default function AvatarPicker({
  onAvatarSelected,
  currentAvatar,
}: AvatarPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to select an avatar."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAvatarSelected(result.assets[0].uri);
      setShowPicker(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onAvatarSelected(result.assets[0].uri);
      setShowPicker(false);
    }
  };

  return (
    <View className="items-center mb-6">
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center border-2 border-gray-300"
      >
        {currentAvatar ? (
          <Image
            source={{ uri: currentAvatar }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <Ionicons name="person" size={40} color="#9CA3AF" />
        )}
        <View className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
          <Ionicons name="camera" size={16} color="white" />
        </View>
      </TouchableOpacity>

      <Text className="text-sm text-gray-600 mt-2">Tap to add avatar</Text>

      <Modal visible={showPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-lg font-semibold text-center mb-4">
              Select Avatar
            </Text>

            <TouchableOpacity
              onPress={takePhoto}
              className="flex-row items-center p-4 border-b border-gray-200"
            >
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text className="ml-3 text-lg">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              className="flex-row items-center p-4 border-b border-gray-200"
            >
              <Ionicons name="images" size={24} color="#3B82F6" />
              <Text className="ml-3 text-lg">Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              className="flex-row items-center p-4 justify-center"
            >
              <Text className="text-lg text-red-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
