import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import ScreenLayout from "@/screens/_ScreenLayout";
import { getResidentComplaint } from "./queries/ComplaintGetQueries";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical, AlertCircle, XCircle } from "lucide-react-native";
import { SearchWithTabs } from "./components/SearchWithTabs";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import { Drawer } from "@/components/ui/drawer"; 
import { ConfirmationModal } from "./components/ComplaintConfirmationModal";
import { useRaiseComplaint } from "./queries/ComplaintPostQueries";
import { useQueryClient } from "@tanstack/react-query";

interface ComplaintItem {
  comp_id: string;
  comp_allegation: string;
  cpnt_name: string;
  comp_location: string;
  comp_status: "Pending" | "Resolved" | "Raised" | "Cancelled" | "Rejected";
  comp_datetime: string;
  comp_incident_type: string;
}

export default function ResidentComplaint() {
  const {user} = useAuth();
  const queryClient = useQueryClient();
  const { data: ResidentComplaintList, isLoading, isError } = getResidentComplaint();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"raise" | "cancel" | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const { mutate: raiseComplaint, isPending: isRaising } = useRaiseComplaint();

  // Calculate status counts
  const statusCounts = useMemo(() => {
    if (!ResidentComplaintList)
      return {
        all: 0,
        pending: 0,
        resolved: 0,
        raised: 0,
        cancelled: 0,
        rejected: 0,
      };

    return {
      all: ResidentComplaintList.length,
      pending: ResidentComplaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Pending"
      ).length,
      resolved: ResidentComplaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Resolved"
      ).length,
      raised: ResidentComplaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Raised"
      ).length,
    };
  }, [ResidentComplaintList]);

  // Define tabs with counts
  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "resolved", label: "Resolved", count: statusCounts.resolved },
    { id: "raised", label: "Raised", count: statusCounts.raised },
    { id: "cancelled", label: "Cancelled", count: statusCounts.raised },
    { id: "rejected", label: "Rejected", count: statusCounts.raised },
  ];

  // Filter complaints based on search and status
  const filteredComplaints = useMemo(() => {
    if (!ResidentComplaintList) return [];

    let filtered = ResidentComplaintList;

    if (activeStatus !== "all") {
      filtered = filtered.filter(
        (item: ComplaintItem) => item.comp_status.toLowerCase() === activeStatus
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (item: ComplaintItem) =>
          item.comp_incident_type
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.comp_allegation
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.comp_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [ResidentComplaintList, activeStatus, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Raised":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-gray-100 text-gray-500";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleMorePress = (item: ComplaintItem) => {
    setSelectedComplaint(item);
    setDrawerVisible(true);
  };

  const openConfirmModal = (type: "raise" | "cancel") => {
    setActionType(type);
    setDrawerVisible(false);
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = () => {
    if (!selectedComplaint) return;

    if (actionType === "raise") {
      raiseComplaint(Number(selectedComplaint.comp_id), {
        onSuccess: () => {
          console.log("Complaint successfully raised!");
          // Invalidate and refetch the complaints list
          queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
          setConfirmModalVisible(false);
          setActionType(null);
          alert("Complaint successfully raised!");
        },
        onError: (error: any) => {
          console.error("Failed to raise complaint:", error);
          setConfirmModalVisible(false);
          setActionType(null);
          alert("Failed to raise complaint. Please try again.");
        },
      });
    } else if (actionType === "cancel") {
      // Add your cancel complaint mutation here
      console.log("Cancelling complaint:", selectedComplaint.comp_id);
      // After your cancel mutation succeeds, also invalidate:
      queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
      setConfirmModalVisible(false);
      setActionType(null);
      alert("Complaint cancelled successfully!");
    }
  };

  const handleCancelModal = () => {
    setConfirmModalVisible(false);
    setActionType(null);
    setDrawerVisible(true);
  };

  const renderComplaintCard = ({ item }: { item: ComplaintItem }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: `/(my-request)/complaint-tracking/compMainView`,
          params: { comp_id: item.comp_id },
        })
      }
      className="bg-white rounded-xl p-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1">
          <View className="w-20 h-20 rounded-full bg-indigo-100 items-center justify-center mr-3 overflow-hidden">
            <Image
              source={
                user?.profile_image
                  ? { uri: user.profile_image }
                  : require("@/assets/images/Logo.png")
              }
              className="w-full h-full rounded-full"
              style={{ backgroundColor: "#f3f4f6" }}
            />
          </View>

          {/* Text Details */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mr-2">
                {item.comp_incident_type}
              </Text>

              <View
                className={`px-3 py-1 rounded-full ${
                  getStatusColor(item.comp_status).split(" ")[0]
                }`}
              >
                <Text
                  className={`text-xs font-PoppinsMedium ${
                    getStatusColor(item.comp_status).split(" ")[1]
                  }`}
                >
                  {item.comp_status}
                </Text>
              </View>
            </View>

            <Text className="text-sm font-PoppinsRegular text-gray-500" numberOfLines={1}>
              {item.comp_allegation} | {item.comp_location}
            </Text>

            {/* Status directly below details */}
            <View className="flex-row items-center mt-2">
              <Text className="text-xs font-PoppinsRegular text-gray-400">{localDateFormatter(item.comp_datetime)}</Text>
            </View>
          </View>
        </View>

        {/* Right: More icon */}
        <TouchableOpacity 
          className="p-1"
          onPress={() => handleMorePress(item)}
        >
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Datetime - bottom right */}
      <View className="items-end mt-2">
      </View>
    </TouchableOpacity>
  );

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

    if (!ResidentComplaintList || ResidentComplaintList.length === 0) {
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
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.comp_id}
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
        <Text className="text-lg font-PoppinsRegular text-gray-900">
          Blotter
        </Text>
      }
      customRightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-white">
        <SearchWithTabs
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          tabs={tabs}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          showTabCounts={true}
          searchPlaceholder="Search complaints..."
        />
        {renderContent()}
      </View>

      {/* Action Drawer */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        header="Complaint Actions"
        description={`What would you like to do with this complaint?`}
        showCloseButton={true}
        showHeaderSpacing={true}
      >
        <View className="px-6 pb-8">
          {/* Raise Option */}
          <TouchableOpacity
            onPress={() => openConfirmModal("raise")}
            className="flex-row items-start p-4 bg-blue-50 rounded-xl mb-3 border border-blue-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <AlertCircle size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Raise Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Escalate this complaint to higher authorities for urgent attention and resolution.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Cancel Option */}
          <TouchableOpacity
            onPress={() => openConfirmModal("cancel")}
            className="flex-row items-start p-4 bg-red-50 rounded-xl border border-red-100"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
              <XCircle size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Cancel Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Withdraw this complaint. This action will mark the complaint as cancelled.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Drawer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalVisible}
        onClose={handleCancelModal}
        onConfirm={handleConfirmAction}
        type={actionType === "raise" ? "raise" : "cancel"}
        title={actionType === "raise" ? "Raise Complaint?" : "Cancel Complaint?"}
        description={
          actionType === "raise"
            ? "This will escalate your complaint to higher authorities for urgent attention. Are you sure you want to continue?"
            : "This action will cancel your complaint and mark it as withdrawn. This action cannot be undone. Do you want to continue?"
        }
        confirmText="Continue"
        cancelText="Go Back"
        isLoading={isRaising}
        showDetails={!!selectedComplaint}
      />
    </ScreenLayout>
  );
}
