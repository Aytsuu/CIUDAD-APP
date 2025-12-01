import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetGarbageCompleteResident } from "../queries/garbagePickupFetchQueries";
import { useRouter } from "expo-router";
import { LoadingState } from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/emptyState";
import { useAuth } from "@/contexts/AuthContext";

export default function ResidentCompletedRequests() {
  const { user } = useAuth();
  const router = useRouter();
  
  // ================= STATE INITIALIZATION =================
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // ================= QUERY HOOK =================
  const { 
    data: completedReqData, 
    isLoading, 
    refetch,
    isFetching 
  } = useGetGarbageCompleteResident(String(user?.rp), currentPage, pageSize, searchQuery);
  
  const requests = completedReqData?.results || [];
  const totalCount = completedReqData?.count || 0;
  const hasNext = completedReqData?.next;

  // ================= SIDE EFFECTS =================
  // Search clearing effect
  useEffect(() => {
    if (searchQuery !== searchInputVal && searchInputVal === "") {
      setSearchQuery(searchInputVal);
    }
  }, [searchQuery, searchInputVal]);

  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  // ================= HANDLERS =================
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  const handleViewDetails = (garb_id: string) => {
    router.push({
      pathname: '/(my-request)/garbage-pickup/view-completed-details',
      params: {
        garb_id: garb_id
      }
    });
  };

  // ================= RENDER HELPERS =================
  const CompletedRequestCard = ({ request }: { request: any }) => (
    <Card
      key={request.garb_id}
      className="border border-gray-200 rounded-lg bg-white mb-4"
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
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <CompletedRequestCard request={item} />,
    []
  );

  // Updated empty state component
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No completed requests found matching your criteria."
      : "No completed requests found.";
    
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500 text-sm">{message}</Text>
      </View>
    );
  };

  // Loading state for initial load
  if (isLoading && isInitialRender) {
    return (
      <View className="flex-1 p-6">
        <LoadingState />
      </View>
    );
  }

  // ================= MAIN RENDER =================
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
            onChangeText={setSearchInputVal}
            onSubmitEditing={handleSearch}
            style={{ borderWidth: 0, shadowOpacity: 0 }}
          />
        </View>
        
        {/* Result Count - Only show when there are items */}
        {!isRefreshing && requests.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              Showing {requests.length} of {totalCount} completed request{totalCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Loading state during refresh */}
      {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

      {/* Main Content - only render when not refreshing */}
      {!isRefreshing && (
        <FlatList
          maxToRenderPerBatch={10}
          overScrollMode="never"
          data={requests}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          windowSize={21}
          renderItem={renderItem}
          keyExtractor={(item) => `completed-${item.garb_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
              tintColor="#00a8f0"
            />
          }
          ListFooterComponent={() =>
            isFetching ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-xs text-gray-500 mt-2">
                  Loading more...
                </Text>
              </View>
            ) : (
              !hasNext &&
              requests.length > 0 && (
                <View className="py-4 items-center">
                  <Text className="text-xs text-gray-400">
                    No more completed requests
                  </Text>
                </View>
              )
            )
          }
          ListEmptyComponent={renderEmptyState()}
        />
      )}
    </View>
  );
}