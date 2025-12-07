import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import {
  Search,
  ChevronLeft
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SelectLayout } from '@/components/ui/select-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageLayout from '@/screens/_PageLayout';
import { useExpenseLog } from '../queries/income-expense-FetchQueries';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

const monthOptions = [
  { id: "All", name: "All" },
  { id: "01", name: "January" },
  { id: "02", name: "February" },
  { id: "03", name: "March" },
  { id: "04", name: "April" },
  { id: "05", name: "May" },
  { id: "06", name: "June" },
  { id: "07", name: "July" },
  { id: "08", name: "August" },
  { id: "09", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" }
];

const INITIAL_PAGE_SIZE = 10;

const ExpenseLogMain = () => {  
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.LogYear as string;

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Add debouncing for search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Month filter options
  const monthFilterOptions = monthOptions.map(month => ({
    label: month.name,
    value: month.id
  }));

  // Updated API call with pagination
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    refetch,
    isFetching 
  } = useExpenseLog(
    currentPage,
    pageSize,
    year ? parseInt(year) : new Date().getFullYear(),
    debouncedSearchQuery,
    selectedMonth
  );

  // Extract data from response
  const fetchedData = responseData?.results || [];
  const totalCount = responseData?.count || 0;
  const hasNext = responseData?.next;

  // Filter data - only show non-archived entries
  const filteredData = fetchedData.filter((row: any) => row.el_is_archive === false);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchQuery, selectedMonth, year]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true
    });
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle month change
  const handleMonthChange = (option: { label: string; value: string }) => {
    setSelectedMonth(option.value);
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Expense Log Card Component - Memoized
  const ExpenseLogCard = React.memo(({ item }: { item: any }) => {
    const amount = Number(item.el_proposed_budget);
    const actualAmount = Number(item.el_actual_expense);
    const returnAmount = Number(item.el_return_amount);

    // Determine text color based on comparison
    const textColor = amount > actualAmount ? 'text-green-600' : 'text-red-600';
    
    return (
      <Card className="mb-4 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-[#2a3a61]">
            {formatDate(item.el_datetime)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Particulars:</Text>
            <Text className="font-semibold">{item.el_particular}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Proposed Budget:</Text>
            <Text>₱{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Actual Expense:</Text>
            <Text>₱{actualAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Return/Excess Amount:</Text>
            <Text className={`font-semibold ${textColor}`}>
              ₱{returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View className="flex-row justify-between pb-2">
            <Text className="text-gray-600">Assigned Staff:</Text>
            <Text>{item.staff_name}</Text>
          </View>
        </CardContent>
      </Card>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => <ExpenseLogCard item={item} />,
    []
  );

  // Simple empty state component
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No records found matching your criteria."
      : "No expense log records found.";
    
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500">{message}</Text>
      </View>
    );
  };

  // Loading state for initial load
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View>
          <Text className="text-[13px]">Expense Log</Text>
        </View>
      }
      rightAction={
        <View className="w-10 h-10 rounded-full items-center justify-center"></View>
      }    
      wrapScroll={false}
    >
      <View className="flex-1 px-6 bg-white">
        {/* Search and Filters */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500" size={17} />
              <TextInput
                placeholder="Search..."
                className="pl-5 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                value={searchQuery}
                onChangeText={handleSearchChange}
              />
            </View>
            
            <View className="w-[120px] pb-3">
              <SelectLayout
                options={monthFilterOptions}
                className="h-10"
                selectedValue={selectedMonth}
                onSelect={handleMonthChange}
                placeholder="Month"
                isInModal={false}
              />
            </View>
          </View>
        </View>

        {/* Result Count - Only show when there are items */}
        {!isRefreshing && filteredData.length > 0 && (
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${filteredData.length} of ${totalCount} expense log records`}</Text>
        )}
        
        {/* Loading state during refresh */}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

        {/* Main Content - only render when not refreshing */}
        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={10}
            overScrollMode="never"
            data={filteredData}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={10}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onScroll={handleScroll}
            windowSize={21}
            renderItem={renderItem}
            keyExtractor={(item) => `expense-log-${item.el_id}`}
            removeClippedSubviews
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingTop: 0,
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
              isFetching ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-xs text-gray-500 mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : (
                !hasNext &&
                filteredData.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400">
                      No more records
                    </Text>
                  </View>
                )
              )
            }
            ListEmptyComponent={renderEmptyState()}
          />
        )}
      </View>
    </PageLayout>
  );
};

export default ExpenseLogMain;