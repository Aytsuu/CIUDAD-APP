import React, { useState, useMemo, useCallback, memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Info,
  Search,
  AlertTriangle,
  HelpCircle,
  Users,
} from "lucide-react-native";
import { getComplaintLists } from "./queries/ComplaintGetQueries";
// import DateFormatter from "@/components/DateFormatter";
import ComplaintActionsDrawer from "./ComplaintActionsDrawer";
import { InfoModal } from "./Modals/InfoModal";
import { ActionSelectionModal } from "./Modals/ActionSelectionModal";
import { ComplaintIcon } from "./ComplaintIcon";

const ComplaintListScreen = () => {
  const [infoVisible, setInfoVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const { data, isLoading, isError, refetch } = getComplaintLists();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase().trim();
    return data.filter((item: any) => {
      const complainantNames = (item.complainant || [])
        .map((c: any) => c.cpnt_name || "")
        .join(" ")
        .toLowerCase();
      const incidentType = (item.comp_incident_type || "").toLowerCase();

      return complainantNames.includes(query) || incidentType.includes(query);
    });
  }, [data, searchQuery]);

  const stableData = useMemo(() => filteredData, [filteredData]);

  const handleComplaintPress = useCallback((item: any) => {
    setSelectedComplaint(item);
    setDrawerVisible(true);
  }, []);

  const handleTrackRequest = useCallback(() => {
    if (selectedComplaint) {
      router.push(`/complaint/${selectedComplaint.comp_id}` as any)
    }
  }, [selectedComplaint]);

  const handleSummon = useCallback(() => {
    if(selectedComplaint) {
      router.push("/(complaint)/summon-payment")
    }
  }, [selectedComplaint])

  const handleDeleteComplaint = useCallback(() => {
    if (selectedComplaint) {
      Alert.alert(
        "Delete Complaint",
        `Are you sure you want to delete this complaint: "${selectedComplaint.comp_incident_type}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              console.log("Deleting complaint:", selectedComplaint.comp_id);
              Alert.alert("Success", "Complaint deleted successfully");
            },
          },
        ]
      );
    }
  }, [selectedComplaint]);

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setSelectedComplaint(null);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const currentDate = monthYear(item.comp_datetime);
      const prevItem = index > 0 ? stableData[index - 1] : null;
      const prevDate = prevItem
        ? DateFormatter.monthYear(prevItem.comp_datetime)
        : null;
      const showDateHeader = currentDate !== prevDate;

      const complainantNames =
        item.complainant && item.complainant.length > 0
          ? item.complainant.map((c: any) => c.cpnt_name).filter(Boolean).join(", ")
          : "No Complainants";

      const accusedNames =
        item.accused && item.accused.length > 0
          ? item.complainant.map((a: any) => a.acc_name).filter(Boolean).join(", ")
          : "No Complainants";

      const { icon: IconComponent, color: iconColor } = ComplaintIcon(item.comp_incident_type);

      return (
        <View>
          {showDateHeader && (
            <View className="bg-gray-50 px-4 py-2 mb-2 rounded-lg">
              <Text className="text-gray-600 font-semibold text-sm uppercase tracking-wide">
                {currentDate}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="bg-white p-4 mb-3 rounded-2xl border border-gray-100"
            onPress={() => handleComplaintPress(item)}
            activeOpacity={0.8}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: `${iconColor}15` }}
                >
                  <IconComponent size={26} color={iconColor} />
                </View>

                <View className="flex-1">
                  <View className="flex flex-row justify-between mb-1">
                    <Text
                      className="text-gray-900 font-normal text-base leading-5 mb-1"
                      numberOfLines={2}
                    >
                      {complainantNames}
                    </Text>
                    <Text className="text-xs bg-red-500 rounded-full px-2 py-1 text-white animate-ping-slow" >Pending</Text>
                  </View>

                  <View className="flex flex-row justify-between">
                    <Text className="text-sm text-gray-500 font-normal">{accusedNames}</Text>
                    {item.comp_location && (
                      <Text
                        className="text-xs text-gray-500 ml-2 flex-shrink leading-4"
                        numberOfLines={1}
                      >
                        {DateFormatter.medium(item.comp_created_at)}
                      </Text>
                    )}
                  </View>

                  {complainantNames !== "No Complainants" && (
                    <View className="flex-row items-center">
                      <Users size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500 ml-2 flex-shrink" numberOfLines={1}>
                        {complainantNames}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [stableData, handleComplaintPress]
  );

  const keyExtractor = useCallback(
    (item: any) => item.comp_id?.toString() || Math.random().toString(),
    []
  );

  const toggleSearch = useCallback(() => {
    setSearchVisible((prev) => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  }, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View className="flex-1 items-center justify-center py-16">
        <HelpCircle size={48} color="#D1D5DB" />
        <Text className="text-gray-500 text-center mt-4 text-base font-medium">
          {searchQuery.trim()
            ? "No matching complaints found"
            : "No complaints found"}
        </Text>
        <Text className="text-gray-400 text-center mt-2 text-sm px-8 leading-5">
          {searchQuery.trim()
            ? "Try adjusting your search terms"
            : "Tap the + button below to file your first complaint"}
        </Text>
      </View>
    ),
    [searchQuery]
  );

  const leftAction = useMemo(
    () => (
      <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
        <ChevronLeft size={24} color="#374151" />
      </TouchableOpacity>
    ),
    []
  );

  const headerAction = useMemo(
    () => (
      <View className="flex-row items-center">
        <Text className="text-lg font-semibold text-gray-900 mr-2">
          Blotter Complaints
        </Text>
        <TouchableOpacity onPress={() => setInfoVisible(true)} className="p-1">
          <Info size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    ),
    []
  );

  const rightAction = useMemo(
    () => (
      <TouchableOpacity onPress={toggleSearch} className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
        <Search size={20} color="#374151" />
      </TouchableOpacity>
    ),
    [toggleSearch]
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100" style={{ paddingTop: 50 }}>
        <View className="flex-row items-center justify-between">
          {leftAction}
          {headerAction}
          {rightAction}
        </View>
      </View>

      {isLoading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-500 mt-4">Loading complaints...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center px-8">
          <AlertTriangle size={48} color="#EF4444" />
          <Text className="text-red-600 text-center text-lg font-medium mt-4">
            Failed to load complaints
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            Please check your connection and try again
          </Text>
        </View>
      ) : (
        <FlatList
          data={stableData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setActionModalVisible(true)}
        className="absolute bottom-6 right-6 w-20 h-20 bg-blue-600 rounded-full items-center justify-center"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>

      {/* Action Selection Modal */}
      <ActionSelectionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
      />

      {/* Complaint Actions Drawer */}
      <ComplaintActionsDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onTrackRequest={handleTrackRequest}
        onSummon ={handleSummon}
        onDelete={handleDeleteComplaint}
        complaintTitle={selectedComplaint?.comp_incident_type}
      />

      {/* Info Modal */}
      <InfoModal
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        title="Blotter Complaints"
        description="Report incidents or file complaints regarding disturbances, conflicts, or any issues within the community."
        buttonText="Confirm"
        buttonColor="bg-blue-600"
      />
    </View>
  );
};

export default memo(ComplaintListScreen);
