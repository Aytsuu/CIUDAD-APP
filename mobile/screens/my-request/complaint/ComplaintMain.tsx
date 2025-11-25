import React, { useState, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import PageLayout from "@/screens/_PageLayout";
import { getResidentComplaint } from "./queries/ComplaintGetQueries";
import { router } from "expo-router";
import {
  ChevronLeft,
  MoreVertical,
  Plus,
  Search,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Lock,
  User,
  Users,
} from "lucide-react-native";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { useAuth } from "@/contexts/AuthContext";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import { DrawerView, DrawerTrigger } from "@/components/ui/drawer";
import { ConfirmationModal } from "./components/ComplaintConfirmationModal";
import { useRaiseComplaint } from "./queries/ComplaintPostQueries";
import { useQueryClient } from "@tanstack/react-query";
import { ComplaintItem, Accused, Complainant } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomSheet from "@gorhom/bottom-sheet";

interface FilterOptions {
  dateRange: "all" | "today" | "week" | "month";
  incidentTypes: string[];
}

interface ExtendedComplaintItem extends ComplaintItem {
  complainant?: Complainant[];
  accused?: Accused[];
}

const ComplaintCard = ({
  item,
  onMorePress,
  onPress,
}: {
  item: ExtendedComplaintItem;
  onMorePress: () => void;
  onPress: () => void;
}) => {
  const formatDate = (dateString: string) => {
    return localDateFormatter(dateString);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-orange-50",
          iconBg: "bg-orange-400",
          text: "Pending",
        };
      case "Resolved":
        return {
          bgColor: "bg-green-50",
          iconBg: "bg-green-400",
          text: "Resolved",
        };
      case "Accepted":
        return {
          bgColor: "bg-green-50",
          iconBg: "bg-green-400",
          text: "Accepted",
        };
      case "Raised":
        return {
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-400",
          text: "Raised",
        };
      case "Rejected":
        return {
          bgColor: "bg-red-50",
          iconBg: "bg-red-400",
          text: "Rejected",
        };
      case "Cancelled":
        return {
          bgColor: "bg-gray-50",
          iconBg: "bg-gray-400",
          text: "Cancelled",
        };
      default:
        return {
          bgColor: "bg-gray-50",
          iconBg: "bg-gray-400",
          text: "Status Unknown",
        };
    }
  };

  const statusConfig = getStatusConfig(item.comp_status);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-xl mx-4 mb-4 shadow-sm overflow-hidden"
      activeOpacity={0.7}
    >
      {/* Information Section */}
      <View className="p-4 bg-gray-50">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-3">
            Blotter #{item.comp_id}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onMorePress();
            }}
            className="h-7 w-7 p-0 items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={15} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View>
          {/* Accused Information - Render all accused */}
          <View className="py-2">
            {item.accused && item.accused.length > 0 && (
              <View className="flex-row justify-between py-2">
                <Text className="text-sm font-PoppinsRegular text-gray-600">
                  Accused
                </Text>
                <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
                  {item.accused
                    .map((a) => a.acsd_name)
                    .join(", ")
                    .toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Allegation
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_allegation}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Incident Type
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_incident_type}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Location
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_location}
            </Text>
          </View>

          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Date Filed
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900">
              {formatDate(item.comp_created_at)}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Section */}
      <View className={`p-4 ${statusConfig.bgColor}`}>
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-PoppinsSemiBold text-gray-900">
            Status
          </Text>

          <View className="flex-row items-center">
            <View className="w-8 h-8 items-center justify-center mr-2">
              {item.comp_status === "Pending" && (
                <Clock size={26} color="#ed8f2d" strokeWidth={3} />
              )}

              {(item.comp_status === "Resolved" ||
                item.comp_status === "Accepted") && (
                <CheckCircle size={26} color="#00e500" strokeWidth={3} />
              )}

              {item.comp_status === "Raised" && (
                <AlertCircle size={26} color="#0a78db" strokeWidth={3} />
              )}

              {(item.comp_status === "Rejected" ||
                item.comp_status === "Cancelled") && (
                <XCircle size={26} color="#db0000" strokeWidth={3} />
              )}
            </View>

            <Text className="text-sm font-PoppinsRegular text-gray-700">
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {statusConfig.text === "Rejected" && (
          <View className="mt-3 p-3 bg-red-100 rounded-lg">
            <Text className="text-xs font-PoppinsSemiBold text-red-800 mb-1">
              Reason:
            </Text>
            <Text className="text-xs font-PoppinsRegular text-red-700">
              {item.comp_rejection_reason}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ResidentComplaint() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    data: ResidentComplaintList,
    isLoading,
    isError,
  } = getResidentComplaint();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    incidentTypes: [],
  });
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"raise" | "cancel" | null>(null);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ExtendedComplaintItem | null>(null);
  const { mutate: raiseComplaint, isPending: isRaising } = useRaiseComplaint();

  const drawerRef = useRef<BottomSheet>(null);

  const openDrawer = (item: ExtendedComplaintItem) => {
    setSelectedComplaint(item);
    drawerRef.current?.snapToIndex(0);
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
          queryClient.invalidateQueries({
            queryKey: ["ResidentComplaintList"],
          });
          setConfirmModalVisible(false);
          setActionType(null);
          setSelectedComplaint(null);
          Alert.alert("Success", "Complaint successfully raised!");
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to raise complaint."
          );
          setConfirmModalVisible(false);
          setActionType(null);
        },
      });
    } else if (actionType === "cancel") {
      queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
      setConfirmModalVisible(false);
      setActionType(null);
      setSelectedComplaint(null);
      Alert.alert("Success", "Complaint cancelled successfully!");
    }
  };

  const handleCancelModal = () => {
    setConfirmModalVisible(false);
    setActionType(null);
    drawerRef.current?.snapToIndex(0);
  };

  // Check if actions are available based on status
  const canRaiseComplaint = (complaint: ExtendedComplaintItem) => {
    // Only enable raise when status is "Accepted"
    return complaint.comp_status === "Accepted";
  };

  const canCancelComplaint = (complaint: ExtendedComplaintItem) => {
    // Only enable cancel when status is "Pending"
    return complaint.comp_status === "Pending";
  };

  // Get unique incident types from complaints
  const uniqueIncidentTypes = useMemo(() => {
    if (!ResidentComplaintList) return [] as string[];
    const types = new Set(
      ResidentComplaintList.map(
        (item: ExtendedComplaintItem) => item.comp_incident_type
      )
    );
    return Array.from(types).sort() as string[];
  }, [ResidentComplaintList]);

  // Filter by date range
  const isDateInRange = (dateString: string, range: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case "today":
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return date >= today && date <= todayEnd;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return date >= weekStart;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return date >= monthStart;
      default:
        return true;
    }
  };

  const statusCounts = useMemo(() => {
    if (!ResidentComplaintList)
      return {
        all: 0,
        pending: 0,
        raised: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
        resolved: 0,
      };

    return {
      all: ResidentComplaintList.length,
      pending: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Pending"
      ).length,
      raised: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Raised"
      ).length,
      accepted: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Accepted"
      ).length,
      rejected: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Rejected"
      ).length,
      cancelled: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Cancelled"
      ).length,
      resolved: ResidentComplaintList.filter(
        (item: ExtendedComplaintItem) => item.comp_status === "Resolved"
      ).length,
    };
  }, [ResidentComplaintList]);

  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "accepted", label: "Accepted", count: statusCounts.accepted },
    { id: "raised", label: "Raised", count: statusCounts.raised },
    { id: "resolved", label: "Resolved", count: statusCounts.resolved },
    { id: "rejected", label: "Rejected", count: statusCounts.rejected },
    { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
  ];

  const filteredComplaints = useMemo(() => {
    if (!ResidentComplaintList) return [];

    let filtered = ResidentComplaintList;

    // Filter by status - Fix: Capitalize the first letter to match the data
    if (activeStatus !== "all") {
      const capitalizedStatus =
        activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1);
      filtered = filtered.filter(
        (item: ExtendedComplaintItem) => item.comp_status === capitalizedStatus
      );
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      filtered = filtered.filter((item: ExtendedComplaintItem) =>
        isDateInRange(item.comp_created_at, filters.dateRange)
      );
    }

    // Filter by incident types
    if (filters.incidentTypes.length > 0) {
      filtered = filtered.filter((item: ExtendedComplaintItem) =>
        filters.incidentTypes.includes(item.comp_incident_type)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: ExtendedComplaintItem) => {
        const complainantName =
          item.complainant?.[0]?.cpnt_name || item.cpnt_name || "";
        const accusedNames =
          item.accused?.map((accused) => accused.acsd_name).join(" ") || "";

        return (
          item.comp_incident_type
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.comp_allegation
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.comp_location
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          complainantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          accusedNames.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  }, [ResidentComplaintList, activeStatus, searchQuery, filters]);

  const handleAddComplaint = () => {
    router.push("/(request)/complaint/complaint-req-form");
  };

  const toggleIncidentType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      incidentTypes: prev.incidentTypes.includes(type)
        ? prev.incidentTypes.filter((t) => t !== type)
        : [...prev.incidentTypes, type],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: "all",
      incidentTypes: [],
    });
  };

  const renderFilterBar = () => (
    <View className="px-4 py-3 flex-row gap-2 justify-end bg-white flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <View className="h-9 px-4 rounded-full border border-gray-400 flex-row items-center justify-center">
            <Text className="text-xs text-gray-700">Date</Text>
          </View>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 bg-white"
          overlayClassName="bg-transparent"
        >
          <DropdownMenuItem
            onPress={() =>
              setFilters((prev) => ({ ...prev, dateRange: "all" }))
            }
            className="border-0"
          >
            <Text
              className={`text-xs ${
                filters.dateRange === "all"
                  ? "font-semibold text-blue-500"
                  : "text-gray-700"
              }`}
            >
              All Time
            </Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onPress={() =>
              setFilters((prev) => ({ ...prev, dateRange: "today" }))
            }
            className="border-0"
          >
            <Text
              className={`text-xs ${
                filters.dateRange === "today"
                  ? "font-semibold text-blue-500"
                  : "text-gray-700"
              }`}
            >
              Today
            </Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onPress={() =>
              setFilters((prev) => ({ ...prev, dateRange: "week" }))
            }
            className="border-0"
          >
            <Text
              className={`text-xs ${
                filters.dateRange === "week"
                  ? "font-semibold text-blue-500"
                  : "text-gray-700"
              }`}
            >
              This Week
            </Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onPress={() =>
              setFilters((prev) => ({ ...prev, dateRange: "month" }))
            }
            className="border-0"
          >
            <Text
              className={`text-xs ${
                filters.dateRange === "month"
                  ? "font-semibold text-blue-500"
                  : "text-gray-700"
              }`}
            >
              This Month
            </Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <View className="h-9 px-4 rounded-full border border-gray-400 flex-row items-center justify-center">
            <Text className="text-xs text-gray-700">Type</Text>
          </View>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-white"
          overlayClassName="bg-transparent"
        >
          <View className="p-2">
            <Text className="text-xs font-semibold text-gray-900 mb-2 px-2">
              Incident Type
            </Text>
            {uniqueIncidentTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onPress={() => toggleIncidentType(type)}
                className="border-none"
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-4 h-4 rounded border ${
                      filters.incidentTypes.includes(type)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {filters.incidentTypes.includes(type) && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <Text className="text-xs text-gray-700">{type}</Text>
                </View>
              </DropdownMenuItem>
            ))}
          </View>
          {(filters.incidentTypes.length > 0 ||
            filters.dateRange !== "all") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={clearFilters}>
                <Text className="text-xs font-semibold text-red-500">
                  Clear Filters
                </Text>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );

  const renderTabBar = () => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      className="h-12 bg-white flex-row border-gray-200 border-b mb-10"
      contentContainerStyle={{ paddingRight: 16 }}
      scrollEnabled={true}
      data={tabs}
      renderItem={({ item: tab }) => (
        <TouchableOpacity
          onPress={() => setActiveStatus(tab.id)}
          className={`px-4 flex-row items-center border-b-2 bg-white ${
            activeStatus === tab.id ? "border-blue-500" : "border-transparent"
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-PoppinsMedium ${
              activeStatus === tab.id ? "text-blue-500" : "text-gray-600"
            }`}
          >
            {tab.label}
          </Text>
          {tab.count > 0 && (
            <View
              className={`ml-2 px-2 py-0.5 rounded-full min-w-[20px] items-center ${
                activeStatus === tab.id ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <Text
                className={`text-xs font-PoppinsSemiBold ${
                  activeStatus === tab.id ? "text-white" : "text-gray-600"
                }`}
              >
                {tab.count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <LoadingState />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
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
        <View className="flex-1 items-center justify-center px-6 py-20">
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
        <View className="flex-1 items-center justify-center px-6 py-20">
          <EmptyInbox />
        </View>
      );
    }

    return null;
  };

  // Render action buttons based on complaint status
  const renderActionButtons = () => {
    if (!selectedComplaint) return null;

    const canRaise = canRaiseComplaint(selectedComplaint);
    const canCancel = canCancelComplaint(selectedComplaint);

    return (
      <View className="pb-6">
        {/* Raise Complaint Button */}
        {canRaise ? (
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
        ) : (
          <View className="flex-row items-start p-4 bg-gray-100 rounded-xl mb-3 border border-gray-200 opacity-60">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4">
              <Lock size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-500 mb-1">
                Raise Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-500">
                {selectedComplaint.comp_status === "Pending"
                  ? "Complaint must be accepted first before raising."
                  : selectedComplaint.comp_status === "Raised"
                  ? "Complaint has already been raised."
                  : "This action is not available for the current status."}
              </Text>
            </View>
          </View>
        )}

        {/* Cancel Complaint Button */}
        {canCancel ? (
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
        ) : (
          <View className="flex-row items-start p-4 bg-gray-100 rounded-xl border border-gray-200 opacity-60">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-4">
              <Lock size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-500 mb-1">
                Cancel Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-500">
                {selectedComplaint.comp_status === "Accepted"
                  ? "Accepted complaints cannot be cancelled."
                  : selectedComplaint.comp_status === "Raised"
                  ? "Raised complaints cannot be cancelled."
                  : "This action is not available for the current status."}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1">
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
          <Text className="text-md font-PoppinsRegular text-gray-900">
            Blotter
          </Text>
        }
        rightAction={
          <View className="flex-row gap-3">
            {/* <TouchableOpacity
              onPress={() => handleAddComplaint()}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <Plus size={22} className="text-gray-700" />
            </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => setSearchQuery(searchQuery ? "" : " ")}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <Search size={22} className="text-gray-700" />
            </TouchableOpacity>
          </View>
        }
      >
        <View className="flex-1 bg-gray-50">
          {searchQuery && (
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={() => searchQuery}
            />
          )}

          {isLoading ||
          isError ||
          !ResidentComplaintList ||
          ResidentComplaintList.length === 0 ||
          filteredComplaints.length === 0 ? (
            <View className="flex-1">
              {renderFilterBar()}
              {renderTabBar()}
              {renderEmptyState()}
            </View>
          ) : (
            <FlatList
              data={filteredComplaints}
              renderItem={({ item }) => (
                <ComplaintCard
                  item={item}
                  onMorePress={() => openDrawer(item)}
                  onPress={() =>
                    router.push({
                      pathname: `/(my-request)/complaint-tracking/compMainView`,
                      params: { comp_id: item.comp_id },
                    })
                  }
                />
              )}
              keyExtractor={(item) => item.comp_id}
              ListHeaderComponent={() => (
                <View>
                  {renderFilterBar()}
                  {renderTabBar()}
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
              initialNumToRender={5}
              windowSize={5}
            />
          )}
        </View>
      </PageLayout>

      <DrawerView
        bottomSheetRef={drawerRef}
        snapPoints={[280]}
        title="Blotter Action"
        description="Manage your Blotter Request"
        index={-1}
        enablePanDownToClose={true}
      >
        {renderActionButtons()}
      </DrawerView>

      <ConfirmationModal
        visible={confirmModalVisible}
        onClose={handleCancelModal}
        onConfirm={handleConfirmAction}
        type={actionType === "raise" ? "raise" : "cancel"}
        title={
          actionType === "raise" ? "Raise Complaint?" : "Cancel Complaint?"
        }
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
    </View>
  );
}
