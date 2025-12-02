import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { AlertCircle, AlertTriangle } from "lucide-react-native";

// Update the ConfirmationModalProps interface
interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason?: string) => void;
  type: "raise" | "cancel" | "delete" | "warning" | "info" | "reject";
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showDetails?: boolean;
  detailsTitle?: string;
  detailsContent?: string;
  detailsSubContent?: string;
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
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
  requiresInput = false,
  inputLabel = "Reason",
  inputPlaceholder = "Please provide a reason...",
}: ConfirmationModalProps) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  // Reset states when modal closes
  React.useEffect(() => {
    if (!visible) {
      setRejectionReason("");
      setShowReasonInput(false);
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
      case "reject":
        return {
          bgColor: "bg-red-100",
          buttonColor: "bg-red-500",
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

  const handleCancelPress = () => {
    if ((type === "cancel" || type === "reject") && !showReasonInput && requiresInput) {
      setShowReasonInput(true);
    } else {
      onClose();
    }
  };

  const handleConfirmPress = () => {
    if ((type === "cancel" || type === "reject") && showReasonInput && requiresInput) {
      if (rejectionReason.trim().length === 0) {
        // You can add validation or alert here
        return;
      }
      onConfirm(rejectionReason);
    } else if ((type === "cancel" || type === "reject") && requiresInput) {
      // Show reason input if not already shown
      setShowReasonInput(true);
    } else {
      onConfirm();
    }
  };

  const handleBackToConfirmation = () => {
    setShowReasonInput(false);
    setRejectionReason("");
  };

  const config = getTypeConfig();

  const shouldShowReasonInput = (type === "cancel" || type === "reject") && requiresInput && showReasonInput;

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
              {shouldShowReasonInput ? `${type === "reject" ? "Rejection" : "Cancellation"} Reason` : title}
            </Text>

            {/* Description */}
            <Text className="text-sm font-PoppinsRegular text-gray-600 text-center mb-6">
              {shouldShowReasonInput 
                ? `Provide a reason for ${type === "reject" ? "rejecting" : "cancelling"} this blotter.`
                : description
              }
            </Text>

            {/* Reason Input */}
            {shouldShowReasonInput && (
              <View className="mb-6">
                <Text className="text-sm font-PoppinsMedium text-gray-700 mb-2">
                  {inputLabel} *
                </Text>
                <TextInput
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  placeholder={inputPlaceholder}
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px] border border-gray-300 rounded-lg p-4 text-sm font-PoppinsRegular text-gray-900 bg-white"
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            {/* Optional Details Section */}
            {!shouldShowReasonInput && showDetails && (detailsContent || detailsTitle) && (
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
                onPress={handleCancelPress}
                className="flex-1 py-3 rounded-xl bg-gray-100 h-12"
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text className="text-center text-base font-PoppinsSemiBold text-gray-700">
                  {shouldShowReasonInput ? "Back" : cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmPress}
                className={`flex-1 py-3 rounded-xl h-12 ${config.buttonColor} ${
                  (shouldShowReasonInput && rejectionReason.trim().length === 0) ? "opacity-50" : ""
                }`}
                activeOpacity={0.7}
                disabled={isLoading || (shouldShowReasonInput && rejectionReason.trim().length === 0)}
              >
                <Text className="text-center text-base font-PoppinsSemiBold text-white">
                  {isLoading 
                    ? "Processing..." 
                    : shouldShowReasonInput 
                      ? `Confirm ${type === "reject" ? "Rejection" : "Cancellation"}` 
                      : confirmText
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to confirmation button for rejection/cancellation flow */}
            {shouldShowReasonInput && (
              <TouchableOpacity
                onPress={handleBackToConfirmation}
                className="mt-4 py-2"
                activeOpacity={0.7}
              >
                <Text className="text-center text-sm font-PoppinsMedium text-blue-500">
                  Back to confirmation
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};