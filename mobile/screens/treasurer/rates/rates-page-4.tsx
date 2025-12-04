import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { Edit3, History, CheckCircle, XCircle, Search } from 'lucide-react-native';
import { useGetPurposeAndRateAllBarangayPermit, useGetPurposeAndRateBarangayPermitActive, type PurposeAndRate } from './queries/ratesFetchQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'expo-router';
import { useDeletePurposeAndRate } from './queries/ratesDeleteQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingModal } from '@/components/ui/loading-modal';
import { formatTimestamp } from '@/helpers/timestampformatter';

export default function RatesPage4() {
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchInputVal, setSearchInputVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Pagination states for archive tab only
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Query hooks - active tab without pagination, archive with pagination
  const { 
    data: activeData, 
    isLoading: isActiveLoading, 
    refetch: refetchActive,
    isFetching: isActiveFetching 
  } = useGetPurposeAndRateBarangayPermitActive(1, 1000, searchQuery); // Large page size for all active records
  
  const { 
    data: archiveData, 
    isLoading: isArchiveLoading, 
    refetch: refetchArchive,
    isFetching: isArchiveFetching 
  } = useGetPurposeAndRateAllBarangayPermit(currentPage, pageSize, searchQuery);

  const { mutate: deletePermit, isPending: isDeletePending } = useDeletePurposeAndRate();

  // Data based on active tab
  const currentData = activeTab === 'active' ? activeData : archiveData;
  const currentIsFetching = activeTab === 'active' ? isActiveFetching : isArchiveFetching;
  const rates = currentData?.results || [];
  const totalCount = currentData?.count || 0;
  const hasNext = currentData?.next;
  const isLoading = activeTab === 'active' ? isActiveLoading : isArchiveLoading;

  // ================= SIDE EFFECTS =================
  useEffect(() => {
    if (searchQuery !== searchInputVal && searchInputVal === "") {
      setSearchQuery(searchInputVal);
    }
  }, [searchQuery, searchInputVal]);

  useEffect(() => {
    if (!currentIsFetching && isRefreshing) setIsRefreshing(false);
  }, [currentIsFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isArchiveFetching && isLoadMore) setIsLoadMore(false);
  }, [isArchiveFetching, isLoadMore]);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'active') {
      await refetchActive();
    } else {
      await refetchArchive();
    }
    setIsRefreshing(false);
  };

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInputVal);
    if (activeTab === 'archive') {
      setCurrentPage(1);
    }
  }, [searchInputVal, activeTab]);

  // Scroll handling for archive tab only
  const handleScroll = () => {
    if (activeTab === 'archive') {
      setIsScrolling(true);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }
  };

  // Load more for archive tab only
  const handleLoadMore = () => {
    if (activeTab === 'archive' && isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && activeTab === 'archive' && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  const handleEdit = (item: PurposeAndRate) => {
    router.push({
      pathname: '/(treasurer)/rates/purpose-and-rate-edit',
      params: {
        pr_id: item.pr_id.toString(),
        pr_purpose: item.pr_purpose,
        pr_amount: item.pr_rate.toString(),
        category: 'Barangay Permit',
      },
    });
  };

  // ================= RENDER HELPERS =================
  const RenderRateCard = React.memo(({ 
    item, 
    showStatus = false, 
    showActions = false 
  }: { 
    item: PurposeAndRate; 
    showStatus?: boolean; 
    showActions?: boolean; 
  }) => (
    <Card key={item.pr_id} className="mb-2 border border-gray-200 shadow-xs bg-white">
      <CardHeader className="pb-2">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-base text-[#1a2332]">
              {item.pr_purpose}
            </Text>
            
            {showStatus && (
              <View className="flex-row items-center mt-1">
                {item.pr_is_archive ? (
                  <View className="flex-row items-center bg-red-50 px-1.5 py-0.5 rounded-full">
                    <XCircle size={10} color="#ef4444" />
                    <Text className="text-red-600 text-xs font-medium ml-1">Inactive</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-green-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle size={10} color="#22c55e" />
                    <Text className="text-green-600 text-xs font-medium ml-1">Active</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {showActions && (
            <View className="flex-row space-x-1">
              <TouchableOpacity 
                className="bg-blue-50 p-1.5 rounded-lg"
                onPress={() => handleEdit(item)}
              >
                <Edit3 size={14} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CardHeader>

      <CardContent className="pt-2 border-t border-gray-100">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold text-[#2a3a61]">₱{item.pr_rate.toLocaleString()}</Text>
            {activeTab !== 'active' && (
              <Text className="text-xs text-gray-500 mt-1">
                Last Updated: {formatTimestamp(item.pr_date)} • {item.staff_name || 'N/A'}
              </Text>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  ));

  // Updated empty state component
  const renderEmptyState = () => {
    const message = searchQuery
      ? `No ${activeTab === 'active' ? 'active' : 'archived'} barangay permit rates found matching your criteria.`
      : `No ${activeTab === 'active' ? 'active' : 'archived'} barangay permit rates found.`;
    
    return (
      <View className="flex-1 justify-center items-center h-full">
        <Text className="text-gray-500 text-sm">{message}</Text>
      </View>
    );
  };

  // Loading state for initial load
  if (isLoading && isInitialRender) {
    return (
      <View className="flex-1 p-6">
        <LoadingState />
      </View>
    );
  }

  // Footer component for loading more (archive tab only)
  const renderFooter = () => {
    if (activeTab === 'archive') {
      if (isArchiveFetching && isLoadMore) {
        return (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-xs text-gray-500 mt-2">
              Loading more...
            </Text>
          </View>
        );
      }
      
      if (!hasNext && rates.length > 0) {
        return (
          <View className="py-4 items-center">
            <Text className="text-xs text-gray-400">
              No more archived barangay permit rates
            </Text>
          </View>
        );
      }
    }
    
    return null;
  };

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    if (tab === 'archive') {
      setCurrentPage(1);
      setPageSize(10);
    }
    setSearchQuery('');
    setSearchInputVal('');
  };

  // Render content based on tab
  const renderContent = () => {
    if (currentIsFetching && isRefreshing && !isLoadMore) {
      return <LoadingState />;
    }

    if (rates.length === 0) {
      return renderEmptyState();
    }

    // Active tab uses ScrollView
    if (activeTab === 'active') {
      return (
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
              tintColor="#00a8f0"
            />
          }
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        >
          {rates.map((item: any) => (
            <RenderRateCard 
              key={item.pr_id.toString()} 
              item={item} 
              showActions={true} 
            />
          ))}
        </ScrollView>
      );
    }

    // Archive tab uses FlatList with pagination
    return (
      <FlatList
        maxToRenderPerBatch={10}
        overScrollMode="never"
        data={rates}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={10}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        windowSize={21}
        renderItem={({ item }) => (
          <RenderRateCard 
            item={item} 
            showStatus={true} 
          />
        )}
        keyExtractor={item => item.pr_id.toString()}
        removeClippedSubviews
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 20,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#00a8f0"]}
            tintColor="#00a8f0"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState()}
      />
    );
  };

  return (
    <>
      <View className="flex-1 p-6">
        {/* Search Bar */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder={`Search ${activeTab === 'active' ? 'active' : 'archived'} barangay permit rates...`}
              value={searchInputVal}
              onChangeText={setSearchInputVal}
              onSubmitEditing={handleSearch}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>

          {/* Result Count */}
          {!isRefreshing && rates.length > 0 && (
            <Text className="text-xs text-gray-500 mb-2">
              {activeTab === 'active' ? (
                `${rates.length} active record${rates.length !== 1 ? 's' : ''} found`
              ) : (
                `Showing ${rates.length} of ${totalCount} archived record${totalCount !== 1 ? 's' : ''}`
              )}
            </Text>
          )}
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={val => handleTabChange(val as 'active' | 'archive')} className="flex-1">
          <TabsList className="bg-blue-50 flex-row justify-between mb-4">
            <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
              <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Active
              </Text>
            </TabsTrigger>
            <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
              <View className="flex-row items-center justify-center">
                <History size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
                <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                  History
                </Text>
              </View>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="active" className="flex-1">
            {renderContent()}
          </TabsContent>

          <TabsContent value="archive" className="flex-1">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </View>

      {/* Loading Modal for Delete Operation */}
      <LoadingModal visible={isDeletePending} />
    </>
  );
}