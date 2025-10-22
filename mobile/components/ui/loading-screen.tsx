import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  visible: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 z-50 items-center justify-center">
      <View className="bg-white rounded-xl p-6 items-center shadow-lg">
        <View className="flex-row space-x-1">
          <View className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" />
          <View className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" />
          <View className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" />
          <View className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse" />
        </View>
        <ActivityIndicator size="large" color="#00AFFF" className="mt-4" />
      </View>
    </View>
  );
};
