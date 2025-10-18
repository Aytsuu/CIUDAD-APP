import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { 
    data: logsData, 
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

  // Extract data from paginated response
  const logs = logsData?.results || [];
  const totalCount = logsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: BudgetLogTable }) => (
    <Card className="mb-4 border border-gray-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-[#2a3a61]">
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
          <Text className="text-gray-600">Project Name:</Text>
          <Text className="font-medium">{item.gbud_exp_project || "N/A"}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Particulars:</Text>
          <Text className="font-medium">
            {item.gbud_exp_particulars && item.gbud_exp_particulars.length > 0
              ? item.gbud_exp_particulars.map((item) => item.name).join(", ")
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Proposed Budget:</Text>
          <Text className="font-medium">
            {item.gbud_proposed_budget !== null
              ? `₱${item.gbud_proposed_budget.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Actual Expense:</Text>
          <Text className="font-medium">
            {item.gbudl_prev_amount !== null
              ? `₱${item.gbudl_prev_amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}`
              : "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Return/Excess:</Text>
          <Text
            className={`font-medium ${
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
  );

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} color="#2a3a61" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">{year} Budget Logs</Text>}
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
          <Text className="text-red-500 text-center text-lg">
            Error loading budget logs: {error.message}
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-primaryBlue px-4 py-2 rounded"
            onPress={() => refetch()}
          >
            <Text className="text-white">Try Again</Text>
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
      headerTitle={<Text className="text-gray-900 text-[13px]">{year} Budget Logs</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-white">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="p-2 px-6">
            {/* Loading State */}
            {isLoading ? (
              <View className="py-8">
                <LoadingState/>
              </View>
            ) : (
              <>
                {/* Data List */}
                <FlatList
                  data={logs}
                  renderItem={renderItem}
                  keyExtractor={(item) =>
                    item.gbudl_id?.toString() || Math.random().toString()
                  }
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View className="py-8">
                      <Text className="text-center text-gray-500">
                        {searchQuery
                          ? "No budget logs found matching your search" 
                          : "No budget logs found"
                        }
                      </Text>
                    </View>
                  }
                />

                {/* Pagination */}
                <View className="flex-row justify-between items-center mt-4 px-2">
                  <TouchableOpacity
                    onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                  >
                    <Text className="text-primaryBlue font-bold">← Previous</Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center">
                    {isFetching && (
                      <ActivityIndicator size="small" color="#2a3a61" className="mr-2" />
                    )}
                    <Text className="text-gray-500">
                      Page {currentPage} of {totalPages}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages || totalCount === 0}
                    className={`p-2 ${
                      currentPage === totalPages || totalCount === 0 ? "opacity-50" : ""
                    }`}
                  >
                    <Text className="text-primaryBlue font-bold">Next →</Text>
                  </TouchableOpacity>
                </View>

                {/* Results Count */}
                <View className="mt-2 px-2">
                  <Text className="text-gray-500 text-sm text-center">
                    Showing {logs.length} of {totalCount} logs
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </PageLayout>
  );
};

export default GADBudgetLogTable;