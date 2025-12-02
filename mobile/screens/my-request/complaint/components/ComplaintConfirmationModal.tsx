import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (cancellationReason?: string) => void;
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
  showCancellationReason?: boolean;
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
  showCancellationReason = false,
}: ConfirmationModalProps) => {
  const [cancellationReason, setCancellationReason] = useState("");

  // Reset states when modal closes
  React.useEffect(() => {
    if (!visible) {
      setCancellationReason("");
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case "raise":
        return {
          bgColor: "bg-blue-100",
          buttonColor: "bg-blue-600",
          icon: <AlertCircle size={32} color="#3B82F6" />,
        };
      case "cancel":
        return {
          bgColor: "bg-red-100",
          buttonColor: "bg-red-500",
          icon: <XCircle size={32} color="#EF4444" />,
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

  const handleConfirmPress = () => {
    if (showCancellationReason) {
      if (cancellationReason.trim().length === 0) {
        // You can add an alert here for validation
        return;
      }
      onConfirm(cancellationReason);
    } else {
      onConfirm();
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
        <View className="bg-white rounded-2xl w-full max-w-sm max-h-[80%]">
          <ScrollView contentContainerStyle={{ padding: 24 }}>
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

            {/* Cancellation Reason Input */}
            {showCancellationReason && (
              <View className="mb-6">
                <Text className="text-sm font-PoppinsMedium text-gray-700 mb-2">
                  Reason for Cancellation *
                </Text>
                <TextInput
                  value={cancellationReason}
                  onChangeText={setCancellationReason}
                  placeholder="Please provide your reason for cancelling this complaint..."
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px] border border-gray-300 rounded-lg p-4 text-sm font-PoppinsRegular text-gray-900 bg-white"
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
                <Text className="text-xs font-PoppinsRegular text-gray-500 mt-2">
                  This reason will be recorded and visible to administrators.
                </Text>
              </View>
            )}

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

            {/* Action Buttons - Fixed height */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 h-11 rounded-xl bg-gray-100 items-center justify-center"
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text className="text-base font-PoppinsSemiBold text-gray-700">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmPress}
                className={`flex-1 h-11 rounded-xl ${config.buttonColor} items-center justify-center ${
                  (showCancellationReason && cancellationReason.trim().length === 0) ? "opacity-50" : ""
                }`}
                activeOpacity={0.7}
                disabled={isLoading || (showCancellationReason && cancellationReason.trim().length === 0)}
              >
                <Text className="text-base font-PoppinsSemiBold text-white">
                  {isLoading ? "Processing..." : confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};