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
import { useGetActionReport } from "../queries/reportFetch";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "../../_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { formatDate } from "@/helpers/dateHelpers";
import { capitalize } from "@/helpers/capitalize";
import { Funnel } from "@/lib/icons/Funnel";
import { FilterPlaceholder } from "@/components/ui/filter-placeholder";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react-native";

const INITIAL_PAGE_SIZE = 15;

export default () => {
  // ================= STATE INITIALIZATION =================
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [showFiltering, setShowFiltering] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = React.useState<string>('all')

  const {
    data: actionReportData,
    isLoading,
    refetch,
    isFetching,
  } = useGetActionReport(
    currentPage, 
    pageSize, 
    searchQuery,
    status
  );

  const reports = actionReportData?.results || [];
  const totalCount = actionReportData?.count || 0;
  const hasNext = actionReportData?.next;

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

  const handleDefaultFiltering = () => {
    setStatus('all')
  }

  // ================= RENDER HELPERS =================
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "bg-green-100";
      default:
        return "bg-yellow-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "signed":
        return "text-green-700";
      default:
        return "text-yellow-700";
    }
  };

  const ItemCard = React.memo(({ item }: { item: any }) => {
    return (
      <TouchableOpacity activeOpacity={0.7}>
        <View className="py-5 bg-white border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View
              className="flex-1 flex-shrink pr-4 gap-2"
              style={{ maxWidth: "70%" }}
            >
              <View className="flex-row gap-4">
                <Text
                  className="text-gray-700 text-sm"
                  style={{
                    fontFamily: "GeneralSans-Semibold",
                  }}
                  numberOfLines={1}
                >
                  {item.ar_title}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-primary-medium text-muted-foreground">
                  Report No.
                </Text>
                <Text className={`text-gray-700 font-primary-medium text-xs`}>
                  AR-{item.id}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-primary-medium text-gray-500">
                  Date Created:
                </Text>
                <Text className="text-gray-700 font-primary-medium text-xs">
                  {formatDate(item.ar_date_started)}
                </Text>
              </View>
            </View>

            <View
              className={`${getStatusColor(
                item.status
              )} px-2 py-1 rounded-full mr-5`}
            >
              <Text
                className={`${getStatusTextColor(
                  item.status
                )} font-primary-medium text-xs`}
              >
                {capitalize(item.status)}
              </Text>
            </View>
          </View>
        </View>
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
        <Text className="text-gray-900 text-[13px] font-primary-medium">
          Action Reports
        </Text>
      }
      rightAction={
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => {
              setShowSearch(false);
              setShowFiltering(!showFiltering);
            }}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Funnel size={20} className="text-gray-700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowSearch(!showSearch);
              setShowFiltering(false);
            }}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        </View>
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

      {showFiltering && (
        <FilterPlaceholder setDefault={handleDefaultFiltering}>
          <View className="flex-wrap flex-row gap-4">
            {/* Severity Filtering */}
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500 font-primary-medium">
                Severity:
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex-row items-center">
                  <View className="h-9 px-4 bg-white flex-row items-center justify-between">
                    <Text className="text-sm font-primary-medium text-gray-700">
                      {capitalize(status)}
                    </Text>
                  </View>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2 border-gray-300 bg-gray-100">
                  <DropdownMenuItem onPress={() => setStatus("all")}>
                    <Text className="text-xs">All</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem onPress={() => setStatus("signed")}>
                    <Text className="text-xs">Signed</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem onPress={() => setStatus("unsigned")}>
                    <Text className="text-xs">Unsigned</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View> 
          </View>
        </FilterPlaceholder>
      )}

      <View className="flex-1 px-6">
        {!isRefreshing && (
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${reports.length} of ${totalCount} reports`}</Text>
        )}
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

        {!isRefreshing && (
          <FlatList
            maxToRenderPerBatch={10}
            overScrollMode="never"
            data={reports}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={10}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onScroll={handleScroll}
            windowSize={21}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
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
                reports.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400">
                      No more action reports
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
};
