import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { localDateFormatter } from "@/helpers/localDateFormatter";
import ScreenLayout from "../_ScreenLayout";
import { getComplaintLists } from "./queries/ComplaintGetQueries";
import { router } from "expo-router";
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import { SearchWithTabs } from "./SearchWithTabs";
import EmptyInbox from "@/assets/images/empty-state/EmptyInbox.svg";
import { LoadingState } from "@/components/ui/loading-state";

interface ComplaintItem {
  comp_id: string;
  comp_allegation: string;
  cpnt_name: string;
  comp_location: string;
  comp_status: "Pending" | "Resolved" | "Raised";
  comp_datetime: string;
  comp_incident_type: string;
}

export default function ComplaintLists() {
  const { data: complaintList, isLoading, isError } = getComplaintLists();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  console.log(JSON.stringify(complaintList, null, 2));
  // Calculate status counts
  const statusCounts = useMemo(() => {
    if (!complaintList) return { all: 0, pending: 0, resolved: 0, raised: 0 };

    return {
      all: complaintList.length,
      pending: complaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Pending"
      ).length,
      resolved: complaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Resolved"
      ).length,
      raised: complaintList.filter(
        (item: ComplaintItem) => item.comp_status === "Raised"
      ).length,
    };
  }, [complaintList]);

  // Define tabs with counts
  const tabs = [
    { id: "all", label: "All", count: statusCounts.all },
    { id: "pending", label: "Pending", count: statusCounts.pending },
    { id: "resolved", label: "Resolved", count: statusCounts.resolved },
    { id: "raised", label: "Raised", count: statusCounts.raised },
  ];

  // Filter complaints based on search and status
  const filteredComplaints = useMemo(() => {
    if (!complaintList) return [];

    let filtered = complaintList;

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
  }, [complaintList, activeStatus, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Raised":
        return "bg-blue-100 text-blue-700";
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
            {/* <Image
              source={
                user?.profile_image
                  ? { uri: user.profile_image }
                  : require("@/assets/images/Logo.png")
              }
              className="w-full h-full rounded-full"
              style={{ backgroundColor: "#f3f4f6" }}
            /> */}
          </View>

          {/* Text Details */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mr-2">
                {item.cpnt_name}
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

            <Text
              className="text-sm font-PoppinsRegular text-gray-500"
              numberOfLines={1}
            >
              {item.comp_allegation} | {item.comp_location}
            </Text>

            {/* Status directly below details */}
            <View className="flex-row items-center mt-2">
              <Text className="text-xs font-PoppinsRegular text-gray-400">
                {localDateFormatter(item.comp_datetime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: More icon */}
        <TouchableOpacity className="p-1">
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Datetime - bottom right */}
      <View className="items-end mt-2"></View>
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
        <Text className="text-md font-PoppinsRegular text-gray-900">
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
    </ScreenLayout>
  );
}
