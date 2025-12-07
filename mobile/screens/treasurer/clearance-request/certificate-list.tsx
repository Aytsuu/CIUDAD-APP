import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { useUnpaidCertificates, UnpaidCertificate } from './queries/ClearanceQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'
import { SelectLayout } from '@/components/ui/select-layout'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_PAGE_SIZE = 10;

const CertificateClearanceList = () => {
  const [searchInputVal, setSearchInputVal] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Unpaid' | 'Paid' | 'Declined'>('Unpaid')
  const [residentTypeFilter, setResidentTypeFilter] = useState<'all' | 'resident' | 'nonresident'>('all')
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
  }, [paymentStatusFilter, residentTypeFilter, debouncedSearchQuery])

  // Use React Query hook
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = useUnpaidCertificates(currentPage, pageSize, debouncedSearchQuery || undefined)

  // Extract and filter data client-side (for payment status and resident type)
  const rawResults = responseData?.results || []
  const certificates = useMemo(() => {
    return rawResults.filter((c: UnpaidCertificate) => {
      // Filter by payment status
      const paymentStatus = (c.req_payment_status || '').toLowerCase()
      let paymentMatch = true
      if (paymentStatusFilter === 'Unpaid') {
        paymentMatch = paymentStatus === 'unpaid'
      } else if (paymentStatusFilter === 'Paid') {
        paymentMatch = paymentStatus === 'paid'
      } else if (paymentStatusFilter === 'Declined') {
        paymentMatch = paymentStatus.includes('declined')
      }
      
      // Filter by resident type
      let residentMatch = true
      if (residentTypeFilter === 'resident') {
        residentMatch = !c.is_nonresident
      } else if (residentTypeFilter === 'nonresident') {
        residentMatch = c.is_nonresident === true
      }
      
      return paymentMatch && residentMatch
    })
  }, [rawResults, paymentStatusFilter, residentTypeFilter])
  
  const totalCount = certificates.length
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

  const getPaymentBadge = (certificate: UnpaidCertificate) => {
    const reqStatus = (certificate.req_status || "").toLowerCase();
    
    // First check if request status is Cancelled (check this before declined)
    if (reqStatus === "cancelled" || reqStatus.includes("cancel")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-700">Cancelled</Text>
    }
    
    // Then check if request status is Declined
    if (reqStatus === "declined" || reqStatus.includes("decline") || reqStatus.includes("rejected")) {
      return <Text className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">Declined</Text>
    }
    
    // Then check payment status
    const paymentStatus = (certificate.req_payment_status || "").toLowerCase();
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

  // Filter certificates based on payment status, resident type, and search (like web does)
  const filteredCertificates = useMemo(() => {
    let filtered = certificates;
    
    // Filter by resident type first
    if (residentTypeFilter !== 'all') {
      filtered = filtered.filter(cert => {
        const isNonResident = cert.is_nonresident || false;
        if (residentTypeFilter === 'resident' && isNonResident) return false;
        if (residentTypeFilter === 'nonresident' && !isNonResident) return false;
        return true;
      });
    }
    
    // Filter by payment status (exactly like web component does)
    if (paymentStatusFilter === 'Declined') {
      // Show only declined/cancelled requests (both show as Declined like web does)
      filtered = filtered.filter(cert => {
        const status = cert.req_status || '';
        const statusLower = status.toLowerCase();
        return statusLower === 'declined' || statusLower === 'cancelled';
      });
    } else {
      // For paid/unpaid, filter out declined/cancelled requests first (like web does)
      filtered = filtered.filter(cert => {
        const status = cert.req_status || '';
        const statusLower = status.toLowerCase();
        // Filter out declined and cancelled requests (like web does)
        if (statusLower === 'declined' || statusLower === 'cancelled') {
          return false;
        }
        
        // Then filter by payment status
        const paymentStatus = (cert.req_payment_status || '').toLowerCase();
        if (paymentStatusFilter === 'Paid') {
          return paymentStatus === 'paid';
        } else if (paymentStatusFilter === 'Unpaid') {
          return paymentStatus !== 'paid';
        }
        return false;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(cert => {
        const isNonRes = cert.is_nonresident || false;
        
        if (isNonRes) {
          return (
            cert.cr_id?.toLowerCase().includes(searchLower) ||
            cert.nrc_id?.toLowerCase().includes(searchLower) ||
            cert.nrc_fname?.toLowerCase().includes(searchLower) ||
            cert.nrc_lname?.toLowerCase().includes(searchLower) ||
            cert.nrc_mname?.toLowerCase().includes(searchLower) ||
            cert.req_type?.toLowerCase().includes(searchLower) ||
            cert.req_purpose?.toLowerCase().includes(searchLower)
          );
        } else {
          return (
            cert.cr_id?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_fname?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_lname?.toLowerCase().includes(searchLower) ||
            cert.resident_details?.per_mname?.toLowerCase().includes(searchLower) ||
            cert.req_type?.toLowerCase().includes(searchLower) ||
            cert.req_purpose?.toLowerCase().includes(searchLower)
          );
        }
      });
    }
    
    return filtered;
  }, [certificates, searchQuery, paymentStatusFilter, residentTypeFilter])

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Certificate Requests</Text>}
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

        {/* Filters - Side by Side */}
        <View className="bg-white px-6 py-4 border-b border-gray-200">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <SelectLayout
                label="Type Filter"
                placeholder="Select type"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Resident', value: 'resident' },
                  { label: 'Non-Resident', value: 'nonresident' }
                ]}
                selectedValue={residentTypeFilter}
                onSelect={(option) => setResidentTypeFilter(option.value as any)}
              />
            </View>
            <View className="flex-1">
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
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1">
          {isError ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load unpaid certificates.</Text>
              </View>
            </View>
          ) : (
            <>
              {!isRefreshing && filteredCertificates.length > 0 && (
                <View className="px-6 pt-4">
                  <Text className="text-xs text-gray-500">{`Showing ${filteredCertificates.length} of ${totalCount} certificates`}</Text>
                </View>
              )}
              {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
              {!isRefreshing && (
                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={filteredCertificates}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  renderItem={({ item: certificate }) => {
                    const isNonResident = certificate.is_nonresident || false;
                    const name = isNonResident
                      ? `${certificate.nrc_lname || ''} ${certificate.nrc_fname || ''} ${certificate.nrc_mname || ''}`.trim()
                      : `${certificate.resident_details?.per_fname || ''} ${certificate.resident_details?.per_lname || ''}`.trim();
                    const id = isNonResident ? certificate.nrc_id || certificate.cr_id : certificate.cr_id;

                    return (
                      <View className="px-6 pt-4">
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                          <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                              <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.req_type || "Certificate")}</Text>
                              {isNonResident && (
                                <Text className="text-purple-600 text-[10px] mt-1 font-medium">Non-Resident</Text>
                              )}
                            </View>
                            {getPaymentBadge(certificate)}
                          </View>
                          <Text className="text-gray-500 text-xs mt-1">ID: {id}</Text>
                          <Text className="text-gray-500 text-xs mt-1">Name: {name || '—'}</Text>
                          <Text className="text-gray-500 text-xs mt-1">Purpose: {certificate.req_purpose || certificate.req_type || '—'}</Text>
                          <Text className="text-gray-500 text-xs mt-1">Date Requested: {formatDate(certificate.req_request_date)}</Text>
                          {certificate.amount && (
                            <Text className="text-gray-500 text-xs mt-1">Amount: ₱{parseFloat(certificate.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                          )}
                          {(certificate.req_status === 'Declined' || certificate.req_status === 'Cancelled') && certificate.decline_reason && (
                            <Text className="text-gray-500 text-xs mt-1">Decline Reason: {certificate.decline_reason}</Text>
                          )}
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item, idx) => item.cr_id || item.nrc_id || `cert-${idx}`}
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
                          {searchQuery ? 'No certificates found matching your search' : 'No certificates yet'}
                        </Text>
                        <Text className="text-gray-500 text-sm text-center">
                          {searchQuery ? 'Try adjusting your search terms' : 'Certificate requests will appear here'}
                        </Text>
                      </View>
                    ) : null
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more certificates...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      filteredCertificates.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more certificates
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

export default CertificateClearanceList

