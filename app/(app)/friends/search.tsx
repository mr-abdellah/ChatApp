// (app)/friends/search.tsx
import Button from "@/components/ui/Button";
import { useFriend } from "@/contexts/FriendContext";
import { SearchUser } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchUsersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    searchResults,
    isLoading,
    searchUsers,
    sendFriendRequest,
    clearSearchResults,
  } = useFriend();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        clearSearchResults();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSendFriendRequest = async (userId: number) => {
    await sendFriendRequest(userId);
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => (
    <View className="flex-row items-center p-4 bg-white rounded-lg mb-3 shadow-sm">
      <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3">
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <Ionicons name="person" size={24} color="#6B7280" />
        )}
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
      </View>

      <Button
        title="Add Friend"
        onPress={() => handleSendFriendRequest(item.id)}
        className="px-4 py-2"
        disabled={isLoading}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="search" size={64} color="#D1D5DB" />
      <Text className="text-lg text-gray-500 mt-4">
        {searchQuery ? "No users found" : "Search for users to add as friends"}
      </Text>
      <Text className="text-sm text-gray-400 mt-2 text-center px-8">
        {searchQuery
          ? "Try a different search term"
          : "Enter a username or email to get started"}
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
        <Text className="text-xl font-bold text-gray-900">Find Friends</Text>
      </View>

      {/* Search Input */}
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <View className="flex-1 p-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
