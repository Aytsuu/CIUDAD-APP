import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import React from "react";
import { Search } from "@/lib/icons/Search";
import { useHouseholdTable } from "../queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

export default function HouseholdRecords() {
  // ============= STATE INITIALIZATION =============
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const {
    data: householdTableData,
    isLoading,
    refetch,
    isFetching,
  } = useHouseholdTable(currentPage, pageSize, searchQuery);

  const households = householdTableData?.results || [];
  const totalCount = householdTableData?.count || 0;
  const hasNext = householdTableData?.next;

  // ============= SIDE EFFECTS =============
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

  // ============= HANDLERS =============
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

  // ============= RENDER HELPERS =============
  const ItemCard = React.memo(({ item }: { item: Record<string, any> }) => {
    const householdInitials = item.hh_id
      ? item.hh_id.substring(0, 2).toUpperCase()
      : "HH";
    const fullAddress =
      [item.street, item.sitio].filter(Boolean).join(", ") ||
      "Address not specified";

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(profiling)/household/details",
            params: {
              household: JSON.stringify(item),
            },
          });
        }}
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          {/* Header Section */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="flex-1">
                <Text
                  className="text-gray-900 font-semibold text-base"
                  numberOfLines={1}
                >
                  Household {item.hh_id}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {item.total_families > 0 ? `${item.total_families} ` : ""}
                  {item.total_families > 0 ? item.total_families === 1 ? "family" : "families" : "No family registered"}
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
            <Text className="text-gray-600 text-sm font-medium">Owner: </Text>
            <Text className="text-gray-900 text-sm truncate" numberOfLines={1}>
              {item.head || "Not specified"}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderItem = React.useCallback(
    ({ item }: { item: Record<string, any> }) => <ItemCard item={item} />,
    []
  );

  if (isLoading) {
    return <LoadingState />;
  }

  // ============= MAIN RENDER =============
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
        <Text className="text-gray-900 text-[13px]">Household Records</Text>
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
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${households.length} of ${totalCount} houses`}</Text>
        )}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}
        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            overScrollMode="never"
            windowSize={21}
            removeClippedSubviews
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 20,
              gap: 15,
            }}
            data={households}
            onScroll={handleScroll}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            renderItem={renderItem}
            keyExtractor={(item) => item.hh_id}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#00a8f0"]}
              />
            }
          />
        )}
      </View>
    </PageLayout>
  );
}
