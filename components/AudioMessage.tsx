import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Message } from "../types";
import { ApiClient } from "../utils/api";

interface AudioMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function AudioMessage({
  message,
  isOwnMessage,
}: AudioMessageProps) {
  const fileUrl = ApiClient.getFileUrl(message.fileUrl!);
  const player = useAudioPlayer(fileUrl);
  const status = useAudioPlayerStatus(player);

  const playPauseAudio = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = status.duration
    ? (status.currentTime / status.duration) * 100
    : 0;

  return (
    <View className={`mb-4 ${isOwnMessage ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-xs px-4 py-3 rounded-lg ${
          isOwnMessage
            ? "bg-blue-600 rounded-br-sm"
            : "bg-gray-200 rounded-bl-sm"
        }`}
      >
        {!isOwnMessage && (
          <Text className="text-xs font-semibold text-gray-600 mb-2">
            {message.username}
          </Text>
        )}

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={playPauseAudio}
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isOwnMessage ? "bg-blue-700" : "bg-gray-300"
            }`}
          >
            <Text
              className={`${isOwnMessage ? "text-white" : "text-gray-700"}`}
            >
              {status.playing ? "⏸️" : "▶️"}
            </Text>
          </TouchableOpacity>

          <View className="flex-1">
            <View
              className={`h-1 rounded-full ${
                isOwnMessage ? "bg-blue-300" : "bg-gray-400"
              }`}
            >
              <View
                className={`h-1 rounded-full ${
                  isOwnMessage ? "bg-white" : "bg-blue-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </View>

            <Text
              className={`text-xs mt-1 ${
                isOwnMessage ? "text-blue-100" : "text-gray-600"
              }`}
            >
              {status.duration
                ? `${formatTime(status.currentTime)} / ${formatTime(status.duration)}`
                : "Loading..."}
            </Text>
          </View>
        </View>

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
