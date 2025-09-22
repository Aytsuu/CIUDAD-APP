import React from "react";
import { View, Text } from "react-native";


export const StatusBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "resident":
        return {
          color: "text-green-700",
          bgColor: "bg-green-100",
          borderColor: "border-green-200"
        };
      case "transient":
        return {
          color: "text-purple-700",
          bgColor: "bg-purple-100",
          borderColor: "border-purple-200"
        };
      default:
        return {
          color: "text-gray-700",
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200"
        };
    }
  };

  const typeConfig = getTypeConfig(type);
  return (
    <View className={`px-3 py-1 rounded-full border ${typeConfig.bgColor} ${typeConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${typeConfig.color}`}>{type}</Text>
    </View>
  );
};