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
import { Funnel } from "@/lib/icons/Funnel";
import { FilterPlaceholder } from "@/components/ui/filter-placeholder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalize } from "@/helpers/capitalize";
import { ChevronDown } from "@/lib/icons/ChevronDown";

const INITIAL_PAGE_SIZE = 15;

export default function ResidentReports() {
  // ============ STATE INITIALIZATION ============
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
  const [activeTab, setActiveTab] = React.useState<"active" | "archive">(
    "active"
  );
  const [severity, setSeverity] = React.useState<string>("all");
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
    activeTab === "archive",
    false,
    severity,
    false
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

  const handleDefaultFiltering = () => {
    setSeverity("all");
  };

  // ============ RENDER HELPERS ============
  const severity_color_text: Record<string, any> = {
    LOW: "text-green-500",
    MEDIUM: "text-amber-500",
    HIGH: "text-red-500",
  };

  const severity_color_bg: Record<string, any> = {
    LOW: "bg-green-500",
    MEDIUM: "bg-orange-500",
    HIGH: "bg-red-500",
  };

  const ItemCard = React.memo(({ item }: { item: Record<string, any> }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/(report)/incident/details",
            params: { report: JSON.stringify(item) },
          });
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-center bg-white border-t border-gray-100 py-8">
          <View className="flex-1 flex-row justify-between items-center">
            <View
              className="flex-shrink pr-4 gap-2"
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
                  {item.ir_type}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-primary-medium text-muted-foreground">
                  Severity:
                </Text>
                <Text
                  className={`${
                    severity_color_text[item.ir_severity]
                  } font-primary-medium text-xs`}
                >
                  {capitalize(item.ir_severity)}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-primary-medium text-muted-foreground">
                  Area:
                </Text>
                <Text
                  className={`text-gray-700 font-primary-medium text-xs`}
                  numberOfLines={1}
                >
                  {item.ir_area}
                </Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-primary-medium text-muted-foreground">
                  Date Reported:
                </Text>
                <Text className={`text-gray-700 font-primary-medium text-xs`}>
                  {formatDate(item.ir_date, "long")}
                </Text>
              </View>
            </View>

            <View
              className={`mr-5 flex-row items-center justify-center rounded-lg p-2 ${
                severity_color_bg[item.ir_severity]
              }`}
            >
              <AlertTriangle size={16} className="text-white" />
            </View>
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
        <Text className="text-gray-900 text-[13px] font-primary-medium">
          Resident Reports
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
          <View className="flex-wrap">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500 font-primary-medium">
                Severity:
              </Text>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex-row items-center">
                  <View className="h-9 px-4 bg-white flex-row items-center justify-between">
                    <Text className="text-sm font-primary-medium text-gray-700">
                      {capitalize(severity)}
                    </Text>
                  </View>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2 border-gray-300 bg-gray-100">
                  <DropdownMenuItem onPress={() => setSeverity("all")}>
                    <Text className="text-xs">All</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem onPress={() => setSeverity("low")}>
                    <Text className="text-xs">Low</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-300" />
                  <DropdownMenuItem onPress={() => setSeverity("medium")}>
                    <Text className="text-xs">Medium</Text>
                  </DropdownMenuItem>
                  <DropdownMenuItem onPress={() => setSeverity("high")}>
                    <Text className="text-xs">High</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </FilterPlaceholder>
      )}

      {/* Tab Buttons */}
      <View className="flex-row pt-2 pb-3">
        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "active" ? "bg-primaryBlue" : "bg-gray-100"
          }`}
          onPress={() => handleTabChange("active")}
        >
          <Text
            className={`text-center font-primary-medium text-sm ${
              activeTab === "active" ? "text-white" : "text-gray-600"
            }`}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-2 ${
            activeTab === "archive" ? "bg-primaryBlue" : "bg-gray-100"
          }`}
          onPress={() => handleTabChange("archive")}
        >
          <Text
            className={`text-center font-primary-medium text-sm ${
              activeTab === "archive" ? "text-white" : "text-gray-600"
            }`}
          >
            Archive
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
