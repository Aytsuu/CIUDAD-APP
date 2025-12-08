import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from 'expo-router'
import { useDebounce } from '@/hooks/use-debounce'

const INITIAL_PAGE_SIZE = 10;
import { 
  useIssuedCertificates,
  useIssuedBusinessPermits,
  useIssuedServiceCharges,
  IssuedCertificate,
  IssuedBusinessPermit,
  IssuedServiceCharge 
} from '../queries/issuedCertificateQueries'
import PageLayout from '../../_PageLayout'
import { ChevronLeft } from 'lucide-react-native'
import { LoadingState } from '@/components/ui/loading-state'
import { Search } from '@/lib/icons/Search'
import { SearchInput } from '@/components/ui/search-input'

const IssuedCertList = () => {
  const [activeMainTab, setActiveMainTab] = useState<'certificates' | 'businessPermits' | 'serviceCharges'>('certificates')
  
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

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1)
    setPageSize(INITIAL_PAGE_SIZE)
  }, [activeMainTab, debouncedSearchQuery])

  // Use React Query hooks conditionally based on active tab
  const certificatesQuery = useIssuedCertificates(
    activeMainTab === 'certificates' ? currentPage : 1,
    activeMainTab === 'certificates' ? pageSize : INITIAL_PAGE_SIZE,
    activeMainTab === 'certificates' ? debouncedSearchQuery : undefined
  );

  const businessPermitsQuery = useIssuedBusinessPermits(
    activeMainTab === 'businessPermits' ? currentPage : 1,
    activeMainTab === 'businessPermits' ? pageSize : INITIAL_PAGE_SIZE,
    activeMainTab === 'businessPermits' ? debouncedSearchQuery : undefined
  );

  const serviceChargesQuery = useIssuedServiceCharges(
    activeMainTab === 'serviceCharges' ? currentPage : 1,
    activeMainTab === 'serviceCharges' ? pageSize : INITIAL_PAGE_SIZE,
    activeMainTab === 'serviceCharges' ? debouncedSearchQuery : undefined
  );

  // Select the active query based on tab
  const activeQuery = activeMainTab === 'certificates' 
    ? certificatesQuery 
    : activeMainTab === 'businessPermits' 
    ? businessPermitsQuery 
    : serviceChargesQuery;

  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null },
    isLoading,
    isError,
    refetch,
    isFetching
  } = activeQuery;

  // Extract data based on active tab
  const certificates = activeMainTab === 'certificates' ? (responseData?.results as IssuedCertificate[] || []) : []
  const businessPermits = activeMainTab === 'businessPermits' ? (responseData?.results as IssuedBusinessPermit[] || []) : []
  const serviceCharges = activeMainTab === 'serviceCharges' ? (responseData?.results as IssuedServiceCharge[] || []) : []
  
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

  const getStatusBadge = () => {
    return <Text className="text-[10px] px-2 py-1 rounded-full bg-green-100 text-green-800">Issued</Text>
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

  const renderCertificates = () => (
    <>
      {!isRefreshing && certificates.length > 0 && (
        <View className="px-6 pt-4">
          <Text className="text-xs text-gray-500">{`Showing ${certificates.length} of ${totalCount} certificates`}</Text>
        </View>
      )}
      {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
      {!isRefreshing && (
        <FlatList
          maxToRenderPerBatch={5}
          overScrollMode="never"
          data={certificates}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          windowSize={11}
          renderItem={({ item: certificate }) => (
            <View className="px-6 pt-4">
              <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-900 font-medium">{wrapPurpose(certificate.purpose || "Certificate")}</Text>
                  {getStatusBadge()}
                </View>
                <Text className="text-gray-500 text-xs mt-1">ID: {certificate.ic_id}</Text>
                <Text className="text-gray-500 text-xs mt-1">Requester: {certificate.requester}</Text>
                <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(certificate.dateIssued)}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, idx) => item.ic_id || `cert-${idx}`}
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
                <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No certificates found</Text>
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
              certificates.length > 0 && (
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
  )

  const renderBusinessPermits = () => (
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
          renderItem={({ item: permit }) => (
            <View className="px-6 pt-4">
              <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-900 font-medium">{wrapPurpose(permit.business_name || "Business Permit")}</Text>
                  {getStatusBadge()}
                </View>
                <Text className="text-gray-500 text-xs mt-1">ID: {permit.ibp_id}</Text>
                <Text className="text-gray-500 text-xs mt-1">Purpose: {permit.purpose}</Text>
                <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(permit.dateIssued)}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, idx) => item.ibp_id || `permit-${idx}`}
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
                <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No business permits found</Text>
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
  )

  const renderServiceCharges = () => (
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
              <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-900 font-medium">{serviceCharge.sr_code || "Service Charge"}</Text>
                  {getStatusBadge()}
                </View>
                <Text className="text-gray-500 text-xs mt-1">ID: {serviceCharge.sr_id}</Text>
                {serviceCharge.complainant_names && serviceCharge.complainant_names.length > 0 && (
                  <Text className="text-gray-500 text-xs mt-1">Complainant: {serviceCharge.complainant_names.join(', ')}</Text>
                )}
                <Text className="text-gray-500 text-xs mt-1">Date Issued: {formatDate(serviceCharge.sr_req_date)}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, idx) => item.sr_id || `service-${idx}`}
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
                <Text className="text-gray-700 text-lg font-medium mb-2 text-center">No service charges found</Text>
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
  )

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Issued Certificates</Text>}
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

        {/* Main Tabs */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'certificates' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('certificates')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'certificates' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Certificates
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'businessPermits' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('businessPermits')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'businessPermits' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Business Permits
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center border-b-2 ${
                activeMainTab === 'serviceCharges' ? 'border-blue-500' : 'border-transparent'
              }`}
              onPress={() => setActiveMainTab('serviceCharges')}
            >
              <Text className={`text-sm font-medium ${
                activeMainTab === 'serviceCharges' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Service Charges
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-1">
          {isError ? (
            <View className="flex-1 justify-center items-center p-6">
              <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-800 text-sm text-center">Failed to load data.</Text>
              </View>
            </View>
          ) : (
            <>
              {activeMainTab === 'certificates' && renderCertificates()}
              {activeMainTab === 'businessPermits' && renderBusinessPermits()}
              {activeMainTab === 'serviceCharges' && renderServiceCharges()}
            </>
          )}
        </View>
      </View>
    </PageLayout>
  )
}

export default IssuedCertList
