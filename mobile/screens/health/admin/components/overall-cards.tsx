import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, File, Home, PersonStanding, Syringe, User2Icon, Users } from "lucide-react-native";
import { StatusBadge } from "./status-badge";

export const Overallrecordcard: React.FC<{
  record: any;
  onPress: () => void;
}> = ({ record, onPress }) => {
  const formatAddress = () => {
    return record.address || [record.street, record.barangay, record.city, record.province].filter(Boolean).join(", ");
  };

  return (
    <TouchableOpacity className="bg-white rounded-xl border border-gray-200 mb-3 overflow-hidden shadow-sm" activeOpacity={0.8} onPress={onPress}>
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <User2Icon color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg text-gray-900">
                  {record.lname}, {record.fname} {record.mname}
                </Text>
                <Text className="text-gray-500 text-sm">ID: {record.pat_id}</Text>
              </View>
            </View>
          </View>
          <StatusBadge type={record.pat_type} />
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Users size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Age: <Text className="font-medium text-gray-900">{record.age}</Text> • {record.sex}
          </Text>
        </View>

        <View className="flex-row items-center mb-3">
          <Home size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-600 text-sm">
            Address: <Text className="font-medium text-gray-900">{formatAddress() || "No address provided"}</Text>
          </Text>
        </View>

        {record.sitio && (
          <View className="flex-row items-center mb-3">
            <Home size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Sitio: <Text className="font-medium text-gray-900">{record.sitio}</Text>
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <File size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-600 text-sm">
              Records: <Text className="font-medium text-gray-900">{record.count}</Text>
            </Text>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
