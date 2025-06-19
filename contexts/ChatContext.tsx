// contexts/ChatContext.tsx (COMPLETE UPDATE)
import Pusher from "pusher-js/react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";
import { StorageService } from "../services/storage";
import { ChatContextType, FileData, Message } from "../types";
import { useAuth } from "./AuthContext";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<{
    [key: number]: Message[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pusherInstance, setPusherInstance] = useState<Pusher | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      setupPusher();
      loadMessages();
    }

    return () => {
      if (pusherInstance) {
        pusherInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const setupPusher = async () => {
    const token = await StorageService.getToken();

    const pusher = new Pusher("6696c0d8b9223131e338", {
      cluster: "eu",
      authEndpoint: "http://10.0.2.2:3000/pusher/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    setPusherInstance(pusher);
    setupPusherSubscription(pusher);
  };

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

  const setupPusherSubscription = (pusher: Pusher) => {
    if (!user) return;

    // Subscribe to public chat channel
    const publicChannel = pusher.subscribe("chat-channel");
    publicChannel.bind("new-message", (data: Message) => {
      console.log("Received public message:", data);
      if (!data.isPrivate) {
        setMessages((prev) => [...prev, data]);
      }
    });

    console.log("Pusher subscriptions set up for user:", user.id);
  };

  const subscribeToPrivateChannel = (friendId: number) => {
    if (!user || !pusherInstance) return;

    // Create consistent channel name (smaller ID first)
    const userId1 = Math.min(user.id, friendId);
    const userId2 = Math.max(user.id, friendId);
    const channelName = `private-chat-${userId1}-${userId2}`;

    console.log("Subscribing to private channel:", channelName);

    // Check if already subscribed
    const existingChannel = pusherInstance.channel(channelName);
    if (existingChannel) {
      console.log("Already subscribed to channel:", channelName);
      return;
    }

    const privateChannel = pusherInstance.subscribe(channelName);

    privateChannel.bind("new-message", (data: Message) => {
      console.log("Received private message:", data);
      if (data.isPrivate) {
        const otherUserId =
          data.senderId === user.id ? data.receiverId : data.senderId;
        if (otherUserId) {
          setPrivateMessages((prev) => ({
            ...prev,
            [otherUserId]: [...(prev[otherUserId] || []), data],
          }));
        }
      }
    });

    privateChannel.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to private channel:", channelName);
    });

    privateChannel.bind("pusher:subscription_error", (error: any) => {
      console.error(
        "Failed to subscribe to private channel:",
        channelName,
        error
      );
    });
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
        // Subscribe to private channel if not already subscribed
        subscribeToPrivateChannel(receiverId);

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
        subscribeToPrivateChannel(receiverId);
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
      // Subscribe to private channel when loading messages
      subscribeToPrivateChannel(friendId);

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
