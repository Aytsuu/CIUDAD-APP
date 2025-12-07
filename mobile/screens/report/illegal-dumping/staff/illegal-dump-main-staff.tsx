import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Search, CheckCircle, ChevronLeft, SquareArrowOutUpRight, XCircle } from 'lucide-react-native';
import { useWasteReport, type WasteReport } from '../queries/illegal-dump-fetch-queries';
import { SelectLayout } from '@/components/ui/select-layout';
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from '@/screens/_PageLayout';
import { router } from 'expo-router';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

const INITIAL_PAGE_SIZE = 10;

export default function WasteIllegalDumping() {
  const [selectedFilterId, setSelectedFilterId] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState<boolean>(false);  
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'cancelled'>('pending');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Map tab to status value for backend
  const getStatusParam = (tab: string) => {
    if (tab === "pending") return "pending";
    if (tab === "resolved") return "resolved";
    if (tab === "cancelled") return "cancelled";
    return "";
  };

  // Fetch data with backend filtering and pagination
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useWasteReport(
    currentPage,
    pageSize,
    debouncedSearchQuery, 
    selectedFilterId,
    getStatusParam(activeTab)
  );

  // Extract the actual data array from paginated response
  const fetchedData = responseData?.results || [];
  const totalCount = responseData?.count || 0;
  const hasNext = responseData?.next;

  // Reset pagination when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchQuery, selectedFilterId, activeTab]);

  // Handle scrolling timeout
  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

  // Effects
  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  const filterOptions = [
    { label: "All Report Matter", value: "0" },
    { label: "Littering, Illegal dumping, Illegal disposal of garbage", value: "Littering, Illegal dumping, Illegal disposal of garbage" },
    { label: "Urinating, defecating, spitting in a public place", value: "Urinating, defecating, spitting in a public place" },
    { label: "Dirty frontage and immediate surroundings for establishment owners", value: "Dirty frontage and immediate surroundings for establishment owners" },
    { label: "Improper and untimely stacking of garbage outside residences or establishment", value: "Improper and untimely stacking of garbage outside residences or establishment" },
    { label: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)", value: "Obstruction (any dilapidated appliance, vehicle, and etc., display of merchandise illegal structure along sidewalk)" },
    { label: "Dirty public utility vehicles, or no trash can or receptacle", value: "Dirty public utility vehicles, or no trash can or receptacle" },
    { label: "Spilling, scattering, littering of wastes by public utility vehicles", value: "Spilling, scattering, littering of wastes by public utility vehicles" },
    { label: "Illegal posting or installed signage, billboards, posters, streamers and movie ads.", value: "Illegal posting or installed signage, billboards, posters, streamers and movie ads." },
  ];

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val as 'pending' | 'resolved' | 'cancelled');
  };

  const handleView = async (item: any) => {
    router.push({
      pathname: '/(waste)/illegal-dumping/staff/illegal-dump-view-staff',
      params: { rep_id: item.rep_id }
    });
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Waste Report Card Component - Memoized for better performance
  const WasteReportCard = React.memo(({ item, onView }: { item: WasteReport; onView: (item: WasteReport) => void }) => (
    <Pressable
      onPress={() => onView(item)}
      className="mb-3 border border-gray-200 rounded-lg p-4 bg-white shadow-sm active:opacity-80"
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="font-semibold text-xl text-primaryBlue">Report No. {item.rep_id}</Text>
        <View className="flex-row items-center">
          {item.rep_status === "resolved" ? (
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full border border-green-600">
              <CheckCircle size={12} color="#22c55e" />
              <Text className="text-green-600 text-sm font-medium ml-1">Resolved</Text>
            </View>
          ) : item.rep_status === "cancelled" ? (
            <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full border border-red-600">
              <XCircle size={12} color="#ef4444" />
              <Text className="text-red-600 text-sm font-medium ml-1">Cancelled</Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-full border border-primaryBlue">
              <Text className="text-primaryBlue text-sm font-medium">In progress</Text>
            </View>
          )}
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Matter:</Text>
        <Text className="text-base">{item.rep_matter}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Sitio:</Text>
        <Text className="text-base">{item.sitio_name}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Location:</Text>
        <Text className="text-base">{item.rep_location}</Text>
      </View>

      <View className="mb-2">
        <Text className="text-base font-semibold">Complainant:</Text>
        <Text className="text-base">
          {item.rep_anonymous ? "Anonymous" : item.rep_complainant}
        </Text>
      </View>

      {item.rep_status === "cancelled" && item.rep_cancel_reason && (
        <View className="mb-4">
          <Text className="text-base font-semibold">Cancel Reason:</Text>
          <Text>{item.rep_cancel_reason}</Text>
        </View>
      )}

      <View className="self-end">
        <SquareArrowOutUpRight size={16} color="#00A8F0" />
      </View>
    </Pressable>
  ));

  const renderItem = React.useCallback(
    ({ item }: { item: WasteReport }) => <WasteReportCard item={item} onView={handleView} />,
    []
  );

  // Simple empty state component
  const renderEmptyState = () => {
    const message = searchQuery || selectedFilterId !== "0"
      ? "No matching reports found."
      : `No ${activeTab} reports found`;
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500 text-center">{message}</Text>
      </View>
    );
  };

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Illegal Dumping Reports</Text>}
        rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center" />}
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">Failed to load reports.</Text>
          <TouchableOpacity onPress={handleRefresh} className="bg-[#2a3a61] px-4 py-2 rounded-lg">
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Illegal Dumping Reports</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-white">
        {/* Search Bar - Conditionally rendered */}
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}}
          />
        )}

        {/*TABS*/}
        <View className="bg-white border-b border-gray-200 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            {[
              { key: "pending", label: "Reports" },
              { key: "resolved", label: "Resolved" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => handleTabChange(tab.key)}
                className={`flex-1 px-4 py-4 items-center border-b-2 ${
                  activeTab === tab.key ? "border-blue-500" : "border-transparent"
                }`}
              >
                <Text className={`text-sm font-medium ${activeTab === tab.key ? "text-blue-600" : "text-gray-500"}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>      

        <View className="flex-1">
          {/* Filters only - Search moved to top */}
          <View className="px-6 pt-4 pb-4">
            <SelectLayout
              placeholder="Select report matter"
              options={filterOptions}
              selectedValue={selectedFilterId}
              onSelect={(option) => handleFilterChange(option.value)}
              className="bg-white"
            />
          </View>

          {/* Loading state during refresh */}
          {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

          {/* Main Content - only render when not refreshing */}
          {!isRefreshing && (
            <View className="flex-1 px-2">
              {/* Result Count - Only show when there are items - EXACT SAME as expense */}
              {fetchedData.length > 0 && (
                <Text className="text-xs text-gray-500 mt-2 mb-3 px-6">
                  {`Showing ${fetchedData.length} of ${totalCount} waste reports`}
                </Text>
              )}
              
              <FlatList
                maxToRenderPerBatch={5}
                overScrollMode="never"
                data={fetchedData}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={5}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                windowSize={11}
                renderItem={renderItem}
                keyExtractor={(item) => `waste-report-${item.rep_id}`}
                removeClippedSubviews
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 20,
                  flexGrow: 1,
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
                        Loading more reports...
                      </Text>
                    </View>
                  ) : (
                    !hasNext &&
                    fetchedData.length > 0 && (
                      <View className="py-4 items-center">
                        <Text className="text-xs text-gray-400">
                          No more reports
                        </Text>
                      </View>
                    )
                  )
                }
                ListEmptyComponent={renderEmptyState()}
              />
            </View>
          )}       
        </View>
      </View>
    </PageLayout>
  );
}