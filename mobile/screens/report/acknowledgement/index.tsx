import { useRouter } from "expo-router"
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, Text } from "react-native"
import { useGetAcknowledgementReport } from "../queries/reportFetch";
import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { ChevronRight } from '@/lib/icons/ChevronRight';
import { ChevronLeft } from '@/lib/icons/ChevronLeft';
import { Search } from '@/lib/icons/Search';
import { FileText } from '@/lib/icons/FileText';
import { CheckCircle } from '@/lib/icons/CheckCircle';
import { Clock } from '@/lib/icons/Clock';
import { MapPin } from '@/lib/icons/MapPin';

export default () => {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

  const { data: arReports, isLoading, refetch } = useGetAcknowledgementReport(
    currentPage,
    pageSize,
    searchQuery
  );
  
  const arList = arReports?.results || [];
  const totalCount = arReports?.count || 0;
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

  const handleItemPress = (item: any) => {
    // Navigate to acknowledgement report details

  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };

  const RenderDataCard = React.memo(({ item, index }: { item: any; index: number }) => {
    const hasFiles = item.ar_files && item.ar_files.length > 0;
    const isCompleted = item.status?.toLowerCase() === 'completed';
    
    return (
      <TouchableOpacity
        key={index}
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
                  <Text className="text-gray-900 font-semibold text-base" numberOfLines={2}>
                    {item.ar_title}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.id}
                  </Text>
                </View>
              </View>
              
              <View className="ml-15 space-y-1">
                <View className="flex-row items-center">
                  <MapPin size={14} className="text-gray-400 mr-1" />
                  <Text className="text-gray-600 text-sm">
                    {item.ar_sitio}, {item.ar_street}
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Text className="text-gray-600 text-sm">
                    Started: {formatDate(item.ar_date_started)}
                    {item.ar_time_started && ` at ${item.ar_time_started}`}
                  </Text>
                </View>
                
                {isCompleted && item.ar_date_completed && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm">
                      Completed: {formatDate(item.ar_date_completed)}
                      {item.ar_time_completed && ` at ${item.ar_time_completed}`}
                    </Text>
                  </View>
                )}
                
                <View className="flex-row items-center justify-between mt-2">
                  <View className={`px-2 py-1 rounded-full flex-row items-center ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <Text className={`text-xs font-medium ml-1 ${getStatusColor(item.status)}`}>
                      {item.status}
                    </Text>
                  </View>
                  
                  {hasFiles && (
                    <View className="bg-gray-100 px-2 py-1 rounded-full">
                      <Text className="text-gray-700 text-xs">
                        📎 {item.ar_files.length} file{item.ar_files.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>
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
        {searchQuery ? 'No reports found' : 'No acknowledgement reports yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Acknowledgement reports will appear here once added'
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mt-4 mx-5">
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500'
          }`}
        >
          <Text className={`font-medium ${
            currentPage === 1 ? 'text-gray-400' : 'text-white'
          }`}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <Text className="text-gray-600 font-medium">
          Page {currentPage} of {totalPages}
        </Text>
        
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500'
          }`}
        >
          <Text className={`font-medium ${
            currentPage === totalPages ? 'text-gray-400' : 'text-white'
          }`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          Acknowledgement Reports
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
              <FileText size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                Total Reports
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

          {/* Reports List */}
          <View className="flex-1">
            {isLoading && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <FlatList
                  data={arList}
                  renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#3B82F6']}
                    />
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
                {renderPagination()}
              </>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}