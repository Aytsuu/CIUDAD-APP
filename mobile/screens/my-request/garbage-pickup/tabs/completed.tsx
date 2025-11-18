import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageCompleteResident } from "../queries/garbagePickupFetchQueries";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state"; 

export default function ResidentCompleted() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  
  // Add refetch to the query hook
  const { data: completedRequests = [], isLoading: isDataLoading, refetch } = useGetGarbageCompleteResident(String(user?.rp));

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredData = completedRequests.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: "/(my-request)/garbage-pickup/view-completed-details",
      params: { garb_id },
    });
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
      {!isDataLoading && (
        <View>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search completed requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              {filteredData.length} request{filteredData.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      )}

      {/* Loading / Empty / List */}
      {isDataLoading && !isRefreshing ? (
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
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
              tintColor="#00a8f0"
            />
          }
        >
          {filteredData.length === 0 ? (
            <View className="justify-center items-center py-8">
              <View className="bg-blue-50 p-6 rounded-lg items-center">
                <Info size={24} color="#3b82f6" className="mb-2" />
                <Text className="text-center text-gray-600">
                  {completedRequests.length === 0
                    ? "No completed requests available"
                    : "No matching completed requests found"}
                </Text>
                {searchQuery && (
                  <Text className="text-center text-gray-500 mt-1">
                    Try a different search term
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View className="gap-4">
              {filteredData.map((request) => (
                <TouchableOpacity
                  key={request.garb_id}
                  onPress={() => handleViewDetails(request.garb_id)}
                  activeOpacity={0.8}
                >
                  <Card className="border border-gray-200 rounded-lg bg-white shadow-sm">
                    <CardHeader className="border-b border-gray-200 p-4">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          {/* Garb ID and Location */}
                          <View className="flex-row items-center gap-2 mb-1">
                            <View className="bg-blue-600 px-3 py-1 rounded-full">
                              <Text className="text-white font-bold text-sm tracking-wide">{request.garb_id}</Text>
                            </View>
                            <Text className="text-sm text-gray-600">
                              Sitio: {request.sitio_name}, {request.garb_location}
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row gap-1 items-center">
                          <Text className="text-xs text-gray-500">
                            {formatTimestamp(request.garb_created_at)}
                          </Text>
                          <ChevronRight size={18} color="black" />
                        </View>
                      </View>
                    </CardHeader>

                    <CardContent className="p-4">
                      <View className="gap-3">
                        {/* Waste Type */}
                        <View className="flex-row justify-between">
                          <Text className="text-sm text-gray-600">Waste Type:</Text>
                          <Text className="text-sm font-semibold">
                            {request.garb_waste_type}
                          </Text>
                        </View>

                        {/* Completion Details */}
                        <View className="mt-3 pt-3 border-t border-gray-100">
                          <Text className="text-sm font-medium text-gray-700 mb-2">
                            Completion Details
                          </Text>

                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">
                              Pickup Completion Date:
                            </Text>
                            <Text className="text-sm font-bold text-green-600">
                              {formatTimestamp(request.conf_staff_conf_date || "")}
                            </Text>
                          </View>

                          <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">
                              Completion Acknowledged:
                            </Text>
                            <Text className="text-sm font-bold text-green-600">
                              {formatTimestamp(request.conf_resident_conf_date || "")}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}