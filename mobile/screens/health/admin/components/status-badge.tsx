import React from "react";
import { View, Text } from "react-native";

// For status

export const StatBadge: React.FC<{ status: string }> = ({ status }) => {
  
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' };
      case 'completed':
        return { color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-200' };
      case 'missed' :  case 'cancelled':
        return { color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' };
      default:
        return { color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' };
    }
  };
  const statusConfig = getStatusConfig(status);
  return (
    <View className={`px-3 py-1 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      <Text className={`text-xs font-semibold ${statusConfig.color}`}>{status}</Text>
    </View>
  );
};

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