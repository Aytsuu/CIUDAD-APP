import { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetGarbageRejectedResident } from "../queries/garbagePickupFetchQueries";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { useRouter } from "expo-router";
import { formatTimestamp } from "@/helpers/timestampformatter";

export default function ResidentRejected() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add refetch to the query hook
  const { data: rejectedRequests = [], isLoading: isDataLoading, refetch } = useGetGarbageRejectedResident(String(user?.rp));

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredData = rejectedRequests.filter((request) => {
    const searchString = `
      ${request.garb_location} 
      ${request.garb_waste_type}
      ${request.dec_reason || ""}
      ${request.sitio_name || ""}
    `.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: '/(my-request)/garbage-pickup/view-rejected-details',
      params: { 
        garb_id: garb_id
      }
    });
  };

  // Render Rejected Card Component
  const RenderRejectedCard = ({ item }: { item: any }) => (
    <Card
      key={item.garb_id}
      className="border border-gray-200 rounded-lg bg-white mb-3"
    >
      <CardHeader className="border-b border-gray-200 p-4">
        <TouchableOpacity 
          onPress={() => handleViewDetails(item.garb_id)}
          className="flex flex-row justify-between items-center"
        >
          <View className="flex-1">
            <View className='flex flex-row justify-between items-center mb-1'>
              <View className="bg-blue-600 px-3 py-1 rounded-full">
                <Text className="text-white font-bold text-sm tracking-wide" numberOfLines={1}>
                  {item.garb_id}
                </Text>
              </View>
              <ChevronRight size={16} color="#6b7280" />
            </View>
            <View className='flex flex-row justify-between items-center gap-2'>
              <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                {item.sitio_name}, {item.garb_location}
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
              <Text className="text-orange-700 font-medium text-xs">{item.garb_waste_type}</Text>
            </View>
          </View>

          {item.dec_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Rejected:</Text>
              <Text className="text-sm text-gray-800 font-medium">
                {formatTimestamp(item.dec_date)}
              </Text>
            </View>
          )}

          {/* Rejection Reason Preview */}
          {item.dec_reason && (
            <View className="mt-2">
              <Text className="text-sm text-gray-600">Rejection Reason:</Text>
              <Text className="text-sm font-medium text-red-600">
                {item.dec_reason}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery || rejectedRequests.length === 0
      ? "No rejected requests available"
      : "No matching rejected requests found";
    
    return (
      <View className="justify-center items-center py-8">
        <View className="bg-blue-50 p-6 rounded-lg items-center">
          <Info size={24} color="#3b82f6" className="mb-2" />
          <Text className="text-center text-gray-600">
            {emptyMessage}
          </Text>
          {searchQuery && (
            <Text className="text-center text-gray-500 mt-1">
              Try a different search term
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
        <View>
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder="Search rejected requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
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
      

      {/* Loading / Empty / List */}
      {isDataLoading && !isRefreshing ? (
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      ) : (
        <View className="flex-1">
          {filteredData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredData}
              renderItem={({ item }) => <RenderRejectedCard item={item} />}
              keyExtractor={(item) => item.garb_id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={['#00a8f0']}
                  tintColor="#00a8f0"
                />
              }
              contentContainerStyle={{ 
                flexGrow: 1
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}