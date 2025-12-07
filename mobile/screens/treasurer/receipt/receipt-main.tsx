import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { 
  ChevronLeft,
  Search,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SearchInput } from "@/components/ui/search-input";
import { SelectLayout } from '@/components/ui/select-layout';
import { useInvoiceQuery, type Receipt } from './queries/receipt-getQueries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";

const INITIAL_PAGE_SIZE = 10;

const ReceiptPage = () => {
  const router = useRouter();
  
  // State for search and filter
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch data with backend filtering and pagination
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useInvoiceQuery(
    currentPage,
    pageSize,
    debouncedSearchQuery, 
    selectedFilterId
  );

  // Extract the actual data array from paginated response
  const fetchedData = responseData?.results || [];
  const totalCount = responseData?.count || 0;
  const hasNext = responseData?.next;

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchQuery, selectedFilterId]);

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

  // Generate filter options from fetched data
  // NOTE: With pagination, this might not get all unique values
  // Consider fetching filter options separately if needed
  const filterOptions = useMemo(() => {
    const uniqueNatures = Array.from(
      new Set(fetchedData.map((item: Receipt) => item.inv_nat_of_collection))
    ).filter(Boolean) as string[];

    return [
      { label: 'All', value: 'all' },
      ...uniqueNatures.map((nature: string) => ({ label: nature, value: nature })),
    ];
  }, [fetchedData]);

  // Helper function to get color scheme for nature of collection
  const getColorScheme = useCallback((nature: string) => {
    const normalized = nature?.toLowerCase().trim() || '';
    
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      // Employment & Job Related - Blue variants
      'first time jobseeker': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      'employment': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      'identification': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
      
      // Financial & Loans - Purple variants
      'loan': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      'sss': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
      'bir': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
      'bank requirement': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
      
      // Utilities & Services - Teal/Green variants
      'electrical connection': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
      'mcwd requirements': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      
      // Education & Training - Indigo variants
      'scholarship': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
      'tesda': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      'board examination': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      
      // IDs & Certifications - Cyan variants
      'postal id': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
      'nbi': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
      'pwd identification': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
      'señior citizen identification': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      'police clearance': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
      
      // Financial Assistance - Green variants
      'pwd financial assistance': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
      'señior citizen financial assistance': { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
      'fire victim': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
      
      // Legal & Government - Orange/Amber variants
      'bail bond': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
      'probation': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      'file action': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
      'proof of custody': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
      'summon': { bg: 'bg-orange-200', text: 'text-orange-900', border: 'border-orange-400' },
      
      // Permits & Clearances - Red variants
      'building permit': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      'barangay clearance': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'business clearance': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      'barangay sinulog permit': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
      'barangay fiesta permit': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'dwup': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      
      // Personal & Miscellaneous - Pink/Rose variants
      'burial': { bg: 'bg-rose-200', text: 'text-rose-900', border: 'border-rose-300' },
      'cohabitation': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
      'marriage certification': { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
      'good moral': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
      'indigency': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
      'indigency (for minors)': { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300' },
    };
    
    // Exact match first
    if (colorMap[normalized]) {
      return colorMap[normalized];
    }
    
    // Default for any unknown values
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
  }, []);

  const handleFilterChange = (value: string) => {
    setSelectedFilterId(value);
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );  

  // Receipt Card Component - Memoized for better performance
  const ReceiptCard = React.memo(({ item }: { item: Receipt }) => {
    const colorScheme = getColorScheme(item.inv_nat_of_collection);
    
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200 mb-3 shadow-sm">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 ">Serial No:</Text>
          <Text className="font-medium bg-blue-500 px-2 py-0.5 rounded-md text-white">{item.inv_serial_num}</Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Date Issued:</Text>
          <Text className="text-sm">
            {new Date(item.inv_date).toLocaleString("en-US", {
                timeZone: "UTC",
                dateStyle: "medium",
                timeStyle: "short"
            })}
          </Text>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Payor:</Text>
          <Text className="font-medium flex-1 text-right" numberOfLines={2}>
            {item.inv_payor}
          </Text>
        </View>
        
        {/* Nature of Collection with colored badge */}
        <View className="flex-row justify-between mb-3 items-center">
          <Text className="text-gray-600">Nature of Collection:</Text>
          <View className={`${colorScheme.bg} ${colorScheme.border} border rounded-full px-3 py-1`}>
            <Text className={`${colorScheme.text} text-xs font-medium`}>
              {item.inv_nat_of_collection}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Discount Reason:</Text>
          <Text className="text-sm">{item.inv_discount_reason || "None"}</Text>
        </View>
        
        <View className="border-t border-gray-200 pt-2 mt-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 font-medium">Amount:</Text>
            <Text className="font-bold text-base text-green-700">
              ₱{Number(item.inv_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Change:</Text>
            <Text className="font-semibold text-sm">
              ₱{Number(item.inv_change).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: Receipt }) => <ReceiptCard item={item} />,
    []
  );

  // Simple empty state component
  const renderEmptyState = () => {
    const message = searchQuery || selectedFilterId !== 'all'
      ? "No matching receipts found."
      : "No receipts found.";
    
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
        headerTitle={<Text className="text-gray-900 text-[13px]">Receipts</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load receipts.
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
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Receipts</Text>}
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
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}}
          />
        )}

        {/* Filter Section */}
        <View className="px-6 pt-4 pb-4">
          <SelectLayout
            className="w-full bg-white"
            placeholder="Filter"
            options={filterOptions}
            selectedValue={selectedFilterId}
            onSelect={(option) => handleFilterChange(option.value)}
          />
        </View>

        {/* Result Count - Only show when there are items */}
        {!isRefreshing && fetchedData.length > 0 && (
          <View className="px-6 mb-2">
            <Text className="text-xs text-gray-500">
              Showing {fetchedData.length} of {totalCount} receipts
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
            data={fetchedData}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            windowSize={11}
            renderItem={renderItem}
            keyExtractor={(item) => `receipt-${item.inv_num}`}
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
                    Loading more receipts...
                  </Text>
                </View>
              ) : (
                !hasNext &&
                fetchedData.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400">
                      No more receipts
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

export default ReceiptPage;