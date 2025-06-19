// (app)/friends/requests.tsx
import { useFriend } from "@/contexts/FriendContext";
import { FriendRequest } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendRequestsScreen() {
  const {
    pendingRequests,
    isLoading,
    loadPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriend();

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const handleAccept = async (requestId: number) => {
    await acceptFriendRequest(requestId);
  };

  const handleReject = async (requestId: number) => {
    await rejectFriendRequest(requestId);
  };

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View className="flex-row items-center p-4 bg-white rounded-lg mb-3 shadow-sm">
      <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
        {item.Sender?.avatar ? (
          <Image
            source={{ uri: item.Sender.avatar }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={24} color="#6B7280" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {item.Sender?.username}
        </Text>
        <Text className="text-sm text-gray-500">{item.Sender?.email}</Text>
        <Text className="text-xs text-gray-400 mt-1">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={() => handleReject(item.id)}
          className="p-2 rounded-full bg-red-100"
          disabled={isLoading}
        >
          <Ionicons name="close" size={20} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAccept(item.id)}
          className="p-2 rounded-full bg-green-100"
          disabled={isLoading}
        >
          <Ionicons name="checkmark" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="people" size={64} color="#D1D5DB" />
      <Text className="text-lg text-gray-500 mt-4">No pending requests</Text>
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        Friend requests will appear here when someone wants to connect with you
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
        <Text className="text-xl font-bold text-gray-900">Friend Requests</Text>
        {pendingRequests.length > 0 && (
          <View className="ml-auto bg-red-500 rounded-full w-6 h-6 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {pendingRequests.length}
            </Text>
          </View>
        )}
      </View>

      {/* Requests List */}
      <View className="flex-1 p-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading requests...</Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshing={isLoading}
            onRefresh={loadPendingRequests}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
