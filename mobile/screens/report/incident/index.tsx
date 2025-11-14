import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router, useRouter } from "expo-router";
import React from "react";
import { Search } from "@/lib/icons/Search";
import { useGetIncidentReport } from "../queries/reportFetch";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { formatDate } from "@/helpers/dateHelpers";
import { AlertTriangle } from "@/lib/icons/AlertTriangle";

const INITIAL_PAGE_SIZE = 15;

export default function IncidentReports() {
  // ============ STATE INITIALIZATION ============
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<"active" | "archive">(
    "active"
  );
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const {
    data: incidentReportData,
    isLoading,
    refetch,
    isFetching,
  } = useGetIncidentReport(
    currentPage,
    pageSize,
    searchQuery,
    activeTab === "archive"
  );

  const reports = incidentReportData?.results || [];
  const totalCount = incidentReportData?.count || 0;
  const hasNext = incidentReportData?.next;

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

  const handleTabChange = (tab: "active" | "archive") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  // ============ RENDER HELPERS ============
  const severity_color_bg: Record<string, any> = {
    LOW: "text-green-500",
    MEDIUM: "text-yellow-500",
    HIGH: "text-red-500",
  };

  const ItemCard = React.memo(({ item }: { item: Record<string, any> }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({ 
            pathname: "/(report)/incident/details", 
            params: { report: JSON.stringify(item) }
          });
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center bg-white border-t border-gray-100 py-5">
          <View className="flex-1 flex-row justify-between items-center">
            <View className="flex-shrink pr-4" style={{ maxWidth: "70%" }}>
              <View className="flex-row gap-4">
                <Text
                  className="text-gray-700 font-medium text-md"
                  numberOfLines={1}
                >
                  {item.ir_type}
                </Text>
              </View>

              <Text
                className="text-muted-foreground text-xs mt-1"
                numberOfLines={1}
              >
                {item.ir_area} • {formatDate(item.ir_date, "short")}
              </Text>
            </View>
            <AlertTriangle
              size={20}
              className={`${severity_color_bg[item.ir_severity]} mr-5`}
            />
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
        <Text className="text-gray-900 text-[13px]">Incident Reports</Text>
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

      {/* Tab Buttons */}
      <View className="flex-row px-6 pt-2 pb-3 gap-2">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "active" ? "bg-primaryBlue" : "bg-gray-100"
          }`}
          onPress={() => handleTabChange("active")}
        >
          <Text
            className={`text-center font-medium text-sm ${
              activeTab === "active" ? "text-white" : "text-gray-600"
            }`}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${
            activeTab === "archive" ? "bg-primaryBlue" : "bg-gray-100"
          }`}
          onPress={() => handleTabChange("archive")}
        >
          <Text
            className={`text-center font-medium text-sm ${
              activeTab === "archive" ? "text-white" : "text-gray-600"
            }`}
          >
            Archived
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6">
        {!isRefreshing && (
          <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${reports.length} of ${totalCount} ${activeTab} reports`}</Text>
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
            data={reports}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            renderItem={renderItem}
            keyExtractor={(item) => item.ir_id}
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
                      No more incident reports
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