import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { useUnpaidServiceCharges, UnpaidServiceCharge } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_PAGE_SIZE = 10;

const ServiceChargeClearanceList = () => {
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

  const tab = paymentStatusFilter.toLowerCase() as "unpaid" | "paid" | "declined"

  // Use React Query hook
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useUnpaidServiceCharges(currentPage, pageSize, debouncedSearchQuery || undefined, tab)

  // Extract data from paginated response
  const serviceCharges = responseData?.results || []
  const totalCount = responseData?.count || 0
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

  const getPaymentBadge = (serviceCharge: UnpaidServiceCharge) => {
    // Check payment status (for service charges, declined status is in payment_status)
    const paymentStatus = (serviceCharge.req_payment_status || "").toLowerCase();
    if (paymentStatus === "declined" || paymentStatus.includes("declined") || paymentStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
    if (paymentStatus === "paid") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Paid</Text>
    }
    
    // Default to Unpaid
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

  const wrapText = (text?: string, maxFirstLine: number = 24) => {
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
      headerTitle={<Text className="text-gray-900 text-[13px]">Service Charge Requests</Text>}
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
                <Text className="text-red-800 text-sm text-center">Failed to load unpaid service charges.</Text>
              </View>
            </View>
          ) : (
            <>
              {!isRefreshing && serviceCharges.length > 0 && (
                <View className="px-6 pt-4">
                  <Text className="text-xs text-gray-500">{`Showing ${serviceCharges.length} of ${totalCount} service charges`}</Text>
                </View>
              )}
              {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
              {!isRefreshing && (
                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={serviceCharges}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  renderItem={({ item: serviceCharge }) => (
                    <View className="px-6 pt-4">
                      <View className="bg-white rounded-xl p-5 mb-4 shadow-md border border-gray-200">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 mr-3">
                        <Text className="text-gray-900 font-bold text-base leading-5">{wrapText(serviceCharge.sr_code || "Service Charge")}</Text>
                        <Text className="text-gray-500 text-xs mt-1 font-medium">#{serviceCharge.sr_id}</Text>
                      </View>
                      {getPaymentBadge(serviceCharge)}
                    </View>
                    
                    {/* Complainant(s) */}
                    <View className="bg-blue-50 rounded-lg p-3 mb-3">
                      <Text className="text-blue-800 text-xs font-semibold mb-1">COMPLAINANT</Text>
                      <Text className="text-gray-700 text-sm font-medium">
                        {serviceCharge.complainant_names && serviceCharge.complainant_names.length 
                          ? serviceCharge.complainant_names.join(', ') 
                          : serviceCharge.complainant_name || '—'}
                      </Text>
                      {serviceCharge.complainant_addresses && serviceCharge.complainant_addresses.length > 0 && (
                        <Text className="text-gray-600 text-xs mt-1">
                          {serviceCharge.complainant_addresses.filter(Boolean).join(', ')}
                        </Text>
                      )}
                    </View>
                    
                    {/* Respondent */}
                    {(serviceCharge.accused_names && serviceCharge.accused_names.length > 0) && (
                      <View className="bg-orange-50 rounded-lg p-3 mb-3">
                        <Text className="text-orange-800 text-xs font-semibold mb-1">RESPONDENT</Text>
                        <Text className="text-gray-700 text-sm font-medium">
                          {serviceCharge.accused_names.join(', ')}
                        </Text>
                      </View>
                    )}
                    
                    <View className="bg-gray-50 rounded-lg p-3">
                      <Text className="text-gray-600 text-xs font-semibold mb-1">REQUEST DETAILS</Text>
                      <Text className="text-gray-700 text-sm font-medium">Date Requested: {formatDate(serviceCharge.sr_req_date)}</Text>
                      {serviceCharge.pay_sr_type && (
                        <Text className="text-gray-700 text-sm font-medium mt-2">Type: {serviceCharge.pay_sr_type}</Text>
                      )}
                      {(serviceCharge.req_payment_status === 'Declined' || (serviceCharge.req_payment_status || '').toLowerCase().includes('declined')) && serviceCharge.decline_reason && (
                        <Text className="text-gray-700 text-sm font-medium mt-2">Decline Reason: {serviceCharge.decline_reason}</Text>
                      )}
                      </View>
                    </View>
                    </View>
                  )}
                  keyExtractor={(item: UnpaidServiceCharge, idx: number) => item.sr_id || `service-${idx}`}
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
                      <View className="flex-1 items-center justify-center py-16 px-6">
                        <View className="items-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                          <Text className="text-gray-800 text-xl font-bold mb-3 text-center">
                            {searchQuery ? 'No Matching Service Charges' : 'No Service Charges Yet'}
                          </Text>
                          <Text className="text-gray-600 text-sm text-center leading-5">
                            {searchQuery ? 'Try adjusting your search terms' : 'Service charge requests will appear here when available'}
                          </Text>
                        </View>
                      </View>
                    ) : null
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more service charges...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      serviceCharges.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more service charges
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

export default ServiceChargeClearanceList

