import React from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Plus, Edit3, Trash2, History, CheckCircle, XCircle } from 'lucide-react-native';
import { useGetAnnualGrossSalesActive, useGetAllAnnualGrossSales, type AnnualGrossSales } from './queries/ratesFetchQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter } from 'expo-router';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useDeleteAnnualGrossSales } from './queries/ratesDeleteQueries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function RatesPage1() {
  const router = useRouter();
  
  // State management
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, _setPageSize] = React.useState<number>(10);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // Query hooks with pagination and search
  const { 
    data: activeData, 
    isLoading: isActiveLoading, 
    refetch: refetchActive 
  } = useGetAnnualGrossSalesActive(currentPage, pageSize, searchQuery);
  
  const { 
    data: allData, 
    isLoading: isAllLoading, 
    refetch: refetchAll 
  } = useGetAllAnnualGrossSales(currentPage, pageSize, searchQuery);

  const { mutate: deleteGrossSales, isPending: isDeletePending } = useDeleteAnnualGrossSales();

  // Data based on active tab
  const currentData = activeTab === 'active' ? activeData : allData;
  const rates = currentData?.results || [];
  const totalCount = currentData?.count || 0;
  const isLoading = activeTab === 'active' ? isActiveLoading : isAllLoading;

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

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

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
    deleteGrossSales(Number(agsId), {
      onSuccess: () => {
        refetchActive();
        refetchAll();
      }
    });
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

  // Rate Card Component
  const RenderRateCard = React.memo(({ 
    item, 
    showStatus = false, 
    showActions = false 
  }: { 
    item: AnnualGrossSales; 
    showStatus?: boolean; 
    showActions?: boolean; 
  }) => (
    <Card key={item.ags_id} className="mb-3 border-2 border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="font-semibold text-lg text-[#1a2332] mb-1">
              ₱{item.ags_minimum.toLocaleString()} - ₱{item.ags_maximum.toLocaleString()}
            </Text>

            {showStatus && (
              <View className="flex-row items-center mb-2">
                {item.ags_is_archive ? (
                  <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-full">
                    <XCircle size={12} color="#ef4444" />
                    <Text className="text-red-600 text-xs font-medium ml-1">Inactive</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle size={12} color="#22c55e" />
                    <Text className="text-green-600 text-xs font-medium ml-1">Active</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {showActions && (
            <View className="flex-row space-x-2">
              <TouchableOpacity className="bg-blue-50 p-2 rounded-lg" onPress={() => handleEdit(item)}>
                <Edit3 size={16} color="#3b82f6" />
              </TouchableOpacity>

              <ConfirmationModal
                trigger={ 
                  <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                    <Trash2 size={16} color="#ef4444" />
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

      <CardContent className="pt-3 border-t border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-[#2a3a61]">₱{item.ags_rate.toLocaleString()}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              Date Added/Updated: {new Date(item.ags_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  ));

  // Empty state component
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <History size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No rates found' : `No ${activeTab} rates`}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : `${activeTab === 'active' ? 'Active' : 'Historical'} rates will appear here once added`
        }
      </Text>
    </View>
  );

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    setSearchInputVal('');
  };

  return (
    <>
      <View className="flex-1 p-6">
        {/* Search Bar */}
        <View className="mb-4">
          <Input 
            placeholder="Search..." 
            value={searchInputVal} 
            onChangeText={setSearchInputVal}
            onSubmitEditing={handleSearch}
            className="bg-white text-black rounded-lg p-3 border border-gray-300 mb-3"
          />
          
          <Button onPress={handleCreate} className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md">
            <Plus size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">Add</Text>
          </Button>
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

          {/* Active Tab Content */}
          <TabsContent value="active" className="flex-1">
            {isLoading && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <View className="flex-1">
                <FlatList
                  data={rates}
                  renderItem={({ item }) => <RenderRateCard item={item} showActions={true} />}
                  keyExtractor={item => item.ags_id.toString()}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#00a8f0']}
                    />
                  }
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </TabsContent>

          {/* History Tab Content */}
          <TabsContent value="archive" className="flex-1">
            {isLoading && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <View className="flex-1">
                <FlatList
                  data={rates}
                  renderItem={({ item }) => <RenderRateCard item={item} showStatus={true} />}
                  keyExtractor={item => item.ags_id.toString()}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#00a8f0']}
                    />
                  }
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </TabsContent>
        </Tabs>
      </View>

      {/* Loading Modal for Delete Operation */}
      <LoadingModal visible={isDeletePending} 
      />
    </>
  );
}