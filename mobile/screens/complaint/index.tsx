import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
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
import { ConfirmationModal } from "../my-request/complaint/components/ComplaintConfirmationModal";

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
  onAccept,
  onReject,
  onRaise,
  onPress,
  isProcessing,
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
          text: `Request has been Accepted on ${formatDate(
            item.comp_datetime
          )}`,
          showAcceptRejectButtons: false,
          showRaiseButton: true,
          showRejectionReason: false,
        };
      case "Raised":
        return {
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-400",
          text: `Request has been Raised on ${formatDate(item.comp_datetime)}`,
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: false,
        };
      case "Rejected":
        return {
          bgColor: "bg-red-50",
          iconBg: "bg-red-400",
          text: `Request has been Rejected on ${formatDate(
            item.comp_datetime
          )}`,
          showAcceptRejectButtons: false,
          showRaiseButton: false,
          showRejectionReason: true,
        };
      case "Cancelled":
        return {
          bgColor: "bg-gray-50",
          iconBg: "bg-gray-400",
          text: `Request has been Cancelled by ${requesterName} on ${formatDate(
            item.comp_datetime
          )}`,
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
      {/* Information Section */}
      <View className="p-4 bg-gray-50">
        <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-3">
          Blotter #{item.comp_id}
        </Text>

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
        <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-3">
          Status
        </Text>

        <View className="flex-row items-center mb-4">
          <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-3 relative">
            <View className="w-full h-full rounded-full bg-gray-300" />
            <View
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${statusConfig.iconBg} items-center justify-center border-2 border-white`}
            >
              {item.comp_status === "Pending" && (
                <View className="w-2 h-2 bg-white rounded-full" />
              )}
              {(item.comp_status === "Accepted" ||
                item.comp_status === "Raised") && (
                <CheckCircle size={14} color="white" strokeWidth={3} />
              )}
              {(item.comp_status === "Rejected" ||
                item.comp_status === "Cancelled") && (
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
                  Reason:
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
            <Text className="text-white font-PoppinsSemiBold ml-2">
              Raise to Higher Authority
            </Text>
          </TouchableOpacity>
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
    confirmText: "Confirm",
  });

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
        message: "Please provide a reason for rejecting this complaint.",
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
  };

  const hideModal = () => {
    setModalConfig((prev) => ({ ...prev, visible: false }));
    setProcessingId(null);
  };

  const handleConfirmAction = async (inputValue?: string) => {
    if (!modalConfig.complaintId) return;

    setProcessingId(modalConfig.complaintId);

    try {
      let updateData: any = {};

      switch (modalConfig.type) {
        case "accept":
          updateData = {
            comp_status: "Accepted",
            staff_id: staff,
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
            staff_id: staff,
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
    <View className="px-4 py-3 flex-row gap-2 justify-end bg-white border-b border-gray-200 flex-wrap">
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 pb-10"
      contentContainerStyle={{ paddingRight: 16 }}
    >
      <View className="h-12 bg-white flex-row border-gray-200 border-b ">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
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
        ))}
      </View>
    </ScrollView>
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

    if (!complaintList || complaintList.length === 0) {
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
        <Text className="text-md font-PoppinsRegular text-gray-900">
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
            {renderTabBar()}
            {renderFilterBar()}
            {renderEmptyState()}
          </View>
        ) : (
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
            ListHeaderComponent={() => (
              <View>
                                {renderTabBar()}
                {renderFilterBar()}
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

        <ConfirmationModal
          visible={modalConfig.visible}
          type={
            modalConfig.type === "accept"
              ? "info"
              : modalConfig.type === "reject"
              ? "warning"
              : "raise"
          }
          title={modalConfig.title}
          description={modalConfig.message}
          confirmText={modalConfig.confirmText}
          cancelText="Cancel"
          onConfirm={() => handleConfirmAction()}
          onClose={hideModal}
          isLoading={processingId !== null}
        />
      </View>
    </PageLayout>
  );
}
