import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Search, Calendar, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import PageLayout from '@/screens/_PageLayout';
import { SearchInput } from '@/components/ui/search-input';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

const INITIAL_PAGE_SIZE = 5; // Smaller page size since cards are larger

const IncomeExpenseMain = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const {
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useIncomeExpenseMainCard(debouncedSearchQuery, currentPage, pageSize);

  // Extract the actual data array from the paginated response
  const fetchedData = responseData?.results || [];
  const totalCount = responseData?.count || 0;
  const hasNext = responseData?.next;

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchQuery]);

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
      setPageSize((prev) => prev + 3); // Load 3 more cards at a time
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

  const handleCardClick = (year: string, totalBud: number, totalExp: number, totalInc: number) => {
    router.push({
      pathname: '/(treasurer)/budget-tracker/budget-expense-main',
      params: {
        type: 'viewing',
        budYear: year,
        totalBud: totalBud.toString(),
        totalExp: totalExp.toString(),
        totalInc: totalInc.toString(),
      }
    });
  };

  // Budget Card Component - Memoized
  const BudgetCard = React.memo(({ tracker }: { tracker: any }) => {
    const budget = Number(tracker.ie_main_tot_budget);
    const income = Number(tracker.ie_main_inc);
    const expense = Number(tracker.ie_main_exp);
    const remainingBal = Number(tracker.ie_remaining_bal);
    const progress = budget > 0 ? (expense / budget) * 100 : 0;

    return (
      <TouchableOpacity
        onPress={() => handleCardClick(
          tracker.ie_main_year,
          budget,
          expense,
          income
        )}
        activeOpacity={0.8}
      >
        <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3">
          {/* Card Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="rounded-full border-2 border-[#2a3a61] p-2 mr-3">
                <Calendar size={20} color="#2a3a61" />
              </View>
              <Text className="font-semibold text-lg text-[#2a3a61]">
                {tracker.ie_main_year} Budget Overview
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Budget:</Text>
              <Text className="text-blue-600">
                Php {budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Income:</Text>
              <Text className="text-green-600">
                Php {income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Expenses:</Text>
              <Text className="text-red-600">
                Php {expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Remaining Balance:</Text>
              <Text className="text-yellow-600">
                Php {remainingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-4">
            <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-[#2a3a61]"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1 text-center">
              {progress.toFixed(2)}% of budget spent
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => <BudgetCard tracker={item} />,
    []
  );

  // Simple empty state component
  const renderEmptyState = () => {
    const message = searchQuery
      ? "No matching records found."
      : "No budget records found.";
    
    return (
      <View className="flex-1 justify-center items-center h-full py-8">
        <Text className="text-gray-500 text-center">{message}</Text>
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Income & Expense Tracking</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load income/expense data.
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-[#2a3a61] px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.push('/(treasurer)')} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Income & Expense Tracking</Text>}
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
      <View className="flex-1 bg-white p-2">
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}}
          />
        )}

        {/* Result Count - Only show when there are items */}
        {!isRefreshing && fetchedData.length > 0 && (
          <View className="px-4 mb-2 pt-2">
            <Text className="text-xs text-gray-500">
              Showing {fetchedData.length} of {totalCount} budget records
            </Text>
          </View>
        )}
        
        {/* Loading state during refresh */}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

        {/* Main Content - only render when not refreshing */}
        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={5}
            overScrollMode="never"
            data={[...fetchedData].sort((a, b) => Number(b.ie_main_year) - Number(a.ie_main_year))}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5} // Higher threshold for larger cards
            onScroll={handleScroll}
            windowSize={11}
            renderItem={renderItem}
            keyExtractor={(item) => `budget-card-${item.ie_main_year}`}
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
              isFetching ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-xs text-gray-500 mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : (
                !hasNext &&
                fetchedData.length > 0 && (
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

export default IncomeExpenseMain;