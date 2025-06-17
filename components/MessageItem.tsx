import React from "react";
import { Text, View } from "react-native";
import { Message } from "../types";
import FileMessage from "./FileMessage";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: MessageItemProps) {
  // If message has a file, use FileMessage component
  if (message.fileUrl) {
    return <FileMessage message={message} isOwnMessage={isOwnMessage} />;
  }

  // Regular text message
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      className={`mb-4 flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <View
        className={`max-w-[80%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? "bg-blue-600 rounded-br-sm"
            : "bg-gray-200 rounded-bl-sm"
        }`}
      >
        {!isOwnMessage && (
          <Text className="text-xs font-semibold text-gray-600 mb-1">
            {message.username}
          </Text>
        )}
        <Text className={`${isOwnMessage ? "text-white" : "text-gray-800"}`}>
          {message.message}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}
