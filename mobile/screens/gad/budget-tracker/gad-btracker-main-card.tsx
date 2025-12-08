import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Calendar, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGetGADYearBudgets } from './queries/btracker-yearqueries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from '@/components/ui/loading-state';
import { Search } from '@/lib/icons/Search';
import { SearchInput } from '@/components/ui/search-input';

const INITIAL_PAGE_SIZE = 5; // Smaller page size since cards are larger

const GADBudgetTrackerMain = () => {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  const {
    data: yearsData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useGetGADYearBudgets(currentPage, pageSize, debouncedSearchQuery);
  
  const years = yearsData.results || [];
  const totalCount = yearsData.count || 0;
  const hasNext = yearsData.next;
  
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
    if (isScrolling && hasNext && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setPageSize((prev) => prev + 3); // Load 3 more cards at a time
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
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

  const handleCardClick = (year: string, totalBud: number, totalExp: number) => {
    router.push({
      pathname: '/(gad)/budget-tracker/budget-tracker-record',
      params: {
        type: 'viewing',
        budYear: year,
        totalBud: totalBud.toString(),
        totalExp: totalExp.toString(),
      }
    });
  };

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  // Budget Card Component - Memoized
  const BudgetCard = React.memo(({ tracker }: { tracker: any }) => {
    const budget = Number(tracker.gbudy_budget);
    const expense = Number(tracker.gbudy_expenses);
    const remainingBal = Number(tracker.gbudy_budget - tracker.gbudy_expenses);
    const progress = budget > 0 ? (expense / budget) * 100 : 0;

    return (
      <TouchableOpacity
        key={tracker.gbudy_year}
        onPress={() => handleCardClick(
          tracker.gbudy_year,
          budget,
          expense,
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
                {tracker.gbudy_year} Budget Overview
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
      ? "No matching budget records found."
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
        headerTitle={<Text className="text-[13px] text-gray-900">GAD Budget Tracker</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load expense data.
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
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">GAD Budget Tracker</Text>}
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
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        {/* Result Count - Only show when there are items */}
        {!isRefreshing && years.length > 0 && (
          <View className="px-4 mb-2 pt-2">
            <Text className="text-xs text-gray-500">
              Showing {years.length} of {totalCount} budget records
            </Text>
          </View>
        )}
        
        {/* Loading state during initial render */}
        {isLoading && isInitialRender && <LoadingState />}

        {/* Main Content */}
        <FlatList
          maxToRenderPerBatch={5}
          overScrollMode="never"
          data={[...years].sort((a, b) => Number(b.gbudy_year) - Number(a.gbudy_year))}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5} 
          onScroll={handleScroll}
          windowSize={11}
          renderItem={renderItem}
          keyExtractor={(item) => `budget-card-${item.gbudy_year}`}
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
                  Loading more...
                </Text>
              </View>
            ) : (
              !hasNext &&
              years.length > 0 && (
                <View className="py-4 items-center">
                  <Text className="text-xs text-gray-400">
                    No more records
                  </Text>
                </View>
              )
            )
          }
          ListEmptyComponent={!isLoading ? renderEmptyState() : null}
        />
      </View>
    </PageLayout>
  );
};

export default GADBudgetTrackerMain;