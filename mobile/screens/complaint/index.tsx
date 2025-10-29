import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import ScreenLayout from "../_ScreenLayout";
import { getComplaintLists } from "./queries/ComplaintGetQueries";
import { updateComplaintStatus } from "./queries/ComplaintUpdateQueries";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical, CheckCircle, XCircle, ArrowUp, UserCircle, User } from "lucide-react-native";
import { SearchWithTabs } from "./SearchWithTabs";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";
// import { ConfirmationModal } from "../my-request/complaint/components/ComplaintConfirmationModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { ComplaintData } from "../my-request/complaint/types";
import { useAuth } from "@/contexts/AuthContext";

interface ModalConfig {
  visible: boolean;
  type: "accept" | "reject" | "raise" | "cancel";
  complaintId: number | null;
  title: string;
  message: string;
  requiresInput: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmText: string;
}

const ComplaintCard = ({ 
  item, 
  onAccept, 
  onReject,
  onRaise,
  onPress,
  isProcessing 
}: { 
  item: ComplaintData;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onRaise: (id: number) => void;
  onPress: () => void;
  isProcessing: boolean;
}) => {
  const formatDate = (dateString: string) => {
    return localDateFormatter(dateString);
  };

  const requester = item.complainant && item.complainant.length > 0 
    ? item.complainant[0] 
    : null;

  const requesterName = requester?.cpnt_name || "Unknown";
  const requesterContact = requester?.cpnt_number || "N/A";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-orange-50",
          iconBg: "bg-orange-400",
          text: "Request is Pending",
          showAcceptRejectButtons: true,
          showRaiseButton: false,
          showRejectionReason: false,
        };
      case "Accepted":
        return {
          bgColor: "bg-green-50",
          iconBg: "bg-green-400",
          text: `Request has been Accepted by Barangay Staff on ${formatDate(item.comp_datetime)}`,
          showAcceptRejectButtons: false,
          showRaiseButton: true,
          showRejectionReason: false,
        };
      case "Raised":
        return {
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-400",
          text: `Request has been Raised by Barangay Staff on ${formatDate(item.comp_datetime)}`,
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: false,
        };
      case "Rejected":
        return {
          bgColor: "bg-red-50",
          iconBg: "bg-red-400",
          text: `Request has been Rejected on ${formatDate(item.comp_datetime)}`,
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: true,
        };
      case "Cancelled":
        return {
          bgColor: "bg-gray-50",
          iconBg: "bg-gray-400",
          text: `Request has been Cancelled by ${requesterName} on ${formatDate(item.comp_datetime)}`,
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: false,
        };
      default:
        return {
          bgColor: "bg-gray-50",
          iconBg: "bg-gray-400",
          text: "Status Unknown",
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: false,
        };
    }
  };

  const statusConfig = getStatusConfig(item.comp_status);

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-xl mx-4 mb-4 shadow-sm overflow-hidden"
      activeOpacity={0.7}
      disabled={isProcessing}
    >
      {/* Header Section */}
      <View className="p-4 border-2 bg-gray-100 border-gray-100 rounded-t-xl">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            {/* <View className="w-15 h-15 rounded-full bg-gray-200 text-gray-200 items-center justify-center mr-3 overflow-hidden"> */}
              {/* <UserCircle size={45}/> */}
            {/* </View> */}
            <View className="flex-1">
              <Text className="text-lg font-PoppinsSemiBold text-gray-900">
                {requesterName}
              </Text>
              <Text className="text-sm font-PoppinsRegular text-gray-500">
                {item.comp_incident_type}
              </Text>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <MoreVertical size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Information Section */}
      <View className="p-4 bg-gray-50">
        <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-3">
          Informations
        </Text>
        
        <View>
          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">Allegation</Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_allegation}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">Location</Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_location}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">Date Filed</Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900">
              {formatDate(item.comp_created_at)}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">Contact</Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900">
              {requesterContact}
            </Text>
          </View>

          {item.accused && item.accused.length > 0 && (
            <View className="flex-row justify-between py-2">
              <Text className="text-sm font-PoppinsRegular text-gray-600">Accused</Text>
              <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
                {item.accused.map(a => a.acsd_name).join(", ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Status Section */}
      <View className={`p-4 ${statusConfig.bgColor}`}>
        <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-3">
          Status
        </Text>
        
        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3 relative">
            <View className="w-full h-full rounded-full bg-gray-300" />
            <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${statusConfig.iconBg} items-center justify-center border-2 border-white`}>
              {item.comp_status === "Pending" && (
                <View className="w-2 h-2 bg-white rounded-full" />
              )}
              {(item.comp_status === "Accepted" || item.comp_status === "Raised") && (
                <CheckCircle size={14} color="white" strokeWidth={3} />
              )}
              {(item.comp_status === "Rejected" || item.comp_status === "Cancelled") && (
                <XCircle size={14} color="white" strokeWidth={3} />
              )}
            </View>
          </View>
          
          <View className="flex-1">
            <Text className="text-sm font-PoppinsRegular text-gray-700">
              {statusConfig.text}
            </Text>
            
            {statusConfig.showRejectionReason && item.comp_rejection_reason && (
              <View className="mt-2 p-2 bg-red-100 rounded-lg">
                <Text className="text-xs font-PoppinsSemiBold text-red-800 mb-1">
                  Rejection Reason:
                </Text>
                <Text className="text-xs font-PoppinsRegular text-red-700">
                  {item.comp_rejection_reason}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isProcessing && (
          <View className="py-3 items-center">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        )}

        {!isProcessing && statusConfig.showAcceptRejectButtons && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onReject(item.comp_id);
              }}
              className="flex-1 bg-white border-2 border-red-500 rounded-lg py-3 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-red-500 font-PoppinsSemiBold">Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onAccept(item.comp_id);
              }}
              className="flex-1 bg-green-500 rounded-lg py-3 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-PoppinsSemiBold">Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isProcessing && statusConfig.showRaiseButton && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onRaise(item.comp_id);
            }}
            className="bg-blue-500 rounded-lg py-3 items-center flex-row justify-center"
            activeOpacity={0.7}
          >
            <ArrowUp size={18} color="white" strokeWidth={2.5} />
            <Text className="text-white font-PoppinsSemiBold ml-2">Raise to Higher Authority</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ComplaintLists() {
  const { data: complaintList, isLoading, isError, refetch } = getComplaintLists();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const {user} = useAuth();
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: "accept",
    complaintId: null,
    title: "",
    message: "",
    requiresInput: false,
    confirmText: "Confirm",
  });

  // Get staff_id from authContext
  const getStaffId = () => {
    return user?.staff; 
  };

  const showModal = (
    type: "accept" | "reject" | "raise",
    complaintId: number
  ) => {
    const configs = {
      accept: {
        title: "Accept Complaint",
        message: "Are you sure you want to accept this complaint? You will be assigned as the handler.",
        requiresInput: false,
        confirmText: "Accept",
      },
      reject: {
        title: "Reject Complaint",
        message: "Please provide a reason for rejecting this complaint.",
        requiresInput: true,
        inputLabel: "Rejection Reason",
        inputPlaceholder: "Enter the reason for rejection...",
        confirmText: "Reject",
      },
      raise: {
        title: "Raise to Higher Authority",
        message: "Are you sure you want to escalate this complaint to higher authority?",
        requiresInput: false,
        confirmText: "Raise",
      },
    };

    setModalConfig({
      visible: true,
      type,
      complaintId,
      ...configs[type],
    });
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
    setProcessingId(null);
  };

  const handleConfirmAction = async (inputValue?: string) => {
    if (!modalConfig.complaintId) return;

    setProcessingId(modalConfig.complaintId);

    try {
      const staffId = getStaffId();
      let updateData: any = {};

      switch (modalConfig.type) {
        case "accept":
          updateData = {
            comp_status: "Accepted",
            staff_id: staffId,
          };
          break;
        case "reject":
          updateData = {
            comp_status: "Rejected",
            comp_rejection_reason: inputValue || "",
          };
          break;
        case "raise":
          updateData = {
            comp_status: "Raised",
            staff_id: staffId,
          };
          break;
      }

      await updateComplaintStatus(modalConfig.complaintId, updateData);
      
      // Refetch the list
      await refetch();
      
      hideModal();
      
      Alert.alert(
        "Success",
        `Complaint has been ${modalConfig.type}ed successfully.`
      );
    } catch (error: any) {
      console.error("Error updating complaint:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update complaint status."
      );
      setProcessingId(null);
    }
  };

  const statusCounts = useMemo(() => {
    if (!complaintList) return { all: 0, pending: 0, raised: 0, rejected: 0, cancelled: 0, accepted: 0 };

    return {
      all: complaintList.length,
      pending: complaintList.filter((item: ComplaintData) => item.comp_status === "Pending").length,
      raised: complaintList.filter((item: ComplaintData) => item.comp_status === "Raised").length,
      rejected: complaintList.filter((item: ComplaintData) => item.comp_status === "Rejected").length,
      cancelled: complaintList.filter((item: ComplaintData) => item.comp_status === "Cancelled").length,
      accepted: complaintList.filter((item: ComplaintData) => item.comp_status === "Accepted").length,
    };
  }, [complaintList]);

  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "raised", label: "Raised", count: statusCounts.raised },
    { id: "accepted", label: "Accepted", count: statusCounts.accepted },
    { id: "rejected", label: "Rejected", count: statusCounts.rejected },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  const filteredComplaints = useMemo(() => {
    if (!complaintList) return [];

    let filtered = complaintList;

    if (activeStatus !== "all") {
      filtered = filtered.filter(
        (item: ComplaintData) => item.comp_status.toLowerCase() === activeStatus
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((item: ComplaintData) => {
        const requesterName = item.complainant && item.complainant.length > 0 
          ? item.complainant[0].cpnt_name 
          : "";
        
        return (
          item.comp_incident_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.comp_allegation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.comp_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          requesterName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  }, [complaintList, activeStatus, searchQuery]);

  const handleAddComplaint = () => {
    // router.push("/(my-request)/complaint-tracking/add-complaint");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <LoadingState />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 font-PoppinsSemiBold text-lg mb-2">
            Error Loading Data
          </Text>
          <Text className="text-gray-500 font-PoppinsRegular text-center">
            Unable to load complaints. Please try again.
          </Text>
        </View>
      );
    }

    if (!complaintList || complaintList.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-700 font-PoppinsSemiBold text-lg mb-2">
            No Complaints
          </Text>
          <Text className="text-gray-500 font-PoppinsRegular text-center">
            There are no complaints to display at the moment.
          </Text>
        </View>
      );
    }

    if (filteredComplaints.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <EmptyInbox />
        </View>
      );
    }

    return (
      <FlatList
        data={filteredComplaints}
        renderItem={({ item }) => (
          <ComplaintCard
            item={item}
            onAccept={(id) => showModal("accept", id)}
            onReject={(id) => showModal("reject", id)}
            onRaise={(id) => showModal("raise", id)}
            onPress={() =>
              router.push({
                pathname: `/(my-request)/complaint-tracking/compMainView`,
                params: { comp_id: item.comp_id },
              })
            }
            isProcessing={processingId === item.comp_id}
          />
        )}
        keyExtractor={(item) => item.comp_id.toString()}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerBetweenAction={
        <Text className="text-md font-PoppinsRegular text-gray-900">
          Blotter
        </Text>
      }
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        <SearchWithTabs
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          tabs={tabs}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          showTabCounts={true}
          searchPlaceholder="Search complaints..."
          showAddButton={true}
          onAddPress={handleAddComplaint}
          addButtonLabel="Add"
        />
        {renderContent()}

        <ConfirmationModal
          {...({
            ...modalConfig,
            cancelText: "Cancel",
            onConfirm: handleConfirmAction,
            onCancel: hideModal,
            loading: processingId !== null,
          } as any)}
        />
      </View>
    </ScreenLayout>
  );
}