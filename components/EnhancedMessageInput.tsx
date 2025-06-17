import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import React, { useRef, useState } from "react";
import { Alert, Animated, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useChat } from "../contexts/ChatContext";
import { FileData } from "../types";

export default function EnhancedMessageInput() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { sendMessage, sendFileMessage } = useChat();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

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
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

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
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      await audioRecorder.stop();

      const uri = audioRecorder.uri;
      if (uri && recordingDuration > 1) {
        const file: FileData = {
          uri,
          name: `voice_${Date.now()}.m4a`,
          type: "audio/mp4",
          size: undefined,
        };

        setIsSending(true);
        await sendFileMessage(file);
        setIsSending(false);
      }

      setRecordingDuration(0);
      resetAnimations();
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    if (isRecording) {
      try {
        await audioRecorder.stop();
      } catch (error) {
        console.error("Error canceling recording:", error);
      }
    }

    setIsRecording(false);
    setRecordingDuration(0);

    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    resetAnimations();
  };

  const resetAnimations = () => {
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

  // Gesture definitions
  const tap = Gesture.Tap().onEnd(() => {
    if (!isRecording) {
      Alert.alert("Voice Message", "Hold to record, release to send");
    }
  });

  const longPress = Gesture.LongPress()
    .minDuration(100)
    .onStart(() => {
      startRecording();
    })
    .onEnd(() => {
      stopRecording();
    });

  const pan = Gesture.Pan()
    .minDistance(50)
    .onEnd((event) => {
      if (event.translationX < -100) {
        // Swipe left to cancel
        cancelRecording();
      }
    });

  const micGesture = Gesture.Race(tap, longPress, pan);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const showMicButton = !message.trim() && !selectedFile;

  return (
    <>
      {isRecording && (
        <Animated.View
          className="absolute inset-0 bg-black/50 flex-row items-center justify-center z-10"
          style={{ opacity: slideAnim }}
        >
          <View className="bg-red-500 px-4 py-2 rounded-full flex-row items-center">
            <View className="w-3 h-3 bg-white rounded-full mr-2" />
            <Text className="text-white font-semibold">
              {formatDuration(recordingDuration)}
            </Text>
          </View>
          <Text className="text-white ml-4">← Swipe to cancel</Text>
        </Animated.View>
      )}

      <View className="flex-row items-center p-4 bg-white border-t border-gray-200">
        {showMicButton ? (
          <GestureDetector gesture={micGesture}>
            <Animated.View
              className="flex-1 items-center"
              style={{ transform: [{ scale: scaleAnim }] }}
            >
              <View
                className={`p-4 rounded-full items-center justify-center ${
                  isRecording ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                <Text className="text-white text-2xl">
                  {isRecording ? "🎤" : "🎙️"}
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        ) : (
          <>
            <TextInput
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full bg-gray-50 mr-3"
              placeholder="Type a message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
            {/* Send button implementation */}
          </>
        )}
      </View>
    </>
  );
}
