// contexts/ChatContext.tsx (UPDATED - DISABLE PRIVATE CHANNELS FOR NOW)
import Pusher from "pusher-js/react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";
import { ChatContextType, FileData, Message } from "../types";
import { useAuth } from "./AuthContext";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const pusher = new Pusher("6696c0d8b9223131e338", {
  cluster: "eu",
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<{
    [key: number]: Message[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMessages();
      setupPusherSubscription();
    }

    return () => {
      pusher.unsubscribe("chat-channel");
    };
  }, [isAuthenticated, user]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const fetchedMessages = await apiService.getMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupPusherSubscription = () => {
    if (!user) return;

    // Subscribe to public chat channel
    const publicChannel = pusher.subscribe("chat-channel");
    publicChannel.bind("new-message", (data: Message) => {
      console.log("Received message:", data);

      if (data.isPrivate) {
        // Handle private message
        const otherUserId =
          data.senderId === user.id ? data.receiverId : data.senderId;
        if (otherUserId) {
          setPrivateMessages((prev) => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), data],
          }));
        }
      } else {
        // Handle public message
        setMessages((prev) => [...prev, data]);
      }
    });

    console.log("Pusher subscriptions set up for user:", user.id);
  };

  const subscribeToPrivateChannel = (friendId: number) => {
    // For now, we'll use the same public channel but filter messages
    console.log("Setting up private messaging with friend:", friendId);
  };

  const sendMessage = async (messageText: string, receiverId?: number) => {
    if (!user || !messageText.trim()) return;

    try {
      const newMessage = await apiService.sendMessage(
        user.username,
        messageText.trim(),
        receiverId
      );

      if (receiverId) {
        // Add to private messages cache immediately for better UX
        setPrivateMessages((prev) => ({
          ...prev,
          [receiverId]: [...(prev[receiverId] || []), newMessage],
        }));
      }
      // Public messages will be handled by Pusher real-time
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const sendFileMessage = async (
    file: FileData,
    messageText?: string,
    receiverId?: number
  ) => {
    if (!user) return;

    try {
      const newMessage = await apiService.sendFileMessage(
        user.username,
        file,
        messageText,
        receiverId
      );

      if (receiverId) {
        setPrivateMessages((prev) => ({
          ...prev,
          [receiverId]: [...(prev[receiverId] || []), newMessage],
        }));
      }
    } catch (error) {
      console.log("Error sending file message:", error);
      throw error;
    }
  };

  const getPrivateMessages = async (friendId: number): Promise<Message[]> => {
    try {
      const messages = await apiService.getPrivateMessages(friendId);
      setPrivateMessages((prev) => ({
        ...prev,
        [friendId]: messages,
      }));
      return messages;
    } catch (error) {
      console.error("Error loading private messages:", error);
      return [];
    }
  };

  const getPrivateMessagesFromCache = (friendId: number): Message[] => {
    return privateMessages[friendId] || [];
  };

  const value: ChatContextType = {
    messages,
    sendMessage,
    sendFileMessage,
    getPrivateMessages,
    getPrivateMessagesFromCache,
    subscribeToPrivateChannel,
    isLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
