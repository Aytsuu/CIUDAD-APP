import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, Image, RefreshControl, ActivityIndicator } from "react-native";
import { X, Search, Info, ChevronRight } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { useGetGarbageCancelledResident } from "../queries/garbagePickupFetchQueries";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { useRouter } from "expo-router";

export default function ResidentCancelled() {
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

  // ================= MODAL STATES =================
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // ================= QUERY HOOK =================
  const { 
    data: cancelledReqData, 
    isLoading, 
    refetch,
    isFetching 
  } = useGetGarbageCancelledResident(String(user?.rp), currentPage, pageSize, searchQuery);
  
  const requests = cancelledReqData?.results || cancelledReqData || [];
  const totalCount = cancelledReqData?.count || requests.length;
  const hasNext = cancelledReqData?.next;

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
      pathname: '/(my-request)/garbage-pickup/view-cancelled-details',
      params: { garb_id }
    });
  };

  const handleViewImage = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setViewImageModalVisible(true);
  };

  // ================= RENDER HELPERS =================
  const CancelledRequestCard = useCallback(({ request }: { request: any }) => (
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
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-600">Waste Type:</Text>
            <View className="bg-orange-100 px-2 py-1 rounded-full">
              <Text className="text-orange-700 font-medium text-xs">{request.garb_waste_type}</Text>
            </View>
          </View>

          {/* Cancellation Date */}
          {request.dec_date && (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Cancelled:</Text>
              <Text className="text-sm text-gray-800 font-medium">
                {formatTimestamp(request.dec_date)}
              </Text>
            </View>
          )}

          {/* Quick Preview of Cancellation Reason */}
          {request.dec_reason && (
            <View className="mt-2">
              <Text className="text-sm text-gray-600">Reason:</Text>
              <Text 
                className="text-sm text-red-700 font-medium"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {request.dec_reason}
              </Text>
            </View>
          )}

          {/* Image Preview (if available) */}
          {request.file_url && (
            <View className="mt-2">
              <TouchableOpacity 
                onPress={() => handleViewImage(request.file_url)}
                className="flex-row items-center"
              >
                <Text className="text-sm font-medium text-blue-600">
                  View Attached Image
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  ), []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <CancelledRequestCard request={item} />,
    []
  );

  // Simple empty state component - EXACT SAME pattern
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No cancelled requests found matching your criteria."
      : "No cancelled requests found.";
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <View className="bg-blue-50 p-6 rounded-lg items-center">
          <Info size={24} color="#3b82f6" className="mb-2" />
          <Text className="text-center text-gray-600">
            {message}
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

  // Loading state for initial load
  if (isLoading) {
    return <LoadingState />;
  }

  // ================= MAIN RENDER =================
  return (
    <View className="flex-1 p-6">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
        <Search size={18} color="#6b7280" />
        <Input
          className="flex-1 ml-2 bg-white text-black"
          placeholder="Search cancelled requests..."
          value={searchInputVal}
          onChangeText={setSearchInputVal}
          onSubmitEditing={handleSearch}
          style={{ borderWidth: 0, shadowOpacity: 0 }}
        />
      </View>

      {/* Result Count - Only show when there are items */}
      {!isRefreshing && requests.length > 0 && (
        <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${requests.length} of ${totalCount} cancelled requests`}</Text>
      )}
      
      {/* Loading state during refresh */}
      {isFetching && isRefreshing && !isLoadMore && (
        <View className="h-64 justify-center items-center">
          <LoadingState />
        </View>
      )}

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
          keyExtractor={(item) => `cancelled-${item.garb_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: 20,
            flexGrow: 1, // Makes empty state center properly
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
            />
          }
          ListFooterComponent={() =>
            isFetching && isLoadMore ? (
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
                    No more cancelled requests
                  </Text>
                </View>
              )
            )
          }
          ListEmptyComponent={renderEmptyState()}
        />
      )}

      {/* Image Modal */}
      <Modal
        visible={viewImageModalVisible}
        transparent={true}
        onRequestClose={() => setViewImageModalVisible(false)}
      >
        <View className="flex-1 bg-black/90">
          <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-end items-center">
            <TouchableOpacity onPress={() => setViewImageModalVisible(false)}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center">
            <Image
              source={{ uri: currentImage }}
              style={{ width: "100%", height: 400 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}