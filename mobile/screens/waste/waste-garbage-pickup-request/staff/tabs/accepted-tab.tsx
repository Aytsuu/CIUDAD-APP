import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageAcceptRequest } from "../queries/garbagePickupStaffFetchQueries";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";

export default function AcceptedGarbageRequest() {
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, _setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  // Query hook with pagination and search
  const { data: acceptedReqData, isLoading,  refetch } = useGetGarbageAcceptRequest(currentPage, pageSize, searchQuery);

  const requests = acceptedReqData?.results || [];
  const totalCount = acceptedReqData?.count || 0;

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  };

  const handleViewAssignment = (garb_id: string) => {
    router.push({
      pathname: '/(waste)/garbage-pickup/staff/view-accepted-details',
      params: {
        garb_id: garb_id
      }
    });
  };

  // Empty state component
  const renderEmptyState = () => (
    searchQuery ? (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <EmptyState emptyMessage="No accepted requests found" />
      </View>
    ) : (
      <View className="flex-1 justify-center items-center bg-gray-50">
          <EmptyState emptyMessage="No accepted requests available" />
      </View>
    )
  );

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <Text className="text-lg font-medium text-gray-800 mb-2">
        Accepted Requests ({requests.length})
      </Text>

      {/* Search Bar */}
      <View className="mb-4">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search accepted requests..."
            value={searchInputVal}
            onChangeText={setSearchInputVal}
            onSubmitEditing={handleSearch}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
      </View>

      {/* List */}
      {isLoading && !isRefreshing ? (
        renderLoadingState()
      ) : totalCount === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView 
          className="pb-4" 
          showsVerticalScrollIndicator={false} 
          showsHorizontalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
            />
          }
        >
          <View className="gap-4">
            {requests.map((request) => (
              <TouchableOpacity 
                key={request.garb_id}
                onPress={() => handleViewAssignment(request.garb_id)}
                activeOpacity={0.8}
              >
                <Card className="border border-gray-200 rounded-lg bg-white">
                  <CardHeader className="border-b border-gray-200 p-4">
                    <View className="flex flex-row justify-between items-center">
                      <View className="flex-1">
                        <View className='flex flex-row items-center gap-2 mb-1'>
                          <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                            <Text className="text-white font-bold text-sm tracking-wide">{request.garb_id}</Text>
                          </View>
                          <Text className="font-medium">{request.garb_requester}</Text>
                          <ChevronRight size={16} color="#6b7280" />
                        </View>
                        <View className='flex flex-row justify-between items-center gap-2'>
                          <Text className="text-xs text-gray-500">
                            Sitio: {request.sitio_name}, {request.garb_location}
                          </Text>
                          <Text className="text-xs text-gray-500">{formatTimestamp(request.garb_created_at)}</Text>
                        </View>
                      </View>
                    </View>
                  </CardHeader>
                  <CardContent className="p-4">
                    <View className="gap-3">
                      {/* Waste Type */}
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Waste Type:</Text>
                        <Text className="text-sm font-medium">{request.garb_waste_type}</Text>
                      </View>

                      {/* Decision Date */}
                      {request.dec_date && (
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">Date Accepted:</Text>
                          <Text className="text-sm">{formatTimestamp(request.dec_date)}</Text>
                        </View>
                      )}

                      {/* Assignment Info */}
                      {request.assignment_info?.driver && (
                        <View className="mt-2 border-t border-gray-100 pt-2">
                          <Text className="text-sm font-medium mb-1">Assignment</Text>
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">Driver:</Text>
                            <Text className="text-sm font-medium">{request.assignment_info.driver}</Text>
                          </View>
                          {request.assignment_info.collectors && request.assignment_info.collectors.length > 0 && (
                            <View className="flex-row justify-between mt-1">
                              <Text className="text-sm text-gray-600">Collectors:</Text>
                              <Text className="text-sm font-medium text-right flex-1 ml-2">
                                {request.assignment_info.collectors.join(", ")}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}