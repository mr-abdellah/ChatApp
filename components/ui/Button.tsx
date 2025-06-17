import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  title,
  loading,
  variant = "primary",
  size = "md",
  disabled,
  className,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-200";
      case "outline":
        return "bg-transparent border border-blue-500";
      default:
        return "bg-blue-500";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "py-2 px-4";
      case "lg":
        return "py-4 px-8";
      default:
        return "py-3 px-6";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "secondary":
        return "text-gray-700";
      case "outline":
        return "text-blue-500";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      className={`
        rounded-lg items-center justify-center flex-row
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled || loading ? "opacity-50" : ""}
        ${className || ""}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ActivityIndicator color="white" className="mr-2" />}
      <Text className={`font-semibold ${getTextColor()}`}>
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}
