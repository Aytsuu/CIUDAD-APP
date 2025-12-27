import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import PageLayout from "../_PageLayout";
import { getComplaintLists } from "./queries/ComplaintGetQueries";
import { updateComplaintStatus } from "./queries/ComplaintUpdateQueries";
import { router } from "expo-router";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  ArrowUp,
  Search,
  Plus,
  MoreVertical,
  AlertCircle,
  Clock,
  Lock,
} from "lucide-react-native";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { ComplaintData } from "../my-request/complaint/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "./StaffComplaintModal";
import BottomSheet from "@gorhom/bottom-sheet";
import { DrawerView } from "@/components/ui/drawer";

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

interface FilterOptions {
  dateRange: "all" | "today" | "week" | "month";
  incidentTypes: string[];
}

const ComplaintCard = ({
  item,
  onMorePress,
  onPress,
  isProcessing,
}: {
  item: ComplaintData;
  onMorePress: () => void;
  onPress: () => void;
  isProcessing: boolean;
}) => {
  const formatDate = (dateString: string) => {
    return localDateFormatter(dateString);
  };

  const requester =
    item.complainant && item.complainant.length > 0
      ? item.complainant[0]
      : null;
  const requesterName = requester?.cpnt_name || "Unknown";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          bgColor: "bg-orange-50",
          iconColor: "#ed8f2d",
          text: "Pending",
          icon: Clock,
        };
      case "Accepted":
        return {
          bgColor: "bg-green-50",
          iconColor: "#00e500",
          text: "Accepted",
          icon: CheckCircle,
        };
      case "Raised":
        return {
          bgColor: "bg-blue-50",
          iconColor: "#0a78db",
          text: "Raised",
          icon: AlertCircle,
        };
      case "Rejected":
        return {
          bgColor: "bg-red-50",
          iconColor: "#db0000",
          text: "Rejected",
          icon: XCircle,
        };
      case "Cancelled":
        return {
          bgColor: "bg-gray-50",
          iconColor: "#6B7280",
          text: "Cancelled",
          icon: XCircle,
        };
      default:
        return {
          bgColor: "bg-gray-50",
          iconColor: "#6B7280",
          text: "Status Unknown",
          icon: Clock,
        };
    }
  };

  const statusConfig = getStatusConfig(item.comp_status);
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border border-gray-200 rounded-xl mx-4 mb-4 shadow-sm overflow-hidden"
      activeOpacity={0.7}
      disabled={isProcessing}
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
          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Complainant
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {requesterName.toUpperCase()}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-sm font-PoppinsRegular text-gray-600">
              Allegation
            </Text>
            <Text className="text-sm font-PoppinsMedium text-gray-900 text-right flex-1 ml-4">
              {item.comp_allegation.toUpperCase()}
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
      </View>

      {/* Status Section */}
      <View className={`p-4 ${statusConfig.bgColor}`}>
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-PoppinsSemiBold text-gray-900">
            Status
          </Text>

          <View className="flex-row items-center">
            <View className="w-8 h-8 items-center justify-center mr-2">
              <StatusIcon
                size={26}
                color={statusConfig.iconColor}
                strokeWidth={3}
              />
            </View>
            <Text className="text-sm font-PoppinsRegular text-gray-700">
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {statusConfig.text === "Rejected" && item.comp_rejection_reason && (
          <View className="mt-3 p-3 bg-red-100 rounded-lg">
            <Text className="text-xs font-PoppinsSemiBold text-red-800 mb-1">
              Reason:
            </Text>
            <Text className="text-xs font-PoppinsRegular text-red-700">
              {item.comp_rejection_reason}
            </Text>
          </View>
        )}

        {isProcessing && (
          <View className="pt-3 items-center">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ComplaintLists() {
  const {
    data: complaintList,
    isLoading,
    isError,
    refetch,
  } = getComplaintLists();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { user } = useAuth();
  const staff = user?.staff?.staff_id;
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    incidentTypes: [],
  });

  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: "accept",
    complaintId: null,
    title: "",
    message: "",
    requiresInput: false,
    inputLabel: "",
    inputPlaceholder: "",
    confirmText: "Confirm",
  });

  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintData | null>(null);
  const drawerRef = useRef<BottomSheet>(null);

  const openDrawer = (item: ComplaintData) => {
    setSelectedComplaint(item);
    drawerRef.current?.snapToIndex(0);
  };

  const closeDrawer = () => {
    drawerRef.current?.close();
  };

  const showModal = (
    type: "accept" | "reject" | "raise",
    complaintId: number
  ) => {
    const configs = {
      accept: {
        title: "Accept Complaint",
        message:
          "Are you sure you want to accept this complaint? You will be assigned as the handler.",
        requiresInput: false,
        confirmText: "Accept",
      },
      reject: {
        title: "Reject Complaint",
        message:
          "Are you sure you want to reject this complaint? You will need to provide a reason for rejection.",
        requiresInput: true,
        inputLabel: "Rejection Reason",
        inputPlaceholder: "Enter the reason for rejection...",
        confirmText: "Reject",
      },
      raise: {
        title: "Raise to Higher Authority",
        message:
          "Are you sure you want to escalate this complaint to higher authority?",
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
    closeDrawer();
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
    setProcessingId(null);
  };

  // Fix in the handleConfirmAction function
  const handleConfirmAction = async (inputValue?: string) => {
    if (!modalConfig.complaintId) return;

    setProcessingId(modalConfig.complaintId);

    try {
      let updateData: any = {};

      switch (modalConfig.type) {
        case "accept":
          updateData = {
            comp_status: "Accepted",
            staff_id: Number(staff), // ✅ Convert to number
          };
          break;
        case "reject":
          if (!inputValue || inputValue.trim().length === 0) {
            Alert.alert("Error", "Please provide a rejection reason.");
            setProcessingId(null);
            return;
          }
          updateData = {
            comp_status: "Rejected",
            comp_rejection_reason: inputValue.trim(),
          };
          break;
        case "raise":
          updateData = {
            comp_status: "Raised",
            staff_id: Number(staff), // ✅ Convert to number
          };
          break;
      }

      await updateComplaintStatus(modalConfig.complaintId, updateData);
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

  // Check if actions are available based on status
  const canAcceptComplaint = (complaint: ComplaintData) => {
    return complaint.comp_status === "Pending";
  };

  const canRejectComplaint = (complaint: ComplaintData) => {
    return complaint.comp_status === "Pending";
  };

  const canRaiseComplaint = (complaint: ComplaintData) => {
    return complaint.comp_status === "Accepted";
  };

  // Render action buttons in drawer based on complaint status
  const renderActionButtons = () => {
    if (!selectedComplaint) return null;

    const canAccept = canAcceptComplaint(selectedComplaint);
    const canReject = canRejectComplaint(selectedComplaint);
    const canRaise = canRaiseComplaint(selectedComplaint);

    return (
      <View className="pb-6">
        {/* Accept Complaint Button */}
        {canAccept ? (
          <TouchableOpacity
            onPress={() => showModal("accept", selectedComplaint.comp_id)}
            className="flex-row items-start p-4 bg-green-50 rounded-xl mb-3 border border-green-100"
          >
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
              <CheckCircle size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Accept Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Accept and take responsibility for handling this complaint.
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
                Accept Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-500">
                {selectedComplaint.comp_status === "Accepted"
                  ? "Complaint has already been accepted."
                  : selectedComplaint.comp_status === "Raised"
                  ? "Complaint has been raised to higher authority."
                  : "This action is not available for the current status."}
              </Text>
            </View>
          </View>
        )}

        {/* Reject Complaint Button */}
        {canReject ? (
          <TouchableOpacity
            onPress={() => showModal("reject", selectedComplaint.comp_id)}
            className="flex-row items-start p-4 bg-red-50 rounded-xl mb-3 border border-red-100"
          >
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
              <XCircle size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Reject Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Reject this complaint with a valid reason.
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
                Reject Complaint
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-500">
                {selectedComplaint.comp_status === "Accepted"
                  ? "Accepted complaints cannot be rejected."
                  : selectedComplaint.comp_status === "Raised"
                  ? "Raised complaints cannot be rejected."
                  : "This action is not available for the current status."}
              </Text>
            </View>
          </View>
        )}

        {/* Raise Complaint Button */}
        {canRaise ? (
          <TouchableOpacity
            onPress={() => showModal("raise", selectedComplaint.comp_id)}
            className="flex-row items-start p-4 bg-blue-50 rounded-xl border border-blue-100"
          >
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
              <ArrowUp size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Raise to Higher Authority
              </Text>
              <Text className="text-xs font-PoppinsRegular text-gray-600">
                Escalate this complaint to higher authorities for review.
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
                Raise to Higher Authority
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
      </View>
    );
  };

  // Get unique incident types from complaints
  const uniqueIncidentTypes = useMemo(() => {
    if (!complaintList) return [] as string[];
    const types = new Set(
      complaintList.map((item: ComplaintData) => item.comp_incident_type)
    );
    return Array.from(types).sort() as string[];
  }, [complaintList]);

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
    if (!complaintList)
      return {
        all: 0,
        pending: 0,
        raised: 0,
        rejected: 0,
        cancelled: 0,
        accepted: 0,
      };

    return {
      all: complaintList.length,
      pending: complaintList.filter(
        (item: ComplaintData) => item.comp_status === "Pending"
      ).length,
      raised: complaintList.filter(
        (item: ComplaintData) => item.comp_status === "Raised"
      ).length,
      rejected: complaintList.filter(
        (item: ComplaintData) => item.comp_status === "Rejected"
      ).length,
      cancelled: complaintList.filter(
        (item: ComplaintData) => item.comp_status === "Cancelled"
      ).length,
      accepted: complaintList.filter(
        (item: ComplaintData) => item.comp_status === "Accepted"
      ).length,
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

    // Filter by status
    if (activeStatus !== "all") {
      filtered = filtered.filter(
        (item: ComplaintData) => item.comp_status.toLowerCase() === activeStatus
      );
    }

    // Filter by date range
    if (filters.dateRange !== "all") {
      filtered = filtered.filter((item: ComplaintData) =>
        isDateInRange(item.comp_created_at, filters.dateRange)
      );
    }

    // Filter by incident types
    if (filters.incidentTypes.length > 0) {
      filtered = filtered.filter((item: ComplaintData) =>
        filters.incidentTypes.includes(item.comp_incident_type)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item: ComplaintData) => {
        const requesterName =
          item.complainant && item.complainant.length > 0
            ? item.complainant[0].cpnt_name
            : "";

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
          requesterName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return filtered;
  }, [complaintList, activeStatus, searchQuery, filters]);

  const handleAddComplaint = () => {
    router.push({
      pathname: "/(request)/complaint/complaint-req-form",
      params: staff,
    });
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
            Unable to load Blotter Data. Please try again.
          </Text>
        </View>
      );
    }

    if (!complaintList || complaintList.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Text className="text-gray-700 font-PoppinsSemiBold text-lg mb-2">
            No Blotter
          </Text>
          <Text className="text-gray-500 font-PoppinsRegular text-center">
            There are no blotter to display at the moment.
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
          <Text className="text-md font-primary-medium text-gray-900">
            Blotter
          </Text>
        }
        rightAction={
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleAddComplaint()}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <Plus size={22} className="text-gray-700" />
            </TouchableOpacity>
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
          !complaintList ||
          complaintList.length === 0 ||
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
                  isProcessing={processingId === item.comp_id}
                />
              )}
              keyExtractor={(item) => item.comp_id.toString()}
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

      {/* Action Drawer */}
      <DrawerView
        bottomSheetRef={drawerRef}
        snapPoints={[380]}
        title="Blotter Actions"
        description="Manage your blotter request"
        index={-1}
        enablePanDownToClose={true}
      >
        {renderActionButtons()}
      </DrawerView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalConfig.visible}
        type={
          modalConfig.type === "accept"
            ? "info"
            : modalConfig.type === "reject"
            ? "reject"
            : "raise"
        }
        title={modalConfig.title}
        description={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText="Cancel"
        onConfirm={handleConfirmAction}
        onClose={hideModal}
        isLoading={processingId !== null}
        requiresInput={modalConfig.requiresInput}
        inputLabel={modalConfig.inputLabel}
        inputPlaceholder={modalConfig.inputPlaceholder}
      />
    </View>
  );
}
