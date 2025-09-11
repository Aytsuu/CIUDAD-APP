import React from "react";
import { Modal, TouchableOpacity, View, Text } from "react-native";
import { FileText, Gavel, X } from "lucide-react-native";
import { router } from "expo-router";

interface ActionSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ActionSelectionModal = ({
  visible,
  onClose,
}: ActionSelectionModalProps) => {
  const handleNavigate = (path: "/complaint-form" | "/summon-payment") => {
    onClose();
    router.push(path); 
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-semibold text-gray-900">
              Choose Action
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* File a Complaint */}
          <TouchableOpacity
            onPress={() => handleNavigate("/complaint-form")}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center mb-4"
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <FileText size={24} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                File a Complaint
              </Text>
              <Text className="text-sm text-gray-600">
                Report incidents or disturbances in the community
              </Text>
            </View>
          </TouchableOpacity>

          {/* Request for Summon */}
          <TouchableOpacity
            onPress={() => handleNavigate("/summon-payment")}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex-row items-center"
          >
            <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mr-4">
              <Gavel size={24} color="#D97706" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900 mb-1">
                Request for Summon
              </Text>
              <Text className="text-sm text-gray-600">
                Request official summons for dispute resolution
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
