import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageInput from "../../components/MessageInput";
import MessageItem from "../../components/MessageItem";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { Message } from "../../types";

export default function ChatScreen() {
  const { user, logout } = useAuth();
  const { messages, isLoading } = useChat();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSignOut = () => {
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

  const renderMessage = ({ item }: { item: Message }) => {
    // More robust username comparison
    const isOwnMessage =
      user?.username && item.username
        ? item.username.toLowerCase().trim() ===
          user.username.toLowerCase().trim()
        : false;

    // Debug log
    console.log("Rendering message:", {
      messageUser: item.username,
      currentUser: user?.username,
      isOwn: isOwnMessage,
    });

    return <MessageItem message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
      <Text className="text-lg font-semibold text-gray-700 mt-4">
        No messages yet
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        Start the conversation by sending your first message!
      </Text>
    </View>
  );

  // Debug current user
  console.log("Current user:", user);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <View>
          <Text className="text-lg font-semibold text-gray-900">Chat Room</Text>
          <Text className="text-sm text-gray-600">
            Welcome, {user?.username || "Guest"}
          </Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => router.push("/(app)/profile")}
            className="p-2 rounded-full bg-gray-100"
          >
            {user?.avatar ? (
              <Image src={user?.avatar || ""} width={20} height={20} />
            ) : (
              <Ionicons name="person-outline" size={20} color="#374151" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSignOut}
            className="p-2 rounded-full bg-red-100"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Container */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 16,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            // Add inverted prop if messages appear in wrong order
            // inverted={false}
          />
        )}
      </View>

      {/* Message Input */}
      <MessageInput />
    </SafeAreaView>
  );
}
