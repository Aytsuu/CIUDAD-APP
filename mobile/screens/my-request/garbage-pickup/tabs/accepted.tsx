import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Search, Info, ChevronRight, CheckCircle } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageAcceptedResident } from "../queries/garbagePickupFetchQueries";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { formatTime } from "@/helpers/timeFormatter";
import { useUpdateGarbReqStatusResident } from "../queries/garbagePickupUpdateQueries";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";

export default function ResidentAccepted() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  // Add refetch to the query hook
  const { data: acceptedRequest = [], isLoading: isDataLoading, refetch } = useGetGarbageAcceptedResident(String(user?.rp));
  const { mutate: confirm } = useUpdateGarbReqStatusResident(() => {}, false);

  const filteredData = acceptedRequest.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.sitio_name}
      ${request.assignment_info?.driver || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewAssignment = (garb_id: string) => {
    router.push({
      pathname: "/(my-request)/garbage-pickup/view-accepted-details",
      params: { garb_id },
    });
  };

  const handleConfirmCompletion = (garb_id: any) => {
    confirm(garb_id);
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
            placeholder="Search accepted requests..."
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

      {/* Loading State */}
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
                  {acceptedRequest.length === 0
                    ? "No accepted requests available"
                    : "No matching requests found"}
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
              {filteredData.map((request) => {
                const showConfirmationButton =
                  request.garb_req_status === "completed" &&
                  request.confirmation_info?.conf_resident_conf === false;

                return (
                  <TouchableOpacity
                    key={request.garb_id}
                    onPress={() => handleViewAssignment(request.garb_id)}
                    activeOpacity={0.8}
                  >
                    <Card className="border border-gray-200 rounded-lg bg-white shadow-sm">
                      <CardHeader className="border-b border-gray-200 p-3">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 pr-2">
                            {/* Garb ID - First Line */}
                            <View className="mb-2">
                              <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                                <Text className="text-white font-bold text-sm tracking-wide">{request.garb_id}</Text>
                              </View>
                            </View>
                            
                            {/* Location - Second Line */}
                            <Text className="text-sm text-gray-600">
                              Sitio: {request.sitio_name}, {request.garb_location}
                            </Text>
                          </View>
                          
                          {/* Timestamp and Chevron */}
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
                          <View className="flex-row justify-between">
                            <Text className="text-sm text-gray-600">Waste Type:</Text>
                            <Text className="text-sm font-semibold ">
                              {request.garb_waste_type}
                            </Text>
                          </View>

                          {request.dec_date && (
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-600">Date Accepted:</Text>
                              <Text className="text-sm font-medium text-green-700">
                                {formatTimestamp(request.dec_date)}
                              </Text>
                            </View>
                          )}

                          {request.assignment_info && (
                            <View className="mt-3 pt-3 border-t border-gray-100">
                              <Text className="text-sm">
                                <Text className="font-medium text-gray-600">Driver:</Text>{" "}
                                <Text className="font-semibold text-blue-700">
                                  {request.assignment_info.driver || "Not assigned"}
                                </Text>
                              </Text>
                            </View>
                          )}

                          {request.assignment_info?.pick_date && request.assignment_info?.pick_time && (
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-600">Pickup Date & Time:</Text>
                              <Text className="text-sm font-semibold ">
                                {request.assignment_info?.pick_date},{" "}
                                {formatTime(request.assignment_info?.pick_time)}
                              </Text>
                            </View>
                          )}
                        </View>

                        {showConfirmationButton && (
                          <View className="flex flex-row justify-end mt-3">
                            <ConfirmationModal
                              trigger={
                                <Button className="border border-green-500 native:h-[40px] rounded-lg px-4">
                                  <Text className="text-green-500">Confirm</Text>
                                </Button>
                              }
                              actionLabel="Confirm"
                              title="Confirm Completion"
                              description="Would you like to confirm the completion of the task?"
                              onPress={() => handleConfirmCompletion(request.garb_id)}
                            />
                          </View>
                        )}
                      </CardContent>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}