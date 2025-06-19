// (app)/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
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
import { useFriend } from "../../contexts/FriendContext";
import { Message } from "../../types";

export default function MainScreen() {
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
    // More robust username comparison
    const isOwnMessage =
      user?.username && item.username
        ? item.username.toLowerCase().trim() ===
          user.username.toLowerCase().trim()
        : false;
    return <MessageItem message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
        <Ionicons name="chatbubbles" size={32} color="#3B82F6" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-500 text-center px-8">
        Start the conversation by sending your first message!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-900">Chat Room</Text>
        <Text className="text-sm text-gray-500">
          Welcome, {user?.username || "Guest"}
        </Text>
      </View>

      <View className="flex-row items-center space-x-2">
        {/* Friends Button with Badge */}
        <TouchableOpacity
          onPress={() => router.push("/friends")}
          className="p-2 rounded-full bg-blue-100 relative"
        >
          <Ionicons name="people" size={20} color="#3B82F6" />
          {pendingRequests.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Search Friends Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/friends/search")}
          className="p-2 rounded-full bg-green-100"
        >
          <Ionicons name="person-add" size={20} color="#10B981" />
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/profile")}
          className="p-2 rounded-full bg-gray-100"
        >
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-5 h-5 rounded-full"
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

  const renderQuickActions = () => (
    <View className="p-4 bg-gray-50 border-b border-gray-200">
      <Text className="text-sm font-medium text-gray-700 mb-3">
        Quick Actions
      </Text>
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => router.push("/friends")}
          className="flex-1 bg-white rounded-lg p-3 items-center border border-gray-200"
        >
          <Ionicons name="people" size={24} color="#3B82F6" />
          <Text className="text-sm font-medium text-gray-900 mt-1">
            My Friends
          </Text>
          {pendingRequests.length > 0 && (
            <Text className="text-xs text-red-500 mt-1">
              {pendingRequests.length} pending
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(app)/friends/search")}
          className="flex-1 bg-white rounded-lg p-3 items-center border border-gray-200"
        >
          <Ionicons name="search" size={24} color="#10B981" />
          <Text className="text-sm font-medium text-gray-900 mt-1">
            Find Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(app)/friends/requests")}
          className="flex-1 bg-white rounded-lg p-3 items-center border border-gray-200 relative"
        >
          <Ionicons name="person-add" size={24} color="#F59E0B" />
          <Text className="text-sm font-medium text-gray-900 mt-1">
            Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {pendingRequests.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      {renderHeader()}

      {/* Quick Actions */}
      {renderQuickActions()}

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
            // Add inverted prop if messages appear in wrong order
            // inverted={false}
          />
        )}
      </View>

      {/* Message Input - No receiverId for public chat */}
      <MessageInput />
    </SafeAreaView>
  );
}
