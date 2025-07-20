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
import { useFamiliesTable } from "../queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { UsersRound } from "@/lib/icons/UsersRound";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { Calendar } from "@/lib/icons/Calendar";
import { UserRound } from "@/lib/icons/UserRound";

export default function FamilyRecords() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

  const { data: familiesTableData, isLoading, refetch } = useFamiliesTable(
    currentPage,
    pageSize,
    searchQuery
  );

  const families = familiesTableData?.results || [];
  const totalCount = familiesTableData?.count || 0;

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
    const memberCount = item.members || 0
    const sitio = item.sitio || "N/A"
    const street = item.street || "N/A"
    const building = item.fam_building || "N/A"
    const isIndigenous = item.fam_indigenous

    // Parent information
    const mother = item.mother || "N/A"
    const father = item.father || "N/A"
    const guardian = item.guardian || "N/A"

    // Determine primary guardian/head
    const primaryHead = father !== "N/A" ? father : mother !== "N/A" ? mother : guardian

    // Format location
    const location = building !== "N/A" ? `${sitio}, ${street}` : sitio

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(profiling)/family/details",
            params: {
              family: JSON.stringify(item),
            },
          })
        }}
        className="mb-3 mx-5"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white border border-gray-100 rounded-xl">
          {/* Header with Family ID and Status */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>
                {item.fam_id}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">Family Record</Text>
            </View>

            <View className="flex-row items-center">
              {isIndigenous && (
                <View className="bg-orange-100 px-3 py-1 rounded-full mr-2">
                  <Text className="text-orange-700 text-xs font-semibold">Indigenous</Text>
                </View>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </View>
          </View>

          {/* Family Head */}
          {primaryHead !== "N/A" && (
            <View className="flex-row items-center mb-3 bg-gray-50 p-3 rounded-lg">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <UserRound size={18} className="text-blue-600" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">Family Head</Text>
                <Text className="text-gray-900 font-semibold text-base mt-1" numberOfLines={1}>
                  {primaryHead}
                </Text>
              </View>
            </View>
          )}

          {/* Key Information Row */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
            {/* Members Count */}
            <View className="flex-">
              <Text className="text-gray-500 text-xs">Members</Text>
              <Text className="text-gray-900 font-semibold text-sm">{memberCount}</Text>
            </View>

            {/* Location */}
            <View className="flex-1 ml-4">
              <Text className="text-gray-500 text-xs">Location</Text>
              <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    )
  })

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <UsersRound size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No families found' : 'No families yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
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
          Family Records
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
              <UsersRound size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                Total Families
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

          {/* Families List */}
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
                  data={families}
                  renderItem={({item, index}) => <RenderDataCard item={item} index={index} />}
                  keyExtractor={(item) => item.fam_id.toString()}
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
              </>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}