import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Plus, Edit3, Trash2, History, CheckCircle, XCircle, Search } from 'lucide-react-native';
import { useGetAnnualGrossSalesActive, useGetAllAnnualGrossSales, type AnnualGrossSales } from './queries/ratesFetchQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'expo-router';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useDeleteAnnualGrossSales } from './queries/ratesDeleteQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingModal } from '@/components/ui/loading-modal';
import { Input } from '@/components/ui/input';
import { formatTimestamp } from '@/helpers/timestampformatter';
import { useAuth } from '@/contexts/AuthContext';

export default function RatesPage1() {
  const router = useRouter();
  const {user} = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [searchInputVal, setSearchInputVal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = useState<boolean>(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Query hooks with pagination and search
  const { 
    data: activeData, 
    isLoading: isActiveLoading, 
    refetch: refetchActive,
    isFetching: isActiveFetching
  } = useGetAnnualGrossSalesActive(currentPage, pageSize, searchQuery);
  
  const { 
    data: allData, 
    isLoading: isAllLoading, 
    refetch: refetchAll,
    isFetching: isAllFetching
  } = useGetAllAnnualGrossSales(currentPage, pageSize, searchQuery);

  const { mutate: deleteGrossSales, isPending: isDeletePending } = useDeleteAnnualGrossSales();

  // Data based on active tab
  const currentData = activeTab === 'active' ? activeData : allData;
  const currentIsFetching = activeTab === 'active' ? isActiveFetching : isAllFetching;
  const rates = currentData?.results || [];
  const totalCount = currentData?.count || 0;
  const hasNext = currentData?.next;
  const isLoading = activeTab === 'active' ? isActiveLoading : isAllLoading;

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
    if (!currentIsFetching && isLoadMore) setIsLoadMore(false);
  }, [currentIsFetching, isLoadMore]);

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'active') {
      await refetchActive();
    } else {
      await refetchAll();
    }
    setIsRefreshing(false);
  };

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

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

  const handleCreate = () => {
    const sortedData = [...rates]
      .filter(item => !item.ags_is_archive)
      .sort((a, b) => new Date(b.ags_date).getTime() - new Date(a.ags_date).getTime());

    const lastMaxRange = sortedData.length > 0 ? sortedData[0].ags_maximum : 0;

    router.push({
      pathname: '/(treasurer)/rates/annual-gross-sales-create',
      params: {
        lastMaxRange: lastMaxRange.toString(),
      },
    });
  };

  const handleDelete = (agsId: string) => {
    deleteGrossSales({ags_id: Number(agsId), staff_id: user?.staff?.staff_id});
  };

  const handleEdit = (item: AnnualGrossSales) => {
    router.push({
      pathname: '/(treasurer)/rates/annual-gross-sales-edit',
      params: {
        ags_id: item.ags_id.toString(),
        ags_minimum: item.ags_minimum.toString(),
        ags_maximum: item.ags_maximum.toString(),
        ags_rate: item.ags_rate.toString()
      },
    });
  };

  // ================= RENDER HELPERS =================
  const RenderRateCard = React.memo(({ 
    item, 
    showStatus = false, 
    showActions = false 
  }: { 
    item: AnnualGrossSales; 
    showStatus?: boolean; 
    showActions?: boolean; 
  }) => (
    <Card key={item.ags_id} className="mb-2 border border-gray-200 shadow-xs bg-white">
      <CardHeader className="pb-2">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-base text-[#1a2332]">
              ₱{item.ags_minimum.toLocaleString()} - ₱{item.ags_maximum.toLocaleString()}
            </Text>
            
            {showStatus && (
              <View className="flex-row items-center mt-1">
                {item.ags_is_archive ? (
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
              <TouchableOpacity className="bg-blue-50 p-1.5 rounded-lg" onPress={() => handleEdit(item)}>
                <Edit3 size={14} color="#3b82f6" />
              </TouchableOpacity>

              <ConfirmationModal
                trigger={ 
                  <TouchableOpacity className="bg-red-50 p-1.5 rounded-lg">
                    <Trash2 size={14} color="#ef4444" />
                  </TouchableOpacity>
                }
                title="Confirm Delete"
                description="Are you sure you want to delete this record? This action will set the record to inactive state and cannot be undone."
                actionLabel='Confirm'
                onPress={() => handleDelete(item.ags_id.toString())}
              />
            </View>
          )}
        </View>
      </CardHeader>

      <CardContent className="pt-2 border-t border-gray-100">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold text-[#2a3a61]">₱{item.ags_rate.toLocaleString()}</Text>
            {activeTab !== 'active' && (
              <Text className="text-xs text-gray-500 mt-1">
                Last Updated: {formatTimestamp(item.ags_date)} • {item.staff_name || 'N/A'}
              </Text>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  ));

  const renderEmptyState = () => {
    const message = searchQuery
      ? `No ${activeTab === 'active' ? 'active' : 'archived'} records found matching your criteria.`
      : `No ${activeTab === 'active' ? 'active' : 'archived'} records found.`;
    
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

  // Footer component for loading more
  const renderFooter = () => {
    if (currentIsFetching && isLoadMore) {
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
            No more {activeTab === 'active' ? 'active' : 'archived'} records
          </Text>
        </View>
      );
    }
    
    return null;
  };

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSearchInputVal('');
    setPageSize(10);
  };

  // Render list content
  const renderListContent = () => (
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
          showActions={activeTab === 'active'} 
          showStatus={activeTab === 'archive'} 
        />
      )}
      keyExtractor={item => item.ags_id.toString()}
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

  return (
    <>
      <View className="flex-1 p-6">
        <View className="mb-4">
          {/* Search Input */}
          <View className="flex-row items-center bg-white border border-gray-300 rounded-lg px-3 mb-2">
            <Search size={18} color="#6b7280" />
            <Input
              className="flex-1 ml-2 bg-white text-black"
              placeholder={`Search ${activeTab === 'active' ? 'active' : 'archived'} records...`}
              value={searchInputVal}
              onChangeText={setSearchInputVal}
              onSubmitEditing={handleSearch}
              style={{ borderWidth: 0, shadowOpacity: 0 }}
            />
          </View>

          {/* Result Count */}
          {!isRefreshing && rates.length > 0 && (
            <Text className="text-xs text-gray-500 mb-2">
              Showing {rates.length} of {totalCount} {activeTab === 'active' ? 'active' : 'archived'} record{totalCount !== 1 ? 's' : ''}
            </Text>
          )}

          {/* Add Button */}
          {activeTab === 'active' && (
            <Button 
              onPress={handleCreate} 
              className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md"
            >
              <Plus size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">Add</Text>
            </Button>
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

          {/* Loading state during refresh */}
          {currentIsFetching && isRefreshing && !isLoadMore && <LoadingState />}

          {/* Active Tab Content */}
          <TabsContent value="active" className="flex-1">
            {!isRefreshing && renderListContent()}
          </TabsContent>

          {/* History Tab Content */}
          <TabsContent value="archive" className="flex-1">
            {!isRefreshing && renderListContent()}
          </TabsContent>
        </Tabs>
      </View>

      {/* Loading Modal for Delete Operation */}
      <LoadingModal visible={isDeletePending} />
    </>
  );
}