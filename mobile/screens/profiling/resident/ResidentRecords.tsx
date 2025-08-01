import { 
  FlatList, 
  TouchableOpacity, 
  View, 
  Text, 
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import React from "react";
import { Search } from "@/lib/icons/Search";
import { useResidentsTable } from "../queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { UserRound } from "@/lib/icons/UserRound";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "../../_PageLayout";

export default function ResidentRecords() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

  const { data: residentsTableData, isLoading, refetch } = useResidentsTable(
    currentPage,
    pageSize,
    searchQuery
  );

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
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

  const RenderDataCard = React.memo(({ item, index }: { item: any; index: number }) => {
    const fullName = `${item.fname} ${item.mname ? item.mname + ' ' : ''}${item.lname}`;
    
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/(profiling)/resident/details', // or '/resident-details' depending on your structure
            params: {
              resident: JSON.stringify(item)
            }
          });
        }}
        className="mb-3 mx-5"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-semibold text-lg">
                    {item.fname.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base" numberOfLines={1}>
                    {fullName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.rp_id}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-2">
                  <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
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
        {searchQuery ? 'No residents found' : 'No residents yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
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
        <Text className="text-gray-900 text-[13px]">
          Resident Records
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
              <UserRound size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                Total Residents
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

          {/* Residents List */}
          <View className="flex-1">
            {isLoading && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <FlatList
                  maxToRenderPerBatch={1}
                  overScrollMode="never"
                  data={residents}
                  renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                  keyExtractor={(item) => item.rp_id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#00a8f0']}
                    />
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                  windowSize={5}
                  removeClippedSubviews={true} 
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

