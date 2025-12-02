import { useAuth } from "@/contexts/AuthContext";
import { RefreshControl, TouchableOpacity, View, Text, ActivityIndicator } from "react-native";
import { useGetIRHistory } from "./queries/reportFetch";
import React from "react";
import { formatDate } from "@/helpers/dateHelpers";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { FileText } from "@/lib/icons/FileText";

const INITIAL_PAGE_SIZE = 15;

export default function ReportHistory() {
  // ============ STATE INITIALIZATION ============
  const { user } = useAuth();
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
    data: myIRs,
    isLoading,
    refetch,
    isFetching,
  } = useGetIRHistory(
    currentPage,
    pageSize,
    searchQuery,
    false,
    user?.rp as string
  );

  const history = myIRs?.results || [];
  const totalCount = myIRs?.count || 0;
  const hasNext = myIRs?.next;

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

  const severity_color_bg: Record<string, any> = {
    LOW: 'bg-green-100 border-green-400',
    MEDIUM: 'bg-amber-100 border-amber-400',
    HIGH: 'bg-red-100 border-red-400',
  }

  const severity_color_text: Record<string, any> = {
    LOW: 'text-green-700',
    MEDIUM: 'text-amber-700',
    HIGH: 'text-red-700',
  }

  const createNarrative = (item: Record<string, any>) => {
    const area = item.ir_area || "an unspecified area";
    const date = item.ir_date
      ? formatDate(item.ir_date, "long")
      : "an unknown date";
    const time = item.ir_time || "an unspecified time";
    const involved = item.ir_involved || "unknown parties";

    return `Incident occurred in ${area} on ${date} at ${time}. The incident involved ${involved}.`;
  };

  // ============ RENDER HELPERS ============
  const ItemCard = React.memo(
    ({ item, index }: { item: Record<string, any>; index: number }) => (
      <View className="mb-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <TouchableOpacity
          className="p-4"
          activeOpacity={0.7}
        >
          {/* Header with IR Type Badge and ID */}
          <View className="flex-row justify-between items-start mb-3">
            <View
              className={`px-3 py-1 border rounded-full ${severity_color_bg[item.ir_severity]}`}
            >
              <Text className={`text-xs font-medium capitalize ${severity_color_text[item.ir_severity]}`}>
                {item.ir_type || "N/A"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 font-medium">
              {index + 1}
            </Text>
          </View>

          {/* Narrative Content */}
          <View className="mb-4">
            <Text className="text-gray-800 text-sm leading-relaxed">
              {createNarrative(item)}
            </Text>
          </View>

          {/* Report Submission Info */}
          <View className="pt-3 border-t border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-500 text-xs">Report submitted:</Text>
              <Text className="text-gray-600 text-xs font-medium">
                {item.ir_created_at
                  ? formatDate(item.ir_created_at, "short")
                  : "Unknown"}
              </Text>
            </View>
          </View>

          {/* Subtle indicator for interactivity */}
          <View className="absolute right-4 top-1/2 transform -translate-y-1">
            <View className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <View className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1" />
            <View className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1" />
          </View>
        </TouchableOpacity>
      </View>
    )
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: Record<string, any>; index: number }) => (
      <ItemCard item={item} index={index} />
    ),
    []
  );

  // ============ MAIN RENDER ============
  return (
    <BottomSheetFlatList
      maxToRenderPerBatch={10}
      overScrollMode="never"
      initialNumToRender={10}
      contentContainerStyle={{
        paddingBottom: 40,
        flexGrow: history.length === 0 ? 1 : 0,
      }}
      windowSize={21}
      removeClippedSubviews
      data={history}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onScrollEndDrag={handleScroll}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      renderItem={renderItem}
      keyExtractor={(item: any) => item.ir_id?.toString()}
      ListFooterComponent={() =>
        isFetching ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-xs text-gray-500 mt-2">Loading more...</Text>
          </View>
        ) : (
          !hasNext &&
          history.length > 0 && (
            <View className="py-4 items-center">
              <Text className="text-xs text-gray-400">No more reports</Text>
            </View>
          )
        )
      }
      ListEmptyComponent={() => (
        <View className="flex-1 justify-center items-center">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <FileText />
          </View>
          <Text className="text-gray-600 text-lg font-medium mb-2">
            No Reports Found
          </Text>
          <Text className="text-gray-500 text-center">
            You haven't submitted any incident reports yet.
          </Text>
        </View>
      )}
    />
  );
}