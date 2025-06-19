// (app)/(app)/index.tsx (COMPLETE UPDATE)
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MessageInput from "../../components/MessageInput";
import MessageItem from "../../components/MessageItem";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useFriend } from "../../contexts/FriendContext";
import { Message } from "../../types";

export default function MainChatScreen() {
  const { user, logout } = useAuth();
  const { messages, isLoading } = useChat();
  const { pendingRequests, loadPendingRequests } = useFriend();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load pending friend requests when screen loads
    loadPendingRequests();
  }, []);

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
    const isOwnMessage = user?.id === item.senderId;
    return <MessageItem message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
        <Ionicons name="chatbubbles" size={32} color="#3B82F6" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        Welcome to Global Chat!
      </Text>
      <Text className="text-gray-500 text-center px-8">
        Start the conversation by sending your first message to everyone!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-900">Global Chat</Text>
        <Text className="text-sm text-gray-500">
          Welcome, {user?.username || "Guest"}
        </Text>
      </View>

      <View className="flex-row items-center space-x-2">
        {/* Profile Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/profile")}
          className="p-2 rounded-full bg-gray-100"
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <Ionicons name="person" size={20} color="#374151" />
          )}
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="p-2 rounded-full bg-red-100"
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      {renderHeader()}

      {/* Messages Container */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages.filter((msg) => !msg.isPrivate)} // Only show public messages
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
          />
        )}
      </View>

      {/* Message Input - No receiverId for public chat */}
      <MessageInput />
    </SafeAreaView>
  );
}
