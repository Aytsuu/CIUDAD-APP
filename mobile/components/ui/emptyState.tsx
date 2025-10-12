import React from 'react';
import { View, Text } from 'react-native';
import { Info } from 'lucide-react-native';

const EmptyState = ({ emptyMessage = 'No data available' }) => {
  return (
    // <View className="justify-center items-center p-6 self-stretch min-h-screen">
      <View className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 items-center w-80 max-w-full">
        <View className="bg-blue-100 rounded-full p-3 mb-4">
          <Info size={32} color="#3b82f6" />
        </View>
        <Text className="text-center text-gray-700 text-lg font-medium mb-2">
          {emptyMessage}
        </Text>
        <Text className="text-center text-gray-500 text-sm">
          It looks like there's nothing here right now
        </Text>
      </View>
    // </View>
  );
};

export default EmptyState;
