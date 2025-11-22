import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetGarbageCompleteResident } from "../queries/garbagePickupFetchQueries";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";
import { useAuth } from "@/contexts/AuthContext";

export default function ResidentCompletedRequests() {
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [_currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  
  // Query hook with pagination and search
    const { data: completedRequests = [], isLoading: isDataLoading, refetch } = useGetGarbageCompleteResident(String(user?.rp));


  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  };

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: '/(my-request)/garbage-pickup/view-completed-details',
      params: {
        garb_id: garb_id
      }
    });
  };

  // Empty state component
  const renderEmptyState = () => (
    searchQuery ? (
      <View className="flex-1 justify-center items-center p-6">
        <EmptyState emptyMessage="No completed requests found" />
      </View>
    ) : (
      <View className="flex-1 justify-center items-center p-6">
        <EmptyState emptyMessage="No completed requests available" />
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
      {completedRequests.map((request) => (
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
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-600">Waste Type:</Text>
                <View className="bg-orange-100 px-2 py-1 rounded-full">
                  <Text className="text-orange-700 font-medium text-xs">{request.garb_waste_type}</Text>
                </View>
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

    if (completedRequests.length === 0) {
      return renderEmptyState();
    }

    return renderMainContent();
  };

  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
      <View>
        <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
          <Search size={18} color="#6b7280" />
          <Input
            className="flex-1 ml-2 bg-white text-black"
            placeholder="Search your completed requests..."
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
              {completedRequests.length} request{completedRequests.length !== 1 ? 's' : ''} found
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