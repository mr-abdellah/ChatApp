import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { FileData } from "../types";

interface FilePreviewProps {
  file: FileData;
  onRemove: () => void;
  showRemoveButton?: boolean;
}

export default function FilePreview({
  file,
  onRemove,
  showRemoveButton = true,
}: FilePreviewProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <View className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <View className="flex-row items-center">
        {isImage && (
          <View className="mr-3">
            <Image
              source={{ uri: file.uri }}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-blue-800 font-medium" numberOfLines={2}>
            {isImage ? "🖼️" : isVideo ? "🎥" : "📄"} {file.name}
          </Text>
          <Text className="text-blue-600 text-sm mt-1">
            {file.size ? formatFileSize(file.size) : "Ready to send"}
          </Text>
          <Text className="text-blue-500 text-xs mt-1">{file.type}</Text>
        </View>

        {showRemoveButton && (
          <TouchableOpacity
            onPress={onRemove}
            className="ml-2 p-2 bg-red-100 rounded-full"
          >
            <Text className="text-red-600 text-sm">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
