import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";
import { Message } from "../types";
import { ApiClient } from "../utils/api";
import AudioMessage from "./AudioMessage";

interface FileMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function FileMessage({
  message,
  isOwnMessage,
}: FileMessageProps) {
  // If it's an audio message, use AudioMessage component
  if (message.fileType === "audio") {
    return <AudioMessage message={message} isOwnMessage={isOwnMessage} />;
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const openFile = async () => {
    if (message.fileUrl) {
      const fullUrl = ApiClient.getFileUrl(message.fileUrl);
      await Linking.openURL(fullUrl);
    }
  };

  const renderFileContent = () => {
    if (!message.fileUrl) return null;

    const fileUrl = ApiClient.getFileUrl(message.fileUrl);

    switch (message.fileType) {
      case "image":
        return (
          <TouchableOpacity onPress={openFile}>
            <Image
              source={{ uri: fileUrl }}
              className="w-48 h-48 rounded-lg"
              resizeMode="cover"
            />
          </TouchableOpacity>
        );

      case "video":
        return <VideoPlayerComponent fileUrl={fileUrl} />;

      case "document":
        return (
          <TouchableOpacity
            className="bg-gray-100 p-4 rounded-lg w-48"
            onPress={openFile}
          >
            <Text className="text-lg mb-1">📄</Text>
            <Text className="font-medium text-gray-800 mb-1" numberOfLines={2}>
              {message.fileName}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatFileSize(message?.fileSize || 0)}
            </Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View className={`mb-4 ${isOwnMessage ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-xs ${
          isOwnMessage
            ? "bg-blue-600 rounded-br-sm"
            : "bg-gray-200 rounded-bl-sm"
        } rounded-lg p-3`}
      >
        {!isOwnMessage && (
          <Text className="text-xs font-semibold text-gray-600 mb-2">
            {message.username}
          </Text>
        )}

        {renderFileContent()}

        {message.message && (
          <Text
            className={`mt-2 ${isOwnMessage ? "text-white" : "text-gray-800"}`}
          >
            {message.message}
          </Text>
        )}

        <Text
          className={`text-xs mt-2 ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

// Separate component for video player to manage its lifecycle properly
function VideoPlayerComponent({ fileUrl }: { fileUrl: string }) {
  const player = useVideoPlayer(fileUrl, (player) => {
    player.loop = false;
    player.muted = false;
  });

  return (
    <View className="w-48 h-48 rounded-lg overflow-hidden">
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        allowsFullscreen={true}
        allowsPictureInPicture={false}
        nativeControls={true}
        contentFit="contain"
      />
    </View>
  );
}
