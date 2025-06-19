// (app)/chat/private/[id].tsx (COMPLETE UPDATE)
import MessageInput from "@/components/MessageInput";
import MessageItem from "@/components/MessageItem";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { Message } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivateChatScreen() {
  const { id, username } = useLocalSearchParams<{
    id: string;
    username: string;
  }>();
  const { user } = useAuth();
  const {
    getPrivateMessages,
    getPrivateMessagesFromCache,
    subscribeToPrivateChannel,
  } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const friendId = parseInt(id);

  useEffect(() => {
    loadPrivateMessages();

    // Subscribe to real-time updates
    subscribeToPrivateChannel(friendId);
  }, [friendId]);

  useEffect(() => {
    // Update messages from cache when new messages arrive
    const cachedMessages = getPrivateMessagesFromCache(friendId);
    setMessages(cachedMessages);
  }, [getPrivateMessagesFromCache(friendId)]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadPrivateMessages = async () => {
    try {
      setIsLoading(true);
      const privateMessages = await getPrivateMessages(friendId);
      setMessages(privateMessages);
    } catch (error) {
      console.error("Error loading private messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = user?.id === item.senderId;
    return <MessageItem message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-4">
        <Ionicons name="chatbubble" size={32} color="#3B82F6" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        Start your conversation
      </Text>
      <Text className="text-gray-500 text-center">
        Send a message to {username} to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-100 mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#6B7280" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              {username}
            </Text>
            <Text className="text-sm text-green-500">● Online</Text>
          </View>
        </View>

        <TouchableOpacity className="p-2 rounded-full bg-gray-100">
          <Ionicons name="information-circle" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

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
      <MessageInput receiverId={friendId} />
    </SafeAreaView>
  );
}
