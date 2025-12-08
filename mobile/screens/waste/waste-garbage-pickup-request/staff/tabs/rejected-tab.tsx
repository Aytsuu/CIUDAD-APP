import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { Search, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageRejectRequest } from "../queries/garbagePickupStaffFetchQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { useRouter } from "expo-router";

export default function RejectedGarbageRequest() {
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
    data: rejectedReqData, 
    isLoading, 
    refetch,
    isFetching 
  } = useGetGarbageRejectRequest(currentPage, pageSize, searchQuery);
  
  const requests = rejectedReqData?.results || [];
  const totalCount = rejectedReqData?.count || 0;
  const hasNext = rejectedReqData?.next;

  // ================= SIDE EFFECTS =================
  // Search clearing effect - EXACT SAME as ResidentRecords
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
      pathname: '/(waste)/garbage-pickup/staff/view-rejected-details',
      params: { 
        garb_id: garb_id
      }
    });
  };

  // ================= RENDER HELPERS =================
  const RejectedRequestCard = ({ request }: { request: any }) => (
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
            <View className='flex flex-row items-center gap-2 mb-1'>
              <View className="bg-blue-600 px-3 py-1 rounded-full self-start">
                <Text className="text-white font-bold text-sm tracking-wide" numberOfLines={1}>
                  {request.garb_id}
                </Text>
              </View>
              <Text className="font-medium flex-1" numberOfLines={1}>
                {request.garb_requester}
              </Text>
            </View>
            <View className='flex flex-row justify-between items-center gap-2'>
              <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                {request.sitio_name}, {request.garb_location}
              </Text>
              <ChevronRight size={16} color="#6b7280" />
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

          {request.dec_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Cancelled:</Text>
              <Text className="text-sm text-gray-800 font-medium">
                {formatTimestamp(request.dec_date)}
              </Text>
            </View>
          )}

          {/* Rejection Reason Preview */}
          {request.dec_reason && (
            <View className="mt-2">
              <Text className="text-sm text-gray-600">Rejection Reason:</Text>
              <Text className="text-sm font-medium text-red-600">
                {request.dec_reason}
              </Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => <RejectedRequestCard request={item} />,
    []
  );

  // Simple empty state component - EXACT SAME as your other screens
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No rejected requests found matching your criteria."
      : "No rejected requests found.";
    
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500 text-sm">{message}</Text>
      </View>
    );
  };

  // Loading state for initial load
  if (isLoading) {
    return <LoadingState />;
  }

  // ================= MAIN RENDER =================
  return (
    <View className="flex-1">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
        <Search size={18} color="#6b7280" />
        <Input
          className="flex-1 ml-2 bg-white text-black"
          placeholder="Search rejected requests..."
          value={searchInputVal}
          onChangeText={setSearchInputVal}
          onSubmitEditing={handleSearch}
          style={{ borderWidth: 0, shadowOpacity: 0 }}
        />
      </View>

      {/* Result Count - Only show when there are items */}
      {!isRefreshing && requests.length > 0 && (
        <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${requests.length} of ${totalCount} rejected requests`}</Text>
      )}
      
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
          keyExtractor={(item) => `rejected-${item.garb_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 20,
            flexGrow: 1, // KEY: Makes empty state center properly
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
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
                    No more rejected requests
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