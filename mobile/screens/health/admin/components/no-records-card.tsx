import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FileText } from "lucide-react-native";

// Ensure you import `onRefresh` if it's defined elsewhere

export const NoRecordsCard = () => {
  return (
    <View className="flex-1 items-center justify-center p-5 my-8">
      <View className="bg-gray-50 border border-gray-200 rounded-xl p-8 items-center max-w-md">
        <FileText size={64} color="#9ca3af" />
        <Text className="text-gray-600 text-xl font-semibold mt-4 text-center">No Health Records Found</Text>
        <Text className="text-gray-500 text-base text-center mt-2 mb-4">No health records have been created for this patient yet.</Text>
      </View>
    </View>
  );
};

export default NoRecordsCard;
