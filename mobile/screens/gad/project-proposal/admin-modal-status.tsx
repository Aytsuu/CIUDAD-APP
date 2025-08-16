import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { ProjectProposal, ProposalStatus } from "./projprop-types";

export const StatusUpdateModal: React.FC<{
  visible: boolean;
  project: ProjectProposal | null;
  onClose: () => void;
  onUpdate: (status: ProposalStatus, reason: string | null) => void;
  isLoading: boolean;
}> = ({ visible, project, onClose, onUpdate, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions: ProposalStatus[] = [
    "Amend",
    "Approved",
    "Rejected",
  ];

  const isReasonRequired = selectedStatus === "Amend"; // Only require reason for "Amend" status
  const showReasonField = ["Approved", "Rejected", "Amend"].includes(selectedStatus || "");

  const isUpdateDisabled =
    !selectedStatus ||
    selectedStatus === project?.status ||
    (isReasonRequired && !reason.trim());

  const handleUpdate = () => {
    if (selectedStatus && !isUpdateDisabled) {
      // For "Approved" and "Rejected", send "No remarks provided" if reason is empty
      const finalReason = reason.trim() || 
        (["Approved", "Rejected"].includes(selectedStatus) ? "No remarks provided" : null);
      onUpdate(selectedStatus, finalReason);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setReason("");
    setShowStatusDropdown(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View className="absolute inset-0 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-lg p-6 w-[90%] max-w-md">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Update Proposal Status
          </Text>

          <View className="mb-4 relative z-10">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Select Status
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-300 rounded px-3 py-2 flex-row justify-between items-center"
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text className="text-gray-700">
                {selectedStatus || "Select Status"}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>

            {showStatusDropdown && (
              <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    className={`px-4 py-3 ${
                      status === selectedStatus ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedStatus(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text
                      className={`text-center ${
                        status === selectedStatus
                          ? "text-primaryBlue font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {showReasonField && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Reason for {selectedStatus}
                {isReasonRequired && <Text className="text-red-500"> *</Text>}
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded px-3 py-2 h-20 text-sm"
                placeholder={
                  selectedStatus === "Amend" 
                    ? "Enter reason for amend..." 
                    : "Enter remarks (optional)..."
                }
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
              />
              {isReasonRequired && !reason.trim() && (
                <Text className="text-red-500 text-xs mt-1">
                  Remark(s) is required for {selectedStatus} status.
                </Text>
              )}
            </View>
          )}

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={handleClose}
              className="py-2 px-4 rounded bg-gray-200"
              disabled={isLoading}
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdate}
              className={`py-2 px-4 rounded ${
                isUpdateDisabled || isLoading ? "bg-gray-300" : "bg-primaryBlue"
              }`}
              disabled={isUpdateDisabled || isLoading}
            >
              <Text
                className={`font-medium ${
                  isUpdateDisabled || isLoading ? "text-gray-500" : "text-white"
                }`}
              >
                {isLoading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};