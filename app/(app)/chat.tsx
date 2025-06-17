import React, { useEffect, useRef } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageInput from "../../components/MessageInput";
import MessageItem from "../../components/MessageItem";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { Message } from "../../types";

export default function ChatScreen() {
  const { user, signOut } = useAuth();
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
        onPress: signOut,
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageItem
      message={item}
      isOwnMessage={item.username === user?.username}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-gray-500 text-center text-lg mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-400 text-center">
        Start the conversation by sending your first message!
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-blue-600 shadow-sm">
        <View>
          <Text className="text-white text-lg font-semibold">Chat Room</Text>
          <Text className="text-blue-100 text-sm" selectable>
            Welcome, {user?.username}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-blue-700 px-3 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <View className="flex-1 bg-white">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">Loading messages...</Text>
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
          />
        )}
      </View>

      {/* Message Input */}
      <MessageInput />
    </SafeAreaView>
  );
}
