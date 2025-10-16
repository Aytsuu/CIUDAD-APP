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
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { UserRound } from "@/lib/icons/UserRound";
import { LoadingState } from "@/components/ui/loading-state";
import { capitalize } from "@/helpers/capitalize";

const INITIAL_PAGE_SIZE = 15;

export default function FamilyRecords() {
  // ============ STATE INITIALIZATION ============
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const {
    data: familiesTableData,
    isLoading,
    refetch,
    isFetching,
  } = useFamiliesTable(currentPage, pageSize, searchQuery);

  const families = familiesTableData?.results || [];
  const totalCount = familiesTableData?.count || 0;
  const hasNext = familiesTableData?.next;

  // ============ SIDE EFFECTS ============
  React.useEffect(() => {
    if (searchQuery != searchInputVal && searchInputVal == "") {
      setSearchQuery(searchInputVal);
    }
  }, [searchQuery, searchInputVal]);

  React.useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  React.useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  React.useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  // ============ HANDLERS ============
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => setIsScrolling(false), 150);
  };

  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  // ============ RENDER HELPERS ============
  const ItemCard = React.memo(({ item }: { item: Record<string, any> }) => {
    const memberCount = item.members || 0;
    const sitio = item.sitio || "N/A";
    const street = item.street || "N/A";
    const building = item.fam_building || "N/A";
    const isIndigenous = item.fam_indigenous == "YES";

    // Parent information
    const mother = item.mother || "N/A";
    const father = item.father || "N/A";
    const guardian = item.guardian || "N/A";

    // Determine primary guardian/head
    const primaryHead =
      father !== "N/A" ? father : mother !== "N/A" ? mother : guardian;

    // Format location
    const location = building !== "N/A" ? `${sitio}, ${street}` : sitio;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(profiling)/family/details",
            params: {
              family: JSON.stringify(item),
            },
          });
        }}
        activeOpacity={0.7}
      >
        <Card className="bg-white border border-gray-100 rounded-xl">
          {/* Header with Family ID and Status */}
          <View className=" p-4 flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text
                className="text-gray-900 font-medium text-md"
                numberOfLines={1}
              >
                {item.fam_id}
              </Text>
              <Text className="text-gray-500 text-xs font-medium">
                {isIndigenous ? "Indigenous" : "Not Indigenous"}
              </Text>

            </View>

            <View className="flex-row items-center">
              <ChevronRight size={20} className="text-primaryBlue" />
            </View>
          </View>

          {/* Family Head */}
          {primaryHead !== "N/A" && (
            <View className="mx-4 flex-row items-center mb-3 bg-blue-50 p-3 rounded-lg">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                  Family Head
                </Text>
                <Text
                  className="text-gray-700 font-semibold text-sm mt-1"
                  numberOfLines={1}
                >
                  {capitalize(primaryHead)}
                </Text>
              </View>
            </View>
          )}

          {/* Key Information Row */}
          <View className="p-3 flex-row gap-2 items-center pt-3 border-t border-gray-100">
            {/* Members Count */}
            <View>
              <View className="flex-1 bg-blue-50 px-4 rounded-full">
                <Text className="text-primaryBlue font-semibold text-xs">
                  {memberCount} {memberCount > 1 ? "Members" : "Member"}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View>
              <View className="flex-1 bg-blue-50 px-4 rounded-full">
                <Text
                  className="text-primaryBlue font-medium text-xs"
                  numberOfLines={1}
                >
                  {location}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: Record<string, any> }) => <ItemCard item={item} />,
    []
  );

  if (isLoading && isInitialRender) {
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
        <Text className="text-gray-900 text-[13px]">Family Records</Text>
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
      {/* Search Bar */}
      {showSearch && (
        <SearchInput
          value={searchInputVal}
          onChange={setSearchInputVal}
          onSubmit={handleSearch}
        />
      )}
      <View className="flex-1 px-6">
        {!isRefreshing && (
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${families.length} of ${totalCount} families`}</Text>
        )}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={10}
            overScrollMode="never"
            initialNumToRender={10}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 20,
              gap: 15,
            }}
            windowSize={21}
            removeClippedSubviews
            data={families}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            renderItem={renderItem}
            keyExtractor={(item) => item.fam_id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#00a8f0"]}
              />
            }
            ListFooterComponent={() =>
              isFetching ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-xs text-gray-500 mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : (
                !hasNext &&
                families.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400">
                      No more family records
                    </Text>
                  </View>
                )
              )
            }
            ListEmptyComponent={<View></View>}
          />
        )}
      </View>
    </PageLayout>
  );
}
