import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { AlertCircle, AlertTriangle } from "lucide-react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "raise" | "cancel" | "delete" | "warning" | "info";
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showDetails?: boolean;
  detailsTitle?: string;
  detailsContent?: string;
  detailsSubContent?: string;
}

export const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  type,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Go Back",
  isLoading = false,
  showDetails = false,
  detailsTitle,
  detailsContent,
  detailsSubContent,
}: ConfirmationModalProps) => {
  // Get colors and icon based on type
  const getTypeConfig = () => {
    switch (type) {
      case "raise":
        return {
          bgColor: "bg-blue-100",
          buttonColor: "bg-blue-600",
          icon: <AlertCircle size={32} color="#3B82F6" />,
        };
      case "cancel":
      case "delete":
        return {
          bgColor: "bg-red-100",
          buttonColor: "bg-red-600",
          icon: <AlertTriangle size={32} color="#EF4444" />,
        };
      case "warning":
        return {
          bgColor: "bg-orange-100",
          buttonColor: "bg-orange-600",
          icon: <AlertTriangle size={32} color="#F97316" />,
        };
      case "info":
      default:
        return {
          bgColor: "bg-blue-100",
          buttonColor: "bg-blue-600",
          icon: <AlertCircle size={32} color="#3B82F6" />,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 self-center ${config.bgColor}`}
          >
            {config.icon}
          </View>

          {/* Title */}
          <Text className="text-xl font-PoppinsBold text-gray-900 text-center mb-2">
            {title}
          </Text>

          {/* Description */}
          <Text className="text-sm font-PoppinsRegular text-gray-600 text-center mb-6">
            {description}
          </Text>

          {/* Optional Details Section */}
          {showDetails && (detailsContent || detailsTitle) && (
            <View className="bg-gray-50 rounded-lg p-3 mb-6">
              {detailsTitle && (
                <Text className="text-xs font-PoppinsMedium text-gray-500 mb-1">
                  {detailsTitle}
                </Text>
              )}
              {detailsContent && (
                <Text className="text-sm font-PoppinsSemiBold text-gray-900">
                  {detailsContent}
                </Text>
              )}
              {detailsSubContent && (
                <Text className="text-xs font-PoppinsRegular text-gray-600 mt-1">
                  {detailsSubContent}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-100"
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text className="text-center text-base font-PoppinsSemiBold text-gray-700">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl ${config.buttonColor}`}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text className="text-center text-base font-PoppinsSemiBold text-white">
                {isLoading ? "Processing..." : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};