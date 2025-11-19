import { 
  FlatList, 
  TouchableOpacity, 
  View, 
  Text, 
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import React from "react";
import { Search } from "@/lib/icons/Search";
import { useResidentsTable } from "../../../../profiling/queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { UserRound } from "@/lib/icons/UserRound";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "../../../../_PageLayout";
import { useDebounce } from "@/hooks/use-debounce";

export default function ResidentRecords() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  const debouncedSearchQuery = useDebounce(searchInputVal, 500);

  const { data: residentsTableData, isLoading, refetch } = useResidentsTable(
    currentPage,
    pageSize,
    debouncedSearchQuery
  );

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearchChange = React.useCallback((text: string) => {
    setSearchInputVal(text);
  }, []);

  const handlePageChange = React.useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const RenderDataCard = React.memo(({ item, index }: { item: any; index: number }) => {
    const fullName = `${item.fname} ${item.mname ? item.mname + ' ' : ''}${item.lname}`;
    
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/(health)/admin/health-profiling/resident/details',
            params: {
              resident: JSON.stringify(item)
            }
          });
        }}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
              <UserRound size={24} className="text-white" />
            </View>
            
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
                {fullName}
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                ID: {item.rp_id}
              </Text>

              {/* Badges */}
              <View className="flex-row items-center flex-wrap gap-2">
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">
                    Resident
                  </Text>
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text className="text-gray-700 text-xs">
                    Age: {item.age}
                  </Text>
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text className="text-gray-700 text-xs">
                    {item.sex}
                  </Text>
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
        <UserRound size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {debouncedSearchQuery ? 'No residents found' : 'No residents yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {debouncedSearchQuery 
          ? 'Try adjusting your search terms' 
          : 'Resident records will appear here once added'
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading residents...</Text>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mt-4">
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
        <Text className="text-gray-900 text-lg font-semibold">
          Resident Records
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={16} className="text-gray-500" />
            <TextInput
              className="flex-1 ml-3 text-gray-800 text-base"
              placeholder="Search..."
              placeholderTextColor="#9CA3AF"
              value={searchInputVal}
              onChangeText={handleSearchChange}
            />
          </View>
        </View>

        {/* Stats and Pagination Info */}
        <View className="px-4 flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600">
              Showing {residents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
            </Text>
          </View>
          {totalPages > 1 && (
            <View className="flex-row items-center">
              <Text className="text-sm font-medium text-gray-800">
                Page {currentPage} of {totalPages}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          {/* Residents List */}
          {isLoading && !isRefreshing ? (
            renderLoadingState()
          ) : totalCount === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlatList
                maxToRenderPerBatch={10}
                overScrollMode="never"
                data={residents}
                renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                keyExtractor={(item) => item.rp_id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={['#3B82F6']}
                  />
                }
                contentContainerStyle={{ 
                  padding: 16,
                  paddingBottom: totalPages > 1 ? 80 : 20
                }}
                windowSize={5}
                removeClippedSubviews={true} 
              />
              {renderPagination()}
            </>
          )}
        </View>
      </View>
    </PageLayout>
  );
}

