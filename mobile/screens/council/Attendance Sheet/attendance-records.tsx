import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from "react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useGetCouncilEvents,
  useGetAttendanceSheets,
  useGetCouncilEventYears,
} from "../ce-events/ce-att-queries";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import { AttendanceRecords } from "../ce-events/ce-att-typeFile";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout } from "@/components/ui/select-layout";
import EmptyState from "@/components/ui/emptyState";
import { formatTableDate } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const INITIAL_PAGE_SIZE = 10;

const AttendanceRecord = () => {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { data: availableYears = [] } = useGetCouncilEventYears();

  // Fetch council events with pagination
  const {
    data: councilEventsData,
    isLoading: isCouncilEventsLoading,
    error,
    refetch,
    isFetching,
  } = useGetCouncilEvents(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    filter,
    false
  );

  const { data: attendanceSheets = [], isLoading: isSheetsLoading } =
    useGetAttendanceSheets(false); // Only active sheets
  const isLoading = isCouncilEventsLoading || isSheetsLoading;

  // Extract events from data structure
  const councilEvents = councilEventsData?.results || [];
  const totalCount = councilEventsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = currentPage < totalPages;

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filter]);

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

  // Handle load more - increment page number
  const handleLoadMore = () => {
    if (isScrolling && hasMore && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
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

  // Build table data from backend filtered results - only active records
  const tableData: AttendanceRecords[] = useMemo(() => {
    const data: AttendanceRecords[] = [];

    councilEvents.forEach((event) => {
      const activeSheets = attendanceSheets.filter(
        (sheet) => sheet.ce_id === event.ce_id && !sheet.att_is_archive
      );
      data.push({
        ceId: event.ce_id,
        attMettingTitle: event.ce_title || "Untitled Meeting",
        attMeetingDate: event.ce_date || "N/A",
        attMeetingDescription: event.ce_description || "No description",
        isArchived: false,
        sheets: activeSheets,
      });
    });

    return data;
  }, [councilEvents, attendanceSheets]);

  
  const filterOptions = [
    { label: "All Years", value: "all" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  };

  const handleFilterChange = (option: { label: string; value: string }) => {
    setFilter(option.value);
    setCurrentPage(1);
  };

  const handleOpenAttendance = (ceId: number, sheets: any[]) => {
    router.push({
      pathname: "/(council)/attendance/attendance-info",
      params: {
        ceId: ceId,
        sheets: JSON.stringify(sheets),
      },
    });
  };

  const RenderAttendanceCard = React.memo(({ item }: { item: AttendanceRecords }) => (
    <TouchableOpacity 
      onPress={() => handleOpenAttendance(item.ceId, item.sheets)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                {item.attMettingTitle}
              </Text>
              <Text className="text-sm text-gray-500">
                Date: {formatTableDate(item.attMeetingDate)}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="space-y-3">
            <View className="pb-2">
              <Text className="text-sm text-gray-600 mb-1">Description:</Text>
              <Text className="text-base text-black" numberOfLines={2} ellipsizeMode="tail">
                {item.attMeetingDescription}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Attendance Sheets:</Text>
              <Text className="text-lg font-bold text-[#2a3a61]">
                {item.sheets.length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Status:</Text>
              <Text className={`text-sm font-medium ${
                item.isArchived ? 'text-orange-600' : 'text-green-600'
              }`}>
                {item.isArchived ? 'Archived' : 'Active'}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  ));

  // Render function for FlatList
  const renderItem = React.useCallback(
    ({ item }: { item: AttendanceRecords }) => <RenderAttendanceCard item={item} />,
    []
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery || filter !== 'all'
      ? 'No records found. Try adjusting your search terms.'
      : 'No attendance records available yet.';
    
    return (
      <View className="flex-1 justify-center items-center py-12">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Attendance Records</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
      >
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg font-semibold text-gray-700 mb-2 text-center">
            Failed to Load Records
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            {error.message ||
              "Unable to load attendance records. Please try again."}
          </Text>
          <TouchableOpacity
            className="bg-primaryBlue px-6 py-3 rounded-lg"
            onPress={handleRefresh}
          >
            <Text className="text-white text-base font-semibold">
              Try Again
            </Text>
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Attendance Records</Text>}
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
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        <View className="flex-1 px-6">
          {/* Filter Section */}
          <View className="py-3">
            <SelectLayout
              options={filterOptions}
              className="h-8 mb-5"
              selectedValue={filter}
              onSelect={handleFilterChange}
              placeholder="Filter by year"
              isInModal={false}
            />
          </View>

          {/* Result Count */}
          {!isRefreshing && tableData.length > 0 && (
            <View className="mb-2">
              <Text className="text-xs text-gray-500">
                Showing {tableData.length} of {totalCount} records
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </Text>
            </View>
          )}

          {/* Content Section */}
          <View className="flex-1">
            {isLoading && isInitialRender ? (
              renderLoadingState()
            ) : (
              <View className="flex-1">
                {tableData.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={tableData}
                    maxToRenderPerBatch={5}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    onScroll={handleScroll}
                    windowSize={11}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `attendance-${item.ceId}-${index}`}
                    removeClippedSubviews
                    contentContainerStyle={{
                      paddingBottom: 20,
                      paddingTop: 8,
                      flexGrow: 1,
                    }}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    ListFooterComponent={() =>
                      isFetching && isLoadMore ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator size="small" color="#3B82F6" />
                          <Text className="text-xs text-gray-500 mt-2">
                            Loading more records...
                          </Text>
                        </View>
                      ) : (
                        !hasMore &&
                        tableData.length > 0 && (
                          <View className="py-4 items-center">
                            <Text className="text-xs text-gray-400">
                              No more records
                            </Text>
                          </View>
                        )
                      )
                    }
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
};

export default AttendanceRecord;