import { useRouter } from "expo-router"
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, Text } from "react-native"
import { useGetIncidentReport } from "../queries/reportFetch";
import React, { act } from "react";
import PageLayout from "@/screens/_PageLayout";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronRight } from '@/lib/icons/ChevronRight';
import { ChevronLeft } from '@/lib/icons/ChevronLeft';
import { Search } from '@/lib/icons/Search';
import { FileText } from '@/lib/icons/FileText';
import { Archive } from '@/lib/icons/Archive';
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate } from "@/helpers/dateHelpers";

export default () => {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedPageSize = useDebounce(pageSize, 100);

  const { data: IncidentReport, isLoading: isLoadingIR, refetch } = useGetIncidentReport(
    currentPage,
    debouncedPageSize as number,
    debouncedSearchQuery as string,
    activeTab == 'archive'
  );

  const IRList = IncidentReport?.results || [];
  const totalCount = IncidentReport?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleItemPress = (item: any) => {

  };

  const RenderDataCard = React.memo(({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        className="mb-3 mx-5"
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <FileText size={20} className="text-blue-600" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base" numberOfLines={1}>
                    {item.ir_type}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.ir_id}
                  </Text>
                </View>
              </View>
              
              <View className="ml-15">
                <Text className="text-gray-600 text-sm mb-1">
                  📍 {item.ir_area}
                </Text>
                <Text className="text-gray-600 text-sm mb-1">
                  📅 {formatDate(item.ir_date, 'short')} at {item.ir_time}
                </Text>
                <Text className="text-gray-600 text-sm">
                  👤 Reported by: {item.ir_reported_by}
                </Text>
              </View>
            </View>
            
            <ChevronRight size={20} className="text-gray-400 ml-2" />
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <FileText size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No reports found' : `No ${activeTab} reports yet`}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : `${activeTab === 'active' ? 'Active' : 'Archived'} incident reports will appear here once added`
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading reports...</Text>
    </View>
  );

  const renderTabButtons = () => (
    <View className="flex-row mx-5 mb-4 justify-end">
      <TouchableOpacity
        className={`py-1 px-6 rounded-l-md  ${
          activeTab === 'active' 
            ? 'bg-blue-100 ' 
            : 'bg-white border-gray-300'
        }`}
        onPress={() => handleTabChange('active')}
      >
        <Text className={`text-center font-medium text-sm ${
          activeTab === 'active' ? 'text-primaryBlue' : 'text-gray-600'
        }`}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        className={`py-1 px-4 rounded-r-md  ${
          activeTab === 'archive' 
            ? 'bg-blue-100 ' 
            : 'bg-white border-gray-300'
        }`}
        onPress={() => handleTabChange('archive')}
      >
        <Text className={`text-center font-medium text-sm ${
          activeTab === 'archive' ? 'text-primaryBlue' : 'text-gray-600'
        }`}>
          Archived
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Incident Reports
        </Text>
      }
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

        <View className="flex-1 py-4">
          {/* Stats Card */}
          <Card className="flex-row items-center p-4 mb-4 bg-primaryBlue shadow-lg mx-5">
            <View className="p-3 bg-white/20 rounded-full mr-4">
              {activeTab === 'active' ? (
                <FileText size={24} className="text-white" />
              ) : (
                <Archive size={24} className="text-white" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                {activeTab === 'active' ? 'Active Reports' : 'Archived Reports'}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {totalCount}
              </Text>
              {searchQuery && (
                <Text className="text-white/80 text-xs">
                  Showing {totalCount} results
                </Text>
              )}
            </View>
          </Card>

          {/* Tab Buttons */}
          {renderTabButtons()}

          {/* Reports List */}
          <View className="flex-1">
            {isLoadingIR && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <FlatList
                  data={IRList}
                  renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                  keyExtractor={(item) => item.ir_id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#00a8f0']}
                    />
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}