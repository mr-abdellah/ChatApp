// (app)/friends/index.tsx (COMPLETE UPDATE)
import Button from "@/components/ui/Button";
import { useFriend } from "@/contexts/FriendContext";
import { Friend } from "@/types";
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

export default function FriendsScreen() {
  const {
    friends,
    pendingRequests,
    isLoading,
    loadFriends,
    loadPendingRequests,
  } = useFriend();

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const handleStartChat = (friend: Friend) => {
    router.push(`/(app)/chat/private/${friend.id}?username=${friend.username}`);
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View className="flex-row items-center p-4 bg-white rounded-lg mb-3 shadow-sm">
      <View className="relative mr-3">
        <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Ionicons name="person" size={24} color="#6B7280" />
          )}
        </View>
        {/* Online Status Indicator */}
        <View
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            item.isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      </View>

      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {item.username}
        </Text>
        <Text className="text-sm text-gray-500">{item.email}</Text>
        {item.bio && (
          <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
            {item.bio}
          </Text>
        )}
        <Text className="text-xs text-gray-400 mt-1">
          {item.isOnline
            ? "Online"
            : `Last seen ${formatLastSeen(item.lastSeen)}`}
        </Text>
        <Text className="text-xs text-gray-400">
          Friends since{" "}
          {new Date(item.friendshipCreatedAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleStartChat(item)}
        className="p-3 rounded-full bg-blue-100"
      >
        <Ionicons name="chatbubble" size={20} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      <Text className="text-lg text-gray-500 mt-4">No friends yet</Text>
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        Start by searching for people you know and sending friend requests
      </Text>
      <Button
        title="Find Friends"
        onPress={() => router.push("/(app)/friends/search")}
        className="mt-6"
      />
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
        <Text className="text-xl font-bold text-gray-900">My Friends</Text>
        <View className="ml-auto flex-row space-x-2">
          <TouchableOpacity
            onPress={() => router.push("/(app)/friends/requests")}
            className="p-2 rounded-full bg-gray-100 relative"
          >
            <Ionicons name="person-add" size={20} color="#374151" />
            {pendingRequests.length > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {pendingRequests.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(app)/friends/search")}
            className="p-2 rounded-full bg-blue-100"
          >
            <Ionicons name="search" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Online Friends Count */}
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-sm text-gray-600">
          {friends.filter((f) => f.isOnline).length} of {friends.length} friends
          online
        </Text>
      </View>

      {/* Friends List */}
      <View className="flex-1 p-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading friends...</Text>
          </View>
        ) : (
          <FlatList
            data={friends.sort((a, b) => {
              // Sort by online status first, then by name
              if (a.isOnline && !b.isOnline) return -1;
              if (!a.isOnline && b.isOnline) return 1;
              return a.username.localeCompare(b.username);
            })}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshing={isLoading}
            onRefresh={loadFriends}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
