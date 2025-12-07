import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { useBusinessPermits, UnpaidBusinessPermit } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_PAGE_SIZE = 10;

const BusinessClearanceList = () => {
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Unpaid' | 'Paid' | 'Declined'>('Unpaid')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setPageSize(INITIAL_PAGE_SIZE)
  }, [paymentStatusFilter, debouncedSearchQuery])

  // Use React Query hook
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useBusinessPermits(currentPage, pageSize, debouncedSearchQuery || undefined)

  // Extract data from paginated response
  const rawResults = responseData?.results || []
  const businessPermits = useMemo(() => {
    // Filter by payment status client-side
    if (paymentStatusFilter === 'Unpaid') {
      return rawResults.filter((b: UnpaidBusinessPermit) => 
        (b.req_payment_status || '').toLowerCase() === 'unpaid'
      )
    } else if (paymentStatusFilter === 'Paid') {
      return rawResults.filter((b: UnpaidBusinessPermit) => 
        (b.req_payment_status || '').toLowerCase() === 'paid'
      )
    } else if (paymentStatusFilter === 'Declined') {
      return rawResults.filter((b: UnpaidBusinessPermit) => 
        (b.req_payment_status || '').toLowerCase().includes('declined')
      )
    }
    return rawResults
  }, [rawResults, paymentStatusFilter])
  
  const totalCount = responseData?.count || businessPermits.length
  const hasNext = !!responseData?.next

  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false)
  }, [isFetching, isRefreshing])

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false)
  }, [isLoading, isInitialRender])

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false)
  }, [isFetching, isLoadMore])

  const getStatusBadge = (business: UnpaidBusinessPermit) => {
    // First check if request status is Cancelled
    const reqStatus = (business.req_status || "").toLowerCase();
    if (reqStatus === "cancelled" || reqStatus.includes("cancel")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">Cancelled</Text>
    }
    
    // Then check if request status is Declined
    if (reqStatus === "declined" || reqStatus.includes("decline") || reqStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Decline</Text>
    }
    
    // Then check payment status
    const paymentStatus = (business.req_payment_status || "").toLowerCase();
    if (paymentStatus === "paid") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Paid</Text>
    }
    
    // Default to Unpaid (instead of Pending)
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Unpaid</Text>
  }

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return d;
    }
  }

  const wrapPurpose = (text?: string, maxFirstLine: number = 24) => {
    if (!text) return '—';
    if (text.length <= maxFirstLine) return text;
    const breakIdx = text.lastIndexOf(' ', maxFirstLine);
    const idx = breakIdx > 0 ? breakIdx : maxFirstLine;
    return text.slice(0, idx) + "\n" + text.slice(idx).trimStart();
  }

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
  }, [searchInputVal]);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

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

  // Filter business permits by payment status and request status (client-side filtering for status)
  const filteredBusinesses = useMemo(() => {
    let filtered = businessPermits;

    // Filter by payment status (exactly like certificate list)
    if (paymentStatusFilter === 'Declined') {
      // Show only declined/cancelled requests
      filtered = filtered.filter(business => {
        const status = business.req_status || '';
        const statusLower = status.toLowerCase();
        return statusLower === 'declined' || statusLower === 'cancelled';
      });
    } else {
      // For paid/unpaid, filter out declined/cancelled requests first
      filtered = filtered.filter(business => {
        const status = business.req_status || '';
        const statusLower = status.toLowerCase();
        // Filter out declined and cancelled requests
        if (statusLower === 'declined' || statusLower === 'cancelled') {
          return false;
        }
        
        // Then filter by payment status
        const paymentStatus = (business.req_payment_status || '').toLowerCase();
        if (paymentStatusFilter === 'Paid') {
          return paymentStatus === 'paid';
        } else if (paymentStatusFilter === 'Unpaid') {
          return paymentStatus !== 'paid';
        }
        return false;
      });
    }

    return filtered;
  }, [businessPermits, paymentStatusFilter]);

  if (isLoading && isInitialRender) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Business Permit Request</Text>}
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
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        {/* Payment Status Filter */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <SelectLayout
            label="Payment Status Filter"
            placeholder="Select payment status"
            options={[
              { label: 'Unpaid', value: 'Unpaid' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Declined', value: 'Declined' }
            ]}
            selectedValue={paymentStatusFilter}
            onSelect={(option) => setPaymentStatusFilter(option.value as any)}
          />
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {isError ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load business permits.</Text>
              </View>
            </View>
          ) : (
            <>
              {!isRefreshing && filteredBusinesses.length > 0 && (
                <View className="px-6 pt-4">
                  <Text className="text-xs text-gray-500">{`Showing ${filteredBusinesses.length} of ${totalCount} business permits`}</Text>
                </View>
              )}
              {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
              {!isRefreshing && (
                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={filteredBusinesses}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  renderItem={({ item: business }) => (
                    <View className="px-6 pt-4">
                      <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-gray-900 font-medium">{wrapPurpose(business.business_name || "Business Permit")}</Text>
                        {business.purpose && (
                          <Text className="text-gray-600 text-xs mt-1">{business.purpose}</Text>
                        )}
                        {business.bus_clearance_gross_sales && (
                          <Text className="text-gray-900 text-xs mt-1 font-semibold">
                            ₱{parseFloat(String(business.bus_clearance_gross_sales)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        )}
                        {business.req_amount && !business.bus_clearance_gross_sales && (
                          <Text className="text-gray-900 text-xs mt-1 font-semibold">
                            ₱{parseFloat(String(business.req_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                        )}
                        <Text className="text-gray-500 text-xs mt-1">{formatDate(business.req_request_date)}</Text>
                      </View>
                      {getStatusBadge(business)}
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">ID: {business.bpr_id || business.bp_id}</Text>
                    {business.owner_name && (
                      <Text className="text-gray-500 text-xs mt-1">Owner: {business.owner_name}</Text>
                    )}
                    {(business.req_status === 'Declined' || business.req_status === 'Cancelled') && business.decline_reason && (
                      <Text className="text-gray-500 text-xs mt-1">Decline Reason: {business.decline_reason}</Text>
                      )}
                      </View>
                    </View>
                  )}
                  keyExtractor={(item, idx) => item.bpr_id || item.bp_id || `business-${idx}`}
                  removeClippedSubviews
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#00a8f0']}
                      tintColor="#00a8f0"
                    />
                  }
                  contentContainerStyle={{
                    paddingTop: 0,
                    paddingBottom: 20,
                    gap: 15,
                  }}
                  ListEmptyComponent={
                    !isLoading ? (
                      <View className="flex-1 items-center justify-center py-12 px-6">
                        <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                          {searchQuery ? 'No business permits found matching your search' : 'No business permits yet'}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try adjusting your search terms' : 'Business permit requests will appear here'}
                        </Text>
                      </View>
                    ) : null
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more business permits...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      filteredBusinesses.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more business permits
                          </Text>
                        </View>
                      )
                    )
                  }
                />
              )}
            </>
          )}
        </View>
      </View>
    </PageLayout>
  )
}

export default BusinessClearanceList

