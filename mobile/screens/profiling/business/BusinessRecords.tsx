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
import { useBusinessTable } from "../queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { formatCurrency } from "@/helpers/currencyFormat";
import { LoadingState } from "@/components/ui/loading-state";

export default function BusinessRecords() {
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
    data: businessesTableData,
    isLoading,
    refetch,
    isFetching,
  } = useBusinessTable(currentPage, pageSize, searchQuery);

  const businesses = businessesTableData?.results || [];
  const totalCount = businessesTableData?.count || 0;
  const hasNext = businessesTableData?.next;

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
  const ItemCard = React.memo(({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(profiling)/business/details",
            params: {
              business: JSON.stringify(item),
            },
          });
        }}
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {/* Business Header */}
              <View className="flex-row items-center mb-3">
                <View className="flex-1">
                  <Text
                    className="text-gray-900 font-semibold text-base"
                    numberOfLines={1}
                  >
                    {item.bus_name || "Unnamed Business"}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.bus_id}
                  </Text>
                </View>
              </View>

              {/* Business Details */}
              <View className="space-y-2">
                {/* Gross Sales */}
                {item.bus_gross_sales && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm flex-1">
                      Gross Sales:{" "}
                      <Text className="font-medium text-green-600">
                        {formatCurrency(item.bus_gross_sales)}
                      </Text>
                    </Text>
                  </View>
                )}

                {/* Location */}
                {item?.bus_location && (
                  <View className="flex-row items-center">
                    <Text
                      className="text-gray-600 text-sm flex-1"
                      numberOfLines={1}
                    >
                      {item?.bus_location}
                    </Text>
                  </View>
                )}

                {/* Respondent */}
                {item.respondent && (
                  <View className="flex-row items-center">
                    <Text
                      className="text-gray-600 text-sm flex-1"
                      numberOfLines={1}
                    >
                      Contact: {item.respondent}
                    </Text>
                  </View>
                )}

                {/* Contact Number */}
                {item.bus_respondentContact && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm">
                      {item.bus_respondentContact}
                    </Text>
                  </View>
                )}
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

  if (isLoading && isInitialRender) {
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
        <Text className="text-gray-900 text-[13px]">Business Records</Text>
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
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${businesses.length} of ${totalCount} businesses`}</Text>
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
            data={businesses}
            contentContainerStyle={{
              paddingTop: 0,
              paddingBottom: 20,
              gap: 15,
            }}
            onScroll={handleScroll}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            renderItem={renderItem}
            keyExtractor={(item) => item.bus_id}
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
