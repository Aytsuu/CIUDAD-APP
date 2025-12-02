import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Search, ChevronRight, Info } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { formatTime } from "@/helpers/timeFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useGetGarbagePendingResident } from "../queries/garbagePickupFetchQueries";
import { router } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import { formatDate } from "@/helpers/dateHelpers";

export default function ResidentPending() {
  const { user } = useAuth();
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add refetch to the query hook
  const { data: pendingRequests = [], isLoading: isDataLoading, refetch } = useGetGarbagePendingResident(String(user?.rp));

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredData = pendingRequests.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type} 
      ${request.garb_pref_date} 
      ${request.garb_pref_time} 
      ${request.garb_additional_notes || ""}
      ${request.file_url || ""}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleCancelReq = (garb_id: string) => {
    router.push({
      pathname: "/(my-request)/garbage-pickup/garbage-cancel-req-form",
      params: { garb_id },
    });
  };

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: '/(my-request)/garbage-pickup/view-pending-details',
      params: { 
        garb_id: garb_id
      }
    });
  };

  // Empty state component
  const renderEmptyState = () => (
    searchQuery ? (
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-blue-50 p-6 rounded-lg items-center">
          <Info size={24} color="#3b82f6" className="mb-2" />
          <Text className="text-center text-gray-600">
            No matching requests found
          </Text>
          <Text className="text-center text-gray-500 mt-1">
            Try a different search term
          </Text>
        </View>
      </View>
    ) : (
      <View className="flex-1 justify-center items-center p-6">
        <View className="bg-blue-50 p-6 rounded-lg items-center">
          <Info size={24} color="#3b82f6" className="mb-2" />
          <Text className="text-center text-gray-600">
            No pending requests available
          </Text>
        </View>
      </View>
    )
  );

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Main content component
  const renderMainContent = () => (
    <View className="gap-4">
      {filteredData.map((request) => (
        <Card
          key={request.garb_id}
          className="border border-gray-200 rounded-lg bg-white"
        >
          <CardHeader className="border-b border-gray-200 p-4">
            <TouchableOpacity 
              onPress={() => handleViewDetails(request.garb_id)}
              className="flex flex-row justify-between items-center"
            >
              <View className="flex-1">
                <View className='flex flex-row justify-between items-center mb-1'>
                  <View className="bg-blue-600 px-3 py-1 rounded-full">
                    <Text className="text-white font-bold text-sm tracking-wide" numberOfLines={1}>
                      {request.garb_id}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#6b7280" />
                </View>
                <View className='flex flex-row justify-between items-center gap-2'>
                  <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                    {request.sitio_name}, {request.garb_location}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </CardHeader>
          <CardContent className="p-4">
            <View className="gap-3">
              {/* Waste Type */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">Waste Type:</Text>
                <View className="bg-orange-100 px-2 py-1 rounded-full">
                  <Text className="text-orange-700 font-medium text-xs">{request.garb_waste_type}</Text>
                </View>
              </View>

              {/* Preferred Date & Time Combined */}
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Preferred Date & Time:</Text>
                <Text className="text-sm font-medium text-right flex-1 ml-2" numberOfLines={2}>
                  {formatDate(request.garb_pref_date, "long")} • {formatTime(request.garb_pref_time)}
                </Text>
              </View>

              {/* Cancel Button */}
              <View className="flex-row justify-end mt-4">
                <Button
                  className="border border-red-500 native:h-[40px] rounded-lg px-4"
                  onPress={() => handleCancelReq(request.garb_id)}
                >
                  <Text className="text-red-600">Cancel</Text>
                </Button>
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );

  // Determine which content to render
  const renderContent = () => {
    if (isDataLoading && !isRefreshing) {
      return renderLoadingState();
    }

    if (filteredData.length === 0) {
      return renderEmptyState();
    }

    return renderMainContent();
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar*/}
      <View>
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search pending requests..."
            value={searchInputVal}
            onChangeText={(text) => {
              setSearchInputVal(text);
              handleSearch(text);
            }}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
        {!isDataLoading && (  
          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              {filteredData.length} request{filteredData.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}
      </View>

      {/* Main Content with Refresh Control */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#00a8f0']}
            tintColor="#00a8f0"
          />
        }
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: 16 
        }}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}