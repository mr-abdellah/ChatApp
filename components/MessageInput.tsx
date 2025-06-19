// components/MessageInput.tsx
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../contexts/ChatContext";
import { FileData } from "../types";
import FilePicker from "./FilePicker";

interface MessageInputProps {
  receiverId?: number; // Add receiverId prop for private messaging
}

export default function MessageInput({ receiverId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { sendMessage, sendFileMessage } = useChat();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (isRecording) {
        audioRecorder.stop().catch(console.error);
      }
    };
  }, []);

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || isSending) return;

    try {
      setIsSending(true);
      if (selectedFile) {
        await sendFileMessage(
          selectedFile,
          message.trim() || undefined,
          receiverId
        );
        setSelectedFile(null);
      } else {
        await sendMessage(message, receiverId);
      }
      setMessage("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelected = (file: FileData) => {
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  const requestPermissions = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      return status.granted;
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permission needed",
        "Please grant microphone permissions to record voice messages."
      );
      return;
    }

    try {
      // Ensure we're not already recording
      if (isRecording) return;

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Animate mic button
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
      resetRecordingState();
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      // Clear timer first
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      // Stop recording
      await audioRecorder.stop();

      // Get URI and send if valid
      const uri = audioRecorder.uri;
      if (uri && recordingDuration > 1) {
        const file: FileData = {
          uri,
          name: `voice_${Date.now()}.m4a`,
          type: "audio/mp4",
          size: undefined,
        };

        setIsSending(true);
        await sendFileMessage(file, undefined, receiverId);
      }
    } catch (error) {
      console.log("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    } finally {
      // Always reset state and animations
      resetRecordingState();
      setIsSending(false);
    }
  };

  const cancelRecording = async () => {
    try {
      if (isRecording) {
        await audioRecorder.stop();
      }
    } catch (error) {
      console.error("Error canceling recording:", error);
    } finally {
      resetRecordingState();
    }
  };

  const resetRecordingState = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    // Reset animations
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Pan responder for swipe to cancel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecording,
      onMoveShouldSetPanResponder: () => isRecording,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          cancelRecording();
        }
      },
    })
  ).current;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");
    const isAudio = selectedFile.type.startsWith("audio/");

    return (
      <View className="p-3 bg-gray-100 border-t border-gray-200">
        <View className="flex-row items-center bg-white rounded-lg p-3">
          {isImage && (
            <Image
              source={{ uri: selectedFile.uri }}
              className="w-12 h-12 rounded-lg mr-3"
              resizeMode="cover"
            />
          )}

          <View className="flex-1">
            <Text className="font-medium text-gray-900 mb-1">
              {isImage ? "🖼️" : isVideo ? "🎥" : isAudio ? "🎵" : "📄"}{" "}
              {selectedFile.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {selectedFile.size
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "Ready to send"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={clearSelectedFile}
            className="p-2 rounded-full bg-red-100"
          >
            <Text className="text-red-600 font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecordingOverlay = () => {
    if (!isRecording) return null;

    return (
      <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center z-50">
        <View className="bg-white rounded-xl p-6 mx-8 items-center">
          <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
            <Text className="text-3xl">🎤</Text>
          </View>

          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {formatDuration(recordingDuration)}
          </Text>

          <Text className="text-sm text-gray-500 text-center">
            ← Swipe to cancel
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {renderFilePreview()}
      {renderRecordingOverlay()}

      <View className="flex-row items-center p-4 bg-white border-t border-gray-200">
        {/* FILE BUTTON */}
        <TouchableOpacity
          onPress={() => setShowFilePicker(true)}
          disabled={isSending || isRecording}
          className="p-2 rounded-full bg-gray-100 mr-2"
        >
          <Text className="text-lg">📎</Text>
        </TouchableOpacity>

        {/* MIC BUTTON */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isSending}
            className="p-2 rounded-full bg-blue-100 mr-2"
            {...panResponder.panHandlers}
          >
            <Text className="text-lg">{isRecording ? "🎤" : "🎙️"}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* TEXT INPUT */}
        <TextInput
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 max-h-24"
          placeholder={
            receiverId ? "Send a private message..." : "Type a message..."
          }
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!isRecording}
        />

        {/* SEND BUTTON */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={
            (!message.trim() && !selectedFile) || isSending || isRecording
          }
          className={`px-4 py-2 rounded-full ${
            (!message.trim() && !selectedFile) || isSending || isRecording
              ? "bg-gray-300"
              : "bg-blue-500"
          }`}
        >
          <Text
            className={`font-medium ${
              (!message.trim() && !selectedFile) || isSending || isRecording
                ? "text-gray-500"
                : "text-white"
            }`}
          >
            {isSending ? "Sending..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>

      <FilePicker
        visible={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onFileSelected={handleFileSelected}
      />
    </>
  );
}
