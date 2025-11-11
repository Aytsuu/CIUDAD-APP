import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { getResidentComplaint } from "./queries/ComplaintGetQueries";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical, AlertCircle, XCircle } from "lucide-react-native";
import { SearchWithTabs } from "./components/SearchWithTabs";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/contexts/AuthContext";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import { DrawerView } from "@/components/ui/drawer"; 
import { ConfirmationModal } from "./components/ComplaintConfirmationModal";
import { useRaiseComplaint } from "./queries/ComplaintPostQueries";
import { useQueryClient } from "@tanstack/react-query";
import BottomSheet from "@gorhom/bottom-sheet";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: ResidentComplaintList, isLoading, isError } = getResidentComplaint();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"raise" | "cancel" | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const { mutate: raiseComplaint, isPending: isRaising } = useRaiseComplaint();

  const drawerRef = useRef<BottomSheet | null>(null);

  const openDrawer = (item: ComplaintItem) => {
    setSelectedComplaint(item);
    drawerRef.current?.expand();
  };

  const closeDrawer = () => {
    drawerRef.current?.close();
  };

  const openConfirmModal = (type: "raise" | "cancel") => {
    setActionType(type);
    closeDrawer();
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = () => {
    if (!selectedComplaint) return;

    if (actionType === "raise") {
      raiseComplaint(Number(selectedComplaint.comp_id), {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
          setConfirmModalVisible(false);
          setActionType(null);
          alert("Complaint successfully raised!");
        },
        onError: () => {
          alert("Failed to raise complaint. Please try again.");
          setConfirmModalVisible(false);
          setActionType(null);
        },
      });
    } else if (actionType === "cancel") {
      console.log("Cancelling complaint:", selectedComplaint.comp_id);
      queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
      setConfirmModalVisible(false);
      setActionType(null);
      alert("Complaint cancelled successfully!");
    }
  };

  const handleCancelModal = () => {
    setConfirmModalVisible(false);
    setActionType(null);
    drawerRef.current?.expand();
  };

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

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mr-2">
                {item.comp_incident_type}
              </Text>

              <View
                className={`px-3 py-1 rounded-full ${getStatusColor(item.comp_status).split(" ")[0]}`}
              >
                <Text
                  className={`text-xs font-PoppinsMedium ${getStatusColor(item.comp_status).split(" ")[1]}`}
                >
                  {item.comp_status}
                </Text>
              </View>
            </View>

            <Text className="text-sm font-PoppinsRegular text-gray-500" numberOfLines={1}>
              {item.comp_allegation} | {item.comp_location}
            </Text>

            <Text className="text-xs font-PoppinsRegular text-gray-400 mt-2">
              {localDateFormatter(item.comp_datetime)}
            </Text>
          </View>
        </View>

        <TouchableOpacity className="p-1" onPress={() => openDrawer(item)}>
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
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

    if (!ResidentComplaintList || ResidentComplaintList.length === 0)
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

    return (
      <FlatList
        data={ResidentComplaintList}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.comp_id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-lg font-PoppinsRegular text-gray-900">
          Blotter
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 text-black">
        <SearchWithTabs
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
          tabs={[]}
          activeTab={activeStatus}
          onTabChange={setActiveStatus}
          showTabCounts={true}
        />
        {renderContent()}
      </View>

      {/* ✅ Updated Drawer using DrawerView */}
      <DrawerView
        bottomSheetRef={drawerRef}
        index={-1}
        title="Complaint Actions"
        description="What would you like to do with this complaint?"
      >
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={() => openConfirmModal("raise")}
            className="flex-row items-start p-4 bg-blue-50 rounded-xl mb-3 border border-blue-100"
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <AlertCircle size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Raise Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Escalate this complaint to higher authorities.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openConfirmModal("cancel")}
            className="flex-row items-start p-4 bg-red-50 rounded-xl border border-red-100"
          >
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
              <XCircle size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Cancel Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Withdraw this complaint. This cannot be undone.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </DrawerView>

      <ConfirmationModal
        visible={confirmModalVisible}
        onClose={handleCancelModal}
        onConfirm={handleConfirmAction}
        type={actionType === "raise" ? "raise" : "cancel"}
        title={actionType === "raise" ? "Raise Complaint?" : "Cancel Complaint?"}
        description={
          actionType === "raise"
            ? "This will escalate your complaint to higher authorities. Continue?"
            : "This will cancel and withdraw the complaint. Continue?"
        }
        confirmText="Continue"
        cancelText="Go Back"
        isLoading={isRaising}
        showDetails={!!selectedComplaint}
      />
    </PageLayout>
  );
}
