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
import { useGetFamilyList } from "../queries/healthProfilingQueries";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { capitalize } from "@/helpers/capitalize";
import { UsersRound } from "@/lib/icons/UsersRound";
import { UserRound } from "@/lib/icons/UserRound";
import { useDebounce } from "@/hooks/use-debounce";

export default function FamilyRecords() {
  // ============ STATE INITIALIZATION ============
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  const debouncedSearchQuery = useDebounce(searchInputVal, 500);

  const {
    data: familiesTableData,
    isLoading,
    refetch,
  } = useGetFamilyList(currentPage, pageSize, debouncedSearchQuery);

  const families = familiesTableData?.results || [];
  const totalCount = familiesTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // ============ HANDLERS ============
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

  // ============ RENDER HELPERS ============
  const ItemCard = React.memo(({ item }: { item: Record<string, any> }) => {
    const membersCount = item.members || 0;
    const sitio = item.sitio || "N/A";
    const street = item.street || "N/A";
    const building = item.fam_building || "N/A";

    const location = building !== "N/A" ? `${sitio}, ${street}` : sitio;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(health)/admin/health-profiling/family/details",
            params: {
              family: JSON.stringify(item),
            },
          });
        }}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Avatar */}
            <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
              {membersCount > 1 ? (
                <UsersRound size={24} className="text-white" />
              ) : (
                <UserRound size={24} className="text-white" />
              )}
            </View>
            
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
                {item.fam_id}
              </Text>
              <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
                {capitalize(location)}
              </Text>

              {/* Badges */}
              <View className="flex-row items-center flex-wrap gap-2">
                <View className="bg-purple-100 px-3 py-1 rounded-full">
                  <Text className="text-purple-700 text-xs font-medium">
                    Family
                  </Text>
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded-full flex-row items-center gap-1">
                  {membersCount > 1 ? (
                    <UsersRound size={12} className="text-gray-700" />
                  ) : (
                    <UserRound size={12} className="text-gray-700" />
                  )}
                  <Text className="text-gray-700 text-xs">
                    {membersCount} {membersCount === 1 ? 'Member' : 'Members'}
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

  const renderItem = React.useCallback(
    ({ item }: { item: Record<string, any> }) => <ItemCard item={item} />,
    []
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <UsersRound size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {debouncedSearchQuery ? 'No families found' : 'No families yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {debouncedSearchQuery 
          ? 'Try adjusting your search terms' 
          : 'Family records will appear here once added'
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading families...</Text>
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

  if (isLoading && currentPage === 1) {
    return <LoadingState />;
  }

  // ============ MAIN RENDER ============
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
          Family Records
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="bg-white px-4 py-2 border-b border-gray-200">
          <View className="flex-row items-center p-1 border border-gray-200 bg-gray-50 rounded-xl">
            <Search size={20} className="text-gray-500" />
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
              Showing {families.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
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
          {/* Families List */}
          {isLoading && !isRefreshing ? (
            renderLoadingState()
          ) : totalCount === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlatList
                maxToRenderPerBatch={10}
                overScrollMode="never"
                data={families}
                renderItem={renderItem}
                keyExtractor={(item) => item.fam_id.toString()}
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
