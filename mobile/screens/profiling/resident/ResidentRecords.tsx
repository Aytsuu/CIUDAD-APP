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
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "../../_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

const INITIAL_PAGE_SIZE = 15;

export default function ResidentRecords() {
  // ================= STATE INITIALIZATION =================
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
    data: residentsTableData,
    isLoading,
    refetch,
    isFetching,
  } = useResidentsTable(currentPage, pageSize, searchQuery);

  const residents = residentsTableData?.results || [];
  const totalCount = residentsTableData?.count || 0;
  const hasNext = residentsTableData?.next;

  // ================= SIDE EFFECTS =================
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
  // ================= HANDLERS =================
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
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  // ================= RENDER HELPERS =================
  const ItemCard = React.memo(({ item }: { item: any }) => {
    const fullName = `${item.fname} ${item.mname ? item.mname + " " : ""}${
      item.lname
    }`;

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(profiling)/resident/details",
            params: {
              resident: JSON.stringify(item),
            },
          });
        }}
        className="mb-3"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="flex-1">
                  <Text
                    className="text-gray-900 font-semibold text-base"
                    numberOfLines={1}
                  >
                    {fullName}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.rp_id}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-2">
                <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                  <Text className="text-gray-700 text-xs">Age: {item.age}</Text>
                </View>
                <View className="bg-gray-100 px-2 py-1 rounded-full">
                  <Text className="text-gray-700 text-xs">{item.sex}</Text>
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

  if (isLoading) {
    return <LoadingState />;
  }

  // ================= MAIN RENDER =================
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
        <Text className="text-gray-900 text-[13px]">Resident Records</Text>
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
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${residents.length} of ${totalCount} residents`}</Text>
        )}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={10}
            overScrollMode="never"
            data={residents}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={10}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onScroll={handleScroll}
            windowSize={21}
            renderItem={renderItem}
            keyExtractor={(item) => item.rp_id}
            removeClippedSubviews
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 20,
              gap: 15,
            }}
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
                residents.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400">
                      No more resident records
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
