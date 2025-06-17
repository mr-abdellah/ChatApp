import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import React, { useEffect, useState } from "react";
import { Alert, Animated, Text, TouchableOpacity, View } from "react-native";
import { FileData } from "../types";

interface VoiceRecorderProps {
  onRecordingComplete: (file: FileData) => void;
  onCancel: () => void;
  visible: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  visible,
}: VoiceRecorderProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      requestPermissions();
    }
    return () => {
      if (isRecording) {
        audioRecorder.stop();
      }
    };
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Duration counter
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          "Permission needed",
          "Please grant microphone permissions to record voice messages."
        );
        onCancel();
      }
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      onCancel();
    }
  };

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await audioRecorder.stop();

      const uri = audioRecorder.uri;
      if (uri) {
        const file: FileData = {
          uri,
          name: `voice_${Date.now()}.m4a`,
          type: "audio/mp4",
          size: undefined,
        };

        onRecordingComplete(file);
      }

      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
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
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/80 flex-1 justify-center items-center z-50">
      <View className="bg-white rounded-3xl p-8 mx-6 items-center">
        <Text className="text-xl font-semibold mb-6">Voice Message</Text>

        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
            isRecording ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          <Text className="text-white text-2xl">
            {isRecording ? "🎤" : "🎙️"}
          </Text>
        </Animated.View>

        <Text className="text-2xl font-mono mb-6 text-gray-800">
          {formatDuration(recordingDuration)}
        </Text>

        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="bg-gray-200 px-6 py-3 rounded-full"
            onPress={cancelRecording}
          >
            <Text className="text-gray-700 font-semibold">Cancel</Text>
          </TouchableOpacity>

          {!isRecording ? (
            <TouchableOpacity
              className="bg-red-500 px-6 py-3 rounded-full"
              onPress={startRecording}
            >
              <Text className="text-white font-semibold">Record</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-blue-500 px-6 py-3 rounded-full"
              onPress={stopRecording}
            >
              <Text className="text-white font-semibold">Send</Text>
            </TouchableOpacity>
          )}
        </View>

        {isRecording && (
          <Text className="text-gray-500 text-sm mt-4">
            Recording in progress...
          </Text>
        )}
      </View>
    </View>
  );
}
