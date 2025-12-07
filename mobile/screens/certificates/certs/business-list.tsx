import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { useBusinessPermits, getBusinessPermits, BusinessPermit } from '../queries/businessPermitQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_PAGE_SIZE = 10;

const BusinessList = () => {
  const [allPurposes, setAllPurposes] = useState<string[]>([])
  const [purposeFilter, setPurposeFilter] = useState<string>('all')
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false)
  const [isInitialRender, setIsInitialRender] = useState(true)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch all purposes once for filter dropdown
  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const data = await getBusinessPermits(undefined, 1, 1000, undefined, 'Paid', undefined)
        const purposesSet = new Set<string>()
        data.results.forEach(business => {
          const purpose = business.purpose || business.business_type
          if (purpose) purposesSet.add(purpose)
        })
        setAllPurposes(Array.from(purposesSet).sort())
      } catch (err) {
        // Silently fail
      }
    }
    fetchPurposes()
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setPageSize(INITIAL_PAGE_SIZE)
  }, [purposeFilter, debouncedSearchQuery])

  const purposeParam = purposeFilter === 'all' ? undefined : purposeFilter

  // Use React Query hook
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useBusinessPermits(
    currentPage,
    pageSize,
    debouncedSearchQuery || undefined,
    undefined,
    'Paid',
    purposeParam
  )

  // Extract data and filter out completed items client-side
  const rawResults = responseData?.results || []
  const businessPermits = rawResults.filter((p: BusinessPermit) => 
    String(p.req_status || "").toLowerCase() !== "completed"
  )
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

  const getStatusBadge = (status?: string) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("reject") || normalized === "rejected") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Rejected</Text>
    }
    if (normalized.includes("approve") || normalized === "approved") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Approved</Text>
    }
    if (normalized.includes("complete") || normalized === "completed") {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-800">Completed</Text>
    }
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</Text>
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

  // Search function
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

        {/* Purpose Filter */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <SelectLayout
            label="Purpose Filter"
            placeholder="Select purpose"
            options={[
              { label: 'All', value: 'all' },
              ...allPurposes.map(purpose => ({ label: purpose, value: purpose }))
            ]}
            selectedValue={purposeFilter}
            onSelect={(option) => setPurposeFilter(option.value)}
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
              {!isRefreshing && businessPermits.length > 0 && (
                <View className="px-6 pt-4">
                  <Text className="text-xs text-gray-500">{`Showing ${businessPermits.length} of ${totalCount} business permits`}</Text>
                </View>
              )}
              {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
              {!isRefreshing && (
                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={businessPermits}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  keyExtractor={(item, idx) => item.bpr_id || item.bp_id || `business-${idx}`}
                  removeClippedSubviews
                renderItem={({ item: business }) => (
                  <View className="px-6 pt-4">
                    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-900 font-medium">{wrapPurpose(business.business_name || "Business Permit")}</Text>
                        {getStatusBadge(business.req_status)}
                      </View>
                      <Text className="text-gray-500 text-xs mt-1">ID: {business.bpr_id || business.bp_id || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Owner: {business.owner_name || business.requestor || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Type: {business.purpose || business.business_type || '—'}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(business.req_request_date)}</Text>
                      {business.req_claim_date && (
                        <Text className="text-gray-500 text-xs mt-1">Date Claimed: {formatDate(business.req_claim_date)}</Text>
                      )}
                    </View>
                  </View>
                )}
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
                        <View className="items-center">
                          <View className="bg-gray-100 rounded-full p-4 mb-4">
                            <Text className="text-gray-500 text-2xl">🏢</Text>
                          </View>
                          <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
                            {searchQuery ? 'No business permits found matching your search' : 'No business permits yet'}
                          </Text>
                          <Text className="text-gray-500 text-sm text-center">
                            {searchQuery ? 'Try adjusting your search terms' : 'Your business permits will appear here'}
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
                          Loading more business permits...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      businessPermits.length > 0 && (
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

export default BusinessList