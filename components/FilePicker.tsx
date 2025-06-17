import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { FileData } from "../types";

interface FilePickerProps {
  onFileSelected: (file: FileData) => void;
  visible: boolean;
  onClose: () => void;
}

export default function FilePicker({
  onFileSelected,
  visible,
  onClose,
}: FilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media library permissions to share files."
      );
      return false;
    }
    return true;
  };

  const handleFileSelection = (file: FileData) => {
    console.log("FilePicker: File selected", file); // Debug log

    // Close modal first
    onClose();

    // Process file after a small delay
    setTimeout(() => {
      console.log("FilePicker: Calling onFileSelected callback"); // Debug log
      onFileSelected(file);
    }, 100);
  };

  const pickImage = async () => {
    console.log("FilePicker: Starting image picker"); // Debug log

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log("FilePicker: Image picker result", result); // Debug log

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: FileData = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || "image/jpeg",
          size: asset.fileSize,
        };

        console.log("FilePicker: Created file object", file); // Debug log
        handleFileSelection(file);
      } else {
        console.log("FilePicker: Image selection cancelled"); // Debug log
        onClose();
      }
    } catch (error) {
      console.error("FilePicker: Error picking image", error); // Debug log
      Alert.alert("Error", "Failed to pick image");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    console.log("FilePicker: Starting camera"); // Debug log

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to take photos."
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      console.log("FilePicker: Camera result", result); // Debug log

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: FileData = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize,
        };

        console.log("FilePicker: Created camera file object", file); // Debug log
        handleFileSelection(file);
      } else {
        console.log("FilePicker: Camera cancelled"); // Debug log
        onClose();
      }
    } catch (error) {
      console.error("FilePicker: Error taking photo", error); // Debug log
      Alert.alert("Error", "Failed to take photo");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: FileData = {
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          type: asset.type || "video/mp4",
          size: asset.fileSize,
        };

        handleFileSelection(file);
      } else {
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick video");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: FileData = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size,
        };

        handleFileSelection(file);
      } else {
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-semibold text-center mb-6">
            Share File
          </Text>

          <View className="space-y-4">
            <TouchableOpacity
              className="flex-row items-center p-4 bg-blue-50 rounded-xl"
              onPress={takePhoto}
              disabled={isLoading}
            >
              <Text className="text-blue-600 text-lg">📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-green-50 rounded-xl"
              onPress={pickImage}
              disabled={isLoading}
            >
              <Text className="text-green-600 text-lg">🖼️ Choose Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-purple-50 rounded-xl"
              onPress={pickVideo}
              disabled={isLoading}
            >
              <Text className="text-purple-600 text-lg">🎥 Choose Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 bg-orange-50 rounded-xl"
              onPress={pickDocument}
              disabled={isLoading}
            >
              <Text className="text-orange-600 text-lg">
                📄 Choose Document
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-6 p-4 bg-gray-200 rounded-xl"
            onPress={onClose}
            disabled={isLoading}
          >
            <Text className="text-center text-gray-700 text-lg">Cancel</Text>
          </TouchableOpacity>

          {isLoading && (
            <Text className="text-center text-gray-500 mt-4">
              Processing...
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
