import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PageLayout from "@/screens/_PageLayout";
import { useGADBudgetLogs } from "./queries/btracker-fetch";
import { BudgetLogTable } from "./gad-btracker-types";
import { useDebounce } from "@/hooks/use-debounce";
import { LoadingState } from "@/components/ui/loading-state";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const GADBudgetLogTable = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  
  if (!year) {
    return <Text className="text-red-500 text-center">Year is required</Text>;
  }

  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { 
    data: logsData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useGADBudgetLogs(
    year, 
    currentPage, 
    pageSize, 
    debouncedSearchQuery
  );

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  };

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
    const hasNext = logsData?.next;
    if (isScrolling && hasNext && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await refetch();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const logs = logsData?.results || [];
  const totalCount = logsData?.count || 0;
  const hasNext = logsData?.next;

  const renderItem = useCallback(({ item }: { item: BudgetLogTable }) => (
    <Card className="mb-4 border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-[#2a3a61] font-sans">
          {item.gbudl_created_at
            ? new Date(item.gbudl_created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "No date"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600 font-sans">Project Name:</Text>
          <Text className="font-medium font-sans">{item.gbud_exp_project || "N/A"}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 font-sans">Particulars:</Text>
          <Text className="font-medium font-sans">
            {item.gbud_exp_particulars && item.gbud_exp_particulars.length > 0
              ? item.gbud_exp_particulars.map((item) => item.name).join(", ")
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 font-sans">Proposed Budget:</Text>
          <Text className="font-medium font-sans">
            {item.gbud_proposed_budget !== null
              ? `₱${item.gbud_proposed_budget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 font-sans">Actual Expense:</Text>
          <Text className="font-medium font-sans">
            {item.gbudl_prev_amount !== null
              ? `₱${item.gbudl_prev_amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 font-sans">Return/Excess:</Text>
          <Text
            className={`font-medium font-sans ${
              item.gbudl_amount_returned && item.gbudl_prev_amount
                ? item.gbudl_amount_returned < 0
                  ? "text-red-500"
                  : "text-green-500"
                : ""
            }`}
          >
            {item.gbudl_amount_returned !== null && item.gbudl_prev_amount
              ? `${item.gbudl_amount_returned < 0 ? "-" : ""}₱${Math.abs(
                  item.gbudl_amount_returned
                ).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
      </CardContent>
    </Card>
  ), []);

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#2a3a61" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px] font-sans">{year} Budget Logs</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-center text-lg font-sans">
            Error loading budget logs: {error.message}
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-primaryBlue px-4 py-2 rounded"
            onPress={handleRefresh}
          >
            <Text className="text-white font-sans">Try Again</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} color="#2a3a61" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px] font-sans">{year} Budget Logs</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-white p-2">
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        {!isRefreshing && logs.length > 0 && (
          <View className="mb-2 px-4">
            <Text className="text-xs text-gray-500 font-sans">
              Showing {logs.length} of {totalCount} logs
              {hasNext && ` (Page ${currentPage})`}
            </Text>
          </View>
        )}

        {isLoading && isInitialRender ? (
          <View className="h-64 justify-center items-center">
            <LoadingState/>
          </View>
        ) : (
          <FlatList
            data={logs}
            renderItem={renderItem}
            keyExtractor={(item) =>
              item.gbudl_id?.toString() || Math.random().toString()
            }
            maxToRenderPerBatch={5}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            windowSize={11}
            removeClippedSubviews
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 20,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#00a8f0"]}
              />
            }
            ListFooterComponent={() =>
              isFetching && isLoadMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-xs text-gray-500 mt-2 font-sans">
                    Loading more logs...
                  </Text>
                </View>
              ) : (
                !hasNext &&
                logs.length > 0 && (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-400 font-sans">
                      No more logs
                    </Text>
                  </View>
                )
              )
            }
            ListEmptyComponent={
              !isLoading ? (
                <View className="py-8">
                  <Text className="text-center text-gray-500 font-sans">
                    {searchQuery
                      ? "No budget logs found matching your search" 
                      : "No budget logs found"
                    }
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </PageLayout>
  );
};

export default GADBudgetLogTable;