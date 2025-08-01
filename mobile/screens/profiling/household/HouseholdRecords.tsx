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
import { useHouseholdTable } from "../queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { UsersRound } from "@/lib/icons/UsersRound";
import { MapPin } from "@/lib/icons/MapPin";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { Home } from "@/lib/icons/Home";

export default function HouseholdRecords() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

  const { data: householdTableData, isLoading, refetch } = useHouseholdTable(
    currentPage,
    pageSize,
    searchQuery
  );

  const households = householdTableData?.results || [];
  const totalCount = householdTableData?.count || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const RenderDataCard = React.memo(({ item, index }: { item: any; index: number }) => {
    const householdInitials = item.hh_id ? item.hh_id.substring(0, 2).toUpperCase() : 'HH';
    const fullAddress = [item.street, item.sitio].filter(Boolean).join(', ') || 'Address not specified';
    
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/(profiling)/household/details', // or '/resident-details' depending on your structure
            params: {
              household: JSON.stringify(item)
            }
          });
        }}
        className="mb-3 mx-5"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          {/* Header Section */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base" numberOfLines={1}>
                  Household {item.hh_id}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {item.total_families} {item.total_families === 1 ? 'Family' : 'Families'}
                </Text>
              </View>
            </View>
            
            {/* NHTS Badge */}
            {item.nhts && (
              <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                <Text className="text-green-600 text-xs font-medium">NHTS</Text>
              </View>
            )}
            
            <ChevronRight size={20} className="text-gray-400" />
          </View>

          {/* Household Head */}
          <View className="flex-row items-center mb-2">
            <UsersRound size={16} className="text-gray-400 mr-2" />
            <Text className="text-gray-600 text-sm font-medium">Head: </Text>
            <Text className="text-gray-900 text-sm flex-1" numberOfLines={1}>
              {item.head || 'Not specified'}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Home size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No households found' : 'No households yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Household records will appear here once added'
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading households...</Text>
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
          Household Records
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
              <Home size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                Total Households
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

          {/* Households List */}
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
                  data={households}
                  renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                  keyExtractor={(item) => item.hh_id}
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
              </>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}