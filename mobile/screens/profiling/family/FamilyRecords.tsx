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
import { LoadingState } from "@/components/ui/loading-state";
import { capitalize } from "@/helpers/capitalize";
import { UsersRound } from "@/lib/icons/UsersRound";
import { UserRound } from "@/lib/icons/UserRound";

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
    const membersCount = item.members || 0;
    const sitio = item.sitio || "N/A";
    const street = item.street || "N/A";
    const building = item.fam_building || "N/A";

    const mother = item.mother || "N/A";
    const father = item.father || "N/A";
    const guardian = item.guardian || "N/A";

    const primaryHead =
      father !== "N/A" ? father : mother !== "N/A" ? mother : guardian;

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
        <View className="flex-row justify-between items-center bg-white border-t border-gray-100 py-5">
          <View className="flex-shrink pr-4" style={{ maxWidth: "60%" }}>
            <View className="flex-row gap-4">
              <Text
                className="text-gray-700 font-medium text-md"
                numberOfLines={1}
              >
                {item.fam_id}
              </Text>

              <View className="flex-row gap-1 items-center">
                {membersCount > 1 ? (
                  <UsersRound size={14} className="text-primaryBlue" />
                ) : (
                  <UserRound size={14} className="text-primaryBlue" />
                )}
                <Text className="text-primaryBlue text-xs">- {membersCount}</Text>
              </View>
            </View>

            <Text
              className="text-muted-foreground text-xs mt-1"
              numberOfLines={1}
            >
              {capitalize(location)}
            </Text>
          </View>

          <View className="ml-4">
            <ChevronRight size={20} className="text-primaryBlue" />
          </View>
        </View>
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
