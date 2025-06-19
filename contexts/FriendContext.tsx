// contexts/FriendContext.tsx (CREATE THIS FILE)
import React, { createContext, useContext, useState } from "react";
import Toast from "react-native-toast-message";
import { apiService } from "../services/api";
import { Friend, FriendContextType, FriendRequest, SearchUser } from "../types";
import { useAuth } from "./AuthContext";

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await apiService.searchUsers(query);
      setSearchResults(results);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Search Failed",
        text2: error.response?.data?.message || "Failed to search users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      setIsLoading(true);
      await apiService.sendFriendRequest(userId);
      Toast.show({
        type: "success",
        text1: "Friend Request Sent",
        text2: "Your friend request has been sent successfully",
      });
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2: error.response?.data?.message || "Failed to send friend request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      setIsLoading(true);
      await apiService.acceptFriendRequest(requestId);
      Toast.show({
        type: "success",
        text1: "Friend Request Accepted",
        text2: "You are now friends!",
      });
      await Promise.all([loadPendingRequests(), loadFriends()]);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Accept Failed",
        text2:
          error.response?.data?.message || "Failed to accept friend request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rejectFriendRequest = async (requestId: number) => {
    try {
      setIsLoading(true);
      await apiService.rejectFriendRequest(requestId);
      Toast.show({
        type: "success",
        text1: "Friend Request Rejected",
        text2: "Friend request has been rejected",
      });
      await loadPendingRequests();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Reject Failed",
        text2:
          error.response?.data?.message || "Failed to reject friend request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendsList = await apiService.getFriends();
      setFriends(friendsList);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Load Failed",
        text2: "Failed to load friends list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await apiService.getPendingRequests();
      setPendingRequests(requests);
    } catch (error: any) {
      console.error("Failed to load pending requests:", error);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const value: FriendContextType = {
    friends,
    pendingRequests,
    searchResults,
    isLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    loadFriends,
    loadPendingRequests,
    clearSearchResults,
  };

  return (
    <FriendContext.Provider value={value}>{children}</FriendContext.Provider>
  );
}

export function useFriend() {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error("useFriend must be used within a FriendProvider");
  }
  return context;
}
