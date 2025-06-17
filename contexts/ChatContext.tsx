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
    const channel = pusher.subscribe("chat-channel");
    channel.bind("new-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
  };

  const sendMessage = async (messageText: string) => {
    if (!user || !messageText.trim()) return;

    try {
      await apiService.sendMessage(user.username, messageText.trim());
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const sendFileMessage = async (file: FileData, messageText?: string) => {
    if (!user) return;

    try {
      await apiService.sendFileMessage(user.username, file, messageText);
    } catch (error) {
      console.error("Error sending file message:", error);
      throw error;
    }
  };

  const value: ChatContextType = {
    messages,
    sendMessage,
    sendFileMessage,
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
