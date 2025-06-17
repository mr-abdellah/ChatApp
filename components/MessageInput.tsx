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

export default function MessageInput() {
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
        await sendFileMessage(selectedFile, message.trim() || undefined);
        setSelectedFile(null);
      } else {
        await sendMessage(message);
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
        console.log("file", file);
        setIsSending(true);
        await sendFileMessage(file);
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
      <View className="p-3 bg-blue-50 border-t border-blue-200">
        <View className="flex-row items-center">
          {isImage && (
            <Image
              source={{ uri: selectedFile.uri }}
              className="w-12 h-12 rounded-lg mr-3"
              resizeMode="cover"
            />
          )}

          <View className="flex-1">
            <Text className="text-blue-800 font-medium" numberOfLines={1}>
              {isImage ? "🖼️" : isVideo ? "🎥" : isAudio ? "🎵" : "📄"}{" "}
              {selectedFile.name}
            </Text>
            <Text className="text-blue-600 text-sm">
              {selectedFile.size
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "Ready to send"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={clearSelectedFile}
            className="ml-2 p-1 bg-red-100 rounded-full"
          >
            <Text className="text-red-600 text-lg">✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecordingOverlay = () => {
    if (!isRecording) return null;

    return (
      <Animated.View
        className="absolute inset-0 bg-black/50 flex-row items-center justify-center z-10"
        style={{
          opacity: slideAnim,
        }}
      >
        <View className="bg-red-500 px-4 py-2 rounded-full flex-row items-center">
          <View className="w-3 h-3 bg-white rounded-full mr-2" />
          <Text className="text-white font-semibold">
            {formatDuration(recordingDuration)}
          </Text>
        </View>
        <Text className="text-white ml-4">← Swipe to cancel</Text>
      </Animated.View>
    );
  };

  return (
    <>
      {renderFilePreview()}
      {renderRecordingOverlay()}

      <View
        className="flex-row items-center p-4 bg-white border-t border-gray-200"
        {...panResponder.panHandlers}
      >
        {/* FILE BUTTON */}
        <TouchableOpacity
          className={`mr-3 p-2 rounded-full ${selectedFile ? "bg-blue-100" : "bg-gray-100"}`}
          onPress={() => setShowFilePicker(true)}
          disabled={isSending || isRecording}
        >
          <Text
            className={`text-xl ${selectedFile ? "text-blue-600" : "text-gray-600"}`}
          >
            📎
          </Text>
        </TouchableOpacity>

        {/* MIC BUTTON */}
        <Animated.View
          className="mr-3"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          <TouchableOpacity
            className={`p-3 rounded-full items-center justify-center ${
              isRecording ? "bg-red-500" : "bg-blue-500"
            }`}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={isSending}
          >
            <Text className="text-white text-xl">
              {isRecording ? "🎤" : "🎙️"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* TEXT INPUT */}
        <TextInput
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-gray-50 mr-3"
          placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          editable={!isRecording}
        />

        {/* SEND BUTTON */}
        <TouchableOpacity
          className={`px-6 py-2 rounded-full ${
            (message.trim() || selectedFile) && !isSending
              ? "bg-blue-600"
              : "bg-gray-400"
          }`}
          onPress={handleSend}
          disabled={
            (!message.trim() && !selectedFile) || isSending || isRecording
          }
        >
          <Text className="text-white font-semibold">
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
