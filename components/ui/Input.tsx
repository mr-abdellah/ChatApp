import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
        <View className="relative">
          {icon && (
            <View className="absolute left-3 top-3 z-10">
              <Ionicons name={icon} size={20} color="#9CA3AF" />
            </View>
          )}
          <TextInput
            ref={ref}
            className={`
              border border-gray-300 rounded-lg px-4 py-3 text-base
              ${icon ? "pl-10" : ""}
              ${error ? "border-red-500" : "border-gray-300"}
              ${className || ""}
            `}
            placeholderTextColor="#9CA3AF"
            {...props}
          />
        </View>
        {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

export default Input;
